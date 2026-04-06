'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiateAnonymousSignIn, initiateEmailSignIn, useUser } from '@/firebase';
import { CreditCard, LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    initiateEmailSignIn(auth, email, password);
    // Note: Errors are handled by the global listener
    setTimeout(() => setLoading(false), 2000);
  };

  const handleQuickAccess = () => {
    setLoading(true);
    initiateAnonymousSignIn(auth);
    setTimeout(() => setLoading(false), 2000);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-body overflow-y-auto">
      <div className="w-full max-w-[420px] py-12">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-2xl shadow-primary/30 mb-2">
            <CreditCard className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-headline">DuesFlow</h1>
          <p className="text-slate-500 font-medium">Enterprise Supplier Dues Management</p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="pt-10 pb-6 text-center border-b border-slate-50">
            <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400 font-medium mt-1">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-8 px-8">
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-600 font-bold ml-1">Work Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-12 bg-slate-50 border-transparent focus:border-primary/20 focus:bg-white h-12 rounded-xl transition-all font-medium text-slate-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-slate-600 font-bold">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary opacity-80 hover:opacity-100">Forgot?</Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 bg-slate-50 border-transparent focus:border-primary/20 focus:bg-white h-12 rounded-xl transition-all font-medium text-slate-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-base" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                Sign In
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-300">
                <span className="bg-white px-4">Secure Gateway</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 border-slate-100 hover:bg-slate-50 hover:border-slate-200 font-bold rounded-xl text-slate-600 transition-all"
              onClick={handleQuickAccess}
              disabled={loading}
            >
              Quick Access Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
          <CardFooter className="pb-10 pt-4 text-center justify-center">
            <p className="text-[11px] text-slate-400 font-medium px-8 leading-relaxed">
              By signing in, you agree to our <span className="text-primary/70 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-primary/70 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
