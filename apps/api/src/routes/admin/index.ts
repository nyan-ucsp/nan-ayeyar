import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';
import profileRoutes from './profile';
import userRoutes from './users';
import orderRoutes from './orders';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication and admin role middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// Mount sub-routes
router.use('/profile', profileRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);

// Update admin profile
router.patch('/profile', [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, address } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        address,
        updatedAt: new Date(),
      },
    });

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Change admin password
router.patch('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'No password set for this account'
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Get admin dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic metrics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      ordersByStatus
    ] = await Promise.all([
      prisma.user.count({
        where: { role: 'customer' }
      }),
      prisma.product.count({
        where: { disabled: false }
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'DELIVERED' }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.product.findMany({
        where: {
          disabled: false,
          stockEntries: {
            some: {
              quantity: { lt: 10 } // Low stock threshold
            }
          }
        },
        take: 5,
        include: {
          stockEntries: {
            select: { quantity: true }
          }
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // Transform orders by status to the format expected by frontend
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    ordersByStatus.forEach(group => {
      const status = group.status.toUpperCase();
      const count = group._count.status;
      
      switch (status) {
        case 'PENDING':
          statusCounts.pending = count;
          break;
        case 'PROCESSING':
          statusCounts.processing = count;
          break;
        case 'SHIPPED':
          statusCounts.shipped = count;
          break;
        case 'DELIVERED':
          statusCounts.delivered = count;
          break;
        case 'CANCELED':
        case 'CANCELLED':
          statusCounts.cancelled = count;
          break;
        case 'ON_HOLD':
          statusCounts.pending += count; // Treat ON_HOLD as pending
          break;
        case 'RETURNED':
        case 'REFUNDED':
          statusCounts.cancelled += count; // Treat returned/refunded as cancelled
          break;
      }
    });

    const metrics = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      ordersByStatus: statusCounts,
      recentOrders,
      lowStockProducts: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name_en,
        currentStock: product.stockEntries.reduce((sum, entry) => sum + entry.quantity, 0)
      }))
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics'
    });
  }
});


// Create new product
router.post('/products', authenticate, requireAdmin, [
  body('name_en').notEmpty().withMessage('English name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('images').optional().isArray(),
  body('sku').optional().isString(),
  body('name_my').optional().isString(),
  body('description_en').optional().isString(),
  body('description_my').optional().isString(),
  body('disabled').optional().isBoolean(),
  body('outOfStock').optional().isBoolean(),
  body('allowSellWithoutStock').optional().isBoolean(),
  body('metadata').optional().isObject(),
], async (req: any, res: any) => {
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
      name_en,
      name_my,
      description_en,
      description_my,
      price,
      images = [],
      sku,
      disabled = false,
      outOfStock = false,
      allowSellWithoutStock = true,
      metadata = {}
    } = req.body;

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          error: 'Product with this SKU already exists'
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        name_en,
        name_my,
        description_en,
        description_my,
        price,
        images,
        sku,
        disabled,
        outOfStock,
        allowSellWithoutStock,
        metadata
      }
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// Update product
router.put('/products/:id', authenticate, requireAdmin, [
  body('name_en').optional().notEmpty().withMessage('English name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('images').optional().isArray(),
  body('sku').optional().isString(),
  body('name_my').optional().isString(),
  body('description_en').optional().isString(),
  body('description_my').optional().isString(),
  body('disabled').optional().isBoolean(),
  body('outOfStock').optional().isBoolean(),
  body('allowSellWithoutStock').optional().isBoolean(),
  body('metadata').optional().isObject(),
], async (req: any, res: any) => {
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
    const updateData = req.body;

    // Check if SKU already exists (if being updated)
    if (updateData.sku) {
      const existingProduct = await prisma.product.findFirst({
        where: { 
          sku: updateData.sku,
          id: { not: id }
        }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          error: 'Product with this SKU already exists'
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/products/:id', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete product that has been ordered'
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// Admin Products Management
// Get products for admin (with all fields and filters)
router.get('/products', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      disabled,
      outOfStock,
      sortBy = 'newest'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name_en: { contains: search, mode: 'insensitive' } },
        { name_my: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (disabled !== undefined) {
      where.disabled = disabled === 'true';
    }

    if (outOfStock !== undefined) {
      where.outOfStock = outOfStock === 'true';
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { name_en: 'asc' };
        break;
      case 'price':
        orderBy = { price: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    // For now, just return products without stock calculation
    const productsWithStock = products.map(product => ({
      ...product,
      currentStock: 0
    }));

    res.json({
      success: true,
      data: productsWithStock,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Admin Stock Management
// Get stock entries
router.get('/stock', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      productId 
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    const [stockEntries, total] = await Promise.all([
      prisma.stockEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          product: {
            select: {
              id: true,
              name_en: true,
              name_my: true,
              sku: true,
              price: true,
              images: true
            }
          }
        }
      }),
      prisma.stockEntry.count({ where })
    ]);

    res.json({
      success: true,
      data: stockEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin stock entries fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock entries'
    });
  }
});

// Add stock entry
router.post('/stock', authenticate, requireAdmin, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity')
    .exists().withMessage('Quantity is required')
    .isInt().withMessage('Quantity must be an integer'),
  body('purchasePrice')
    .exists().withMessage('Purchase price is required')
    .isFloat({ min: 0 }).withMessage('Purchase price must be a non-negative number'),
], async (req: any, res: any) => {
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
      productId,
      quantity,
      purchasePrice
    } = req.body;

    // Coerce numeric types safely
    const parsedQuantity = parseInt(quantity, 10);
    const parsedPurchasePrice = parseFloat(purchasePrice);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const stockEntry = await prisma.stockEntry.create({
      data: {
        productId,
        quantity: parsedQuantity,
        purchasePrice: parsedPurchasePrice
      },
      include: {
        product: {
          select: {
            id: true,
            name_en: true,
            name_my: true,
            sku: true,
            price: true,
            images: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: stockEntry
    });
  } catch (error) {
    console.error('Stock entry creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stock entry'
    });
  }
});

// Admin Inventory Summary
// Get inventory summary
router.get('/inventory', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    // Get all products with their stock entries
    const products = await prisma.product.findMany({
      where: { disabled: false },
      include: {
        stockEntries: {
          select: {
            quantity: true,
            purchasePrice: true
          }
        }
      }
    });

    // Calculate inventory summary for each product
    const inventorySummary = products.map(product => {
      const stockEntries = product.stockEntries || [];
      const totalStock = stockEntries.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
      const totalValue = stockEntries.reduce((sum, entry) => {
        const price = entry.purchasePrice || product.price || 0;
        const quantity = entry.quantity || 0;
        return sum + (Number(price) * quantity);
      }, 0);
      const averageCost = totalStock > 0 ? totalValue / totalStock : 0;

      return {
        productId: product.id,
        productName: product.name_en || 'Unknown Product',
        productSku: product.sku || '',
        currentStock: totalStock,
        totalValue,
        averageCost,
        salePrice: product.price || 0,
        lastUpdated: product.updatedAt,
        lowStock: totalStock < 10, // Low stock threshold
        outOfStock: totalStock === 0
      };
    });

    res.json({
      success: true,
      data: inventorySummary
    });
  } catch (error) {
    console.error('Inventory summary fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory summary'
    });
  }
});

export default router;