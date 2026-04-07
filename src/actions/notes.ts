'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { createCreditNoteSchema, createDebitNoteSchema } from '@/lib/validations';
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
 * Create a credit note
 */
export async function createCreditNote(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = createCreditNoteSchema.parse(data);

    const db = getAdminFirestore();
    const newNote = {
      ...validatedData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('creditNotes').add(newNote);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newNote,
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
    console.error('Error creating credit note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create credit note',
    };
  }
}

/**
 * Create a debit note
 */
export async function createDebitNote(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = createDebitNoteSchema.parse(data);

    const db = getAdminFirestore();
    const newNote = {
      ...validatedData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('debitNotes').add(newNote);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newNote,
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
    console.error('Error creating debit note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create debit note',
    };
  }
}
