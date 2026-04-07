
export type Status = 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue';
export type TransactionType = 'invoice' | 'debitNote' | 'creditNote';

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  defaultCreditDays: number;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Invoice {
  id: string;
  branchId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  creditDays: number;
  amount: number;
  paidAmount: number;
  remainingBalance: number;
  status: Status;
}

export interface DebitNote {
  id: string;
  branchId: string;
  supplierId: string;
  referenceNumber: string;
  date: string;
  amount: number;
  reason: string;
  description?: string;
  createdAt: string;
  createdBy: string;
}

export interface CreditNote {
  id: string;
  branchId: string;
  supplierId: string;
  referenceNumber: string;
  date: string;
  amount: number;
  reason: string;
  description?: string;
  createdAt: string;
  createdBy: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  supplierId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
}

export interface Statistics {
  totalOutstanding: number;
  totalOverdue: number;
  upcoming7Days: number;
  upcoming15Days: number;
  upcoming30Days: number;
}
