import { z } from 'zod';

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Supplier name is required'),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  defaultCreditDays: z.number().int().min(0, 'Credit days must be >= 0'),
  category: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Supplier = z.infer<typeof supplierSchema>;

export const createSupplierSchema = supplierSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateSupplier = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema.partial();

export type UpdateSupplier = z.infer<typeof updateSupplierSchema>;

export const bulkCreateSuppliersSchema = z.array(createSupplierSchema);

export type BulkCreateSuppliers = z.infer<typeof bulkCreateSuppliersSchema>;
