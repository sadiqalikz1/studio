'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { createInvoiceSchema, updateInvoiceSchema, bulkCreateInvoicesSchema } from '@/lib/validations';
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
 * Create a new invoice
 */
export async function createInvoice(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = createInvoiceSchema.parse(data);

    const db = getAdminFirestore();
    const newInvoice = {
      ...validatedData,
      uploadedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('invoices').add(newInvoice);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newInvoice,
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
    console.error('Error creating invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invoice',
    };
  }
}

/**
 * Batch create invoices with atomic write
 */
export async function batchCreateInvoices(invoices: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedInvoices = bulkCreateInvoicesSchema.parse(invoices);

    const db = getAdminFirestore();
    const batch = db.batch();
    const createdInvoices: Array<{ id: string; [key: string]: any }> = [];

    validatedInvoices.forEach((invoice) => {
      const docRef = db.collection('invoices').doc();
      const newInvoice = {
        ...invoice,
        uploadedAt: new Date().toISOString(),
      };
      batch.set(docRef, newInvoice);
      createdInvoices.push({
        id: docRef.id,
        ...newInvoice,
      });
    });

    await batch.commit();

    return {
      success: true,
      data: {
        created: createdInvoices.length,
        invoices: createdInvoices,
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
    console.error('Error batch creating invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to batch create invoices',
    };
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(id: string, status: string) {
  try {
    await getCurrentUser();

    if (!['Pending', 'Partially Paid', 'Paid', 'Overdue'].includes(status)) {
      return {
        success: false,
        error: 'Invalid status',
      };
    }

    const db = getAdminFirestore();
    await db.collection('invoices').doc(id).update({ status });

    return {
      success: true,
      data: { id, status },
    };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invoice status',
    };
  }
}
