import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/blog", label: "Blog" },
    { path: "/about", label: "About Us" },
    { path: "/portfolio", label: "Portfolio Gallery" },
    { path: "/notaris", label: "Notaris" },
    { path: "/faq", label: "FAQ" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 hover-elevate rounded-md px-2 py-1 -ml-2">
              <div className="h-10 md:h-12 flex items-center">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  Salam Bumi Property
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <button
                  className={`text-base font-medium hover-elevate px-3 py-2 rounded-md transition-colors ${
                    location === item.path
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/favorites" data-testid="link-favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            {/* Admin button hidden for security - access via /admin/login directly */}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <button
                  className={`w-full text-left px-4 py-3 rounded-md hover-elevate font-medium transition-colors ${
                    location === item.path
                      ? "text-primary bg-accent"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
            <div className="pt-2 border-t flex gap-2">
              <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} data-testid="link-mobile-favorites">
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Button>
              </Link>
              {/* Admin button hidden for security - access via /admin/login directly */}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
