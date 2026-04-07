'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/firebase';

interface StatsResponse {
  totalOutstanding: number;
  totalOverdue: number;
  upcoming7Days: number;
  upcoming15Days: number;
  upcoming30Days: number;
  asOfDate: string;
}

interface AgingReportResponse {
  buckets: {
    '0-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
  };
  asOfDate: string;
}

interface LedgerResponse {
  supplier: any;
  transactions: any[];
  totalCount: number;
}

/**
 * Fetch dashboard statistics (outstanding, overdue, upcoming)
 */
export function useStats(branchId?: string) {
  const { user } = useUser();

  return useQuery<StatsResponse>({
    queryKey: ['stats', branchId],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (branchId) params.append('branchId', branchId);

      const token = await user.getIdToken();
      const response = await fetch(`/api/stats?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid,
  });
}

/**
 * Fetch aging report data
 */
export function useAgingReport(branchId?: string) {
  const { user } = useUser();

  return useQuery<AgingReportResponse>({
    queryKey: ['agingReport', branchId],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const params = new URLSearchParams();
      if (branchId) params.append('branchId', branchId);

      const token = await user.getIdToken();
      const response = await fetch(`/api/reports/aging?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch aging report');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid,
  });
}

/**
 * Fetch supplier ledger (all transactions)
 */
export function useLedger(supplierId: string) {
  const { user } = useUser();

  return useQuery<LedgerResponse>({
    queryKey: ['ledger', supplierId],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Not authenticated');

      const token = await user.getIdToken();
      const response = await fetch(`/api/reports/ledger/${supplierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch ledger');
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.uid && !!supplierId,
  });
}
