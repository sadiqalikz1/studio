import { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/errors';

const EMPLOYEES_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    await requireAuth(request);

    const db = getAdminFirestore();
    const collectionsRef = db.collection('employees');

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Build query
    let q = collectionsRef.orderBy('name');

    if (status && status !== 'all') {
      q = q.where('status', '==', status);
    }

    // Get all matching documents (client-side pagination)
    const snapshot = await q.get();
    let employees: any[] = [];

    snapshot.forEach((doc: any) => {
      employees.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Client-side search filtering
    if (search) {
      employees = employees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase()) ||
        e.iqamaNumber?.toLowerCase().includes(search.toLowerCase()) ||
        e.passportNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIdx = (page - 1) * EMPLOYEES_PER_PAGE;
    const endIdx = page * EMPLOYEES_PER_PAGE;
    const paginatedEmployees = employees.slice(startIdx, endIdx);

    return successResponse({
      employees: paginatedEmployees,
      total: employees.length,
      page,
      pageSize: EMPLOYEES_PER_PAGE,
      totalPages: Math.ceil(employees.length / EMPLOYEES_PER_PAGE),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
