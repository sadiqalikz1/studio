import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError, notFoundResponse } from '@/lib/api/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    await requireAuth(request);

    const { supplierId } = await params;
    const db = getAdminFirestore();

    // Get supplier info
    const supplierDoc = await db.collection('suppliers').doc(supplierId).get();
    if (!supplierDoc.exists) {
      return notFoundResponse('Supplier not found');
    }

    // Get all transactions for this supplier (invoices, credits, debits)
    const [invoicesSnapshot, creditNotesSnapshot, debitNotesSnapshot] = await Promise.all([
      db.collection('invoices').where('supplierId', '==', supplierId).get(),
      db.collection('creditNotes').where('supplierId', '==', supplierId).get(),
      db.collection('debitNotes').where('supplierId', '==', supplierId).get(),
    ]);

    const transactions: any[] = [];

    // Add invoices
    invoicesSnapshot.forEach((doc: any) => {
      transactions.push({
        id: doc.id,
        type: 'Invoice',
        ...doc.data(),
      });
    });

    // Add credit notes
    creditNotesSnapshot.forEach((doc: any) => {
      transactions.push({
        id: doc.id,
        type: 'Credit Note',
        date: doc.data().noteDate,
        amount: -doc.data().amount, // Negative for credit
        ...doc.data(),
      });
    });

    // Add debit notes
    debitNotesSnapshot.forEach((doc: any) => {
      transactions.push({
        id: doc.id,
        type: 'Debit Note',
        date: doc.data().noteDate,
        ...doc.data(),
      });
    });

    // Sort by date
    transactions.sort((a, b) => {
      const dateA = new Date(a.invoiceDate || a.noteDate || a.date);
      const dateB = new Date(b.invoiceDate || b.noteDate || b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate running balance
    let runningBalance = 0;
    transactions.forEach((t) => {
      if (t.type === 'Invoice') {
        t.runningBalance = runningBalance + (t.invoiceAmount || 0);
        runningBalance = t.runningBalance;
      } else {
        t.runningBalance = runningBalance + (t.amount || 0);
        runningBalance = t.runningBalance;
      }
    });

    return successResponse({
      supplier: {
        id: supplierDoc.id,
        ...supplierDoc.data(),
      },
      transactions,
      totalCount: transactions.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
