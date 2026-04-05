
"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Building2, TrendingUp } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BranchesPage() {
  const { firestore } = useFirestore();
  const branchesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'branches');
  }, [firestore]);
  const { data: branches, isLoading } = useCollection(branchesQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', contactPerson: '' });

  const handleAddBranch = () => {
    if (!newBranch.name || !firestore) return;
    
    addDocumentNonBlocking(collection(firestore, 'branches'), {
      ...newBranch,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    setNewBranch({ name: '', address: '', contactPerson: '' });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold font-headline text-slate-900 tracking-tight">Branches</h2>
            <p className="text-muted-foreground mt-1">Operational centers and departmental credit tracking.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Branch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Branch Name</Label>
                  <Input 
                    value={newBranch.name} 
                    onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                    placeholder="e.g. Mumbai North"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={newBranch.address} 
                    onChange={e => setNewBranch({...newBranch, address: e.target.value})}
                    placeholder="Full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input 
                    value={newBranch.contactPerson} 
                    onChange={e => setNewBranch({...newBranch, contactPerson: e.target.value})}
                    placeholder="Name"
                  />
                </div>
                <Button className="w-full" onClick={handleAddBranch}>Save Branch</Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches?.map((branch) => (
            <Card key={branch.id} className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{branch.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {branch.address || 'No address provided'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Contact</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{branch.contactPerson || 'N/A'}</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <Button variant="link" className="w-full mt-4 text-primary text-xs font-bold">
                  View Branch Details
                </Button>
              </CardContent>
            </Card>
          ))}
          {(!branches || branches.length === 0) && !isLoading && (
            <div className="col-span-3 text-center py-20 bg-white rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">No branches found. Add one to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
