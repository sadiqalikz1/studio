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
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useAuth } from '@/firebase';
import { useUserRole } from '@/hooks/use-user-role';
import { doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Globe, CheckCircle2, Loader2, User, LogOut, ShieldCheck } from 'lucide-react';
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
  const { isAdmin } = useUserRole();
  const auth = useAuth();
  const firestore = useFirestore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'userSettings', user.uid);
  }, [firestore, user?.uid]);

  const adminSettingsRef = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return doc(firestore, 'systemSettings', 'auth');
  }, [firestore, isAdmin]);

  const { data: settings, isLoading } = useDoc(settingsRef);
  const { data: adminSettings, isLoading: isAdminSettingsLoading } = useDoc(adminSettingsRef);
  
  const [selectedCurrency, setSelectedCurrency] = useState('SAR');
  const [signupDisabled, setSignupDisabled] = useState(false);

  useEffect(() => {
    if (settings?.currency) {
      setSelectedCurrency(settings.currency);
    }
    if (adminSettings) {
      setSignupDisabled(adminSettings.signupDisabled === true);
    }
  }, [settings, adminSettings]);

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

  const handleAdminToggle = (checked: boolean) => {
    if (!firestore || !isAdmin) return;
    setSignupDisabled(checked);
    setDocumentNonBlocking(
      doc(firestore, 'systemSettings', 'auth'),
      {
        signupDisabled: checked,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      },
      { merge: true }
    );
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <SidebarInset className="flex-1 bg-[#F8FAFC]">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 md:px-8">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-slate-900 tracking-tight">System Settings</h2>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <p className="text-slate-500 font-medium">Manage your account preferences and application localization defaults.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Personal Settings */}
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center gap-4 border-b bg-slate-50/30 pb-6">
              <div className="p-2.5 bg-accent/10 rounded-xl shrink-0">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">Account Profile</CardTitle>
                <CardDescription>Your personal information and session details.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold">Display Name</Label>
                  <Input 
                    value={user?.displayName || 'Active User'} 
                    readOnly 
                    className="bg-slate-50 border-slate-200 cursor-not-allowed h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold">Email Address</Label>
                  <Input 
                    value={user?.email || 'Anonymous Access'} 
                    readOnly 
                    className="bg-slate-50 border-slate-200 cursor-not-allowed h-11"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <p>Your session is protected with enterprise-grade encryption via Firebase.</p>
              </div>
            </CardContent>
          </Card>

          {/* Localization Settings */}
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center gap-4 border-b bg-slate-50/30 pb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">Localization</CardTitle>
                <CardDescription>Select your preferred currency for global financial reports.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3 max-w-sm">
                <Label htmlFor="currency" className="text-slate-600 font-bold">Preferred Currency</Label>
                {isLoading ? (
                  <div className="h-11 w-full bg-slate-100 animate-pulse rounded-xl" />
                ) : (
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger id="currency" className="w-full bg-slate-50 border-slate-200 h-11 rounded-xl">
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

              <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-slate-100">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || isLoading}
                  className="bg-primary min-w-[160px] h-11 rounded-xl shadow-lg shadow-primary/20"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Preferences'}
                </Button>
                {success && (
                  <div className="flex items-center text-green-600 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Preferences updated successfully.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Security Settings */}
          {isAdmin && (
            <Card className="border-none shadow-sm overflow-hidden bg-white border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center gap-4 border-b bg-orange-50/10 pb-6">
                <div className="p-2.5 bg-orange-100 rounded-xl shrink-0">
                  <ShieldCheck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline">Enterprise Security Controls</CardTitle>
                  <CardDescription>Access management and global restriction protocols.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold text-slate-800">New User Registration</Label>
                    <p className="text-sm text-slate-500">
                      When disabled, only pre-authorized team members can access the system.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${signupDisabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {signupDisabled ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                    <Switch 
                      checked={!signupDisabled} 
                      onCheckedChange={(checked) => handleAdminToggle(!checked)} 
                    />
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 text-sm font-medium text-orange-800 bg-orange-50 rounded-xl border border-orange-100">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>Changes here take effect immediately for all new connection attempts. Existing active sessions will not be terminated.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logout Section */}
          <Card className="border-none shadow-sm overflow-hidden bg-white border-l-4 border-l-destructive/50">
            <CardHeader className="flex flex-row items-center gap-4 border-b bg-red-50/10 pb-6">
              <div className="p-2.5 bg-destructive/10 rounded-xl shrink-0">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline">Security & Session</CardTitle>
                <CardDescription>Securely end your current session across this device.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-8 px-6">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="h-11 min-w-[160px] rounded-xl font-bold"
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
