import { z } from 'zod';

export const creditNoteSchema = z.object({
  id: z.string().optional(),
  branchId: z.string().min(1, 'Branch ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  noteDate: z.string().date().or(z.coerce.date()).transform(d => typeof d === 'string' ? d : d.toISOString().split('T')[0]),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
  createdByUserId: z.string().min(1, 'Created by user ID is required'),
  createdAt: z.string().datetime().optional(),
});

export type CreditNote = z.infer<typeof creditNoteSchema>;

export const createCreditNoteSchema = creditNoteSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateCreditNote = z.infer<typeof createCreditNoteSchema>;

export const debitNoteSchema = z.object({
  id: z.string().optional(),
  branchId: z.string().min(1, 'Branch ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  noteDate: z.string().date().or(z.coerce.date()).transform(d => typeof d === 'string' ? d : d.toISOString().split('T')[0]),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
  createdByUserId: z.string().min(1, 'Created by user ID is required'),
  createdAt: z.string().datetime().optional(),
});

export type DebitNote = z.infer<typeof debitNoteSchema>;

export const createDebitNoteSchema = debitNoteSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateDebitNote = z.infer<typeof createDebitNoteSchema>;
