/**
 * API Services Layer
 * Provides unified interface to call server actions and API routes
 */

import * as invoiceActions from '@/actions/invoices';
import * as paymentActions from '@/actions/payments';
import * as supplierActions from '@/actions/suppliers';
import * as noteActions from '@/actions/notes';
import * as uploadActions from '@/actions/upload';
import * as employeeActions from '@/actions/employees';

// ─── Suppliers Service ──────────────────────────────────────────────────────

export const suppliersService = {
  async createSupplier(data: any) {
    try {
      const result = await supplierActions.createSupplier(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create supplier',
      };
    }
  },

  async updateSupplier(id: string, data: any) {
    try {
      const result = await supplierActions.updateSupplier(id, data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update supplier',
      };
    }
  },

  async bulkCreateSuppliers(data: any[]) {
    try {
      const result = await supplierActions.bulkCreateSuppliers(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create suppliers',
      };
    }
  },

  async getSuppliers(page = 1, limit = 10) {
    try {
      const response = await fetch(`/api/suppliers?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch suppliers',
      };
    }
  },
};

// ─── Invoices Service ──────────────────────────────────────────────────────

export const invoicesService = {
  async createInvoice(data: any) {
    try {
      const result = await invoiceActions.createInvoice(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      };
    }
  },

  async batchCreateInvoices(data: any[]) {
    try {
      const result = await invoiceActions.batchCreateInvoices(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoices',
      };
    }
  },

  async getInvoices(page = 1, limit = 20, filters?: any) {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(limit) });
      if (filters?.supplierId) params.append('supplierId', filters.supplierId);
      if (filters?.branchId) params.append('branchId', filters.branchId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const response = await fetch(`/api/invoices?${params}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
      };
    }
  },
};

// ─── Payments Service ──────────────────────────────────────────────────────

export const paymentsService = {
  async createPaymentWithFIFO(data: any) {
    try {
      const result = await paymentActions.createPaymentWithFIFO(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment',
      };
    }
  },

  async getPayments(page = 1, limit = 20, filters?: any) {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(limit) });
      if (filters?.supplierId) params.append('supplierId', filters.supplierId);
      if (filters?.branchId) params.append('branchId', filters.branchId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const response = await fetch(`/api/payments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
      };
    }
  },
};

// ─── Notes Service (Credit & Debit Notes) ──────────────────────────────────

export const notesService = {
  async createCreditNote(data: any) {
    try {
      const result = await noteActions.createCreditNote(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create credit note',
      };
    }
  },

  async createDebitNote(data: any) {
    try {
      const result = await noteActions.createDebitNote(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create debit note',
      };
    }
  },

  async getCreditNotes(page = 1, limit = 20, filters?: any) {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(limit) });
      if (filters?.supplierId) params.append('supplierId', filters.supplierId);
      if (filters?.branchId) params.append('branchId', filters.branchId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const response = await fetch(`/api/credit-notes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch credit notes');
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch credit notes',
      };
    }
  },

  async getDebitNotes(page = 1, limit = 20, filters?: any) {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(limit) });
      if (filters?.supplierId) params.append('supplierId', filters.supplierId);
      if (filters?.branchId) params.append('branchId', filters.branchId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const response = await fetch(`/api/debit-notes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch debit notes');
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch debit notes',
      };
    }
  },
};

// ─── Upload Service ────────────────────────────────────────────────────────

export const uploadService = {
  async commitUpload(uploadData: any, uploadType: 'invoices' | 'payments' | 'debitNotes' | 'creditNotes') {
    try {
      const result = await uploadActions.commitUpload(uploadData, uploadType);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to commit upload',
      };
    }
  },
};

// ─── Employees Service ────────────────────────────────────────────────────

export const employeesService = {
  async createEmployee(data: any) {
    try {
      const result = await employeeActions.createEmployee(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create employee',
      };
    }
  },

  async updateEmployee(id: string, data: any) {
    try {
      const result = await employeeActions.updateEmployee(id, data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update employee',
      };
    }
  },

  async deleteEmployee(id: string) {
    try {
      const result = await employeeActions.deleteEmployee(id);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete employee',
      };
    }
  },

  async getEmployeeById(id: string) {
    try {
      const result = await employeeActions.getEmployeeById(id);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employee',
      };
    }
  },

  async bulkCreateEmployees(data: any[]) {
    try {
      const result = await employeeActions.bulkCreateEmployees(data);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create employees',
      };
    }
  },

  async getEmployees(page = 1, limit = 10, filters?: any) {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(limit) });
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);

      const response = await fetch(`/api/employees?${params}`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employees',
      };
    }
  },
};

// ─── Generic API Fetch Helper ──────────────────────────────────────────────

export async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API call failed',
    };
  }
}
