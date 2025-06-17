export interface Client {
  id: number;
  name: string;
  address?: string;
  panVat?: string;
  phone?: string;
  email?: string;
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
  discountType: "rate" | "amount";
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
  discountType: "rate" | "amount";
  discountValue: number;
}

export type PaymentType = "cash" | "bank" | "wallet" | "cheque";

export interface BasePaymentMedium {
  type: PaymentType;
  balance?: number;
}

export interface CashPayment extends BasePaymentMedium {
  type: "cash";
  balance?: number;
}

export interface WalletPayment extends BasePaymentMedium {
  type: "wallet";
  walletName: string;
  accountName: string;
  accountNumber: string;
  balance?: number;
}

export interface BankPayment extends BasePaymentMedium {
  type: "bank";
  bankName: string;
  accountName: string;
  accountNumber: string;
  balance?: number;
}

export interface ChequePayment extends BasePaymentMedium {
  type: "cheque";
}

export type PaymentMedium =
  | CashPayment
  | WalletPayment
  | BankPayment
  | ChequePayment;

export interface Transaction {
  id: number;
  amount: number;
  paymentType: "cash" | "bank" | "wallet" | "cheque";
  paymentMethodId?: number;
  receiptId?: number;
  chequeDetails?: {
    bankName: string;
    chequeNumber: string;
    branchName: string;
    issueDate: string;
  };
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: number;
  date: string;
  clientId: number;
  total: number;
  notes?: string;
  transactions: Transaction[];
  client?: Client;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptFormData {
  date: string;
  clientId: number;
  notes?: string;
  transactions: Omit<
    Transaction,
    "id" | "receiptId" | "createdAt" | "updatedAt" | "paymentMethod"
  >[];
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
  id: number;
  email: string;
  role: string;
  name?: string;
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

export interface BillItem {
  id: number;
  billId: string;
  stockId: number;
  quantity: number;
  rate: number;
  total: number;
  stock?: {
    name: string;
  };
}

export interface Bill {
  id: string;
  number: string;
  date: string;
  clientId: string;
  subTotal: number;
  discountType: "rate" | "amount";
  discountValue: number;
  discountAmount: number;
  total: number;
  notes?: string;
  status: "pending" | "paid" | "cancelled";
  items: BillItem[];
  client?: {
    name: string;
    address?: string;
    panVat?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BillFormData {
  date: string;
  clientId: string;
  items: EstimateItem[];
  discountType: "rate" | "amount";
  discountValue: number;
}

export interface AgingBucket {
  label: string;
  range: string;
  bills: Bill[];
  totalAmount: number;
  count: number;
}

export interface Stock {
  id: string;
  name: string;
  quantity: number | null;
  status: "tracked" | "untracked";
  createdAt: string;
  updatedAt: string;
}

export interface StockFormData {
  name: string;
  quantity: string;
  status?: "tracked" | "untracked";
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface PaymentMethod {
  id: number;
  type: "cash" | "bank" | "wallet";
  name: string;
  accountName: string;
  accountNumber: string;
  balance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodFormData {
  type: PaymentType;
  name?: string;
  accountName?: string;
  accountNumber?: string;
  balance?: string;
  isDefault?: boolean;
}
