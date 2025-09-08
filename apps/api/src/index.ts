import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentMethodRoutes from './routes/paymentMethods';
import uploadRoutes from './routes/uploads';
import uploadApiRoutes from './routes/upload';
import adminFileRoutes from './routes/admin/files';
import adminUserRoutes from './routes/admin/users';
import adminRoutes from './routes/admin';
import companyPaymentAccountRoutes from './routes/companyPaymentAccounts';
import onlineTransferOrderRoutes from './routes/onlineTransferOrders';
// import userRoutes from './routes/users'; // Removed - using admin users instead

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { apiRateLimit } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware with image-friendly CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3001", "http://127.0.0.1:3001", "http://nanayeyarapi.nxera.top", "https://nanayeyarapi.nxera.top"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// General API rate limiting
app.use(apiRateLimit);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://nanayeyar.nxera.top',
    process.env.ADMIN_URL || 'https://nanayeyaradmin.nxera.top'
  ],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Static file serving for uploads (with proper headers)
app.use('/uploads', express.static(path.join(__dirname, '../../storage/uploads'), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set CORS headers for cross-origin image access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Set appropriate headers for uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    
    // Allow cross-origin resource sharing for images
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Static file serving for seed images
app.use('/storage', express.static(path.join(__dirname, '../../storage'), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set CORS headers for cross-origin image access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Set appropriate headers for uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    
    // Allow cross-origin resource sharing for images
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api/users', userRoutes); // Removed - using admin users instead
app.use('/api/users/payment-methods', paymentMethodRoutes);
app.use('/api/company-accounts', companyPaymentAccountRoutes);
app.use('/api/orders/online-transfer', onlineTransferOrderRoutes);

// File upload and serving routes
app.use('/', uploadRoutes);
app.use('/api/upload', uploadApiRoutes);
// Backward/alternate prefix support for clients using /api/uploads
app.use('/api/uploads', uploadApiRoutes);

// Admin routes (with admin prefix for clarity)
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/files', adminFileRoutes);
app.use('/api/admin/company-accounts', companyPaymentAccountRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
