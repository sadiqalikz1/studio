
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiateAnonymousSignIn, initiateEmailSignIn, useUser } from '@/firebase';
import { CreditCard, LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

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
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F6F9] p-4 font-body">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-4">
            <CreditCard className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-headline">DuesFlow</h1>
          <p className="text-muted-foreground">Enterprise Supplier Dues Management</p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-10 bg-slate-50 border-slate-200 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 bg-slate-50 border-slate-200 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 bg-primary text-white font-bold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground font-semibold">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 border-slate-200 hover:bg-slate-50 font-semibold"
              onClick={handleQuickAccess}
              disabled={loading}
            >
              Quick Access Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
          <CardFooter className="pb-8 text-center justify-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
