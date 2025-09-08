import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  OnlineTransferOrderRequest,
  OnlineTransferOrderResponse,
  PaymentConfirmationRequest,
  PaymentConfirmationResponse
} from '../types/payment';
import { body, param, validationResult } from 'express-validator';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

/**
 * POST /api/orders/online-transfer
 * Create an online transfer order (authenticated customer only)
 */
export const createOnlineTransferOrder = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const {
      items,
      shippingAddress,
      companyAccountId,
      transactionId,
      customerAccountName,
      customerAccountNo,
      paymentScreenshot
    }: OnlineTransferOrderRequest = req.body;

    // Validate company account exists and is enabled
    const companyAccount = await prisma.companyPaymentAccount.findFirst({
      where: { 
        id: companyAccountId,
        enabled: true 
      }
    });

    if (!companyAccount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or disabled company payment account'
      });
    }

    // Validate products and calculate total
    let totalAmount = new Decimal(0);
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.disabled) {
        return res.status(400).json({
          success: false,
          message: `Product is disabled: ${product.name_en}`
        });
      }

      if (product.outOfStock) {
        return res.status(400).json({
          success: false,
          message: `Product is out of stock: ${product.name_en}`
        });
      }

      // Check stock availability if not allowing sell without stock
      if (!product.allowSellWithoutStock) {
        const stockEntries = await prisma.stockEntry.findMany({
          where: { productId: product.id }
        });

        const totalStock = stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);
        if (totalStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name_en}. Available: ${totalStock}, Requested: ${item.quantity}`
          });
        }
      }

      const itemTotal = new Decimal(product.price).mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      validatedItems.push({
        productId: product.id,
        unitPrice: product.price,
        quantity: item.quantity,
        metadata: product.metadata
      });
    }

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          paymentType: 'ONLINE_TRANSFER',
          companyAccountId,
          totalAmount,
          shippingAddress,
          transactionId,
          paymentScreenshot,
          customerAccountName,
          customerAccountNo
        }
      });

      // Create order items
      await tx.orderItem.createMany({
        data: validatedItems.map(item => ({
          orderId: order.id,
          productId: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          metadata: item.metadata
        }))
      });

      // Deduct inventory (create negative stock entries)
      for (const item of validatedItems) {
        await tx.stockEntry.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity, // Negative quantity for deduction
            purchasePrice: new Decimal(0) // No purchase price for deductions
          }
        });
      }

      return order;
    });

    // Fetch the complete order with relations
    const order = await prisma.order.findUnique({
      where: { id: result.id },
      include: {
        companyAccount: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const response: OnlineTransferOrderResponse = {
      id: order!.id,
      status: order!.status,
      paymentType: order!.paymentType,
      totalAmount: order!.totalAmount.toNumber(),
      transactionId: order!.transactionId!,
      customerAccountName: order!.customerAccountName!,
      customerAccountNo: order!.customerAccountNo!,
      paymentScreenshot: order!.paymentScreenshot || undefined,
      companyAccount: {
        id: order!.companyAccount!.id,
        name: order!.companyAccount!.name,
        type: order!.companyAccount!.type,
        details: order!.companyAccount!.details as any,
        enabled: order!.companyAccount!.enabled,
        createdAt: order!.companyAccount!.createdAt,
        updatedAt: order!.companyAccount!.updatedAt
      },
      createdAt: order!.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Online transfer order created successfully',
      data: response
    });

  } catch (error) {
    console.error('Error creating online transfer order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create online transfer order'
    });
  }
};

/**
 * PATCH /api/admin/orders/:id/payment-confirmation
 * Confirm or reject payment for online transfer order (admin only)
 */
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { confirmed, notes }: PaymentConfirmationRequest = req.body;

    // Check if order exists and is an online transfer order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        companyAccount: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentType !== 'ONLINE_TRANSFER') {
      return res.status(400).json({
        success: false,
        message: 'Order is not an online transfer order'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in pending status'
      });
    }

    // Update order status based on confirmation
    const newStatus = confirmed ? 'PROCESSING' : 'ON_HOLD';
    
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    const response: PaymentConfirmationResponse = {
      success: true,
      message: confirmed 
        ? 'Payment confirmed successfully' 
        : 'Payment marked as on hold',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

/**
 * GET /api/admin/orders/:id/payment-details
 * Get payment details for online transfer order (admin only)
 */
export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        companyAccount: true,
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
        message: 'Order not found'
      });
    }

    if (order.paymentType !== 'ONLINE_TRANSFER') {
      return res.status(400).json({
        success: false,
        message: 'Order is not an online transfer order'
      });
    }

    const response = {
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount.toNumber(),
        transactionId: order.transactionId,
        customerAccountName: order.customerAccountName,
        customerAccountNo: order.customerAccountNo,
        paymentScreenshot: order.paymentScreenshot,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      companyAccount: order.companyAccount ? {
        id: order.companyAccount.id,
        name: order.companyAccount.name,
        type: order.companyAccount.type,
        details: order.companyAccount.details
      } : null,
      customer: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email
      }
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
};

/**
 * GET /api/orders/:id/payment-info
 * Get payment information for customer's own order
 */
export const getOrderPaymentInfo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        companyAccount: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentType !== 'ONLINE_TRANSFER') {
      return res.status(400).json({
        success: false,
        message: 'Order is not an online transfer order'
      });
    }

    const response = {
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount.toNumber(),
        transactionId: order.transactionId,
        customerAccountName: order.customerAccountName,
        customerAccountNo: order.customerAccountNo,
        paymentScreenshot: order.paymentScreenshot,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      companyAccount: order.companyAccount ? {
        id: order.companyAccount.id,
        name: order.companyAccount.name,
        type: order.companyAccount.type,
        details: order.companyAccount.details
      } : null
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching order payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment information'
    });
  }
};

// Validation middleware
export const validateOnlineTransferOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productId')
    .isString()
    .withMessage('Product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Shipping name is required'),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Shipping address is required'),
  body('shippingAddress.phone')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Shipping phone is required'),
  body('companyAccountId')
    .isString()
    .withMessage('Company account ID is required'),
  body('transactionId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction ID is required'),
  body('customerAccountName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Customer account name is required'),
  body('customerAccountNo')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Customer account number is required'),
  body('paymentScreenshot')
    .optional()
    .isString()
    .withMessage('Payment screenshot must be a string')
];

export const validatePaymentConfirmation = [
  param('id')
    .isString()
    .withMessage('Invalid order ID'),
  body('confirmed')
    .isBoolean()
    .withMessage('Confirmed must be a boolean'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

export const validateOrderId = [
  param('id')
    .isString()
    .withMessage('Invalid order ID')
];
