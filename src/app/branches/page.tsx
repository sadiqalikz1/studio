
"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BRANCHES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Building2, TrendingUp } from 'lucide-react';

export default function BranchesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Branches</h2>
            <p className="text-muted-foreground mt-1">Operational centers and departmental credit tracking.</p>
          </div>
          <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BRANCHES.map((branch) => (
            <Card key={branch.id} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{branch.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {branch.location}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Dues</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">₹12.4L</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <Button variant="link" className="w-full mt-4 text-primary text-xs font-bold">
                  View Branch Distribution
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
