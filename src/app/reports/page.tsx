
"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INVOICES, SUPPLIERS, BRANCHES } from '@/lib/mock-data';
import { Search, Download, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = INVOICES.filter(inv => {
    const supplier = SUPPLIERS.find(s => s.id === inv.supplierId)?.name || '';
    return (
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Ledger Reports</h2>
            <p className="text-muted-foreground mt-1">Detailed transaction history and outstanding balances.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </header>

        <Card className="border-none shadow-sm mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoice or supplier..." 
                  className="pl-10 bg-slate-50 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="ghost" className="text-muted-foreground">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 border-t">
                <TableRow>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Invoice #</TableHead>
                  <TableHead className="font-bold">Supplier</TableHead>
                  <TableHead className="font-bold">Branch</TableHead>
                  <TableHead className="font-bold text-right">Amount</TableHead>
                  <TableHead className="font-bold text-right">Balance</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-sm">{inv.invoiceDate}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">
                      {SUPPLIERS.find(s => s.id === inv.supplierId)?.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {BRANCHES.find(b => b.id === inv.branchId)?.name}
                    </TableCell>
                    <TableCell className="text-right">₹{inv.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-primary">₹{inv.remainingBalance.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={inv.status === 'Overdue' ? 'destructive' : 'secondary'}
                        className="font-bold text-[10px] uppercase px-2"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
