
"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { AgingReport } from '@/components/dashboard/aging-report';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase,
  useUser
} from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Dashboard() {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const { firestore } = useFirestore();
  const { user } = useUser();

  const branchesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'branches');
  }, [firestore]);
  const { data: branches } = useCollection(branchesQuery);

  const suppliersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'suppliers');
  }, [firestore]);
  const { data: suppliers } = useCollection(suppliersQuery);

  const invoicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = collection(firestore, 'invoices');
    if (selectedBranch !== 'all') {
      return query(q, where('branchId', '==', selectedBranch), orderBy('dueDate', 'asc'), limit(20));
    }
    return query(q, orderBy('dueDate', 'asc'), limit(20));
  }, [firestore, selectedBranch]);
  const { data: invoices, isLoading: invoicesLoading } = useCollection(invoicesQuery);

  const stats = {
    totalOutstanding: invoices?.reduce((sum, inv) => sum + (inv.remainingBalance || 0), 0) || 0,
    totalOverdue: invoices?.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + (inv.remainingBalance || 0), 0) || 0,
    upcoming7Days: invoices?.filter(inv => inv.status === 'Pending').slice(0, 5).reduce((sum, inv) => sum + (inv.remainingBalance || 0), 0) || 0,
    upcoming30Days: invoices?.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + (inv.remainingBalance || 0), 0) || 0,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Dues Overview</h2>
            <p className="text-muted-foreground mt-1">Real-time aggregation of your accounts payable.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Branch:</span>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0 h-8">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Link href="/upload">
              <Button className="h-10 bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </Link>
          </div>
        </header>

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <AgingReport />
          
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!invoicesLoading && invoices && invoices.length > 0 ? (
                   invoices.slice(0, 5).map(inv => (
                    <div key={inv.id} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold">New invoice {inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">Due on {inv.dueDate}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Updated Recently</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No recent activity detected.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-headline">Critical Pending Invoices</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Showing top entries requiring immediate action.</p>
              </div>
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="text-primary font-semibold">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Invoice #</TableHead>
                    <TableHead className="font-bold">Supplier</TableHead>
                    <TableHead className="font-bold">Branch</TableHead>
                    <TableHead className="font-bold">Due Date</TableHead>
                    <TableHead className="font-bold text-right">Amount</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono text-xs font-semibold">{inv.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">
                        {suppliers?.find(s => s.id === inv.supplierId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {branches?.find(b => b.id === inv.branchId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm">{inv.dueDate}</TableCell>
                      <TableCell className="text-right font-bold">₹{(inv.remainingBalance || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={inv.status === 'Overdue' ? 'destructive' : 'secondary'}
                          className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5"
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!invoices || invoices.length === 0) && !invoicesLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No pending invoices found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
