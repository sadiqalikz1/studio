import { z } from 'zod';

export const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Employee name is required'),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  iqamaNumber: z.string().min(1, 'Iqama number is required'),
  iqamaExpiry: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  photoUrl: z.string().optional(),
  iqamaDocumentUrl: z.string().optional(),
  passportDocumentUrl: z.string().optional(),
  startDate: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active').optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Employee = z.infer<typeof employeeSchema>;

export const createEmployeeSchema = employeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateEmployee = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;

export const bulkCreateEmployeesSchema = z.array(createEmployeeSchema);

export type BulkCreateEmployees = z.infer<typeof bulkCreateEmployeesSchema>;
