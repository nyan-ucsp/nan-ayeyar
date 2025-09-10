import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  CreateCompanyPaymentAccountRequest, 
  UpdateCompanyPaymentAccountRequest,
  CompanyPaymentAccountResponse,
  validateCompanyAccountDetails,
  getPaymentTypeDisplayName,
  getPaymentTypeIcon
} from '../types/payment';
import { body, param, validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * GET /api/admin/company-accounts
 * List all company payment accounts (admin only)
 */
export const getCompanyPaymentAccounts = async (req: Request, res: Response) => {
  try {
    const { enabled, type } = req.query;

    const where: any = {};
    
    if (enabled !== undefined) {
      where.enabled = enabled === 'true';
    }
    
    if (type) {
      where.type = type;
    }

    const accounts = await prisma.companyPaymentAccount.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: CompanyPaymentAccountResponse[] = accounts.map((account: any) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      details: account.details as any,
      enabled: account.enabled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }));

    res.json({
      success: true,
      data: response,
      count: response.length
    });

  } catch (error) {
    console.error('Error fetching company payment accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company payment accounts'
    });
  }
};

/**
 * GET /api/admin/company-accounts/:id
 * Get a specific company payment account (admin only)
 */
export const getCompanyPaymentAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const account = await prisma.companyPaymentAccount.findUnique({
      where: { id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Company payment account not found'
      });
    }

    const response: CompanyPaymentAccountResponse = {
      id: account.id,
      name: account.name,
      type: account.type,
      details: account.details as any,
      enabled: account.enabled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching company payment account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company payment account'
    });
  }
};

/**
 * POST /api/admin/company-accounts
 * Create a new company payment account (admin only)
 */
export const createCompanyPaymentAccount = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, type, details, enabled = true }: CreateCompanyPaymentAccountRequest = req.body;

    // Validate payment method details
    const validation = validateCompanyAccountDetails(type, details);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment account details',
        errors: validation.errors
      });
    }

    // Check if account with same name already exists
    const existingAccount = await prisma.companyPaymentAccount.findFirst({
      where: { name }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'A company payment account with this name already exists'
      });
    }

    const account = await prisma.companyPaymentAccount.create({
      data: {
        name,
        type,
        details: details as any,
        enabled
      }
    });

    const response: CompanyPaymentAccountResponse = {
      id: account.id,
      name: account.name,
      type: account.type,
      details: account.details as any,
      enabled: account.enabled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Company payment account created successfully',
      data: response
    });

  } catch (error) {
    console.error('Error creating company payment account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company payment account'
    });
  }
};

/**
 * PATCH /api/admin/company-accounts/:id
 * Update a company payment account (admin only)
 */
export const updateCompanyPaymentAccount = async (req: Request, res: Response) => {
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
    const { name, type, details, enabled }: UpdateCompanyPaymentAccountRequest = req.body;

    // Check if account exists
    const existingAccount = await prisma.companyPaymentAccount.findUnique({
      where: { id }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Company payment account not found'
      });
    }

    // Validate payment method details if provided
    if (type && details) {
      const validation = validateCompanyAccountDetails(type, details);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment account details',
          errors: validation.errors
        });
      }
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== existingAccount.name) {
      const nameConflict = await prisma.companyPaymentAccount.findFirst({
        where: { 
          name,
          id: { not: id }
        }
      });

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'A company payment account with this name already exists'
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (details !== undefined) {
      // Merge details to avoid wiping fields not provided by admin UI
      const mergedDetails = { ...(existingAccount.details as any || {}), ...(details as any) };
      updateData.details = mergedDetails;
    }
    if (enabled !== undefined) updateData.enabled = enabled;

    const account = await prisma.companyPaymentAccount.update({
      where: { id },
      data: updateData
    });

    const response: CompanyPaymentAccountResponse = {
      id: account.id,
      name: account.name,
      type: account.type,
      details: account.details as any,
      enabled: account.enabled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };

    res.json({
      success: true,
      message: 'Company payment account updated successfully',
      data: response
    });

  } catch (error) {
    console.error('Error updating company payment account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company payment account'
    });
  }
};

/**
 * DELETE /api/admin/company-accounts/:id
 * Delete a company payment account (admin only)
 */
export const deleteCompanyPaymentAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if account exists
    const existingAccount = await prisma.companyPaymentAccount.findUnique({
      where: { id },
      include: {
        orders: true
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Company payment account not found'
      });
    }

    // Check if account is being used in orders
    if (existingAccount.orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete company payment account that is being used in orders',
        data: {
          orderCount: existingAccount.orders.length
        }
      });
    }

    await prisma.companyPaymentAccount.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Company payment account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company payment account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company payment account'
    });
  }
};

/**
 * GET /api/company-accounts
 * Get enabled company payment accounts (public endpoint for checkout)
 */
export const getEnabledCompanyPaymentAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.companyPaymentAccount.findMany({
      where: { enabled: true },
      orderBy: {
        type: 'asc'
      }
    });

    const response = accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      displayName: getPaymentTypeDisplayName(account.type),
      icon: getPaymentTypeIcon(account.type),
      details: account.details as any
    }));

    res.json({
      success: true,
      data: response,
      count: response.length
    });

  } catch (error) {
    console.error('Error fetching enabled company payment accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company payment accounts'
    });
  }
};

// Validation middleware
export const validateCreateCompanyAccount = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('type')
    .isIn(['AYA_BANK', 'KBZ_BANK', 'AYA_PAY', 'KBZ_PAY'])
    .withMessage('Invalid payment account type'),
  body('details')
    .isObject()
    .withMessage('Details must be an object'),
  body('details.accountNo')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Account number is required and must be less than 50 characters'),
  body('details.accountName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Account name is required and must be less than 100 characters'),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean')
];

export const validateUpdateCompanyAccount = [
  param('id')
    .isString()
    .withMessage('Invalid account ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('type')
    .optional()
    .isIn(['AYA_BANK', 'KBZ_BANK', 'AYA_PAY', 'KBZ_PAY'])
    .withMessage('Invalid payment account type'),
  body('details')
    .optional()
    .isObject()
    .withMessage('Details must be an object'),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean')
];

export const validateCompanyAccountId = [
  param('id')
    .isString()
    .withMessage('Invalid account ID')
];
