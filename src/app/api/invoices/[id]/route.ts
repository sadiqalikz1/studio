import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError, notFoundResponse } from '@/lib/api/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);

    const { id } = await params;
    const db = getAdminFirestore();
    const invoiceDoc = await db.collection('invoices').doc(id).get();

    if (!invoiceDoc.exists) {
      return notFoundResponse('Invoice not found');
    }

    return successResponse({
      id: invoiceDoc.id,
      ...invoiceDoc.data(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
