'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
  // Pages that should not have a sidebar
  const isAuthPage = pathname === '/login';

  useEffect(() => {
    // Force redirect to login if auth check finishes and no user is found on a protected page
    if (!isUserLoading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [user, isUserLoading, isAuthPage, router]);

  // 1. Initial Loading State: While Firebase is determining current auth status
  if (isUserLoading && !isAuthPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F3F6F9]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Loader2 className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">Authorizing Session</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State: Prevent rendering protected content while redirecting
  if (!user && !isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-[#F3F6F9] flex items-center justify-center">
         <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  // 3. Auth Page State: Login/Signup pages (sidebar-less)
  if (isAuthPage) {
    return <div className="min-h-screen w-full bg-[#F3F6F9]">{children}</div>;
  }

  // 4. Authenticated State: User is logged in and authorized
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full transition-all duration-300">
        <AppSidebar />
        {children}
      </div>
    </SidebarProvider>
  );
}
