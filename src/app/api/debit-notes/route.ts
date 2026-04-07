import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const db = getAdminFirestore();
    const debitNotesRef = db.collection('debitNotes');

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const supplierId = searchParams.get('supplierId');
    const branchId = searchParams.get('branchId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const DEBIT_NOTES_PER_PAGE = 15;

    let q = debitNotesRef.orderBy('noteDate', 'desc');

    if (supplierId) {
      q = q.where('supplierId', '==', supplierId);
    }
    if (branchId) {
      q = q.where('branchId', '==', branchId);
    }

    const snapshot = await q.get();
    let debitNotes: any[] = [];

    snapshot.forEach((doc: any) => {
      debitNotes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side date filtering
    if (fromDate) {
      debitNotes = debitNotes.filter((n) => n.noteDate >= fromDate);
    }
    if (toDate) {
      debitNotes = debitNotes.filter((n) => n.noteDate <= toDate);
    }

    // Pagination
    const startIdx = (page - 1) * DEBIT_NOTES_PER_PAGE;
    const endIdx = page * DEBIT_NOTES_PER_PAGE;
    const paginatedNotes = debitNotes.slice(startIdx, endIdx);

    return successResponse({
      debitNotes: paginatedNotes,
      total: debitNotes.length,
      page,
      pageSize: DEBIT_NOTES_PER_PAGE,
      totalPages: Math.ceil(debitNotes.length / DEBIT_NOTES_PER_PAGE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
