import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const db = getAdminFirestore();
    const creditNotesRef = db.collection('creditNotes');

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const supplierId = searchParams.get('supplierId');
    const branchId = searchParams.get('branchId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const CREDIT_NOTES_PER_PAGE = 15;

    let q = creditNotesRef.orderBy('noteDate', 'desc');

    if (supplierId) {
      q = q.where('supplierId', '==', supplierId);
    }
    if (branchId) {
      q = q.where('branchId', '==', branchId);
    }

    const snapshot = await q.get();
    let creditNotes: any[] = [];

    snapshot.forEach((doc: any) => {
      creditNotes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side date filtering
    if (fromDate) {
      creditNotes = creditNotes.filter((n) => n.noteDate >= fromDate);
    }
    if (toDate) {
      creditNotes = creditNotes.filter((n) => n.noteDate <= toDate);
    }

    // Pagination
    const startIdx = (page - 1) * CREDIT_NOTES_PER_PAGE;
    const endIdx = page * CREDIT_NOTES_PER_PAGE;
    const paginatedNotes = creditNotes.slice(startIdx, endIdx);

    return successResponse({
      creditNotes: paginatedNotes,
      total: creditNotes.length,
      page,
      pageSize: CREDIT_NOTES_PER_PAGE,
      totalPages: Math.ceil(creditNotes.length / CREDIT_NOTES_PER_PAGE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
