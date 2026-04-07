'use server';

import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin';
import { createSupplierSchema, updateSupplierSchema, bulkCreateSuppliersSchema } from '@/lib/validations';
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
 * Create a new supplier
 */
export async function createSupplier(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = createSupplierSchema.parse(data);

    const db = getAdminFirestore();
    const newSupplier = {
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('suppliers').add(newSupplier);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newSupplier,
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
    console.error('Error creating supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create supplier',
    };
  }
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(id: string, data: unknown) {
  try {
    await getCurrentUser();
    const validatedData = updateSupplierSchema.parse(data);

    const db = getAdminFirestore();
    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('suppliers').doc(id).update(updateData);

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
    console.error('Error updating supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update supplier',
    };
  }
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(id: string) {
  try {
    await getCurrentUser();

    const db = getAdminFirestore();
    await db.collection('suppliers').doc(id).delete();

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete supplier',
    };
  }
}

/**
 * Bulk import suppliers
 */
export async function bulkCreateSuppliers(suppliers: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedSuppliers = bulkCreateSuppliersSchema.parse(suppliers);

    const db = getAdminFirestore();
    const batch = db.batch();
    const createdSuppliers: Array<{ id: string; [key: string]: any }> = [];

    validatedSuppliers.forEach((supplier) => {
      const docRef = db.collection('suppliers').doc();
      const newSupplier = {
        ...supplier,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(docRef, newSupplier);
      createdSuppliers.push({
        id: docRef.id,
        ...newSupplier,
      });
    });

    await batch.commit();

    return {
      success: true,
      data: {
        created: createdSuppliers.length,
        suppliers: createdSuppliers,
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
    console.error('Error bulk creating suppliers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to bulk create suppliers',
    };
  }
}
