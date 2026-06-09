import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { leadsApi, contractsApi } from "@/lib/api-client";
import {
  LayoutDashboard, Home, FileText, FileSignature, Users, BarChart3,
  Settings, LogOut, ChevronDown, ChevronRight, Menu, Bell,
  Plus, ChevronLeft, Building2, User, X, FileSpreadsheet, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubItem {
  label: string;
  path: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  danger?: boolean;
  badge?: number;
  subitems?: SubItem[];
}

// navItems dipindahkan ke dalam AdminLayout component agar bisa akses badgeCounts

function SidebarLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate: () => void }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(() => location.startsWith(item.path));
  const isActive = location.startsWith(item.path);
  const Icon = item.icon;

  if (item.subitems) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
            isActive ? "bg-[#1E3A8A]/30 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`}
          aria-expanded={open}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {open ? <ChevronDown className="w-4 h-4 opacity-60" /> : <ChevronRight className="w-4 h-4 opacity-60" />}
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="ml-8 mt-1 space-y-0.5">
            {item.subitems.map(sub => (
              <Link key={sub.path} href={sub.path} onClick={onNavigate}>
                <span className={`block px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  location === sub.path
                    ? "bg-[#1E3A8A]/40 text-white font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}>
                  {sub.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.path} onClick={onNavigate}>
      <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium cursor-pointer ${
        isActive
          ? "bg-[#1E3A8A]/30 text-white"
          : item.danger
          ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}>
        <Icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="flex-1">{item.label}</span>}
        {!collapsed && item.badge ? (
          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
            {item.badge}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function ProfileDropdown({ user, logout }: { user: { name: string; role: string; photo: string } | null; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="Profil admin"
      >
        <img
          src={user?.photo}
          alt={user?.name}
          className="w-9 h-9 rounded-full object-cover border-2 border-[#1E3A8A]/30"
        />
        <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <Link href="/admin/settings">
            <span
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <User className="w-4 h-4 text-gray-400" />
              Profil & Settings
            </span>
          </Link>
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, logout, resetInactivityTimer } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handler = () => resetInactivityTimer();
    events.forEach(ev => window.addEventListener(ev, handler, { passive: true }));
    return () => events.forEach(ev => window.removeEventListener(ev, handler));
  }, [resetInactivityTimer]);

  useEffect(() => { setSidebarOpen(false); }, []);

  // Badge counts — fetch dari API
  const [badgeCounts, setBadgeCounts] = useState({ newLeads: 0, newSubmissions: 0, pendingContracts: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [leadsResult, contractsResult] = await Promise.allSettled([
          leadsApi.getAll({ status: "new", limit: 1 }),
          contractsApi.getAll({ status: "draft", limit: 1 }),
        ]);

        const newLeads = leadsResult.status === "fulfilled"
          ? (leadsResult.value.pagination?.total || 0) : 0;
        const pendingContracts = contractsResult.status === "fulfilled"
          ? (contractsResult.value.pagination?.total || 0) : 0;

        setBadgeCounts({ newLeads, newSubmissions: 0, pendingContracts });
      } catch {}
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000); // refresh setiap 1 menit
    return () => clearInterval(interval);
  }, []);

  const totalBadge = badgeCounts.newLeads + badgeCounts.newSubmissions + badgeCounts.pendingContracts;

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    {
      icon: Home, label: "Kelola Properti", path: "/admin/properties",
      subitems: [
        { label: "Semua Properti", path: "/admin/properties" },
        { label: "Tambah Properti", path: "/admin/properties/add" },
        { label: "Properti Sold", path: "/admin/properties/sold" },
        { label: "Import CSV", path: "/admin/import-csv" },
        { label: "Import History", path: "/admin/import-history" },
      ]
    },
    { icon: FileText, label: "Form Submission", path: "/admin/submissions" },
    { icon: FileSignature, label: "Perjanjian & Kontrak", path: "/admin/contracts", badge: badgeCounts.pendingContracts },
    { icon: Users, label: "Lead Management", path: "/admin/leads", badge: badgeCounts.newLeads },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-[#1F2937] transition-all duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${collapsed ? "w-16" : "w-64"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-white font-extrabold text-sm leading-tight">SALAM BUMI</div>
              <div className="text-[#F59E0B] text-xs font-semibold tracking-wide">PROPERTY</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto text-gray-400 hover:text-white hidden lg:block shrink-0"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-gray-400 hover:text-white lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Profile */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={user?.photo}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#F59E0B]"
              />
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
                <div className="text-gray-400 text-xs truncate">{user?.role}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <SidebarLink
              key={item.path}
              item={item}
              collapsed={collapsed}
              onNavigate={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-2 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center gap-3 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900 p-1"
            aria-label="Buka sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{title}</h1>

          <Link href="/admin/properties/add">
            <Button size="sm" className="hidden sm:flex gap-2 bg-[#1E3A8A] hover:bg-[#1e4db7] h-9">
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Tambah Properti</span>
            </Button>
          </Link>

          <button className="relative text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifikasi">
            <Bell className="w-5 h-5" />
            {totalBadge > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {totalBadge > 9 ? "9+" : totalBadge}
              </span>
            )}
          </button>

          <ProfileDropdown user={user} logout={logout} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
