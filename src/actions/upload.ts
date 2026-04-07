'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { bulkCreateInvoicesSchema, bulkCreateSuppliersSchema } from '@/lib/validations';
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
 * Process and commit an upload (invoices, payments, notes)
 * This handles atomic batch writes to prevent partial data insertion
 */
export async function commitUpload(
  uploadData: any,
  uploadType: 'invoices' | 'payments' | 'debitNotes' | 'creditNotes'
) {
  try {
    const user = await getCurrentUser();

    const db = getAdminFirestore();
    const batch = db.batch();

    let createdCount = 0;
    const createdIds: string[] = [];

    // Validate based on type
    if (uploadType === 'invoices') {
      const validatedInvoices = bulkCreateInvoicesSchema.parse(uploadData);
      validatedInvoices.forEach((invoice) => {
        const docRef = db.collection('invoices').doc();
        const data = {
          ...invoice,
          uploadedAt: new Date().toISOString(),
        };
        batch.set(docRef, data);
        createdIds.push(docRef.id);
        createdCount++;
      });
    } else if (uploadType === 'debitNotes' || uploadType === 'creditNotes') {
      // Handle notes
      uploadData.forEach((note: any) => {
        const docRef = db.collection(uploadType).doc();
        const data = {
          ...note,
          createdAt: new Date().toISOString(),
        };
        batch.set(docRef, data);
        createdIds.push(docRef.id);
        createdCount++;
      });
    }

    // Commit the batch
    await batch.commit();

    // Create upload history record
    const historyRef = db.collection('uploadHistory').doc();
    await historyRef.set({
      uploadType,
      uploadedBy: user.uid,
      uploadedAt: new Date().toISOString(),
      totalRecords: createdCount,
      successCount: createdCount,
      failureCount: 0,
      status: 'completed',
    });

    return {
      success: true,
      data: {
        uploadId: historyRef.id,
        uploadType,
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
    console.error('Error committing upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to commit upload',
    };
  }
}

/**
 * Save a mapping preset for future uploads
 */
export async function savePreset(presetData: Record<string, any>) {
  try {
    const user = await getCurrentUser();

    const db = getAdminFirestore();
    const preset = {
      ...presetData,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('mappingPresets').add(preset);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...preset,
      },
    };
  } catch (error) {
    console.error('Error saving preset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save preset',
    };
  }
}
