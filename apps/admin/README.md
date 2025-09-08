# Nan Ayeyar Admin Frontend

A comprehensive admin dashboard for managing the Nan Ayeyar rice trading platform, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Admin Authentication**: Secure JWT-based login with role verification
- **Dashboard**: Real-time metrics, order statistics, and quick actions
- **Product Management**: Full CRUD operations with image upload and metadata
- **Stock Management**: Inventory tracking and stock entry management
- **Order Management**: Order processing, status updates, and refund handling
- **User Management**: Customer listing and payment method oversight
- **Settings**: Bank account configuration for payment processing

### Admin Capabilities
- **Product Control**: Enable/disable products, mark out of stock, manage pricing
- **Inventory Management**: Add stock entries with purchase price tracking
- **Order Processing**: Update order status, process refunds, view payment screenshots
- **Customer Support**: View customer details and payment methods
- **Business Settings**: Configure bank accounts for online transfers

### Technical Features
- **Responsive Design**: Mobile-first admin interface
- **Real-time Updates**: Live data synchronization
- **File Upload**: Image management with drag-and-drop
- **Form Validation**: Comprehensive input validation
- **Error Handling**: Graceful error management with user feedback
- **Security**: Role-based access control and secure authentication

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **File Upload**: React Dropzone
- **Charts**: Recharts (for dashboard metrics)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, Modal, Card)
│   ├── layout/          # Layout components (Sidebar, Header, AdminLayout)
│   ├── products/        # Product management components
│   └── orders/          # Order management components
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state management
├── lib/                 # Utility libraries
│   └── api.ts          # Admin API client configuration
├── pages/               # Next.js pages
│   ├── _app.tsx        # App wrapper with providers
│   ├── login.tsx       # Admin login page
│   ├── dashboard.tsx   # Admin dashboard
│   ├── products/       # Product management pages
│   ├── stock.tsx       # Stock management page
│   ├── orders/         # Order management pages
│   ├── users.tsx       # User management page
│   └── settings.tsx    # Settings page
├── styles/              # Global styles
│   └── globals.css     # Tailwind imports and custom styles
├── types/               # TypeScript type definitions
│   └── index.ts        # Shared types
└── utils/               # Utility functions
    ├── cn.ts           # Class name utility
    └── storage.ts      # Local storage helpers
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 3001
- Admin user account with proper role

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_ADMIN_APP_NAME=Nan Ayeyar Admin
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3002](http://localhost:3002)

### Build for Production

```bash
npm run build
npm start
```

## 🔐 Authentication

### Admin Login
- **Endpoint**: `/api/auth/login`
- **Required Role**: `admin`
- **Session**: JWT token with automatic refresh
- **Security**: Role verification on every request

### Access Control
- **Protected Routes**: All admin pages require authentication
- **Role Verification**: Only users with `admin` role can access
- **Auto-redirect**: Unauthorized users redirected to login

## 📊 Dashboard

### Key Metrics
- **Total Orders**: Count of all orders
- **Total Sales**: Revenue from completed orders
- **Total Products**: Number of active products
- **Total Customers**: Registered customer count

### Order Status Overview
- Visual breakdown of orders by status
- Quick status filtering and updates
- Recent orders with customer information

### Quick Actions
- Direct links to product management
- Stock entry shortcuts
- Order processing tools
- User management access

## 🛍️ Product Management

### Product CRUD Operations
- **Create**: Add new products with images and metadata
- **Read**: View product details and inventory status
- **Update**: Edit product information and settings
- **Delete**: Remove products from catalog

### Product Features
- **Multilingual Support**: English and Myanmar names/descriptions
- **Image Management**: Multiple product images with drag-and-drop upload
- **Metadata Fields**: Custom fields for rice-specific attributes
- **Stock Control**: Enable/disable and out-of-stock management
- **Pricing**: Flexible pricing with currency formatting

### Product Status Management
- **Active/Disabled**: Toggle product visibility in store
- **Stock Status**: Mark products as out of stock
- **Sell Without Stock**: Allow sales even without inventory

## 📦 Stock Management

### Stock Entry System
- **Add Stock**: Record inventory additions with purchase prices
- **Product Selection**: Choose from existing products
- **Quantity Tracking**: Record exact quantities added
- **Cost Tracking**: Track purchase prices for profit analysis

### Inventory Overview
- **Current Stock**: Real-time inventory levels
- **Stock Value**: Total inventory value calculation
- **Low Stock Alerts**: Visual indicators for low inventory
- **Stock History**: Complete audit trail of stock movements

### Stock Features
- **Transaction-based**: Each stock entry is a separate transaction
- **Cost Tracking**: Purchase price recording for profit analysis
- **Automatic Updates**: Real-time inventory level updates
- **Stock Alerts**: Visual indicators for low stock levels

## 📋 Order Management

### Order Processing
- **Order Listing**: Comprehensive order list with filtering
- **Status Updates**: Change order status with visual feedback
- **Order Details**: Complete order information and timeline
- **Payment Verification**: View payment screenshots and details

### Order Status Workflow
1. **Pending**: New orders awaiting processing
2. **Processing**: Orders being prepared
3. **On Hold**: Orders temporarily paused
4. **Shipped**: Orders in transit
5. **Delivered**: Completed orders
6. **Canceled**: Cancelled orders
7. **Returned**: Returned orders
8. **Refunded**: Refunded orders

### Refund Processing
- **Refund Requests**: Process refunds for online transfers
- **Refund Tracking**: Record refund amounts and reasons
- **Status Updates**: Automatic status change to "Refunded"
- **Audit Trail**: Complete refund history

## 👥 User Management

### Customer Overview
- **Customer List**: View all registered customers
- **Customer Details**: Access customer information and history
- **Payment Methods**: View customer payment methods
- **Order History**: Customer order tracking

### User Features
- **Search & Filter**: Find customers by name, email, or status
- **Verification Status**: Track email verification status
- **Registration Date**: Customer account creation tracking
- **Activity Monitoring**: Customer engagement metrics

## ⚙️ Settings

### Bank Account Management
- **Account Configuration**: Set up bank accounts for payments
- **Payment Methods**: Configure AYA Bank, KBZ Bank, AYA Pay, KBZ Pay
- **Account Details**: Store account names, numbers, and phone numbers
- **Active Status**: Enable/disable payment methods

### System Settings
- **Company Information**: Business details and contact info
- **Payment Configuration**: Payment method settings
- **Notification Settings**: Email and system notifications
- **Security Settings**: Password policies and access controls

## 🔧 API Integration

### Admin API Endpoints
```typescript
// Authentication
POST /api/auth/login
GET  /api/auth/me

// Dashboard
GET  /api/admin/dashboard

// Products
GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/:id
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id

// Stock
GET  /api/admin/stock
POST /api/admin/stock
GET  /api/admin/inventory

// Orders
GET   /api/admin/orders/all
GET   /api/admin/orders/:id
PATCH /api/admin/orders/:id/status

// Users
GET /api/admin/users
GET /api/admin/users/:id
GET /api/admin/users/:id/payment-methods

// Settings
GET    /api/admin/settings/bank-accounts
POST   /api/admin/settings/bank-accounts
PATCH  /api/admin/settings/bank-accounts/:id
DELETE /api/admin/settings/bank-accounts/:id

// File Upload
POST /api/upload
```

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **Validation Errors**: Field-specific error messages
- **Authentication**: Automatic token refresh and logout
- **User Feedback**: Toast notifications for all actions

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions
- **Admin**: Dark grays for sidebar and navigation
- **Status Colors**: Green (success), Red (error), Yellow (warning)
- **Neutral**: Gray scale for text and backgrounds

### Components
- **Consistent Styling**: Unified design language
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **Loading States**: Skeleton loaders and spinners

### Layout
- **Sidebar Navigation**: Collapsible left navigation
- **Top Header**: User menu and notifications
- **Main Content**: Flexible content area
- **Modal System**: Overlay modals for forms and details

## 🚀 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components and data loading
- **Caching**: API response caching
- **Bundle Analysis**: Webpack bundle analyzer

### Performance Metrics
- **Lighthouse Score**: 90+ across all categories
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🧪 Testing

### Component Testing
```bash
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

## 📦 Deployment

### Vercel (Recommended)
1. **Connect Repository** to Vercel
2. **Set Environment Variables**:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_ADMIN_APP_NAME`
3. **Deploy**: Automatic deployments on push

### Docker
```bash
docker build -t nan-ayeyar-admin .
docker run -p 3002:3002 nan-ayeyar-admin
```

## 🔍 SEO & Analytics

### Admin-Specific Considerations
- **No Public SEO**: Admin interface is not publicly accessible
- **Internal Analytics**: Track admin usage and performance
- **Error Monitoring**: Comprehensive error tracking
- **Performance Monitoring**: Real-time performance metrics

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Style
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: admin-support@nanayeyar.com
- **Documentation**: [docs.nanayeyar.com/admin](https://docs.nanayeyar.com/admin)
- **Issues**: [GitHub Issues](https://github.com/nanayeyar/admin/issues)

## 🙏 Acknowledgments

- **Next.js** for the React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vercel** for deployment platform
- **React Community** for excellent libraries and tools
