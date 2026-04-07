'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ArrowLeft, History, FileSpreadsheet, CheckCircle2, AlertTriangle, UserPlus, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function UploadHistoryPage() {
  const firestore = useFirestore();
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const historyQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'uploadHistory'), orderBy('uploadedAt', 'desc'));
  }, [firestore]);
  const { data: history, isLoading } = useCollection(historyQuery);

  const branchesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'branches');
  }, [firestore]);
  const { data: branches } = useCollection(branchesQuery);

  // Query details for selected history
  const detailsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedHistory?.id) return null;
    return query(collection(firestore, 'uploadHistory', selectedHistory.id, 'details'));
  }, [firestore, selectedHistory]);
  const { data: importDetails } = useCollection(detailsQuery);

  const filtered = useMemo(() => {
    if (!history) return [];
    if (filterType === 'all') return history;
    return history.filter(h => h.type === filterType);
  }, [history, filterType]);

  const totalImported = useMemo(() => filtered.reduce((s, h) => s + (h.importedCount || 0), 0), [filtered]);
  const totalSkipped = useMemo(() => filtered.reduce((s, h) => s + (h.skippedCount || 0), 0), [filtered]);
  const totalSessions = filtered.length;

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return format(d, 'dd MMM yyyy, HH:mm');
    } catch {
      return '—';
    }
  };

  return (
    <SidebarInset className="flex-1 bg-background">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4 md:px-8">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
        <Link href="/upload">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <History className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold font-headline text-slate-900 tracking-tight">Upload History</h2>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Filter className="w-3 h-3 text-slate-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="border-none shadow-none h-7 w-[130px] text-xs font-bold p-0 focus:ring-0">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invoices">Purchases</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-4 md:p-8 bg-slate-50/40">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[1400px] mx-auto w-full">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-[2rem] bg-white">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Sessions</p>
                <FileSpreadsheet className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-black text-slate-900">{totalSessions}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Upload runs recorded</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-[2rem] bg-white">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Imported</p>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-3xl font-black text-green-600">{totalImported}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Records committed</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-[2rem] bg-white">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Skipped</p>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-amber-600">{totalSkipped}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Records skipped / failed</p>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden max-w-[1400px] mx-auto w-full">
          <CardHeader className="px-8 pt-8 pb-6 border-b bg-slate-50/50">
            <CardTitle className="text-lg">Import Log</CardTitle>
            <CardDescription className="text-xs">
              Every upload session is recorded here for audit purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent border-b-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 pl-8">Date &amp; Time</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">File Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Type</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Branch</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Total Rows</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Imported</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Skipped</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 pr-8 text-center">New Suppliers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((h) => (
                    <TableRow 
                      key={h.id} 
                      className="hover:bg-blue-50/50 transition-colors border-b-slate-50 cursor-pointer"
                      onClick={() => {
                        setSelectedHistory(h);
                        setShowDetails(true);
                      }}
                    >
                      <TableCell className="font-mono text-[11px] text-slate-500 font-bold pl-8 py-5">
                        {formatDate(h.uploadedAt)}
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          <span className="text-[12px] font-bold text-slate-700 truncate max-w-[200px]">
                            {h.fileName || 'Unknown File'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-5">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-black uppercase tracking-wider rounded-full px-3 ${
                            h.type === 'invoices'
                              ? 'bg-blue-50 text-blue-600 border-blue-100'
                              : 'bg-green-50 text-green-600 border-green-100'
                          }`}
                        >
                          {h.type === 'invoices' ? 'Purchases' : 'Payments'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[12px] font-medium text-slate-600 py-5">
                        {branches?.find(b => b.id === h.branchId)?.name || h.branchId || '—'}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-sm py-5">
                        {h.totalRows ?? '—'}
                      </TableCell>
                      <TableCell className="text-center py-5">
                        <span className="font-black text-green-600 text-sm">{h.importedCount ?? 0}</span>
                      </TableCell>
                      <TableCell className="text-center py-5">
                        {(h.skippedCount ?? 0) > 0 ? (
                          <span className="font-black text-amber-500 text-sm">{h.skippedCount}</span>
                        ) : (
                          <span className="text-slate-300 text-sm">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center pr-8 py-5">
                        {(h.newSuppliersCreated ?? 0) > 0 ? (
                          <div className="inline-flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-full">
                            <UserPlus className="w-3 h-3" />
                            {h.newSuppliersCreated}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {!isLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-24 text-slate-400">
                        <History className="w-10 h-10 mx-auto mb-4 opacity-20" />
                        <p className="font-bold text-sm">No upload sessions recorded yet.</p>
                        <p className="text-xs mt-1 opacity-60">Start an import from the Upload page to see history here.</p>
                      </TableCell>
                    </TableRow>
                  )}

                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium">Loading history...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Drawer */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent className="w-full sm:w-[600px] flex flex-col p-0">
          <SheetHeader className="sticky top-0 z-10 px-8 py-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg">Import Session Details</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {selectedHistory && (
              <>
                {/* Summary Info */}
                <div className="space-y-3 pb-6 border-b">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase">Upload Date</span>
                    <span className="text-sm font-bold text-slate-900">{formatDate(selectedHistory.uploadedAt)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase">File Name</span>
                    <span className="text-sm font-bold text-slate-900 text-right">{selectedHistory.fileName || '—'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase">Type</span>
                    <Badge className={`text-[9px] font-black uppercase ${
                      selectedHistory.type === 'invoices' || selectedHistory.type === 'mixed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedHistory.type === 'invoices' ? 'Purchases' : selectedHistory.type === 'payments' ? 'Payments' : 'Mixed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase">Branch</span>
                    <span className="text-sm font-bold text-slate-900">
                      {branches?.find(b => b.id === selectedHistory.branchId)?.name || selectedHistory.branchId || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase">Batch Memo</span>
                    <span className="text-sm font-bold text-slate-900 text-right">{selectedHistory.batchMemo || '—'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase">Accounting Period</span>
                    <span className="text-sm font-bold text-slate-900">{selectedHistory.accountingPeriod || '—'}</span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Rows</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{selectedHistory.totalRows ?? 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-green-600 uppercase">Imported</p>
                    <p className="text-2xl font-black text-green-600 mt-1">{selectedHistory.importedCount ?? 0}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Skipped</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{selectedHistory.skippedCount ?? 0}</p>
                  </div>
                </div>

                {/* New Suppliers Created */}
                {selectedHistory.newSuppliersCreated > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <UserPlus className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-primary">New Suppliers Created</p>
                        <p className="text-2xl font-black text-primary mt-1">{selectedHistory.newSuppliersCreated}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Imported Records Preview */}
                {importDetails && importDetails.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Imported Records Preview</h3>
                    <div className="overflow-x-auto border rounded-lg max-h-[300px] overflow-y-auto">
                      <Table className="w-full text-xs">
                        <TableHeader className="bg-slate-50 sticky top-0">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[9px] font-black uppercase py-2 px-3">Vch No.</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-2 px-3">Party</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-2 px-3 text-right">Amount</TableHead>
                            <TableHead className="text-[9px] font-black uppercase py-2 px-3 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importDetails.slice(0, 50).map((detail: any, idx: number) => (
                            <TableRow key={idx} className="hover:bg-slate-50/50 border-b text-xs">
                              <TableCell className="font-mono font-bold py-2 px-3">{detail.refNumber || '—'}</TableCell>
                              <TableCell className="font-medium py-2 px-3 max-w-[120px] truncate">{detail.supplierName || '—'}</TableCell>
                              <TableCell className="font-mono font-bold py-2 px-3 text-right">{detail.amount?.toFixed(2) || '—'}</TableCell>
                              <TableCell className="text-center py-2 px-3">
                                {detail.isSkipped ? (
                                  <Badge className="bg-red-100 text-red-700 text-[8px] font-bold">SKIP</Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 text-[8px] font-bold">OK</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {importDetails.length > 50 && (
                      <p className="text-xs text-slate-400 text-center py-2">
                        ... and {importDetails.length - 50} more records
                      </p>
                    )}
                  </div>
                )}

                {(!importDetails || importDetails.length === 0) && (
                  <div className="text-center py-8">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-slate-500">Detailed records coming soon</p>
                    <p className="text-xs text-slate-400 mt-1">Visit Purchase Ledger to see imported transactions</p>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarInset>
  );
}
