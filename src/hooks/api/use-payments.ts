'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/firebase';

interface UsePaymentsOptions {
  page?: number;
  supplierId?: string;
  branchId?: string;
}

interface PaymentsResponse {
  payments: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch list of payments with pagination and filters
 */
export function usePayments(options: UsePaymentsOptions = {}) {
  const { user } = useUser();

  return useQuery<PaymentsResponse>({
    queryKey: ['payments', options.page, options.supplierId, options.branchId],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.supplierId) params.append('supplierId', options.supplierId);
      if (options.branchId) params.append('branchId', options.branchId);

      const token = await user.getIdToken();
      const response = await fetch(`/api/payments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid,
  });
}

interface SinglePaymentResponse {
  id: string;
  allocations?: any[];
  [key: string]: any;
}

/**
 * Fetch a single payment with allocations
 */
export function usePayment(id: string) {
  const { user } = useUser();

  return useQuery<SinglePaymentResponse>({
    queryKey: ['payment', id],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const token = await user.getIdToken();
      const response = await fetch(`/api/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch payment');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid && !!id,
  });
}
