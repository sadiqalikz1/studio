'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Search, CheckCircle2, Eye, Loader2, Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { useCollection, useMemoFirebase, useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useUserRole } from '@/hooks/use-user-role';
import { notesService } from '@/lib/api/services';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface CreditNote {
  id: string;
  date: string;
  supplierName: string;
  referenceNumber: string;
  amount: number;
  reason?: string;
  branchId: string;
  supplierId: string;
}

export default function CreditNotesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();

  // State
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'supplier' | 'amount'>('date');
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // New CN form state
  const [newCNForm, setNewCNForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    supplierName: '',
    referenceNumber: '',
    amount: '',
    reason: '',
    branchId: '',
  });

  // Load data
  const creditNotesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'creditNotes');
  }, [firestore]);
  const { data: creditNotes } = useCollection(creditNotesQuery);

  const suppliersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'suppliers');
  }, [firestore]);
  const { data: suppliers } = useCollection(suppliersQuery);

  const branchesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'branches');
  }, [firestore]);
  const { data: branches } = useCollection(branchesQuery);

  // Normalize notes
  const normalized: CreditNote[] = useMemo(() => {
    return (creditNotes || []).map(cn => ({
      id: cn.id,
      date: cn.date || '',
      supplierName: suppliers?.find(s => s.id === cn.supplierId)?.name || 'Unknown',
      referenceNumber: cn.referenceNumber || '',
      amount: cn.amount || 0,
      reason: cn.reason || '',
      branchId: cn.branchId || '',
      supplierId: cn.supplierId || '',
    }));
  }, [creditNotes, suppliers]);

  // Apply filters
  const filtered = useMemo(() => {
    return normalized.filter(n => {
      if (filterSupplier && !n.supplierName.toLowerCase().includes(filterSupplier.toLowerCase())) return false;
      if (filterFromDate && n.date < filterFromDate) return false;
      if (filterToDate && n.date > filterToDate) return false;
      return true;
    });
  }, [normalized, filterSupplier, filterFromDate, filterToDate]);

  // Apply sorting
  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortBy === 'date') {
      copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'supplier') {
      copy.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    } else if (sortBy === 'amount') {
      copy.sort((a, b) => b.amount - a.amount);
    }
    return copy;
  }, [filtered, sortBy]);

  // Summary
  const summary = useMemo(() => ({
    total: sorted.length,
    totalAmount: sorted.reduce((sum, n) => sum + n.amount, 0),
  }), [sorted]);

  const handleCreateCreditNote = async () => {
    if (!firestore || !user || !newCNForm.supplierName.trim() || !newCNForm.referenceNumber.trim() || !newCNForm.amount.trim() || !newCNForm.branchId) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const supplier = suppliers?.find(s => s.name.toLowerCase().trim() === newCNForm.supplierName.toLowerCase().trim());
      const supplierId = supplier?.id || '';

      if (!supplierId) {
        toast({
          title: 'Error',
          description: 'Supplier not found. Please select an existing supplier.',
          variant: 'destructive',
        });
        setCreating(false);
        return;
      }

      const result = await notesService.createCreditNote({
        date: newCNForm.date,
        supplierId,
        referenceNumber: newCNForm.referenceNumber.trim(),
        amount: parseFloat(newCNForm.amount),
        reason: newCNForm.reason.trim() || 'Manual Entry',
        branchId: newCNForm.branchId,
        createdBy: user.uid,
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Credit note created successfully',
        });
        setShowCreateDialog(false);
        setNewCNForm({
          date: format(new Date(), 'yyyy-MM-dd'),
          supplierName: '',
          referenceNumber: '',
          amount: '',
          reason: '',
          branchId: '',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create credit note',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error creating credit note', err);
      toast({
        title: 'Error',
        description: 'Failed to create credit note',
        variant: 'destructive',
      });
    }
    setCreating(false);
  };

  if (isRoleLoading) {
    return (
      <div className="p-8 h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <SidebarInset className="flex-1 bg-background">
      <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-8">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
        <div className="flex flex-col">
          <h2 className="text-lg font-bold font-headline text-slate-900 tracking-tight">Credit Notes</h2>
          <p className="text-xs text-slate-500 mt-0.5">Vendor-issued credits</p>
        </div>
        <div className="ml-auto flex gap-2">
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)} className="rounded-full text-xs font-bold shadow-lg shadow-primary/20" size="sm">
              <Plus className="w-4 h-4 mr-2" /> New Credit Note
            </Button>
          )}
          <Link href="/purchase-ledger">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-bold">
              View Ledger
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 bg-slate-50/40">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white">
            <CardContent className="pt-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Credit Notes</div>
              <div className="text-2xl font-black text-slate-900">{summary.total}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white">
            <CardContent className="pt-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-2">Total Credit</div>
              <div className="text-2xl font-black text-slate-900">({summary.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })})</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white">
            <CardContent className="pt-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Average Credit</div>
              <div className="text-2xl font-black text-slate-900">
                ({summary.total > 0 ? (summary.totalAmount / summary.total).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'})
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Filters & Sort
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600">Supplier</Label>
                <Input
                  placeholder="Search supplier..."
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  className="h-10 rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600">From Date</Label>
                <Input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="h-10 rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600">To Date</Label>
                <Input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="h-10 rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-600">Sort By</Label>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Newest)</SelectItem>
                    <SelectItem value="supplier">Supplier Name</SelectItem>
                    <SelectItem value="amount">Amount (Highest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Notes Table */}
        <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Credit Notes ({sorted.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sorted.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500 text-sm">No credit notes found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50">
                      <TableHead className="h-12 px-6 text-xs font-bold">Date</TableHead>
                      <TableHead className="h-12 px-6 text-xs font-bold">Supplier</TableHead>
                      <TableHead className="h-12 px-6 text-xs font-bold">Reference</TableHead>
                      <TableHead className="h-12 px-6 text-xs font-bold">Reason</TableHead>
                      <TableHead className="h-12 px-6 text-xs font-bold text-right">Credit</TableHead>
                      <TableHead className="h-12 px-6 text-xs font-bold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((n) => (
                      <TableRow key={n.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <TableCell className="px-6 py-4 text-sm font-medium">
                          {format(new Date(n.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm font-medium">{n.supplierName}</TableCell>
                        <TableCell className="px-6 py-4 text-sm font-mono text-slate-600">{n.referenceNumber}</TableCell>
                        <TableCell className="px-6 py-4 text-sm text-slate-700">{n.reason}</TableCell>
                        <TableCell className="px-6 py-4 text-sm font-bold text-right">({n.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })})</TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNote(n)}
                            className="h-8 px-3 rounded-lg hover:bg-primary/10 text-primary"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="rounded-[2rem] max-w-lg border-none shadow-2xl">
          {selectedNote && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <DialogTitle className="text-xl font-black">Credit Note Details</DialogTitle>
                </div>
                <DialogDescription className="text-xs text-slate-600">
                  Full credit note information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
                    <p className="text-sm font-bold text-slate-900">{format(new Date(selectedNote.date), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reference</p>
                    <p className="text-sm font-bold text-slate-900 font-mono">{selectedNote.referenceNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Supplier</p>
                    <p className="text-sm font-bold text-slate-900">{selectedNote.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Credit Amount</p>
                    <p className="text-lg font-black text-green-600">({selectedNote.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })})</p>
                  </div>
                  {selectedNote.reason && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reason</p>
                      <p className="text-sm text-slate-700">{selectedNote.reason}</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedNote(null)} className="rounded-full">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Credit Note Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-[2rem] max-w-lg border-none shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <DialogTitle className="text-xl font-black">Create Credit Note</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600">
              Add a new credit note from a vendor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-600">Date</Label>
              <Input
                type="date"
                value={newCNForm.date}
                onChange={(e) => setNewCNForm({...newCNForm, date: e.target.value})}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-600">Supplier *</Label>
              <Select value={newCNForm.supplierName} onValueChange={(value) => setNewCNForm({...newCNForm, supplierName: value})}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-600">Reference Number *</Label>
              <Input
                placeholder="CN-001"
                value={newCNForm.referenceNumber}
                onChange={(e) => setNewCNForm({...newCNForm, referenceNumber: e.target.value})}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-600">Amount *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newCNForm.amount}
                onChange={(e) => setNewCNForm({...newCNForm, amount: e.target.value})}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-600">Reason / Note</Label>
              <Input
                placeholder="Why this credit note..."
                value={newCNForm.reason}
                onChange={(e) => setNewCNForm({...newCNForm, reason: e.target.value})}
                className="h-10 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-600">Branch *</Label>
              <Select value={newCNForm.branchId} onValueChange={(value) => setNewCNForm({...newCNForm, branchId: value})}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleCreateCreditNote} disabled={creating} className="rounded-full shadow-lg shadow-primary/20">
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Credit Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
