// Simplified Admin Sidebar - Unified Navigation
// Refactored for cleaner, more maintainable code

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Building2,
  Users,
  FileText,
  BarChart3,
  Settings,
  Activity,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ThemeToggle";
import { cn } from "@/lib/utils";

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  children?: MenuItem[];
  onClick?: () => void;
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ 
  isCollapsed: initialCollapsed = false, 
  onToggleCollapse 
}: AdminSidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['properties']));

  // Navigation menu structure - simplified
  const menuItems: MenuItem[] = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      path: "/admin/properties",
      label: "Properti",
      icon: Building2,
      children: [
        { path: "/admin/properties", label: "Semua Properti", icon: Building2 },
        { path: "/admin/properties/new", label: "Tambah Baru", icon: Building2 },
      ]
    },
    {
      path: "/admin/blog",
      label: "Blog",
      icon: BookOpen,
      children: [
        { path: "/admin/blog", label: "Semua Post", icon: FileText },
        { path: "/admin/blog/editor", label: "Tambah Post", icon: FileText },
      ]
    },
    {
      path: "/admin/analytics",
      label: "Analytics & SEO",
      icon: BarChart3,
    },
    {
      path: "/admin/submissions",
      label: "Submissions",
      icon: LinkIcon,
    },
    {
      path: "/admin/integrations",
      label: "Integrasi",
      icon: Settings,
    },
    {
      path: "/admin/activity",
      label: "Aktivitas",
      icon: Activity,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(menuKey)) {
        newExpanded.delete(menuKey);
      } else {
        newExpanded.add(menuKey);
      }
      return newExpanded;
    });
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggleCollapse?.();
  };

  const isActive = (path: string) => {
    if (!path) return false;
    // Exact match or starts with for sub-routes
    if (path === '/admin/dashboard') {
      return location === path;
    }
    return location === path || location.startsWith(path + '/');
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => child.path && isActive(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.label.toLowerCase());
    const active = isMenuActive(item);

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.label.toLowerCase())}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              active 
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1 text-left text-sm">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>

          {!isCollapsed && hasChildren && isExpanded && item.children && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map(child => (
                <Link key={child.path || child.label} href={child.path || "#"}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      child.path && isActive(child.path)
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{child.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Item without children
    return (
      <Link key={item.path || item.label} href={item.path || "#"}>
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
            active 
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
            isCollapsed && "justify-center px-2"
          )}
        >
          <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "h-6 w-6")} />
          {!isCollapsed && (
            <>
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-screen flex flex-col sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SB</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">SalamBumi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600",
            isCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
