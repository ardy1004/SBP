import Link from "next/link"
import { Home, Mail, Phone, Facebook, Instagram, Twitter } from "@/components/icons"
import { companyInfo } from "@/lib/data"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Home className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">{companyInfo.name}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{companyInfo.slogan}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Link Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Properti
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="font-semibold mb-4">Jenis Properti</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/properties?type=house"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Rumah
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=apartment"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Apartemen
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=land"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Tanah
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=villa"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Villa
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=commercial"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Komersial
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Hubungi Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{companyInfo.phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{companyInfo.email}</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              {companyInfo.socialMedia.facebook && (
                <a
                  href={companyInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {companyInfo.socialMedia.instagram && (
                <a
                  href={companyInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {companyInfo.socialMedia.twitter && (
                <a
                  href={companyInfo.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {companyInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
