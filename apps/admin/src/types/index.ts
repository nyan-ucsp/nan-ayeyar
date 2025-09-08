// User types
export interface User {
  id: string;
  email: string;
  name: string;
  address?: string;
  locale: 'en' | 'my';
  role: 'customer' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  sku?: string;
  name_en: string;
  name_my?: string;
  description_en?: string;
  description_my?: string;
  images: string[];
  price: number;
  disabled: boolean;
  outOfStock: boolean;
  allowSellWithoutStock: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  sku?: string;
  name_en: string;
  name_my?: string;
  description_en?: string;
  description_my?: string;
  price: number;
  disabled?: boolean;
  outOfStock?: boolean;
  allowSellWithoutStock?: boolean;
  metadata?: Record<string, any>;
}

// Stock types
export interface StockEntry {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
  createdAt: string;
  product?: Product;
}

export interface StockFormData {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface InventorySummary {
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  totalValue: number;
  averageCost: number;
  salePrice: number;
  lastUpdated: string;
  lowStock: boolean;
  outOfStock: boolean;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentType: PaymentType;
  paymentMethodId?: string;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
  };
  transactionId?: string;
  paymentScreenshot?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: User;
  paymentMethod?: PaymentMethod;
  refunds?: Refund[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  metadata?: Record<string, any>;
  product?: Product;
}

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  refundedAt: string;
  reason: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'ON_HOLD'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentType = 'COD' | 'ONLINE_TRANSFER';

// Payment method types
export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  details: PaymentMethodDetails;
  createdAt: string;
  user?: User;
}

export type PaymentMethodType = 'AYA_BANK' | 'KBZ_BANK' | 'AYA_PAY' | 'KBZ_PAY';

export interface PaymentMethodDetails {
  accountName: string;
  accountNumber?: string;
  phoneNumber?: string;
}

// Address types
export interface ShippingAddress {
  name: string;
  address: string;
  phone: string;
}

// Dashboard types
export interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: Order[];
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
  }>;
}

// Settings types
export interface BankAccount {
  id: string;
  type: PaymentMethodType;
  accountName: string;
  accountNumber?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountFormData {
  type: PaymentMethodType;
  accountName: string;
  accountNumber?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Filter types
export interface ProductFilters {
  search?: string;
  disabled?: boolean;
  outOfStock?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name' | 'price';
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentType?: PaymentType;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'newest' | 'oldest' | 'amount';
}

export interface UserFilters {
  search?: string;
  role?: 'customer' | 'admin';
  isEmailVerified?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name' | 'email';
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Language types
export type Locale = 'en' | 'my';

export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: any) => string;
}
