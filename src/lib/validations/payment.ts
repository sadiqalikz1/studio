import { z } from 'zod';

export const paymentSchema = z.object({
  id: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  paymentDate: z.string().date().or(z.coerce.date()).transform(d => typeof d === 'string' ? d : d.toISOString().split('T')[0]),
  amount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.string().default('Bank Transfer'),
  referenceNumber: z.string().optional(),
  paidByUserId: z.string().min(1, 'Paid by user ID is required'),
  createdAt: z.string().datetime().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

export const createPaymentSchema = paymentSchema.omit({
  id: true,
  createdAt: true,
});

export type CreatePayment = z.infer<typeof createPaymentSchema>;

export const applyFIFOPaymentSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().date(),
  referenceNumber: z.string().optional(),
  paymentMethod: z.string().default('Bank Transfer'),
  uploadedByUserId: z.string().min(1, 'User ID is required'),
});

export type ApplyFIFOPayment = z.infer<typeof applyFIFOPaymentSchema>;

export const invoiceAllocationSchema = z.object({
  id: z.string().optional(),
  paymentId: z.string().min(1, 'Payment ID is required'),
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amountApplied: z.number().positive('Amount applied must be positive'),
  allocatedAt: z.string().datetime().optional(),
});

export type InvoiceAllocation = z.infer<typeof invoiceAllocationSchema>;
