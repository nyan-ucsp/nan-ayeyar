export interface Product {
  id: string;
  sku?: string;
  name: string;
  name_en?: string;
  name_my?: string;
  description?: string;
  description_en?: string;
  description_my?: string;
  images?: string[];
  price: number;
  disabled: boolean;
  outOfStock: boolean;
  allowSellWithoutStock: boolean;
  metadata?: {
    variety?: string;
    weight?: string;
    grade?: string;
    harvestDate?: string;
    origin?: string;
    packageType?: string;
    [key: string]: any;
  };
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  address?: string;
  locale: 'en' | 'my';
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentType: PaymentType;
  paymentMethodId?: string;
  totalAmount: number;
  shippingAddress: any;
  transactionId?: string;
  paymentScreenshot?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  unitPrice: number;
  quantity: number;
  metadata?: any;
  product?: Product;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  details: any;
  createdAt: string;
}

export interface CompanyPaymentAccount {
  id: string;
  name: string;
  type: CompanyPaymentAccountType;
  details: any;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'ON_HOLD'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentType = 'COD' | 'ONLINE_TRANSFER';

export type PaymentMethodType = 'AYA_BANK' | 'KBZ_BANK' | 'AYA_PAY' | 'KBZ_PAY';

export type CompanyPaymentAccountType = 'AYA_BANK' | 'KBZ_BANK' | 'AYA_PAY' | 'KBZ_PAY';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  address?: string;
  locale: 'en' | 'my';
}

export interface ProductFilters {
  search?: string;
  variety?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
  locale?: 'en' | 'my';
}