import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload, processImage, generateThumbnail } from '../middleware/upload';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get products (public)
 * Returns paginated list of products with locale support
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('locale').optional().isIn(['en', 'my']),
  query('search').optional().isString(),
  query('variety').optional().isString(),
  query('weight').optional().isString(),
  query('priceMin').optional().isFloat({ min: 0 }),
  query('priceMax').optional().isFloat({ min: 0 }),
  query('inStock').optional().isBoolean(),
  query('sortBy').optional().isIn(['priceLow', 'priceHigh', 'name', 'newest', 'oldest']),
  query('disabled').optional().isBoolean(),
  query('excludeId').optional().isString(),
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
      page = 1, 
      limit = 20, 
      locale = 'en',
      search,
      variety,
      weight,
      priceMin,
      priceMax,
      inStock,
      sortBy = 'newest',
      disabled = false,
      excludeId
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      disabled: disabled === 'true' ? true : false,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    if (search) {
      where.OR = [
        { name_en: { contains: search, mode: 'insensitive' } },
        { name_my: { contains: search, mode: 'insensitive' } },
        { description_en: { contains: search, mode: 'insensitive' } },
        { description_my: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Note: For metadata filtering, we'll need to filter after fetching
    // since Prisma doesn't support complex JSON path queries easily

    if (priceMin !== undefined) {
      where.price = { gte: parseFloat(priceMin as string) };
    }

    if (priceMax !== undefined) {
      where.price = { 
        ...where.price,
        lte: parseFloat(priceMax as string) 
      };
    }

    if (inStock === 'true') {
      where.outOfStock = false;
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'priceLow':
        orderBy = { price: 'asc' };
        break;
      case 'priceHigh':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name_en: 'asc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          stockEntries: {
            select: {
              quantity: true,
            }
          },
        },
        skip,
        take: parseInt(limit as string),
        orderBy,
      }),
      prisma.product.count({ where })
    ]);

    // Calculate total stock and format response based on locale
    let formattedProducts = products.map(product => {
      const totalStock = product.stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);
      
      return {
        id: product.id,
        sku: product.sku,
        name: locale === 'my' ? (product.name_my || product.name_en) : product.name_en,
        name_en: product.name_en,
        name_my: product.name_my,
        description: locale === 'my' ? (product.description_my || product.description_en) : product.description_en,
        description_en: product.description_en,
        description_my: product.description_my,
        images: product.images,
        price: product.price,
        disabled: product.disabled,
        outOfStock: product.outOfStock,
        allowSellWithoutStock: product.allowSellWithoutStock,
        metadata: product.metadata,
        totalStock: totalStock > 0 ? 1 : 0, // Hide actual quantity, only show if in stock or not
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    // Apply metadata filtering after fetching (since Prisma JSON queries are complex)
    if (variety) {
      formattedProducts = formattedProducts.filter(product => 
        product.metadata && (product.metadata as any).variety === variety
      );
    }

    if (weight) {
      formattedProducts = formattedProducts.filter(product => 
        product.metadata && (product.metadata as any).weight === weight
      );
    }

    res.json({
      success: true,
      data: formattedProducts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get product by ID (public)
 * Returns detailed product information
 */
router.get('/:id', [
  query('locale').optional().isIn(['en', 'my']),
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
    const { locale = 'en' } = req.query;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockEntries: {
          select: {
            quantity: true,
            purchasePrice: true,
            createdAt: true,
          }
        },
      }
    });

    if (!product || product.disabled) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const totalStock = product.stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);

    const formattedProduct = {
      id: product.id,
      sku: product.sku,
      name: locale === 'my' ? (product.name_my || product.name_en) : product.name_en,
      description: locale === 'my' ? (product.description_my || product.description_en) : product.description_en,
      images: product.images,
      price: product.price,
      disabled: product.disabled,
      outOfStock: product.outOfStock,
      allowSellWithoutStock: product.allowSellWithoutStock,
      metadata: product.metadata,
      totalStock,
      stockEntries: product.stockEntries,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Create product (admin only)
 * Creates a new product with optional image uploads
 */
router.post('/', authenticate, requireAdmin, upload.array('images', 10), [
  body('name_en').notEmpty().trim(),
  body('name_my').optional().trim(),
  body('description_en').optional().trim(),
  body('description_my').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('sku').optional().trim(),
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
      sku,
      metadata = {}
    } = req.body;

    // Process uploaded images
    const imagePaths: string[] = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filename = file.filename;
        const baseName = filename.split('.')[0];
        const ext = filename.split('.').pop();
        
        // Process main image
        const processedPath = `storage/uploads/${baseName}_processed.${ext}`;
        await processImage(file.path, { width: 1200, height: 1200, quality: 85 });
        
        // Generate thumbnail
        const thumbnailPath = `storage/uploads/${baseName}_thumb.${ext}`;
        await generateThumbnail(file.path, 300);
        
        imagePaths.push(`/uploads/${filename}`);
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        sku,
        name_en,
        name_my,
        description_en,
        description_my,
        images: imagePaths,
        price: parseFloat(price),
        metadata,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Update product (admin only)
 * Updates product information including stock status
 */
router.patch('/:id', authenticate, requireAdmin, [
  body('name_en').optional().trim(),
  body('name_my').optional().trim(),
  body('description_en').optional().trim(),
  body('description_my').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
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
    const updateData: any = {};

    // Only include fields that are provided
    if (req.body.name_en !== undefined) updateData.name_en = req.body.name_en;
    if (req.body.name_my !== undefined) updateData.name_my = req.body.name_my;
    if (req.body.description_en !== undefined) updateData.description_en = req.body.description_en;
    if (req.body.description_my !== undefined) updateData.description_my = req.body.description_my;
    if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
    if (req.body.disabled !== undefined) updateData.disabled = req.body.disabled === 'true';
    if (req.body.outOfStock !== undefined) updateData.outOfStock = req.body.outOfStock === 'true';
    if (req.body.allowSellWithoutStock !== undefined) updateData.allowSellWithoutStock = req.body.allowSellWithoutStock === 'true';
    if (req.body.metadata !== undefined) updateData.metadata = req.body.metadata;

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Add stock entry (admin only)
 * Adds stock entry for a product
 */
router.post('/stock', authenticate, requireAdmin, [
  body('productId').notEmpty(),
  body('quantity').isInt({ min: 1 }),
  body('purchasePrice').isFloat({ min: 0 }),
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

    const { productId, quantity, purchasePrice } = req.body;

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
        quantity: parseInt(quantity),
        purchasePrice: parseFloat(purchasePrice),
      }
    });

    res.status(201).json({
      success: true,
      message: 'Stock entry created successfully',
      stockEntry
    });
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
