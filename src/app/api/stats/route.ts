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

    let q = invoicesRef;
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

    // Calculate statistics
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let totalOutstanding = 0;
    let totalOverdue = 0;
    let upcoming7Days = 0;
    let upcoming15Days = 0;
    let upcoming30Days = 0;

    invoices.forEach((invoice) => {
      if (
        invoice.status === 'Pending' ||
        invoice.status === 'Partially Paid' ||
        invoice.status === 'Overdue'
      ) {
        totalOutstanding += invoice.remainingBalance || 0;

        const dueDate = new Date(invoice.dueDate);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (invoice.dueDate < today) {
          totalOverdue += invoice.remainingBalance || 0;
        } else if (daysUntilDue <= 7) {
          upcoming7Days += invoice.remainingBalance || 0;
        }

        if (daysUntilDue <= 15) {
          upcoming15Days += invoice.remainingBalance || 0;
        }

        if (daysUntilDue <= 30) {
          upcoming30Days += invoice.remainingBalance || 0;
        }
      }
    });

    return successResponse({
      totalOutstanding,
      totalOverdue,
      upcoming7Days,
      upcoming15Days,
      upcoming30Days,
      asOfDate: today,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
