'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { useUser } from '@/firebase';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  
  // Pages that should not have a sidebar
  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return <div className="min-h-screen w-full bg-[#F3F6F9]">{children}</div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        {children}
      </div>
    </SidebarProvider>
  );
}
