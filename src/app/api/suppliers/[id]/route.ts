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
    const supplierDoc = await db.collection('suppliers').doc(id).get();

    if (!supplierDoc.exists) {
      return notFoundResponse('Supplier not found');
    }

    return successResponse({
      id: supplierDoc.id,
      ...supplierDoc.data(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
