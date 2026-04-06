
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useAuth } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Settings, Globe, CheckCircle2, Loader2, User, LogOut, ShieldCheck } from 'lucide-react';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

const CURRENCIES = [
  { code: 'SAR', name: 'Saudi Riyal (SAR) - KSA' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
];

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { firestore } = useFirestore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'userSettings', user.uid);
  }, [firestore, user?.uid]);

  const { data: settings, isLoading } = useDoc(settingsRef);
  const [selectedCurrency, setSelectedCurrency] = useState('SAR');

  useEffect(() => {
    if (settings?.currency) {
      setSelectedCurrency(settings.currency);
    }
  }, [settings]);

  const handleSave = () => {
    if (!firestore || !user?.uid) return;
    
    setSaving(true);
    setDocumentNonBlocking(
      doc(firestore, 'userSettings', user.uid),
      {
        userId: user.uid,
        currency: selectedCurrency,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <SidebarInset className="flex-1 bg-background">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-8">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-slate-900 tracking-tight">System Settings</h2>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <div className="mb-8">
          <p className="text-muted-foreground">Manage your account preferences and application defaults.</p>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Personal Settings */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2.5 bg-accent/10 rounded-xl shrink-0">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Account Profile</CardTitle>
                <CardDescription>Your personal information and session details.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    value={user?.displayName || 'Active User'} 
                    readOnly 
                    className="bg-slate-50 border-slate-200 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    value={user?.email || 'Anonymous Access'} 
                    readOnly 
                    className="bg-slate-50 border-slate-200 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-slate-50 p-3 rounded-lg border border-dashed">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Your account is managed via Firebase Enterprise Authentication.
              </div>
            </CardContent>
          </Card>

          {/* Localization Settings */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Localization</CardTitle>
                <CardDescription>Select your preferred currency for financial reports.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Preferred Currency</Label>
                {isLoading ? (
                  <div className="h-10 w-full bg-slate-100 animate-pulse rounded-md" />
                ) : (
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger id="currency" className="w-full bg-slate-50 border-slate-200 h-11">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>{curr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || isLoading}
                  className="bg-primary min-w-[140px] h-11 w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Preferences'}
                </Button>
                {success && (
                  <div className="flex items-center text-green-600 text-sm font-bold">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Preferences updated successfully.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card className="border-none shadow-sm border-l-4 border-l-destructive/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2.5 bg-destructive/10 rounded-xl shrink-0">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg">Security & Session</CardTitle>
                <CardDescription>Securely end your current session.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="h-11 min-w-[140px]"
              >
                Sign Out from DuesFlow
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarInset>
  );
}
