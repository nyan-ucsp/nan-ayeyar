import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { Product, ApiResponse, PaginatedResponse, ApiError } from '@/types';

class ApiClient {
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
        const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
        console.log('API Client - Request interceptor, token exists:', !!token);
        console.log('API Client - Request URL:', config.url);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('API Client - Authorization header set');
        } else {
          console.log('API Client - No token found, request without auth');
        }
        return config;
      },
      (error) => {
        console.error('API Client - Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Client - Response success:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.log('API Client - Response error:', error.response?.status, error.config?.url);
        console.log('API Client - Error details:', error.response?.data);
        // Let the AuthContext handle 401 errors and logout logic
        // This prevents automatic redirects that might interfere with auth state
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get(url: string): Promise<AxiosResponse> {
    return this.client.get(url);
  }

  async post(url: string, data?: any): Promise<AxiosResponse> {
    return this.client.post(url, data);
  }

  async put(url: string, data?: any): Promise<AxiosResponse> {
    return this.client.put(url, data);
  }

  async delete(url: string): Promise<AxiosResponse> {
    return this.client.delete(url);
  }

  // Auth endpoints
  async register(data: {
    email: string;
    name: string;
    password: string;
    address: string;
    locale: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.post('/api/auth/register', data);
    return response.data;
  }

  async verifyOtp(data: { email: string; otp: string }): Promise<{ success: boolean; data: { token: string; user: any }; message?: string }> {
    const response = await this.client.post('/api/auth/verify-otp', data);
    return response.data;
  }

  // Updated return type to match actual API response structure
  async login(data: { email: string; password: string }): Promise<{ success: boolean; data: { token: string; user: any }; message?: string }> {
    const response = await this.client.post('/api/auth/login', data);
    return response.data;
  }

  async requestOtp(data: { email: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.post('/api/auth/request-otp', data);
    return response.data;
  }

  async updateProfile(data: { name: string; address: string; locale: string }): Promise<{ success: boolean; data: { user: any }; message?: string }> {
    const response = await this.client.put('/api/users/profile', data);
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    const response = await this.client.patch('/api/users/change-password', data);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/auth/reset-password', data);
    return response.data;
  }

  // Product endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    variety?: string;
    weight?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    sortBy?: string;
    locale?: string;
    disabled?: boolean;
    excludeId?: string;
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.client.get('/api/products', { params });
    return response.data;
  }

  async getProduct(id: string, locale?: string): Promise<ApiResponse<Product>> {
    const response = await this.client.get(`/api/products/${id}`, {
      params: { locale },
    });
    return response.data;
  }

  // Order endpoints
  async createOrder(data: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: any;
    paymentType: string;
    paymentMethodId?: string;
    transactionId?: string;
    paymentScreenshot?: string;
  }): Promise<any> {
    const response = await this.client.post('/api/orders', data);
    return response.data;
  }

  async getOrder(id: string): Promise<any> {
    const response = await this.client.get(`/api/orders/${id}`);
    return response.data;
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> {
    const response = await this.client.get('/api/orders', { params });
    return response.data;
  }

  async updateOrderTransaction(orderId: string, transactionId: string): Promise<any> {
    const response = await this.client.patch(`/api/orders/${orderId}/transaction`, {
      transactionId
    });
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<any> {
    const response = await this.client.patch(`/api/orders/${orderId}/cancel`);
    return response.data;
  }

  async returnOrder(orderId: string): Promise<any> {
    const response = await this.client.patch(`/api/orders/${orderId}/return`);
    return response.data;
  }

  // Payment method endpoints
  async getPaymentMethods(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/api/users/payment-methods');
    return response.data;
  }

  async addPaymentMethod(data: {
    type: string;
    details: any;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/users/payment-methods', data);
    return response.data;
  }

  async updatePaymentMethod(id: string, data: {
    type: string;
    details: any;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.patch(`/api/users/payment-methods/${id}`, data);
    return response.data;
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.delete(`/api/users/payment-methods/${id}`);
    return response.data;
  }

  // Company payment accounts
  async getCompanyPaymentAccounts(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get('/api/company-accounts');
    return response.data;
  }

  // File upload
  async uploadFile(file: File): Promise<{ success: boolean; image: { url: string; processedUrl?: string; thumbnailUrl?: string } }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();