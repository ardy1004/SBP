import { HeroBanner } from "@/components/hero-banner"
import { SearchBar } from "@/components/search-bar"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { getProperties, getFeaturedProperties } from "@/lib/supabase/properties-server"
import Link from "next/link"
import { ArrowRight, Home, Shield, HeadphonesIcon, TrendingUp } from "@/components/icons"

export default async function HomePage() {
  const [featuredProperties, allProperties] = await Promise.all([getFeaturedProperties(), getProperties()])

  const latestProperties = allProperties.slice(0, 6)

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="container mx-auto px-4 py-8">
        <HeroBanner properties={featuredProperties} />
      </section>

      {/* Search Bar Section */}
      <section className="container mx-auto px-4 py-8">
        <SearchBar />
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mengapa Memilih Kami?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kami berkomitmen memberikan layanan terbaik untuk membantu Anda menemukan properti impian
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center space-y-3 p-6 rounded-xl bg-muted/50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Properti Terlengkap</h3>
            <p className="text-sm text-muted-foreground">Ribuan pilihan properti dari berbagai lokasi dan harga</p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-xl bg-muted/50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Terpercaya</h3>
            <p className="text-sm text-muted-foreground">Informasi akurat dan transaksi yang aman dan terpercaya</p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-xl bg-muted/50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
              <HeadphonesIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Layanan 24/7</h3>
            <p className="text-sm text-muted-foreground">Tim profesional siap membantu Anda kapan saja</p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-xl bg-muted/50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Investasi Terbaik</h3>
            <p className="text-sm text-muted-foreground">Rekomendasi properti dengan potensi investasi tinggi</p>
          </div>
        </div>
      </section>

      {/* Latest Properties Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Properti Terbaru</h2>
            <p className="text-muted-foreground">Temukan properti terbaru dari berbagai lokasi</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/properties">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Menemukan Properti Impian?</h2>
          <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan orang yang telah menemukan properti terbaik bersama kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/properties">Jelajahi Properti</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/contact">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
