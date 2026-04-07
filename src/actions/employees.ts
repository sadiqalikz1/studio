'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { createEmployeeSchema, updateEmployeeSchema, bulkCreateEmployeesSchema } from '@/lib/validations/employee';
import { ServerError, ValidationError } from '@/lib/api/auth';
import { headers } from 'next/headers';

/**
 * Helper: Get current user from auth token
 */
async function getCurrentUser() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ServerError('Unauthorized', 401);
  }

  const token = authHeader.slice(7);
  try {
    const decodedToken = await require('@/lib/firebase-admin').verifyIdToken(token);
    return decodedToken;
  } catch {
    throw new ServerError('Invalid token', 401);
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = createEmployeeSchema.parse(data);

    const db = getAdminFirestore();
    const newEmployee = {
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('employees').add(newEmployee);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newEmployee,
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
      };
    }
    console.error('Error creating employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create employee',
    };
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, data: unknown) {
  try {
    await getCurrentUser();
    const validatedData = updateEmployeeSchema.parse(data);

    const db = getAdminFirestore();
    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('employees').doc(id).update(updateData);

    return {
      success: true,
      data: { id, ...updateData },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
      };
    }
    console.error('Error updating employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update employee',
    };
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string) {
  try {
    await getCurrentUser();

    const db = getAdminFirestore();
    await db.collection('employees').doc(id).delete();

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete employee',
    };
  }
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: string) {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('employees').doc(id).get();

    if (!doc.exists) {
      return {
        success: false,
        error: 'Employee not found',
      };
    }

    return {
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    };
  } catch (error) {
    console.error('Error fetching employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch employee',
    };
  }
}

/**
 * Bulk create employees
 */
export async function bulkCreateEmployees(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedEmployees = bulkCreateEmployeesSchema.parse(data);

    const db = getAdminFirestore();
    const batch = db.batch();

    let createdCount = 0;
    const createdIds: string[] = [];

    validatedEmployees.forEach((employee) => {
      const docRef = db.collection('employees').doc();
      const employeeData = {
        ...employee,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(docRef, employeeData);
      createdIds.push(docRef.id);
      createdCount++;
    });

    await batch.commit();

    return {
      success: true,
      data: {
        createdCount,
        createdIds,
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
      };
    }
    console.error('Error bulk creating employees:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create employees',
    };
  }
}
