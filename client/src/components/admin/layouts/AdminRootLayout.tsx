// Unified Admin Root Layout
// Combines sidebar and header into a single, consistent layout system

import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

interface AdminRootLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AdminRootLayout({
  children,
  title = "Dashboard",
  subtitle,
  className
}: AdminRootLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar 
            isCollapsed={sidebarCollapsed} 
            onToggleCollapse={toggleSidebar} 
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <AdminSidebar />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <AdminHeader 
            title={title}
            subtitle={subtitle}
            onMenuToggle={toggleMobileMenu}
            mobileMenuOpen={mobileMenuOpen}
          />

          {/* Page Content */}
          <main className={cn(
            "flex-1 p-4 lg:p-6 overflow-auto",
            className
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminRootLayout;
