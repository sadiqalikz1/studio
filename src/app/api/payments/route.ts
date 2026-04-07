import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const db = getAdminFirestore();
    const paymentsRef = db.collection('payments');

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const supplierId = searchParams.get('supplierId');
    const branchId = searchParams.get('branchId');

    const PAYMENTS_PER_PAGE = 20;

    let q = paymentsRef.orderBy('paymentDate', 'desc');

    if (supplierId) {
      q = q.where('supplierId', '==', supplierId);
    }
    if (branchId) {
      q = q.where('branchId', '==', branchId);
    }

    const snapshot = await q.get();
    let payments: any[] = [];

    snapshot.forEach((doc: any) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Pagination
    const startIdx = (page - 1) * PAYMENTS_PER_PAGE;
    const endIdx = page * PAYMENTS_PER_PAGE;
    const paginatedPayments = payments.slice(startIdx, endIdx);

    return successResponse({
      payments: paginatedPayments,
      total: payments.length,
      page,
      pageSize: PAYMENTS_PER_PAGE,
      totalPages: Math.ceil(payments.length / PAYMENTS_PER_PAGE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
