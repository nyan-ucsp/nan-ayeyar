// Use string literal types instead of enums to avoid conflicts
export type CompanyPaymentAccountType = 'AYA_BANK' | 'KBZ_BANK' | 'AYA_PAY' | 'KBZ_PAY';
export type PaymentMethodType = 'AYA_BANK' | 'KBZ_BANK' | 'AYA_PAY' | 'KBZ_PAY';

// Company Payment Account Types
export interface CompanyPaymentAccountDetails {
  accountNo: string;
  accountName: string;
  phone?: string;
  branch?: string;
  swiftCode?: string;
  notes?: string;
}

export interface CreateCompanyPaymentAccountRequest {
  name: string;
  type: CompanyPaymentAccountType;
  details: CompanyPaymentAccountDetails;
  enabled?: boolean;
}

export interface UpdateCompanyPaymentAccountRequest {
  name?: string;
  type?: CompanyPaymentAccountType;
  details?: CompanyPaymentAccountDetails;
  enabled?: boolean;
}

export interface CompanyPaymentAccountResponse {
  id: string;
  name: string;
  type: CompanyPaymentAccountType;
  details: CompanyPaymentAccountDetails;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Payment Method Types
export interface CustomerPaymentMethodDetails {
  accountNumber?: string;
  accountName?: string;
}

export interface CreateCustomerPaymentMethodRequest {
  type: PaymentMethodType;
  details: CustomerPaymentMethodDetails;
}

export interface UpdateCustomerPaymentMethodRequest {
  type?: PaymentMethodType;
  details?: CustomerPaymentMethodDetails;
}

export interface CustomerPaymentMethodResponse {
  id: string;
  type: PaymentMethodType;
  details: CustomerPaymentMethodDetails;
  createdAt: Date;
}

// Online Transfer Order Types
export interface OnlineTransferOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
    city: string;
    state: string;
    postalCode: string;
  };
  companyAccountId: string;
  transactionId: string;
  customerAccountName: string;
  customerAccountNo: string;
  paymentScreenshot?: string; // file path
}

export interface OnlineTransferOrderResponse {
  id: string;
  status: string;
  paymentType: string;
  totalAmount: number;
  transactionId: string;
  customerAccountName: string;
  customerAccountNo: string;
  paymentScreenshot?: string;
  companyAccount: CompanyPaymentAccountResponse;
  createdAt: Date;
}

// Payment Confirmation Types
export interface PaymentConfirmationRequest {
  orderId: string;
  confirmed: boolean;
  notes?: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    status: string;
    updatedAt: Date;
  };
}

// Payment Method Validation
export const validatePaymentMethodDetails = (
  type: PaymentMethodType,
  details: CustomerPaymentMethodDetails
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  switch (type) {
    case 'AYA_BANK':
    case 'KBZ_BANK':
      if (!details.accountNumber) {
        errors.push('Account number is required for bank transfers');
      }
      if (!details.accountName) {
        errors.push('Account name is required for bank transfers');
      }
      break;
    
    case 'AYA_PAY':
    case 'KBZ_PAY':
      if (!details.accountNumber) {
        errors.push('Account number is required for mobile payments');
      }
      if (!details.accountName) {
        errors.push('Account name is required for mobile payments');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Company Account Validation
export const validateCompanyAccountDetails = (
  type: CompanyPaymentAccountType,
  details: CompanyPaymentAccountDetails
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!details.accountNo) {
    errors.push('Account number is required');
  }
  if (!details.accountName) {
    errors.push('Account name is required');
  }

  switch (type) {
    case 'AYA_BANK':
    case 'KBZ_BANK':
      // Branch is optional in admin UI; don't require it
      break;
    
    case 'AYA_PAY':
    case 'KBZ_PAY':
      // Phone number is optional for mobile payment accouns
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Payment Type Helpers
export const getPaymentTypeDisplayName = (type: PaymentMethodType | CompanyPaymentAccountType): string => {
  switch (type) {
    case 'AYA_BANK':
      return 'AYA Bank';
    case 'KBZ_BANK':
      return 'KBZ Bank';
    case 'AYA_PAY':
      return 'AYA Pay';
    case 'KBZ_PAY':
      return 'KBZ Pay';
    default:
      return type;
  }
};

export const getPaymentTypeIcon = (type: PaymentMethodType | CompanyPaymentAccountType): string => {
  switch (type) {
    case 'AYA_BANK':
    case 'KBZ_BANK':
      return '🏦';
    case 'AYA_PAY':
    case 'KBZ_PAY':
      return '📱';
    default:
      return '💳';
  }
};
