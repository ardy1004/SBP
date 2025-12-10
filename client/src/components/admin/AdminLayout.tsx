import { ReactNode } from "react";
import { EnhancedAdminSidebar } from "./EnhancedAdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ThemeProvider } from "@/hooks/use-theme";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  notifications?: number;
}

export function AdminLayout({
  children,
  title,
  subtitle,
  showSearch,
  onSearch,
  notifications
}: AdminLayoutProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="salambumi-admin-theme">
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <EnhancedAdminSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <AdminHeader
              title={title}
              subtitle={subtitle}
              showSearch={showSearch}
              onSearch={onSearch}
              notifications={notifications}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}