'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { createPaymentSchema, applyFIFOPaymentSchema } from '@/lib/validations';
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
 * Create a payment and apply FIFO allocation
 */
export async function createPaymentWithFIFO(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = applyFIFOPaymentSchema.parse(data);

    const db = getAdminFirestore();
    const batch = db.batch();

    // Create payment record
    const paymentRef = db.collection('payments').doc();
    const paymentData = {
      supplierId: validatedData.supplierId,
      branchId: validatedData.branchId,
      paymentDate: validatedData.paymentDate,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      referenceNumber: validatedData.referenceNumber || '',
      paidByUserId: validatedData.uploadedByUserId,
      createdAt: new Date().toISOString(),
    };

    batch.set(paymentRef, paymentData);

    // Get pending invoices for this supplier, ordered by dueDate (FIFO)
    const invoicesSnapshot = await db
      .collection('invoices')
      .where('supplierId', '==', validatedData.supplierId)
      .where('branchId', '==', validatedData.branchId)
      .where('status', 'in', ['Pending', 'Partially Paid', 'Overdue'])
      .orderBy('dueDate', 'asc')
      .get();

    let remainingAmount = validatedData.amount;
    const allocations: Array<{ invoiceId: string; amountApplied: number; newStatus: string }> = [];

    // Apply FIFO logic
    invoicesSnapshot.forEach((invoiceDoc: any) => {
      if (remainingAmount <= 0) return;

      const invoice = invoiceDoc.data();
      const amountToApply = Math.min(remainingAmount, invoice.remainingBalance);

      // Update invoice
      const newRemainingBalance = invoice.remainingBalance - amountToApply;
      const newStatus =
        newRemainingBalance <= 0
          ? 'Paid'
          : newRemainingBalance < invoice.invoiceAmount
            ? 'Partially Paid'
            : 'Pending';

      batch.update(invoiceDoc.ref, {
        remainingBalance: newRemainingBalance,
        paidAmount: (invoice.paidAmount || 0) + amountToApply,
        status: newStatus,
      });

      // Create allocation record
      const allocationRef = db.collection('invoiceAllocations').doc();
      batch.set(allocationRef, {
        paymentId: paymentRef.id,
        invoiceId: invoiceDoc.id,
        amountApplied: amountToApply,
        allocatedAt: new Date().toISOString(),
      });

      allocations.push({
        invoiceId: invoiceDoc.id,
        amountApplied: amountToApply,
        newStatus,
      });

      remainingAmount -= amountToApply;
    });

    // Commit the batch
    await batch.commit();

    return {
      success: true,
      data: {
        paymentId: paymentRef.id,
        amount: validatedData.amount,
        allocations,
        remainingUnallocated: Math.max(0, remainingAmount),
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
    console.error('Error creating payment with FIFO:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}

/**
 * Create a simple payment without FIFO
 */
export async function createPayment(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = createPaymentSchema.parse(data);

    const db = getAdminFirestore();
    const newPayment = {
      ...validatedData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('payments').add(newPayment);

    return {
      success: true,
      data: {
        id: docRef.id,
        ...newPayment,
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
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}
