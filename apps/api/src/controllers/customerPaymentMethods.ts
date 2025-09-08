import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  CreateCustomerPaymentMethodRequest, 
  UpdateCustomerPaymentMethodRequest,
  CustomerPaymentMethodResponse,
  validatePaymentMethodDetails,
  getPaymentTypeDisplayName,
  getPaymentTypeIcon
} from '../types/payment';
import { body, param, validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * GET /api/users/payment-methods
 * Get customer's payment methods (authenticated user only)
 */
export const getCustomerPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: CustomerPaymentMethodResponse[] = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      details: method.details as any,
      createdAt: method.createdAt
    }));

    res.json({
      success: true,
      data: response,
      count: response.length
    });

  } catch (error) {
    console.error('Error fetching customer payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
};

/**
 * GET /api/users/payment-methods/:id
 * Get a specific customer payment method (authenticated user only)
 */
export const getCustomerPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    const response: CustomerPaymentMethodResponse = {
      id: paymentMethod.id,
      type: paymentMethod.type,
      details: paymentMethod.details as any,
      createdAt: paymentMethod.createdAt
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching customer payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment method'
    });
  }
};

/**
 * POST /api/users/payment-methods
 * Create a new customer payment method (authenticated user only)
 */
export const createCustomerPaymentMethod = async (req: Request, res: Response) => {
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
    const { type, details }: CreateCustomerPaymentMethodRequest = req.body;

    // Validate payment method details
    const validation = validatePaymentMethodDetails(type, details);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method details',
        errors: validation.errors
      });
    }

    // Check if user already has a payment method of this type
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: { 
        userId,
        type 
      }
    });

    if (existingMethod) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${getPaymentTypeDisplayName(type)} payment method`
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        details: details as any
      }
    });

    const response: CustomerPaymentMethodResponse = {
      id: paymentMethod.id,
      type: paymentMethod.type,
      details: paymentMethod.details as any,
      createdAt: paymentMethod.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Payment method created successfully',
      data: response
    });

  } catch (error) {
    console.error('Error creating customer payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment method'
    });
  }
};

/**
 * PATCH /api/users/payment-methods/:id
 * Update a customer payment method (authenticated user only)
 */
export const updateCustomerPaymentMethod = async (req: Request, res: Response) => {
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
    const { id } = req.params;
    const { type, details }: UpdateCustomerPaymentMethodRequest = req.body;

    // Check if payment method exists and belongs to user
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Validate payment method details if provided
    if (type && details) {
      const validation = validatePaymentMethodDetails(type, details);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method details',
          errors: validation.errors
        });
      }
    }

    // Check if type is being changed and if it conflicts
    if (type && type !== existingMethod.type) {
      const typeConflict = await prisma.paymentMethod.findFirst({
        where: { 
          userId,
          type,
          id: { not: id }
        }
      });

      if (typeConflict) {
        return res.status(400).json({
          success: false,
          message: `You already have a ${getPaymentTypeDisplayName(type)} payment method`
        });
      }
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (details !== undefined) updateData.details = details;

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: updateData
    });

    const response: CustomerPaymentMethodResponse = {
      id: paymentMethod.id,
      type: paymentMethod.type,
      details: paymentMethod.details as any,
      createdAt: paymentMethod.createdAt
    };

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: response
    });

  } catch (error) {
    console.error('Error updating customer payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method'
    });
  }
};

/**
 * DELETE /api/users/payment-methods/:id
 * Delete a customer payment method (authenticated user only)
 */
export const deleteCustomerPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if payment method exists and belongs to user
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        orders: true
      }
    });

    if (!existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Check if payment method is being used in orders
    if (existingMethod.orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete payment method that is being used in orders',
        data: {
          orderCount: existingMethod.orders.length
        }
      });
    }

    await prisma.paymentMethod.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
    });
  }
};

/**
 * GET /api/users/payment-methods/types
 * Get available payment method types with display information
 */
export const getPaymentMethodTypes = async (req: Request, res: Response) => {
  try {
    const types = [
      {
        type: 'AYA_BANK',
        displayName: getPaymentTypeDisplayName('AYA_BANK'),
        icon: getPaymentTypeIcon('AYA_BANK'),
        description: 'AYA Bank account transfer',
        requiredFields: ['accountNo', 'accountName']
      },
      {
        type: 'KBZ_BANK',
        displayName: getPaymentTypeDisplayName('KBZ_BANK'),
        icon: getPaymentTypeIcon('KBZ_BANK'),
        description: 'KBZ Bank account transfer',
        requiredFields: ['accountNo', 'accountName']
      },
      {
        type: 'AYA_PAY',
        displayName: getPaymentTypeDisplayName('AYA_PAY'),
        icon: getPaymentTypeIcon('AYA_PAY'),
        description: 'AYA Pay mobile payment',
        requiredFields: ['phone', 'name']
      },
      {
        type: 'KBZ_PAY',
        displayName: getPaymentTypeDisplayName('KBZ_PAY'),
        icon: getPaymentTypeIcon('KBZ_PAY'),
        description: 'KBZ Pay mobile payment',
        requiredFields: ['phone', 'name']
      }
    ];

    res.json({
      success: true,
      data: types
    });

  } catch (error) {
    console.error('Error fetching payment method types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment method types'
    });
  }
};

// Validation middleware
export const validateCreatePaymentMethod = [
  body('type')
    .isIn(['AYA_BANK', 'KBZ_BANK', 'AYA_PAY', 'KBZ_PAY'])
    .withMessage('Invalid payment method type'),
  body('details')
    .isObject()
    .withMessage('Details must be an object')
];

export const validateUpdatePaymentMethod = [
  param('id')
    .isString()
    .withMessage('Invalid payment method ID'),
  body('type')
    .optional()
    .isIn(['AYA_BANK', 'KBZ_BANK', 'AYA_PAY', 'KBZ_PAY'])
    .withMessage('Invalid payment method type'),
  body('details')
    .optional()
    .isObject()
    .withMessage('Details must be an object')
];

export const validatePaymentMethodId = [
  param('id')
    .isString()
    .withMessage('Invalid payment method ID')
];
