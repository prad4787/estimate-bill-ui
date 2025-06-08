export interface Client {
  id: string;
  name: string;
  address?: string;
  panVat?: string;
  openingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  address: string;
  panVat: string;
  openingBalance: string;
}

export interface EstimateItem {
  sn: number;
  item: string;
  quantity: number;
  rate: number;
  total: number;
  description: string;
}

export interface Estimate {
  id: string;
  number: string;
  date: string;
  clientId: string;
  items: EstimateItem[];
  subTotal: number;
  discountType: 'rate' | 'amount';
  discountValue: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  paymentMedium?: PaymentMedium;
}

export interface EstimateFormData {
  date: string;
  clientId: string;
  items: EstimateItem[];
  discountType: 'rate' | 'amount';
  discountValue: number;
}

export type PaymentType = 'cash' | 'wallet' | 'bank' | 'cheque';

export interface BasePaymentMedium {
  type: PaymentType;
  balance?: number;
}

export interface CashPayment extends BasePaymentMedium {
  type: 'cash';
  balance?: number;
}

export interface WalletPayment extends BasePaymentMedium {
  type: 'wallet';
  walletName: string;
  accountName: string;
  accountNumber: string;
  balance?: number;
}

export interface BankPayment extends BasePaymentMedium {
  type: 'bank';
  bankName: string;
  accountName: string;
  accountNumber: string;
  balance?: number;
}

export interface ChequePayment extends BasePaymentMedium {
  type: 'cheque';
}

export type PaymentMedium = CashPayment | WalletPayment | BankPayment | ChequePayment;

export interface Transaction {
  id: string;
  amount: number;
  paymentType: PaymentType;
  paymentMedium?: PaymentMedium;
  chequeDetails?: {
    bankName: string;
    chequeNumber: string;
    chequeName: string;
    chequeDate: string;
  };
}

export interface Receipt {
  id: string;
  date: string;
  clientId: string;
  transactions: Transaction[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptFormData {
  date: string;
  clientId: string;
  transactions: Omit<Transaction, 'id'>[];
}

export interface OrganizationInfo {
  name: string;
  address: string;
  phones: string[];
  emails: string[];
  logo?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
}

export interface OrganizationFormData {
  name: string;
  address: string;
  phones: string[];
  emails: string[];
  website: string;
  taxId: string;
  registrationNumber: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface AgingBucket {
  label: string;
  range: string;
  bills: Bill[];
  totalAmount: number;
  count: number;
}