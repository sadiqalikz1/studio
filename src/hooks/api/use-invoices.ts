'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/firebase';

interface UseInvoicesOptions {
  page?: number;
  supplierId?: string;
  branchId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

interface InvoicesResponse {
  invoices: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch list of invoices with filters and pagination
 */
export function useInvoices(options: UseInvoicesOptions = {}) {
  const { user } = useUser();

  return useQuery<InvoicesResponse>({
    queryKey: [
      'invoices',
      options.page,
      options.supplierId,
      options.branchId,
      options.status,
      options.fromDate,
      options.toDate,
    ],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.supplierId) params.append('supplierId', options.supplierId);
      if (options.branchId) params.append('branchId', options.branchId);
      if (options.status) params.append('status', options.status);
      if (options.fromDate) params.append('fromDate', options.fromDate);
      if (options.toDate) params.append('toDate', options.toDate);

      const token = await user.getIdToken();
      const response = await fetch(`/api/invoices?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid,
  });
}

interface SingleInvoiceResponse {
  id: string;
  [key: string]: any;
}

/**
 * Fetch a single invoice by ID
 */
export function useInvoice(id: string) {
  const { user } = useUser();

  return useQuery<SingleInvoiceResponse>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const token = await user.getIdToken();
      const response = await fetch(`/api/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoice');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid && !!id,
  });
}
