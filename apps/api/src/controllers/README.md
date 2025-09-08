# Payment System Controllers

This directory contains the controllers for the comprehensive payment system in the Nan Ayeyar e-commerce platform, including company payment accounts, customer payment methods, and online transfer orders.

## 🏦 **Company Payment Accounts**

### **Purpose**
Company payment accounts are the bank accounts and mobile payment accounts that customers transfer money to when making online payments. These are managed by admins and displayed to customers during checkout.

### **Features**
- **Multiple Account Types**: AYA Bank, KBZ Bank, AYA Pay, KBZ Pay
- **Account Details**: Account number, account name, phone, branch, etc.
- **Enable/Disable**: Admins can enable or disable accounts
- **Public Access**: Enabled accounts are available for customer checkout

### **API Endpoints**

#### **Public Endpoints**
```typescript
GET /api/company-accounts
// Get enabled company payment accounts for checkout
```

#### **Admin Endpoints**
```typescript
GET    /api/admin/company-accounts        // List all accounts
GET    /api/admin/company-accounts/:id    // Get specific account
POST   /api/admin/company-accounts        // Create new account
PATCH  /api/admin/company-accounts/:id    // Update account
DELETE /api/admin/company-accounts/:id    // Delete account
```

### **Data Structure**
```typescript
interface CompanyPaymentAccount {
  id: string;
  name: string;                    // e.g., "AYA Bank - Main Account"
  type: 'AYA_BANK' | 'KBZ_BANK' | 'AYA_PAY' | 'KBZ_PAY';
  details: {
    accountNo: string;
    accountName: string;
    phone?: string;                // For mobile payments
    branch?: string;               // For bank accounts
    swiftCode?: string;
    notes?: string;
  };
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 💳 **Customer Payment Methods**

### **Purpose**
Customer payment methods are the bank accounts and mobile payment accounts that customers use to make payments. These are personal accounts that customers add to their profile.

### **Features**
- **Personal Accounts**: Each customer can add their own payment methods
- **Multiple Types**: Support for all payment types (AYA Bank, KBZ Bank, AYA Pay, KBZ Pay)
- **Validation**: Type-specific validation for account details
- **One Per Type**: Customers can only have one payment method per type

### **API Endpoints**
```typescript
GET    /api/users/payment-methods         // List customer's payment methods
GET    /api/users/payment-methods/types   // Get available payment types
GET    /api/users/payment-methods/:id     // Get specific payment method
POST   /api/users/payment-methods         // Add new payment method
PATCH  /api/users/payment-methods/:id     // Update payment method
DELETE /api/users/payment-methods/:id     // Delete payment method
```

### **Data Structure**
```typescript
interface CustomerPaymentMethod {
  id: string;
  type: 'AYA_BANK' | 'KBZ_BANK' | 'AYA_PAY' | 'KBZ_PAY';
  details: {
    accountNo?: string;           // For bank accounts
    accountName?: string;         // For bank accounts
    phone?: string;               // For mobile payments
    name?: string;                // For mobile payments
  };
  createdAt: Date;
}
```

## 🔄 **Online Transfer Orders**

### **Purpose**
Online transfer orders handle the complete flow of customers making payments via bank transfer or mobile payment, including payment confirmation by admins.

### **Features**
- **Order Creation**: Customers create orders with payment details
- **Payment Proof**: Upload payment screenshots
- **Admin Confirmation**: Admins can confirm or reject payments
- **Status Management**: Orders move through PENDING → PROCESSING/ON_HOLD
- **Inventory Deduction**: Automatic stock deduction on order creation

### **API Endpoints**

#### **Customer Endpoints**
```typescript
POST /api/orders/online-transfer          // Create online transfer order
GET  /api/orders/:id/payment-info         // Get payment info for own order
```

#### **Admin Endpoints**
```typescript
PATCH /api/orders/:id/payment-confirmation // Confirm/reject payment
GET   /api/orders/:id/payment-details      // Get detailed payment info
```

### **Order Flow**
1. **Customer Creates Order**: Provides items, shipping address, payment details
2. **Payment Details**: Transaction ID, customer account info, optional screenshot
3. **Order Status**: Set to PENDING
4. **Admin Review**: Admin views payment proof and confirms/rejects
5. **Status Update**: Order moves to PROCESSING (confirmed) or ON_HOLD (rejected)

### **Data Structure**
```typescript
interface OnlineTransferOrder {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'ON_HOLD' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  paymentType: 'ONLINE_TRANSFER';
  totalAmount: number;
  transactionId: string;
  customerAccountName: string;
  customerAccountNo: string;
  paymentScreenshot?: string;
  companyAccount: CompanyPaymentAccount;
  createdAt: Date;
}
```

## 🔐 **Security & Validation**

### **Authentication**
- **Customer Routes**: Require user authentication
- **Admin Routes**: Require admin role authentication
- **Public Routes**: Company accounts for checkout (no auth required)

### **Validation**
- **Payment Method Details**: Type-specific validation
- **Account Information**: Required fields based on payment type
- **Order Data**: Comprehensive validation for order creation
- **File Uploads**: Payment screenshot validation

### **Business Rules**
- **One Payment Method Per Type**: Customers can only have one payment method per type
- **Account Uniqueness**: Company account names must be unique
- **Order Ownership**: Customers can only access their own orders
- **Payment Confirmation**: Only admins can confirm payments

## 📊 **Usage Examples**

### **Create Company Payment Account (Admin)**
```typescript
POST /api/admin/company-accounts
{
  "name": "AYA Bank - Main Account",
  "type": "AYA_BANK",
  "details": {
    "accountNo": "1234567890",
    "accountName": "Nan Ayeyar Trading Co.",
    "branch": "Yangon Main Branch",
    "swiftCode": "AYABMMYY"
  },
  "enabled": true
}
```

### **Add Customer Payment Method**
```typescript
POST /api/users/payment-methods
{
  "type": "AYA_BANK",
  "details": {
    "accountNo": "9876543210",
    "accountName": "John Doe"
  }
}
```

### **Create Online Transfer Order**
```typescript
POST /api/orders/online-transfer
{
  "items": [
    {
      "productId": "product123",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "phone": "09123456789",
    "city": "Yangon",
    "state": "Yangon",
    "postalCode": "11001"
  },
  "companyAccountId": "company_account123",
  "transactionId": "TXN123456789",
  "customerAccountName": "John Doe",
  "customerAccountNo": "9876543210",
  "paymentScreenshot": "/uploads/2024/01/15/screenshot.jpg"
}
```

### **Confirm Payment (Admin)**
```typescript
PATCH /api/orders/order123/payment-confirmation
{
  "confirmed": true,
  "notes": "Payment verified and confirmed"
}
```

## 🎯 **Integration Points**

### **Frontend Integration**
- **Checkout Flow**: Display company accounts for customer selection
- **Payment Methods**: Manage customer payment methods in profile
- **Order Tracking**: Show payment status and confirmation
- **File Upload**: Upload payment screenshots

### **Database Integration**
- **Prisma Models**: CompanyPaymentAccount, PaymentMethod, Order
- **Relations**: Orders linked to company accounts and customer payment methods
- **Transactions**: Atomic operations for order creation and inventory deduction

### **File System Integration**
- **Payment Screenshots**: Stored in organized directory structure
- **Image Processing**: Automatic optimization and thumbnail generation
- **Static Serving**: Optimized file serving with caching

## 🚀 **Performance Considerations**

- **Database Indexing**: Optimized queries for payment methods and orders
- **Caching**: Company accounts cached for checkout performance
- **File Optimization**: Payment screenshots optimized for storage
- **Transaction Safety**: Atomic operations for order creation

## 🧪 **Testing**

### **Unit Tests**
- Payment method validation
- Order creation logic
- Payment confirmation flow
- Error handling scenarios

### **Integration Tests**
- End-to-end order creation
- Payment confirmation workflow
- File upload and serving
- Database transaction integrity

This payment system provides a complete solution for handling online transfers in the Nan Ayeyar e-commerce platform, with robust security, validation, and admin management capabilities.
