import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const db = getAdminFirestore();
    const invoicesRef = db.collection('invoices');

    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');

    let q = invoicesRef.where('status', '!=', 'Paid');
    if (branchId) {
      q = q.where('branchId', '==', branchId);
    }

    const snapshot = await q.get();
    const invoices: any[] = [];

    snapshot.forEach((doc: any) => {
      invoices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Calculate aging buckets
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const buckets = {
      '0-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    invoices.forEach((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.ceil(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue <= 0) {
        buckets['0-30'] += invoice.remainingBalance || 0;
      } else if (daysOverdue <= 30) {
        buckets['0-30'] += invoice.remainingBalance || 0;
      } else if (daysOverdue <= 60) {
        buckets['31-60'] += invoice.remainingBalance || 0;
      } else if (daysOverdue <= 90) {
        buckets['61-90'] += invoice.remainingBalance || 0;
      } else {
        buckets['90+'] += invoice.remainingBalance || 0;
      }
    });

    return successResponse({
      buckets,
      asOfDate: today,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
