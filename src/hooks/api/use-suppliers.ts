'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/firebase/index';

interface UseSupplierOptions {
  page?: number;
  search?: string;
  category?: string;
}

interface SuppliersResponse {
  suppliers: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch list of suppliers with pagination and filters
 */
export function useSuppliers(options: UseSupplierOptions = {}) {
  const { user } = useUser();

  return useQuery<SuppliersResponse>({
    queryKey: ['suppliers', options.page, options.search, options.category],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (options.page) params.append('page', String(options.page));
      if (options.search) params.append('search', options.search);
      if (options.category) params.append('category', options.category);

      const token = await user.getIdToken();
      const response = await fetch(`/api/suppliers?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid,
  });
}

interface SingleSupplierResponse {
  id: string;
  [key: string]: any;
}

/**
 * Fetch a single supplier by ID
 */
export function useSupplier(id: string) {
  const { user } = useUser();

  return useQuery<SingleSupplierResponse>({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const token = await user.getIdToken();
      const response = await fetch(`/api/suppliers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch supplier');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid && !!id,
  });
}
