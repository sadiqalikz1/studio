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
    const paymentDoc = await db.collection('payments').doc(id).get();

    if (!paymentDoc.exists) {
      return notFoundResponse('Payment not found');
    }

    // Get associated invoice allocations
    const allocationsSnapshot = await db
      .collection('invoiceAllocations')
      .where('paymentId', '==', id)
      .get();

    const allocations: any[] = [];
    allocationsSnapshot.forEach((doc: any) => {
      allocations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return successResponse({
      id: paymentDoc.id,
      ...paymentDoc.data(),
      allocations,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
