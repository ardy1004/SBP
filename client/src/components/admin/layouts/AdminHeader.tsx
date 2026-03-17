// Unified Admin Header - Enhanced with search, notifications, quick actions
// Part of the new unified admin layout system

import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Search, User, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function AdminHeader({
  title = "Dashboard",
  subtitle = "",
  onMenuToggle,
  mobileMenuOpen
}: AdminHeaderProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3); // This would come from real data

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search logic - for now redirect to properties with search
      setLocation(`/admin/properties?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: Search (desktop only) */}
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Cari properti, leads, blog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Properti baru ditambahkan</span>
                    <span className="text-xs text-slate-500">2 menit lalu</span>
                  </div>
                  <span className="text-sm text-slate-500">Rumah di Yogyakarta</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Lead baru masuk</span>
                    <span className="text-xs text-slate-500">1 jam lalu</span>
                  </div>
                  <span className="text-sm text-slate-500">Inquiry untuk Kost di Sleman</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Submission menunggu review</span>
                    <span className="text-xs text-slate-500">3 jam lalu</span>
                  </div>
                  <span className="text-sm text-slate-500">Tanah di Bantul</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center text-emerald-600">
                Lihat semua notification
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@salambumi.xyz
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/admin/integrations')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
