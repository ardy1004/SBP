import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  return (
    <div className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.salambumi.xyz/luxury_modern_villa_exterior_in_yogyakarta_at_twilight.png"
          alt="Luxury Villa in Yogyakarta"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
        <div className="max-w-3xl space-y-8">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            Find Your <span className="text-primary-foreground text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Perfect Property</span> in Yogyakarta
          </h1>

          <p
            className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed"
            data-aos="fade-right"
            data-aos-delay="200"
          >
            Rumah, Villa, Kost, Tanah, Ruko, Hotel, dan Properti Komersial dengan legalitas terjamin dan lokasi strategis.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 pt-4"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Link href="/properties">
              <Button size="lg" className="rounded-full px-8 text-base h-12 bg-primary hover:bg-primary/90 border-none">
                Lihat Daftar Properti
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/#contact">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12 bg-white/10 border-white/20 text-white hover:bg-white hover:text-foreground backdrop-blur-sm">
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block text-white/50">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}