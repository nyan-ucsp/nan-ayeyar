import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(requireAdmin);

// Get all orders (with pagination and filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentType,
      search,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (paymentType && paymentType !== 'all') {
      where.paymentType = paymentType;
    }
    
    if (search) {
      where.OR = [
        { id: { contains: search as string, mode: 'insensitive' } },
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } }
      ];
    }
    
    // Date range filtering
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        // Add one day to endDate to include the entire end date
        const endDateObj = new Date(endDate as string);
        endDateObj.setDate(endDateObj.getDate() + 1);
        where.createdAt.lt = endDateObj;
      }
    }

    // Get orders and total count
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name_en: true,
                  name_my: true,
                  images: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.user?.name || 'Unknown',
      customerEmail: order.user?.email || 'Unknown',
      status: order.status,
      paymentType: order.paymentType,
      total: order.totalAmount,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name_en || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice,
        product: item.product ? {
          id: item.product.id,
          sku: (item.product as any).sku || null,
          name_en: item.product.name_en,
          name_my: item.product.name_my,
          images: item.product.images
        } : null
      })),
      shippingAddress: order.shippingAddress,
      paymentMethodId: order.paymentMethodId,
      transactionId: order.transactionId,
      paymentScreenshot: order.paymentScreenshot,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({
      success: true,
      data: transformedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get single order
router.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Transform order for frontend
    const transformedOrder = {
      id: order.id,
      customerName: order.user?.name || 'Unknown',
      customerEmail: order.user?.email || 'Unknown',
      status: order.status,
      paymentType: order.paymentType,
      total: order.totalAmount,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name_en || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice,
        product: item.product ? {
          id: item.product.id,
          sku: (item.product as any).sku || null,
          name_en: item.product.name_en,
          name_my: item.product.name_my,
          images: item.product.images
        } : null
      })),
      shippingAddress: order.shippingAddress,
      paymentMethodId: order.paymentMethodId,
      transactionId: order.transactionId,
      paymentScreenshot: order.paymentScreenshot,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json({
      success: true,
      data: { order: transformedOrder }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Update order status
router.patch('/:orderId/status', [
  body('status')
    .isIn(['PENDING', 'PROCESSING', 'ON_HOLD', 'SHIPPED', 'DELIVERED', 'CANCELED', 'RETURNED', 'REFUNDED'])
    .withMessage('Invalid order status'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be a positive number'),
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Refund reason must be between 1 and 500 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { orderId } = req.params;
    const { status, amount, reason } = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      PENDING: ['PROCESSING', 'ON_HOLD', 'CANCELED'],
      PROCESSING: ['SHIPPED', 'ON_HOLD', 'CANCELED'],
      ON_HOLD: ['PROCESSING', 'CANCELED'],
      SHIPPED: ['DELIVERED', 'RETURNED'],
      DELIVERED: ['RETURNED', 'REFUNDED'],
      CANCELED: ['REFUNDED'], // Allow refunding cancelled orders
      RETURNED: ['REFUNDED'],
      REFUNDED: []
    };

    if (!validTransitions[existingOrder.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from ${existingOrder.status} to ${status}`
      });
    }

    // Validate refund data for REFUNDED status
    if (status === 'REFUNDED') {
      if (!amount || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Refund amount and reason are required when marking order as refunded'
        });
      }
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create refund record if status is REFUNDED
    if (status === 'REFUNDED') {
      await prisma.refund.create({
        data: {
          orderId: orderId,
          amount: parseFloat(amount),
          reason: reason
        }
      });
    }

    // Transform order for frontend
    const transformedOrder = {
      id: order.id,
      customerName: order.user?.name || 'Unknown',
      customerEmail: order.user?.email || 'Unknown',
      status: order.status,
      paymentType: order.paymentType,
      total: order.totalAmount,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name_en || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice,
        product: item.product ? {
          id: item.product.id,
          sku: (item.product as any).sku || null,
          name_en: item.product.name_en,
          name_my: item.product.name_my,
          images: item.product.images
        } : null
      })),
      shippingAddress: order.shippingAddress,
      paymentMethodId: order.paymentMethodId,
      transactionId: order.transactionId,
      paymentScreenshot: order.paymentScreenshot,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json({
      success: true,
      data: { order: transformedOrder }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// Update order payment information
router.patch('/:orderId/payment', [
  body('transactionId').optional().trim().notEmpty().withMessage('Transaction ID cannot be empty'),
  body('paymentScreenshot').optional().trim().notEmpty().withMessage('Payment screenshot URL cannot be empty')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { orderId } = req.params;
    const { transactionId, paymentScreenshot } = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order payment information
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        transactionId,
        paymentScreenshot
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_my: true,
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Transform order for frontend
    const transformedOrder = {
      id: order.id,
      customerName: order.user?.name || 'Unknown',
      customerEmail: order.user?.email || 'Unknown',
      status: order.status,
      paymentType: order.paymentType,
      total: order.totalAmount,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name_en || 'Unknown Product',
        quantity: item.quantity,
        price: item.unitPrice,
        product: item.product ? {
          id: item.product.id,
          sku: (item.product as any).sku || null,
          name_en: item.product.name_en,
          name_my: item.product.name_my,
          images: item.product.images
        } : null
      })),
      shippingAddress: order.shippingAddress,
      paymentMethodId: order.paymentMethodId,
      transactionId: order.transactionId,
      paymentScreenshot: order.paymentScreenshot,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json({
      success: true,
      data: { order: transformedOrder }
    });
  } catch (error) {
    console.error('Error updating order payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order payment information'
    });
  }
});

export default router;
