import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Salam Bumi Property</h3>
            <p className="text-sm text-muted-foreground mb-4 font-body">
              Finding the Best Properties Will Be Easier and More Precise
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover-elevate p-2 rounded-md" data-testid="link-facebook">
                <Facebook className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="#" className="hover-elevate p-2 rounded-md" data-testid="link-instagram">
                <Instagram className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="#" className="hover-elevate p-2 rounded-md" data-testid="link-twitter">
                <Twitter className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" data-testid="link-footer-home">
                  <span className="text-sm text-muted-foreground hover:text-foreground hover-elevate inline-block px-2 py-1 -ml-2 rounded-md">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/about" data-testid="link-footer-about">
                  <span className="text-sm text-muted-foreground hover:text-foreground hover-elevate inline-block px-2 py-1 -ml-2 rounded-md">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/portfolio" data-testid="link-footer-portfolio">
                  <span className="text-sm text-muted-foreground hover:text-foreground hover-elevate inline-block px-2 py-1 -ml-2 rounded-md">Portfolio</span>
                </Link>
              </li>
              <li>
                <Link href="/notaris" data-testid="link-footer-notaris">
                  <span className="text-sm text-muted-foreground hover:text-foreground hover-elevate inline-block px-2 py-1 -ml-2 rounded-md">Notaris</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" data-testid="link-footer-blog">
                  <span className="text-sm text-muted-foreground hover:text-foreground hover-elevate inline-block px-2 py-1 -ml-2 rounded-md">Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" data-testid="link-footer-faq">
                  <span className="text-sm text-muted-foreground hover:text-foreground hover-elevate inline-block px-2 py-1 -ml-2 rounded-md">FAQ</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" data-testid="link-footer-contact">
                  <span className="text-sm text-muted-foreground hover:text-foreground hover-elevate inline-block px-2 py-1 -ml-2 rounded-md">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Virtual Office</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+62 813 9127 8889</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@salambumi.xyz</span>
              </li>
            </ul>
          </div>

          {/* Lokasi Populer */}
          <div>
            <h4 className="font-semibold mb-4">Lokasi Populer</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h5 className="text-sm font-medium mb-2">Sleman</h5>
                <ul className="space-y-1">
                  <li>
                    <Link href="/rumah-dijual/sleman">
                      <span className="text-xs text-muted-foreground hover:text-foreground hover-elevate inline-block px-1 py-0.5 -ml-1 rounded">Rumah Dijual</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/kost/sleman">
                      <span className="text-xs text-muted-foreground hover:text-foreground hover-elevate inline-block px-1 py-0.5 -ml-1 rounded">Kost</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/apartemen/sleman">
                      <span className="text-xs text-muted-foreground hover:text-foreground hover-elevate inline-block px-1 py-0.5 -ml-1 rounded">Apartemen</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-2">Bantul</h5>
                <ul className="space-y-1">
                  <li>
                    <Link href="/rumah-dijual/bantul">
                      <span className="text-xs text-muted-foreground hover:text-foreground hover-elevate inline-block px-1 py-0.5 -ml-1 rounded">Rumah Dijual</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/kost/bantul">
                      <span className="text-xs text-muted-foreground hover:text-foreground hover-elevate inline-block px-1 py-0.5 -ml-1 rounded">Kost</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/apartemen/bantul">
                      <span className="text-xs text-muted-foreground hover:text-foreground hover-elevate inline-block px-1 py-0.5 -ml-1 rounded">Apartemen</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/portfolio">
                <span className="text-sm text-primary hover:text-primary/80 hover-elevate inline-block px-2 py-1 -ml-2 rounded">
                  Lihat Semua Properti →
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Salam Bumi Property. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
