
"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SUPPLIERS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Phone, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SuppliersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Suppliers</h2>
            <p className="text-muted-foreground mt-1">Manage vendor records and default credit terms.</p>
          </div>
          <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPLIERS.map((supplier) => (
            <Card key={supplier.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.category}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                    {supplier.defaultCreditDays} Days Credit
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {supplier.phone}
                  </div>
                </div>
                
                <div className="pt-4 border-t flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-primary hover:bg-primary/5">
                    View Ledger
                  </Button>
                  <Button variant="ghost" size="sm" className="w-10 px-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
