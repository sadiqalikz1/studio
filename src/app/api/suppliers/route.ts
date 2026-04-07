import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/errors';

const SUPPLIERS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    await requireAuth(request);

    const db = getAdminFirestore();
    const collectionsRef = db.collection('suppliers');

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // Build query
    let q = collectionsRef.orderBy('name');

    if (category) {
      q = q.where('category', '==', category);
    }

    // Get all matching documents (client-side pagination)
    const snapshot = await q.get();
    let suppliers: any[] = [];

    snapshot.forEach((doc: any) => {
      suppliers.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side search filtering (for 'name' search)
    if (search) {
      suppliers = suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contactEmail?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIdx = (page - 1) * SUPPLIERS_PER_PAGE;
    const endIdx = page * SUPPLIERS_PER_PAGE;
    const paginatedSuppliers = suppliers.slice(startIdx, endIdx);

    return successResponse({
      suppliers: paginatedSuppliers,
      total: suppliers.length,
      page,
      pageSize: SUPPLIERS_PER_PAGE,
      totalPages: Math.ceil(suppliers.length / SUPPLIERS_PER_PAGE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
