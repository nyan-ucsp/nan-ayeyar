import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { generateTransactionId } from '../utils/otp';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Create order (authenticated customer)
 * Creates a new order with inventory validation and deduction
 */
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('shippingAddress').isObject(),
  body('shippingAddress.name').notEmpty(),
  body('shippingAddress.address').notEmpty(),
  body('shippingAddress.phone').notEmpty(),
  body('paymentType').isIn(['COD', 'ONLINE_TRANSFER']),
  body('paymentMethodId').optional(),
  body('transactionId').optional(),
  body('paymentScreenshot').optional(),
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      items, 
      shippingAddress, 
      paymentType, 
      paymentMethodId, 
      transactionId, 
      paymentScreenshot 
    } = req.body;

    // Validate payment method for ONLINE_TRANSFER
    if (paymentType === 'ONLINE_TRANSFER') {
      if (!paymentMethodId && !transactionId) {
        return res.status(400).json({
          success: false,
          error: 'Payment method ID or transaction ID required for online transfer'
        });
      }

      // Verify payment method belongs to user
      if (paymentMethodId) {
        const paymentMethod = await prisma.paymentMethod.findFirst({
          where: { id: paymentMethodId, userId: req.user!.id }
        });

        if (!paymentMethod) {
          return res.status(400).json({
            success: false,
            error: 'Invalid payment method'
          });
        }
      }
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          stockEntries: true,
        }
      });

      if (!product || product.disabled) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productId} not found or disabled`
        });
      }

      // Check stock availability
      const totalStock = product.stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      
      if (product.outOfStock || (!product.allowSellWithoutStock && totalStock < item.quantity)) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${product.name_en}`
        });
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        metadata: product.metadata,
      });
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          paymentType,
          paymentMethodId: paymentMethodId || null,
          totalAmount,
          shippingAddress,
          transactionId: transactionId || generateTransactionId(),
          paymentScreenshot: paymentScreenshot || null,
          status: paymentType === 'COD' ? 'PROCESSING' : 'PENDING',
        }
      });

      // Create order items and deduct inventory
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            metadata: item.metadata,
          }
        });

        // Deduct inventory by creating negative stock entry
        // This approach maintains audit trail of all stock movements
        await tx.stockEntry.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity, // Negative quantity for deduction
            purchasePrice: 0, // No purchase price for sales deduction
          }
        });
      }

      return newOrder;
    });

    // Fetch complete order with relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true,
              }
            }
          }
        },
        paymentMethod: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get order by ID
 * Returns order details (owner or admin)
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        // Allow access if user is owner or admin
        OR: [
          { userId: req.user!.id },
          { user: { role: 'admin' } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true,
                sku: true,
              }
            }
          }
        },
        paymentMethod: true,
        refunds: true,
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Update order status (admin only)
 * Updates order status and handles refunds
 */
router.patch('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['PENDING', 'PROCESSING', 'ON_HOLD', 'SHIPPED', 'DELIVERED', 'CANCELED', 'RETURNED', 'REFUNDED']),
  body('refundAmount').optional().isFloat({ min: 0 }),
  body('refundReason').optional().isString(),
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { status, refundAmount, refundReason } = req.body;

    const order = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status }
      });

      // Handle refund if status is REFUNDED
      if (status === 'REFUNDED' && refundAmount && refundReason) {
        await tx.refund.create({
          data: {
            orderId: id,
            amount: parseFloat(refundAmount),
            reason: refundReason,
          }
        });

        // Restore inventory if order is being refunded
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: id }
        });

        for (const item of orderItems) {
          await tx.stockEntry.create({
            data: {
              productId: item.productId,
              quantity: item.quantity, // Positive quantity to restore stock
              purchasePrice: 0,
            }
          });
        }
      }

      return updatedOrder;
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get user's orders
 * Returns paginated list of user's orders
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId: req.user!.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name_en: true,
                  name_my: true,
                  images: true,
                }
              }
            }
          },
          paymentMethod: true,
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get all orders (admin only)
 * Returns paginated list of all orders with filtering
 */
router.get('/admin/all', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentType,
      search,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (paymentType) where.paymentType = paymentType;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name_en: true,
                  name_my: true,
                  images: true,
                }
              }
            }
          },
          paymentMethod: true,
          refunds: true,
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Update order transaction ID (authenticated customer - only for their own orders)
 */
router.patch('/:id/transaction', authenticate, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
], async (req: AuthRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { transactionId } = req.body;

    // Find order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Only allow updating transaction ID for ONLINE_TRANSFER orders in PENDING or PROCESSING status
    if (order.paymentType !== 'ONLINE_TRANSFER') {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID can only be updated for online transfer orders'
      });
    }

    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID can only be updated for pending or processing orders'
      });
    }

    // Update transaction ID
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { transactionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true,
              }
            }
          }
        },
        paymentMethod: true,
      }
    });

    res.json({
      success: true,
      message: 'Transaction ID updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update transaction ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Cancel order (authenticated customer - only for their own orders)
 */
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Find order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Only allow canceling orders in PENDING or PROCESSING status
    if (!['PENDING', 'PROCESSING'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order can only be cancelled if it is pending or processing'
      });
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status: 'CANCELED',
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true,
              }
            }
          }
        },
        paymentMethod: true,
      }
    });

    // Restore inventory by creating positive stock entries
    for (const item of order.items) {
      await prisma.stockEntry.create({
        data: {
          productId: item.productId,
          quantity: item.quantity, // Positive quantity for restoration
          purchasePrice: 0, // No purchase price for cancellation restoration
        }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Request return (authenticated customer - only for their own orders)
 */
router.patch('/:id/return', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Find order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Only allow return requests for DELIVERED orders
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        error: 'Return can only be requested for delivered orders'
      });
    }

    // Update order status to RETURNED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status: 'RETURNED',
        updatedAt: new Date()
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true,
              }
            }
          }
        },
        paymentMethod: true,
      }
    });

    res.json({
      success: true,
      message: 'Return request submitted successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Request return error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;