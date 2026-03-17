"use client"

import Link from "next/link"
import { Home, Search, Menu, X } from "@/components/icons"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Home className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">Salam Bumi</span>
            <span className="text-xs text-muted-foreground">Property</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Beranda
          </Link>
          <Link href="/properties" className="text-sm font-medium transition-colors hover:text-primary">
            Properti
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            Tentang Kami
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Kontak
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/properties">
              <Search className="h-4 w-4 mr-2" />
              Cari Properti
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/contact">Hubungi Kami</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/properties"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Properti
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tentang Kami
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kontak
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/properties" onClick={() => setMobileMenuOpen(false)}>
                  <Search className="h-4 w-4 mr-2" />
                  Cari Properti
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Hubungi Kami
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
