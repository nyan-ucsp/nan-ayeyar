# Nan Ayeyar - E-commerce Platform

A comprehensive e-commerce platform for rice trading with admin panel, built with modern technologies and supporting both English and Myanmar languages.

## 🏗️ Architecture

This is a monorepo containing:

- **`/apps/api`** - Node.js + TypeScript + Express backend with Prisma ORM
- **`/apps/ecommerce`** - React + TypeScript e-commerce frontend with professional design system
- **`/apps/admin`** - React + TypeScript admin panel
- **`/packages/ui`** - Shared UI components and Tailwind configuration

## 🚀 Features

### E-commerce Frontend
- **Professional Design System** - Mobile-first responsive UI with Tailwind CSS
- **Multi-language support** (English/Myanmar) with react-i18next
- **Product catalog** with categories and advanced filtering
- **Shopping cart** functionality with local storage persistence
- **User authentication** with OTP verification via email
- **Order management** with status tracking and timeline
- **Payment method management** (COD and Online Transfer)
- **Responsive design** optimized for mobile, tablet, and desktop
- **Component library** with ProductCard, OrderStatusTimeline, Hero sections

### Admin Panel
- Product management (CRUD operations)
- Stock management with purchase/sale prices
- Order management and status tracking
- User management
- Category management
- File upload for product images
- Dashboard with analytics

### Backend API
- **RESTful API** with Express.js and TypeScript
- **PostgreSQL database** with Prisma ORM and comprehensive schema
- **JWT authentication** with role-based access control
- **Email OTP verification** with bilingual templates (English/Myanmar)
- **File upload handling** with local storage and image processing
- **Rate limiting** and security middleware
- **Company payment accounts** management for online transfers
- **Inventory management** with transaction-based stock tracking
- **Order processing** with payment proof handling

## 🛠️ Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Nodemailer (Email)
- Multer (File uploads)
- Sharp (Image processing)

### Frontend
- **React + TypeScript** with Next.js
- **Tailwind CSS** with custom design system and responsive utilities
- **React Hook Form** for form management and validation
- **React i18next** for internationalization (English/Myanmar)
- **Axios** for API communication
- **Professional UI Components** with mobile-first responsive design
- **Local Storage** for cart persistence and user preferences

### Development
- Docker & Docker Compose
- ESLint
- TypeScript
- Concurrently (Monorepo management)

## 📋 Prerequisites

- Node.js 18+ 
- npm 9+
- Docker & Docker Compose
- PostgreSQL (if running without Docker)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd nan-ayeyar
npm install
```

### 2. Environment Configuration

```bash
cp env.example .env
```

Edit `.env` file with your configuration:
- Database connection string
- JWT secret
- SMTP email settings
- Application URLs

### 3. Run with Docker (per app)

Build and run each service individually:

```bash
# API (http://localhost:3001)
cd apps/api
docker build -t nan-ayeyar-api:local .
docker run --rm -p 3001:3001 --env-file ../../.env nan-ayeyar-api:local

# Admin (http://localhost:3002)
cd ../admin
docker build -t nan-ayeyar-admin:local .
docker run --rm -p 3002:3002 --env-file ../../.env nan-ayeyar-admin:local

# Ecommerce (http://localhost:3000)
cd ../ecommerce
docker build -t nan-ayeyar-ecommerce:local .
docker run --rm -p 3000:3000 --env-file ../../.env nan-ayeyar-ecommerce:local
```

### 4. Manual Setup (Alternative)

```bash
# Start PostgreSQL (if not using Docker)
# Create database: nan_ayeyar

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate --workspace=@nan-ayeyar/api

# Run migrations
npm run db:migrate --workspace=@nan-ayeyar/api

# Seed database
npm run db:seed --workspace=@nan-ayeyar/api

# Start development servers
npm run dev
```

## 🌐 Access Points

After starting the application:

- **E-commerce Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **API**: http://localhost:3001
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 👤 Default Credentials

After seeding the database:

**Admin User:**
- Email: `admin@nanayeyar.com`
- Password: `AdminPass123!`

**Demo Customer:**
- Email: `demo@nanayeyar.com`
- Password: `DemoPass123!`

## 📁 Project Structure

```
nan-ayeyar/
├── apps/
│   ├── api/                 # Backend API
│   │   ├── src/
│   │   │   ├── routes/      # API routes
│   │   │   ├── middleware/  # Express middleware
│   │   │   ├── utils/       # Utility functions
│   │   │   └── scripts/     # Database scripts
│   │   ├── prisma/          # Database schema
│   │   └── Dockerfile
│   ├── ecommerce/           # E-commerce frontend
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   │   ├── ui/      # UI components (ProductCard, Button, etc.)
│   │   │   │   ├── sections/ # Section components (Hero, ProductGrid)
│   │   │   │   └── layout/  # Layout components (Header, Footer)
│   │   │   ├── pages/       # Next.js pages
│   │   │   ├── locales/     # Internationalization files
│   │   │   ├── contexts/    # React contexts (Auth, Cart, Language)
│   │   │   ├── utils/       # Utility functions
│   │   │   └── types/       # TypeScript type definitions
│   │   ├── tailwind.config.js # Design system configuration
│   │   ├── DESIGN_SYSTEM.md    # Design system documentation
│   │   └── Dockerfile
│   └── admin/               # Admin panel
│       ├── src/
│       │   ├── components/  # Admin components
│       │   ├── pages/       # Admin pages
│       │   └── lib/         # Utilities
│       └── Dockerfile
├── packages/
│   └── ui/                  # Shared UI components
│       ├── src/
│       │   ├── components/  # Reusable components
│       │   └── utils/       # Utility functions
│       └── tailwind.config.js
├── storage/                 # File uploads (local storage)
│   ├── uploads/            # User uploaded files
│   └── seed-images/        # Demo product images
├── (docker-compose removed)
├── env.example             # Environment variables template
├── SEEDING_GUIDE.md        # Database seeding documentation
├── INVENTORY_MANAGEMENT.md # Inventory system documentation
├── package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level
```bash
npm run dev          # Start all development servers
npm run build        # Build all applications
npm run test         # Run all tests
npm run lint         # Lint all applications
```

### API Specific
```bash
npm run dev:api           # Start API server
npm run db:migrate        # Run database migrations
npm run db:seed           # Seed database with sample data
npm run db:seed:images    # Create seed image files
npm run db:seed:products  # Seed products only
npm run db:seed:customers # Seed customers only
npm run db:reset          # Reset database
npm run db:studio         # Open Prisma Studio
```

### Frontend Specific
```bash
npm run dev:ecommerce  # Start e-commerce frontend
npm run dev:admin      # Start admin panel
```

### Design System
```bash
# View design system examples
cd apps/ecommerce
npm run dev
# Visit http://localhost:3000/examples
```

## 🗄️ Database Schema

### Key Models
- **User** - Customer and admin users with role-based access
- **Product** - Rice products with flexible metadata and multilingual support
- **StockEntry** - Transaction-based inventory management
- **Order** - Customer orders with status tracking and payment proof
- **OrderItem** - Order line items with price snapshots
- **PaymentMethod** - Customer payment methods (AYA Bank, KBZ Bank, etc.)
- **CompanyPaymentAccount** - Company bank accounts for online transfers
- **Otp** - Email OTP verification with attempt tracking
- **Refund** - Order refund records

### Order Statuses
- PENDING → PROCESSING → SHIPPED → DELIVERED
- Alternative paths: ON_HOLD, CANCELED, RETURNED, REFUNDED

### Payment Types
- COD (Cash on Delivery)
- ONLINE_TRANSFER (AYA Bank, KBZ Bank, AYA Pay, KBZ Pay)

## 🌍 Internationalization

The platform supports:
- **English** (en)
- **Myanmar** (my)

Language switching is available in both frontend applications.

## 🎨 Design System

The ecommerce frontend includes a comprehensive design system built with Tailwind CSS:

### **Components**
- **ProductCard** - Responsive product display with hover effects and out-of-stock states
- **OrderStatusTimeline** - Visual order tracking with responsive layout
- **Button** - Multiple variants (primary, secondary, outline, ghost) with loading states
- **Hero** - Full-width banner sections with background images
- **ProductGrid** - Responsive grid layouts (2/3/4 columns)

### **Features**
- **Mobile-first design** - Optimized for phones, scaled to tablets and desktops
- **Professional aesthetics** - Clean typography, consistent spacing, soft shadows
- **Accessibility** - Proper contrast ratios, semantic HTML, keyboard navigation
- **Performance** - Optimized images, efficient CSS, minimal bundle size

### **Usage**
```bash
# View design system examples
cd apps/ecommerce
npm run dev
# Visit http://localhost:3000/examples
```

See `apps/ecommerce/DESIGN_SYSTEM.md` for detailed documentation.

## 📤 File Storage

- **Local file storage** in `/storage` directory
- **Image processing** with Sharp (resizing, optimization, thumbnails)
- **Organized structure**: `/storage/uploads/YYYY/MM/DD/` with UUID filenames
- **File validation**: Image types (JPEG, PNG, WebP) with 5MB size limit
- **Static serving**: Express routes with caching headers
- **Support for**: Product images, payment screenshots, user uploads

## 🔒 Security Features

- JWT-based authentication
- Rate limiting
- Input validation
- SQL injection protection (Prisma)
- XSS protection
- CORS configuration
- Helmet.js security headers

## 🌱 Database Seeding

The project includes a comprehensive seeding system for development and testing:

### **Available Seed Data**
- **Admin User**: `admin@nanayeyar.com` / `AdminPass123!`
- **Demo Customer**: `demo@nanayeyar.com` / `DemoPass123!`
- **10 Rice Products**: Various types with metadata and images
- **4 Company Payment Accounts**: AYA Bank, KBZ Bank, AYA Pay, KBZ Pay
- **Customer Payment Methods**: Sample payment methods for demo user

### **Seeding Commands**
```bash
# Full database seed
npm run db:seed --workspace=@nan-ayeyar/api

# Individual seed components
npm run db:seed:images --workspace=@nan-ayeyar/api    # Create seed images
npm run db:seed:products --workspace=@nan-ayeyar/api  # Seed products only
npm run db:seed:customers --workspace=@nan-ayeyar/api # Seed users only
```

See `SEEDING_GUIDE.md` for detailed documentation.

## 🧪 Testing

```bash
# Run backend tests
npm run test --workspace=@nan-ayeyar/api

# Run frontend tests
npm run test --workspace=@nan-ayeyar/ecommerce
npm run test --workspace=@nan-ayeyar/admin
```

## 🚀 Deployment

### Production Environment Variables
- Set `NODE_ENV=production`
- Use strong JWT secret
- Configure production SMTP settings
- Set up production database
- Configure file storage (consider cloud storage)

### GitHub Actions: Docker Hub Publish

This repo includes a workflow to build and push images for API, Admin, and Ecommerce on pushes to `main`:

- Workflow: `.github/workflows/docker-publish.yml`
- Images pushed:
  - `nan-ayeyar-api:latest` and `nan-ayeyar-api:<short-sha>`
  - `nan-ayeyar-admin:latest` and `nan-ayeyar-admin:<short-sha>`
  - `nan-ayeyar-ecommerce:latest` and `nan-ayeyar-ecommerce:<short-sha>`

Required GitHub Secrets:

- `NANAYEYARDOCKERHUB_USERNAME`
- `NANAYEYARDOCKERHUB_TOKEN`

Local build and push example:

```bash
cd apps/api && docker build -t $DOCKER_USER/nan-ayeyar-api:latest . && docker push $DOCKER_USER/nan-ayeyar-api:latest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments for implementation details

## 🔄 Development Workflow

1. **Database Changes**: Update Prisma schema → Generate client → Create migration
2. **API Changes**: Update routes → Test endpoints → Update frontend
3. **UI Changes**: Update shared components → Test in both apps
4. **New Features**: Plan → Implement backend → Implement frontend → Test

---

## 📚 Additional Documentation

- **`apps/ecommerce/DESIGN_SYSTEM.md`** - Complete design system documentation
- **`SEEDING_GUIDE.md`** - Database seeding guide and commands
- **`INVENTORY_MANAGEMENT.md`** - Inventory system architecture
- **`apps/api/src/scripts/README.md`** - Seeding scripts documentation
- **`apps/api/src/templates/email/README.md`** - Email templates documentation

## 🎯 Key Highlights

- **Production-Ready**: Comprehensive e-commerce platform with professional UI/UX
- **Mobile-First**: Responsive design optimized for all devices
- **Bilingual Support**: English and Myanmar language support
- **Modern Stack**: React, TypeScript, Node.js, PostgreSQL, Prisma
- **Security**: JWT authentication, rate limiting, input validation
- **File Management**: Local storage with image processing
- **Inventory System**: Transaction-based stock tracking
- **Payment Integration**: COD and online transfer support
- **Admin Panel**: Complete management interface
- **Design System**: Professional UI components with Tailwind CSS

**Note**: This is a production-ready e-commerce platform with comprehensive features for rice trading. The codebase is well-structured, documented, and follows modern development practices with a professional design system.
