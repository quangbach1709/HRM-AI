import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopHeader } from './TopHeader';
import { MobileBottomNav } from './MobileBottomNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col">
          <TopHeader />
          
          <main className="flex-1 p-4 lg:p-6 pb-24 md:pb-6 overflow-auto">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
