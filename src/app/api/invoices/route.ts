import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/errors';

const INVOICES_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const db = getAdminFirestore();
    const invoicesRef = db.collection('invoices');

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const supplierId = searchParams.get('supplierId');
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    let q = invoicesRef.orderBy('invoiceDate', 'desc');

    if (supplierId) {
      q = q.where('supplierId', '==', supplierId);
    }
    if (branchId) {
      q = q.where('branchId', '==', branchId);
    }
    if (status) {
      q = q.where('status', '==', status);
    }

    const snapshot = await q.get();
    let invoices: any[] = [];

    snapshot.forEach((doc: any) => {
      invoices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side date filtering
    if (fromDate) {
      invoices = invoices.filter((i) => i.invoiceDate >= fromDate);
    }
    if (toDate) {
      invoices = invoices.filter((i) => i.invoiceDate <= toDate);
    }

    // Pagination
    const startIdx = (page - 1) * INVOICES_PER_PAGE;
    const endIdx = page * INVOICES_PER_PAGE;
    const paginatedInvoices = invoices.slice(startIdx, endIdx);

    return successResponse({
      invoices: paginatedInvoices,
      total: invoices.length,
      page,
      pageSize: INVOICES_PER_PAGE,
      totalPages: Math.ceil(invoices.length / INVOICES_PER_PAGE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
