import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Upload,
  Search,
  Zap,
  Users,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Building2,
  TrendingUp,
  Target,
  Database,
  Shield,
  Bell,
  UserCheck,
  Activity,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  children?: MenuItem[];
  onClick?: () => void;
}

export function EnhancedAdminSidebar() {
  const [location, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['properties', 'analytics']));

  const menuItems: MenuItem[] = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      path: "/admin/properties",
      label: "Properties",
      icon: Building2,
      children: [
        { path: "/admin/properties", label: "All Properties", icon: FileText },
        { onClick: () => setLocation("/admin/properties/new"), label: "Add New", icon: Upload },
      ]
    },
    {
      path: "/admin/blog",
      label: "Blog",
      icon: BookOpen,
      children: [
        { path: "/admin/blog", label: "All Posts", icon: FileText },
        { onClick: () => setLocation("/admin/blog/editor"), label: "Add New", icon: Upload },
      ]
    },
    {
      path: "/admin/analytics",
      label: "Analytics & SEO",
      icon: BarChart3,
      children: [
        { path: "/admin/analytics", label: "Google Analytics", icon: BarChart3 },
        { path: "/admin/search-console", label: "Search Console", icon: Search },
        { path: "/admin/page-insights", label: "PageSpeed Insights", icon: Zap },
        { onClick: () => setLocation("/admin/seo-optimizer"), label: "SEO Optimizer", icon: Target },
      ]
    },
    {
      path: "/admin/integrations",
      label: "Integrations",
      icon: Settings,
    },
    {
      path: "/admin/activity",
      label: "Activity Log",
      icon: Activity,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/admin/login');
  };

  const toggleMenu = (menuKey: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuKey)) {
      newExpanded.delete(menuKey);
    } else {
      newExpanded.add(menuKey);
    }
    setExpandedMenus(newExpanded);
  };

  const isActive = (path: string) => location === path;
  const isMenuActive = (item: MenuItem) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => child.path && isActive(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.label.toLowerCase());
    const active = isMenuActive(item);

    return (
      <div key={item.path}>
        {hasChildren ? (
          <button
            onClick={() => toggleMenu(item.label.toLowerCase())}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all hover-elevate group",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
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
        ) : (
          <button
            onClick={item.onClick || (() => item.path ? setLocation(item.path as string) : undefined)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all hover-elevate",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-5 w-5 flex-shrink-0", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        )}

        {!isCollapsed && hasChildren && isExpanded && item.children && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map(child => (
              <div key={child.label}>
                {child.path ? (
                  <Link href={child.path}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all hover-elevate text-sm",
                        child.path && isActive(child.path)
                          ? "bg-sidebar-accent/70 text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                      )}
                    >
                      <child.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{child.label}</span>
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={child.onClick}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all hover-elevate text-sm",
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{child.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "bg-sidebar border-r h-screen flex flex-col sticky top-0 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-xl font-bold">SalamBumi</h2>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
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
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start hover-elevate",
            isCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("flex-shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}