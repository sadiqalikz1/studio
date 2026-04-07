import { z } from 'zod';

export const invoiceStatusSchema = z.enum(['Pending', 'Partially Paid', 'Paid', 'Overdue']);

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceSchema = z.object({
  id: z.string().optional(),
  branchId: z.string().min(1, 'Branch ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().date().or(z.coerce.date()).transform(d => typeof d === 'string' ? d : d.toISOString().split('T')[0]),
  invoiceAmount: z.number().positive('Invoice amount must be positive'),
  creditDays: z.number().int().min(0, 'Credit days must be >= 0'),
  dueDate: z.string().date().or(z.coerce.date()).transform(d => typeof d === 'string' ? d : d.toISOString().split('T')[0]),
  remainingBalance: z.number().min(0, 'Remaining balance cannot be negative'),
  status: invoiceStatusSchema,
  isOpeningBalance: z.boolean().default(false),
  uploadedAt: z.string().datetime().optional(),
  uploadedByUserId: z.string().min(1, 'Uploaded by user ID is required'),
});

export type Invoice = z.infer<typeof invoiceSchema>;

export const createInvoiceSchema = invoiceSchema.omit({
  id: true,
  uploadedAt: true,
});

export type CreateInvoice = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;

export const bulkCreateInvoicesSchema = z.array(createInvoiceSchema);

export type BulkCreateInvoices = z.infer<typeof bulkCreateInvoicesSchema>;
