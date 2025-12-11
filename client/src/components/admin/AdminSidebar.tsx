import { Link, useLocation } from "wouter";
import { Home, FileText, BarChart3, Settings, LogOut, Upload, Search, Zap, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const [location, setLocation] = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: Home },
    { path: "/admin/properties", label: "Properti", icon: FileText },
    { path: "/admin/blog", label: "Blog", icon: BookOpen },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/leads", label: "Leads", icon: Users },
    { path: "/admin/search-console", label: "Search Console", icon: Search },
    { path: "/admin/page-insights", label: "Page Insights", icon: Zap },
    { path: "/admin/integrations", label: "Integrasi", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/admin/login');
  };

  return (
    <div className="w-64 bg-sidebar border-r h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Salam Bumi Property</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link key={item.path} href={item.path} data-testid={`link-${item.label.toLowerCase()}`}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover-elevate ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
