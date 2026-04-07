'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/firebase';

interface UseNotesOptions {
  page?: number;
  supplierId?: string;
  branchId?: string;
  fromDate?: string;
  toDate?: string;
}

interface CreditNotesResponse {
  creditNotes: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface DebitNotesResponse {
  debitNotes: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch list of credit notes with filters and pagination
 */
export function useCreditNotes(options: UseNotesOptions = {}) {
  const { user } = useUser();

  return useQuery<CreditNotesResponse>({
    queryKey: [
      'creditNotes',
      options.page,
      options.supplierId,
      options.branchId,
      options.fromDate,
      options.toDate,
    ],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.supplierId) params.append('supplierId', options.supplierId);
      if (options.branchId) params.append('branchId', options.branchId);
      if (options.fromDate) params.append('fromDate', options.fromDate);
      if (options.toDate) params.append('toDate', options.toDate);

      const token = await user.getIdToken();
      const response = await fetch(`/api/credit-notes?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch credit notes');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid,
  });
}

/**
 * Fetch list of debit notes with filters and pagination
 */
export function useDebitNotes(options: UseNotesOptions = {}) {
  const { user } = useUser();

  return useQuery<DebitNotesResponse>({
    queryKey: [
      'debitNotes',
      options.page,
      options.supplierId,
      options.branchId,
      options.fromDate,
      options.toDate,
    ],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.supplierId) params.append('supplierId', options.supplierId);
      if (options.branchId) params.append('branchId', options.branchId);
      if (options.fromDate) params.append('fromDate', options.fromDate);
      if (options.toDate) params.append('toDate', options.toDate);

      const token = await user.getIdToken();
      const response = await fetch(`/api/debit-notes?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch debit notes');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid,
  });
}
