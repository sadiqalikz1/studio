import { z } from 'zod';

export const branchSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Branch = z.infer<typeof branchSchema>;

export const createBranchSchema = branchSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateBranch = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = createBranchSchema.partial();

export type UpdateBranch = z.infer<typeof updateBranchSchema>;
