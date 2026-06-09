import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, X, Phone, Home, Building,
  LogIn, LogOut, ChevronDown,
  LayoutDashboard, Settings, User
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/admin/context/AuthContext";

interface NavDropdownItem {
  href: string;
  label: string;
}

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  hasDropdown?: boolean;
  dropdownItems?: NavDropdownItem[];
}

// Navigation items dengan icons dan dropdown support
const NAV_LINKS: NavLinkItem[] = [
  { href: "/", label: "Home", icon: Home },
  { 
    href: "/properti", 
    label: "Properties", 
    icon: Building,
    hasDropdown: true,
    dropdownItems: [
      { href: "/properti/dijual/rumah", label: "Rumah Dijual" },
      { href: "/properti/dijual/kost", label: "Kost Dijual" },
      { href: "/properti/dijual/tanah", label: "Tanah Dijual" },
      { href: "/properti/dijual/villa", label: "Villa Dijual" },
      { href: "/properti/dijual/ruko", label: "Ruko Dijual" },
      { href: "/properti/dijual/apartment", label: "Apartment Dijual" },
      { href: "/properti/dijual/hotel", label: "Hotel Dijual" },
      { href: "/properti/dijual/homestay", label: "Homestay Dijual" },
      { href: "/properti/dijual/gudang", label: "Gudang Dijual" },
      { href: "/properti/disewa/kost", label: "Kost Disewa" },
      { href: "/properti/disewa/villa", label: "Villa Disewa" },
      { href: "/properti/disewa/hotel", label: "Hotel Disewa" },
      { href: "/properti", label: "Semua Properti" },
    ]
  },
  { href: "/contact", label: "Contact", icon: Phone },
];

// Admin profile dropdown items
const ADMIN_MENU_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Home },
  { href: "/admin/leads", label: "Leads", icon: User },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Gunakan AuthContext untuk mendapatkan status auth
  const { user, isAuthenticated, logout } = useAuth();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setAdminDropdownOpen(false);
  }, [location]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Check if link is active
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setAdminDropdownOpen(false);
    setMobileMenuOpen(false);
    setLocation("/admin/login");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
            : "bg-white py-5",
          className
        )}
        role="banner"
        aria-label="Main navigation header"
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 group"
              aria-label="Salam Bumi Property - Home"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-secondary font-bold text-xl transition-transform group-hover:scale-105">
                SB
              </div>
              <span className="font-extrabold text-xl tracking-tight text-primary">
                SALAM BUMI
                <span className="block text-xs font-semibold text-secondary tracking-widest uppercase mt-[-4px]">
                  Property
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav 
              className="hidden lg:flex items-center gap-1"
              role="navigation"
              aria-label="Main navigation"
            >
              <ul className="flex items-center gap-1" role="menubar">
                {NAV_LINKS.map((link) => (
                  <li 
                    key={link.href} 
                    className="relative"
                    role="none"
                  >
                    {link.hasDropdown ? (
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === link.href ? null : link.href)}
                        role="menuitem"
                        aria-haspopup="true"
                        aria-expanded={activeDropdown === link.href}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg relative group",
                          isActive(link.href)
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-gray-600 hover:text-primary hover:bg-gray-50"
                        )}
                      >
                        <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                        {link.label}
                        {link.badge && (
                          <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-semibold animate-pulse">
                            {link.badge}
                          </span>
                        )}
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-300",
                          activeDropdown === link.href && "rotate-180"
                        )} />
                        {isActive(link.href) && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-secondary rounded-full" />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        role="menuitem"
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg relative group",
                          isActive(link.href)
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-gray-600 hover:text-primary hover:bg-gray-50"
                        )}
                      >
                        <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                        {link.label}
                        {link.badge && (
                          <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-semibold animate-pulse">
                            {link.badge}
                          </span>
                        )}
                        {isActive(link.href) && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-secondary rounded-full" />
                        )}
                      </Link>
                    )}

                    {/* Properties Dropdown */}
                    {link.hasDropdown && link.dropdownItems && activeDropdown === link.href && (
                      <div
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                        role="menu"
                        aria-label="Properties submenu"
                      >
                        {link.dropdownItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <ChevronDown className="w-3 h-3 -rotate-90 text-gray-400" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Side: CTA, Admin Login/Profile, Mobile Toggle */}
            <div className="flex items-center gap-3">
              {/* WhatsApp CTA - Desktop */}
              <Button
                asChild
                className="hidden md:flex bg-secondary hover:bg-secondary/90 text-primary font-bold px-6 shadow-md shadow-secondary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <a href="https://wa.me/6281391278889" target="_blank" rel="noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  Hubungi Kami
                </a>
              </Button>

              {/* Admin Login / Profile Dropdown */}
              {isAuthenticated ? (
                <div className="relative hidden lg:block" ref={adminDropdownRef}>
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-expanded={adminDropdownOpen}
                    aria-haspopup="true"
                    aria-label="Admin menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-500 transition-transform",
                      adminDropdownOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Admin Dropdown Menu */}
                  <div
                    className={cn(
                      "absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200",
                      adminDropdownOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    )}
                    role="menu"
                    aria-label="Admin menu options"
                  >
                    {ADMIN_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 my-2" />
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="hidden lg:flex border-primary/20 text-primary hover:bg-primary hover:text-white"
                >
                  <Link href="/admin/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Admin Login
                  </Link>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(true)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] lg:hidden"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            style={{
              opacity: mobileMenuOpen ? 1 : 0,
            }}
          />
          
          {/* Slide-in Menu */}
          <div 
            ref={mobileMenuRef}
            className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out"
            style={{
              transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            }}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-lg text-primary">Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-primary bg-gray-50 rounded-full transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3" role="navigation" aria-label="Mobile navigation">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    {link.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === link.href ? null : link.href)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                            isActive(link.href)
                              ? "bg-primary/5 text-primary"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                          aria-expanded={activeDropdown === link.href}
                          aria-haspopup="true"
                        >
                          <span className="flex items-center gap-3">
                            <link.icon className="w-5 h-5" />
                            {link.label}
                          </span>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            activeDropdown === link.href && "rotate-180"
                          )} />
                        </button>
                        
                        {/* Mobile Dropdown */}
                        {activeDropdown === link.href && link.dropdownItems && (
                          <ul className="ml-8 mt-1 space-y-1">
                            {link.dropdownItems.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                          isActive(link.href)
                            ? "bg-primary/5 text-primary"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                        aria-current={isActive(link.href) ? "page" : undefined}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                        {link.badge && (
                          <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-semibold ml-auto">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Bottom Section */}
            <div className="p-5 border-t border-gray-100 space-y-3">
              {/* Admin Login / Profile in Mobile */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  {ADMIN_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Button 
                  asChild 
                  variant="outline"
                  className="w-full border-primary/20 text-primary hover:bg-primary hover:text-white"
                >
                  <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Admin Login
                  </Link>
                </Button>
              )}
              
              {/* WhatsApp CTA */}
              <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-primary font-bold">
                <a href="https://wa.me/6281391278889" target="_blank" rel="noreferrer">
                  <Phone className="w-4 h-4 mr-2" />
                  0813-9127-8889
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* SEO Structured Data - SiteNavigationElement */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            "name": "Salam Bumi Property Navigation",
            "url": "https://salambumi.xyz",
            "hasPart": NAV_LINKS.map(link => ({
              "@type": "SiteNavigationElement",
              "name": link.label,
              "url": `https://salambumi.xyz${link.href}`
            }))
          })
        }}
      />
    </>
  );
}
