
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileUp, 
  Users, 
  CreditCard, 
  History, 
  Building2, 
  LogOut,
  LogIn,
  Settings,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Upload Purchases', href: '/upload', icon: FileUp },
  { name: 'Make Payments', href: '/payments', icon: CreditCard },
  { name: 'Ledger Reports', href: '/reports', icon: History },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Branches', href: '/branches', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { state } = useSidebar();

  const handleAuthAction = () => {
    if (user) {
      signOut(auth).then(() => {
        router.push('/login');
      });
    } else {
      router.push('/login');
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-white shadow-sm font-body">
      <SidebarHeader className="p-4 flex flex-row items-center gap-3 h-16">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <CreditCard className="text-white w-5 h-5" />
        </div>
        {state !== 'collapsed' && (
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 font-headline leading-tight truncate">DuesFlow</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">AP Management</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 mt-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className={cn(
                    "transition-all duration-200 h-11 px-3 rounded-xl",
                    isActive 
                      ? "bg-primary text-white hover:bg-primary/90 hover:text-white shadow-md shadow-primary/20" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500")} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-slate-50/50">
        {user ? (
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-2xl border bg-white shadow-sm transition-all duration-200 group relative",
            state === 'collapsed' ? "p-1 justify-center border-none shadow-none bg-transparent" : "pr-4"
          )}>
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0 uppercase">
              {user.displayName?.[0] || user.email?.[0] || <User className="w-4 h-4" />}
            </div>
            {state !== 'collapsed' && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user.displayName || (user.isAnonymous ? 'Quick Session' : user.email?.split('@')[0])}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-medium">Administrator</p>
              </div>
            )}
            {state !== 'collapsed' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                onClick={handleAuthAction}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <Button 
            className={cn(
              "w-full h-11 rounded-xl bg-primary shadow-lg shadow-primary/20",
              state === 'collapsed' ? "px-0" : ""
            )}
            onClick={() => router.push('/login')}
          >
            <LogIn className="w-4 h-4 shrink-0" />
            {state !== 'collapsed' && <span className="ml-2 font-bold">Sign In</span>}
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
