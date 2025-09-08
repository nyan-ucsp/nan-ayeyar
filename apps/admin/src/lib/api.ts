import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  Product, 
  ProductFormData,
  StockEntry,
  StockFormData,
  InventorySummary,
  Order, 
  User,
  PaymentMethod,
  DashboardMetrics,
  BankAccount,
  BankAccountFormData,
  OrderFilters,
  ProductFilters,
  UserFilters
} from '@/types';
import { adminStorage } from '@/utils/storage';

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = adminStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          adminStorage.clearAll();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      // Real API call
      const response: AxiosResponse<ApiResponse<{ token: string; user: User }>> = 
        await this.client.post('/api/auth/login', { email, password });
      
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || response.data.message || 'Login failed');
    } catch (error: any) {
      console.error('API login error:', error);
      
      // If it's a network error, provide a helpful message
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check if the API server is running.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Login failed - server error');
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // Real API call
      const response: AxiosResponse<ApiResponse<{ user: User }>> = 
        await this.client.get('/api/auth/me');
      
      if (response.data.success && response.data.data) {
        return response.data.data.user;
      }
      throw new Error(response.data.error || 'Failed to get user');
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response: AxiosResponse<ApiResponse<DashboardMetrics>> = 
      await this.client.get('/api/admin/dashboard');
    
    if (response.data.success) {
      return response.data.data!;
    }
    throw new Error(response.data.error || 'Failed to fetch dashboard metrics');
  }

  // Product endpoints
  async getProducts(params?: ProductFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> {
    const response: AxiosResponse<{
      success: boolean;
      data: Product[];
      pagination: any;
      error?: string;
    }> = await this.client.get('/api/admin/products', { params });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.data.error || 'Failed to fetch products');
  }

  async getProduct(id: string): Promise<Product> {
    const response: AxiosResponse<ApiResponse<{ product: Product }>> = 
      await this.client.get(`/api/admin/products/${id}`);
    
    if (response.data.success) {
      return response.data.data!.product;
    }
    throw new Error(response.data.error || 'Failed to fetch product');
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    const response: AxiosResponse<{
      success: boolean;
      data: Product;
      error?: string;
    }> = await this.client.post('/api/admin/products', data);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create product');
  }

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const response: AxiosResponse<{
      success: boolean;
      data: Product;
      error?: string;
    }> = await this.client.put(`/api/admin/products/${id}`, data);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update product');
  }

  async deleteProduct(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = 
      await this.client.delete(`/api/admin/products/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete product');
    }
  }

  // Stock endpoints
  async getStockEntries(params?: { page?: number; limit?: number; productId?: string }): Promise<PaginatedResponse<StockEntry>> {
    const response: AxiosResponse<{
      success: boolean;
      data: StockEntry[];
      pagination: any;
      error?: string;
    }> = await this.client.get('/api/admin/stock', { params });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.data.error || 'Failed to fetch stock entries');
  }

  async addStockEntry(data: StockFormData): Promise<StockEntry> {
    const response: AxiosResponse<{
      success: boolean;
      data: StockEntry;
      error?: string;
    }> = await this.client.post('/api/admin/stock', data);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to add stock entry');
  }

  async getInventorySummary(): Promise<InventorySummary[]> {
    const response: AxiosResponse<{
      success: boolean;
      data: InventorySummary[];
      error?: string;
    }> = await this.client.get('/api/admin/inventory');
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch inventory summary');
  }

  // Order endpoints

  async getOrder(id: string): Promise<Order> {
    const response: AxiosResponse<ApiResponse<{ order: Order }>> = 
      await this.client.get(`/api/admin/orders/${id}`);
    
    if (response.data.success) {
      return response.data.data!.order;
    }
    throw new Error(response.data.error || 'Failed to fetch order');
  }

  async updateOrderStatus(id: string, status: string, refundData?: { amount: number; reason: string }): Promise<Order> {
    const response: AxiosResponse<ApiResponse<{ order: Order }>> = 
      await this.client.patch(`/api/admin/orders/${id}/status`, { status, ...refundData });
    
    if (response.data.success) {
      return response.data.data!.order;
    }
    throw new Error(response.data.error || 'Failed to update order status');
  }

  // User endpoints
  async getUsers(params?: UserFilters & { page?: number; limit?: number }): Promise<{ data: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const response: AxiosResponse<{ success: boolean; data: User[]; pagination: any; error?: string }> = 
      await this.client.get('/api/admin/users', { params });
    
    if (response.data.success) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.data.error || 'Failed to fetch users');
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await this.client.get(`/api/admin/users/${id}`);
    
    if (response.data.success) {
      return response.data.data!.user;
    }
    throw new Error(response.data.error || 'Failed to fetch user');
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const response: AxiosResponse<ApiResponse<{ paymentMethods: PaymentMethod[] }>> = 
      await this.client.get(`/api/admin/users/${userId}/payment-methods`);
    
    if (response.data.success) {
      return response.data.data!.paymentMethods;
    }
    throw new Error(response.data.error || 'Failed to fetch payment methods');
  }

  // Company Payment Accounts (admin)
  async getBankAccounts(): Promise<BankAccount[]> {
    const response: AxiosResponse<{ success: boolean; data: any[]; count: number; error?: string }> = 
      await this.client.get('/api/admin/company-accounts/admin');
    if (response.data.success) {
      // Map backend shape to UI BankAccount
      return (response.data.data || []).map((acc: any) => ({
        id: acc.id,
        type: acc.type,
        accountName: acc.details?.accountName || acc.name || '',
        accountNumber: acc.details?.accountNo || '',
        isActive: acc.enabled,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      }));
    }
    throw new Error(response.data.error || 'Failed to fetch company payment accounts');
  }

  async createBankAccount(data: BankAccountFormData): Promise<BankAccount> {
    const payload = {
      name: data.accountName,
      type: data.type,
      details: {
        accountNo: data.accountNumber,
        accountName: data.accountName,
        phone: data.phoneNumber,
      },
      enabled: data.isActive ?? true,
    };
    const response: AxiosResponse<{ success: boolean; data?: any; error?: string }> = 
      await this.client.post('/api/admin/company-accounts/admin', payload);
    if (response.data.success && response.data.data) {
      const acc = response.data.data;
      return {
        id: acc.id,
        type: acc.type,
        accountName: acc.details?.accountName || acc.name || '',
        accountNumber: acc.details?.accountNo || '',
        isActive: acc.enabled,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      };
    }
    throw new Error(response.data.error || 'Failed to create company payment account');
  }

  async updateBankAccount(id: string, data: Partial<BankAccountFormData>): Promise<BankAccount> {
    const payload: any = {};
    if (data.type) payload.type = data.type;
    if (data.accountName) payload.name = data.accountName;
    if (data.isActive !== undefined) payload.enabled = data.isActive;
    if (data.accountNumber || data.accountName) {
      payload.details = {
        accountNo: data.accountNumber,
        accountName: data.accountName,
      };
    }
    const response: AxiosResponse<{ success: boolean; data?: any; error?: string }> = 
      await this.client.patch(`/api/admin/company-accounts/admin/${id}`, payload);
    if (response.data.success && response.data.data) {
      const acc = response.data.data;
      return {
        id: acc.id,
        type: acc.type,
        accountName: acc.details?.accountName || acc.name || '',
        accountNumber: acc.details?.accountNo || '',
        isActive: acc.enabled,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      };
    }
    throw new Error(response.data.error || 'Failed to update company payment account');
  }

  async deleteBankAccount(id: string): Promise<void> {
    const response: AxiosResponse<{ success: boolean; error?: string }> = 
      await this.client.delete(`/api/admin/company-accounts/admin/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete company payment account');
    }
  }

  // Account management endpoints
  async updateProfile(data: { name: string; address: string }): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await this.client.patch('/api/admin/profile', data);
    
    if (response.data.success) {
      return response.data.data!.user;
    }
    throw new Error(response.data.error || 'Failed to update profile');
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    const response: AxiosResponse<ApiResponse> = 
      await this.client.patch('/api/admin/change-password', data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to change password');
    }
  }


  async updateUser(userId: string, data: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.client.patch(`/api/admin/users/${userId}`, data);
    if (response.data.success) {
      return response.data.data!.user;
    }
    throw new Error(response.data.error || 'Failed to update user');
  }

  async deleteUser(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.delete(`/api/admin/users/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete user');
    }
  }

  async createAdminUser(data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'super_admin';
  }): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await this.client.post('/api/admin/users', data);
    if (response.data.success) {
      return response.data.data!.user;
    }
    throw new Error(response.data.error || 'Failed to create admin user');
  }

  // Order management
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Order[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const response: AxiosResponse<{ success: boolean; data: Order[]; pagination: any; error?: string }> =
      await this.client.get('/api/admin/orders', { params });
    if (response.data.success) {
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    }
    throw new Error(response.data.error || 'Failed to fetch orders');
  }



  // File upload
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response: AxiosResponse<{ success: boolean; image: { url: string; processedUrl: string; thumbnailUrl: string } }> = 
      await this.client.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
    if (response.data.success) {
      return response.data.image.processedUrl; // Use processed URL for better quality
    }
    throw new Error('Failed to upload file');
  }
}

export const adminApiClient = new AdminApiClient();
export default adminApiClient;
