# Nan Ayeyar E-commerce Frontend

A modern, responsive e-commerce frontend built with React, TypeScript, and Tailwind CSS for the Nan Ayeyar rice trading platform.

## 🚀 Features

### Core Functionality
- **Product Catalog**: Browse and search premium rice varieties with advanced filtering
- **Shopping Cart**: Persistent cart with local storage support
- **User Authentication**: Email + OTP verification system
- **Order Management**: Complete order tracking and history
- **Payment Integration**: Support for COD and online transfers
- **Multi-language Support**: English and Myanmar (မြန်မာ) localization

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG compliant components and navigation
- **Performance**: Optimized images and lazy loading
- **SEO Ready**: Meta tags and structured data
- **PWA Ready**: Service worker and offline support ready

### Technical Features
- **TypeScript**: Full type safety and IntelliSense
- **React Hooks**: Modern functional components
- **Context API**: Global state management
- **Form Validation**: React Hook Form with validation
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Skeleton loaders and spinners

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Internationalization**: react-i18next

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, Modal, etc.)
│   ├── layout/          # Layout components (Header, Footer)
│   ├── products/        # Product-related components
│   └── auth/            # Authentication components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   ├── CartContext.tsx  # Shopping cart state
│   └── LanguageContext.tsx # Language/locale state
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── api.ts          # API client configuration
│   └── i18n.ts         # Internationalization setup
├── locales/             # Translation files
│   ├── en.json         # English translations
│   └── my.json         # Myanmar translations
├── pages/               # Next.js pages
│   ├── _app.tsx        # App wrapper with providers
│   ├── index.tsx       # Homepage
│   ├── login.tsx       # Login page
│   ├── register.tsx    # Registration page
│   ├── verify-otp.tsx  # OTP verification
│   ├── products/       # Product pages
│   ├── cart.tsx        # Shopping cart
│   ├── checkout.tsx    # Checkout process
│   ├── orders/         # Order management
│   └── profile.tsx     # User profile
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
   NEXT_PUBLIC_APP_NAME=Nan Ayeyar
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🌐 Internationalization

The app supports English and Myanmar languages with complete translations for:

- **UI Elements**: Buttons, labels, navigation
- **Product Information**: Names, descriptions, specifications
- **Error Messages**: Validation and API errors
- **Email Templates**: OTP and notification emails
- **Form Labels**: All input fields and validation messages

### Adding New Translations

1. **Update translation files** in `src/locales/`
2. **Use translation hook** in components:
   ```tsx
   import { useLanguage } from '@/contexts/LanguageContext';
   
   const { t } = useLanguage();
   return <h1>{t('products.title')}</h1>;
   ```

## 🛒 Shopping Cart

The cart system includes:

- **Persistent Storage**: Cart persists across browser sessions
- **Real-time Updates**: Instant quantity and price updates
- **Stock Validation**: Prevents overselling
- **Guest Support**: Works without user authentication

### Cart Features

```tsx
import { useCart } from '@/contexts/CartContext';

const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

// Add product to cart
addToCart(product, quantity);

// Update quantity
updateQuantity(productId, newQuantity);

// Remove item
removeFromCart(productId);
```

## 🔐 Authentication

### Authentication Flow

1. **Registration**: Email, name, address, locale selection
2. **OTP Verification**: 6-digit code sent via email
3. **Login**: Email + password authentication
4. **Session Management**: JWT tokens with automatic refresh

### Protected Routes

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { isAuthenticated, user, login, logout } = useAuth();

if (!isAuthenticated) {
  return <LoginPage />;
}
```

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Mobile-First Approach

- Touch-friendly interface
- Optimized navigation
- Swipe gestures for image galleries
- Mobile-optimized forms

## 🎨 Design System

### Color Palette

- **Primary**: Blue tones (#0ea5e9)
- **Secondary**: Rice-themed yellows (#eab308)
- **Neutral**: Gray scale for text and backgrounds
- **Status**: Green (success), Red (error), Yellow (warning)

### Typography

- **English**: Inter font family
- **Myanmar**: Noto Sans Myanmar font family
- **Responsive**: Fluid typography scaling

### Components

All components follow consistent patterns:

- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Validation**: Real-time form validation

## 🔧 API Integration

### API Client

```tsx
import { apiClient } from '@/lib/api';

// Get products
const products = await apiClient.getProducts({
  page: 1,
  limit: 20,
  locale: 'en'
});

// Create order
const order = await apiClient.createOrder({
  items: cartItems,
  shippingAddress: address,
  paymentType: 'COD'
});
```

### Error Handling

- **Network Errors**: Automatic retry with exponential backoff
- **Validation Errors**: Field-specific error messages
- **Authentication**: Automatic token refresh and logout

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
   - `NEXT_PUBLIC_APP_NAME`
3. **Deploy**: Automatic deployments on push

### Docker

```bash
docker build -t nan-ayeyar-ecommerce .
docker run -p 3000:3000 nan-ayeyar-ecommerce
```

## 🔍 SEO Optimization

- **Meta Tags**: Dynamic title and description
- **Open Graph**: Social media sharing
- **Structured Data**: Product and organization markup
- **Sitemap**: Automatic sitemap generation
- **Performance**: Core Web Vitals optimization

## 🚀 Performance

### Optimization Features

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components and images
- **Caching**: API response caching
- **Bundle Analysis**: Webpack bundle analyzer

### Performance Metrics

- **Lighthouse Score**: 90+ across all categories
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

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

- **Email**: support@nanayeyar.com
- **Documentation**: [docs.nanayeyar.com](https://docs.nanayeyar.com)
- **Issues**: [GitHub Issues](https://github.com/nanayeyar/ecommerce/issues)

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Next.js** for the React framework
- **Vercel** for deployment platform
- **React Community** for excellent libraries and tools
