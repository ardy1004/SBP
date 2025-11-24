import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@shared/types";
import { supabase } from "@/lib/supabase";
import { generatePropertySlug } from "@/lib/utils";

interface PropertyPilihanSliderProps {
  properties: Property[];
}

export function PropertyPilihanSlider({ properties }: PropertyPilihanSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (properties.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % properties.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [properties.length]);

  if (properties.length === 0) {
    return null;
  }

  const formatPrice = (price: string, isPerMeter: boolean = false) => {
    const num = parseFloat(price);
    let displayPrice = num;

    if (isPerMeter) {
      // For per meter pricing, show as "Rp 8.5jt/m²"
      if (num >= 1000000000) {
        const value = num / 1000000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
      } else if (num >= 1000000) {
        const value = num / 1000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
      } else if (num >= 1000) {
        const value = num / 1000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}rb/m²`;
      }
      return `Rp ${num.toLocaleString('id-ID')}/m²`;
    } else {
      // Regular pricing
      if (num >= 1000000000) {
        const value = num / 1000000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
      } else if (num >= 1000000) {
        const value = num / 1000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
      }
      return `Rp ${num.toLocaleString('id-ID')}`;
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % properties.length);
  };

  const handleViewDetails = () => {
    // Set clicked state for green color
    setIsClicked(true);

    // Generate SEO-friendly slug for navigation
    const slug = generatePropertySlug({
      status: currentProperty.status,
      jenis_properti: currentProperty.jenisProperti,
      provinsi: currentProperty.provinsi,
      kabupaten: currentProperty.kabupaten,
      judul_properti: currentProperty.judulProperti || undefined,
      kode_listing: currentProperty.kodeListing
    });

    // Navigate to property detail page
    setLocation(`/${slug}`);

    // Reset clicked state after a short delay for visual feedback
    setTimeout(() => setIsClicked(false), 200);
  };

  const currentProperty = properties[currentIndex];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 sm:py-16 md:py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
           <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-3 sm:mb-4">
             Properti Pilihan
           </h2>
           <p className="text-sm sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
             Temukan properti terbaik dengan lokasi strategis dan fasilitas lengkap
           </p>
         </div>

        <div className="group relative w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:shadow-3xl" style={{ height: '600px', maxWidth: '100%' }}>
          {/* Image */}
          <img
            src={currentProperty.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop'}
            alt={currentProperty.kodeListing}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop';
            }}
          />

          {/* Modern Gradient Overlay - Adjusted for mobile */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/85 sm:from-black/90 via-black/30 sm:via-black/40 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-r from-black/15 sm:from-black/20 via-transparent to-black/15 sm:to-black/20" />

          {/* Property Type Badge - Repositioned for mobile */}
           <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
             <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg">
               {currentProperty.jenisProperti ? currentProperty.jenisProperti.charAt(0).toUpperCase() + currentProperty.jenisProperti.slice(1).replace(/_/g, ' ') : 'Properti'}
             </span>
           </div>

          {/* Property Label Badge - Repositioned and responsive */}
           {(currentProperty.isPremium || currentProperty.isFeatured || currentProperty.isHot) && (
             <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
               {currentProperty.isPremium && (
                 <span className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-2xl animate-pulse border-2 border-white/20">
                   👑 PREMIUM
                 </span>
               )}
               {currentProperty.isFeatured && !currentProperty.isPremium && (
                 <span className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-2xl border-2 border-white/20">
                   💎 FEATURED
                 </span>
               )}
               {currentProperty.isHot && !currentProperty.isPremium && !currentProperty.isFeatured && (
                 <span className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-2xl border-2 border-white/20">
                   🔥 HOT
                 </span>
               )}
             </div>
           )}

         {/* Content Overlay - Bottom-left corner positioning */}
          <div className="absolute bottom-0 left-0 p-8 sm:p-10 md:p-12 lg:p-16 xl:p-20 text-white">
            <div className="max-w-2xl">
              {/* Main content - left-aligned layout with tighter vertical spacing */}
              <div className="space-y-3 sm:space-y-4 md:space-y-5 text-left max-w-2xl">
                {/* 1. Kode Listing - Larger and positioned lower */}
                <p className="text-sm sm:text-base md:text-xl text-white/95 font-mono font-semibold tracking-wider mt-4" data-testid="text-kode-listing">
                  {currentProperty.kodeListing}
                </p>

                {/* 2. Property Title - Slightly larger size */}
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight drop-shadow-2xl line-clamp-2" data-testid="text-property-title">
                  {currentProperty.judulProperti || `${currentProperty.jenisProperti ? currentProperty.jenisProperti.charAt(0).toUpperCase() + currentProperty.jenisProperti.slice(1).replace(/_/g, ' ') : 'Properti'} di ${currentProperty.kabupaten ? currentProperty.kabupaten.charAt(0).toUpperCase() + currentProperty.kabupaten.slice(1) : 'Lokasi'}`}
                </h3>

                {/* 3. Price - Even smaller size */}
                <div className="flex items-center">
                  <div>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white drop-shadow-2xl" data-testid="text-property-price">
                      {formatPrice(currentProperty.hargaProperti, (currentProperty as any).hargaPerMeter)}
                    </p>
                    {currentProperty.isHot && currentProperty.priceOld && (
                      <p className="text-xs sm:text-sm text-white/80 line-through mt-1">
                        {formatPrice(currentProperty.priceOld, (currentProperty as any).hargaPerMeter)}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Location - Even smaller size */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">📍</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-white/95 font-medium">
                    {currentProperty.kabupaten ? currentProperty.kabupaten.charAt(0).toUpperCase() + currentProperty.kabupaten.slice(1) : 'Lokasi tidak tersedia'}
                    {currentProperty.provinsi && `, ${currentProperty.provinsi.charAt(0).toUpperCase() + currentProperty.provinsi.slice(1)}`}
                  </p>
                </div>

                {/* 5. Property Specifications - Appropriate size boxes */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {currentProperty.luasTanah && (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 border border-white/30">
                      <span className="text-xs sm:text-sm md:text-base text-white font-semibold">
                        LT : {currentProperty.luasTanah}m²
                      </span>
                    </div>
                  )}
                  {currentProperty.luasBangunan && (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 border border-white/30">
                      <span className="text-xs sm:text-sm md:text-base text-white font-semibold">
                        LB : {currentProperty.luasBangunan}m²
                      </span>
                    </div>
                  )}
                  {currentProperty.kamarTidur && (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 border border-white/30">
                      <span className="text-xs sm:text-sm md:text-base text-white font-semibold">
                        KT : {currentProperty.kamarTidur}
                      </span>
                    </div>
                  )}
                  {currentProperty.kamarMandi && (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 border border-white/30">
                      <span className="text-xs sm:text-sm md:text-base text-white font-semibold">
                        KM : {currentProperty.kamarMandi}
                      </span>
                    </div>
                  )}
                </div>

                {/* 6. Legalitas - Smaller size */}
                {currentProperty.legalitas && (
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/30">
                    <span className="text-xs sm:text-sm text-white/80 font-medium">Legal:</span>
                    <span className="text-xs sm:text-sm font-bold text-white">{currentProperty.legalitas}</span>
                  </div>
                )}

                {/* 7. Lihat Detail Button */}
                <div className="mt-4 sm:mt-6">
                  <Button
                    onClick={handleViewDetails}
                    className={`
                      backdrop-blur-md border font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-full
                      shadow-2xl hover:shadow-3xl transition-all duration-300
                      hover:scale-105 hover:-translate-y-0.5
                      flex items-center gap-2 text-sm sm:text-base
                      touch-manipulation text-white
                      ${isClicked
                        ? 'bg-green-500 hover:bg-green-600 border-green-400'
                        : 'bg-blue-500 hover:bg-blue-600 border-blue-400'
                      }
                    `}
                    data-testid="button-lihat-detail"
                  >
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    Lihat Detail
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - More compact for mobile */}
           <Button
             variant="ghost"
             size="icon"
             className="
               absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-20
               w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full
               bg-white/80 backdrop-blur-md border border-white/60
               hover:bg-white hover:scale-110
               transition-all duration-300 shadow-2xl
               opacity-50 sm:opacity-60 md:opacity-60 group-hover:opacity-100
               touch-manipulation
             "
             onClick={goToPrevious}
             data-testid="button-previous"
           >
             <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
           </Button>

           <Button
             variant="ghost"
             size="icon"
             className="
               absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-20
               w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full
               bg-white/80 backdrop-blur-md border border-white/60
               hover:bg-white hover:scale-110
               transition-all duration-300 shadow-2xl
               opacity-50 sm:opacity-60 md:opacity-60 group-hover:opacity-100
               touch-manipulation
             "
             onClick={goToNext}
             data-testid="button-next"
           >
             <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
           </Button>

          {/* Dots Navigation - More compact for mobile */}
           <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 md:gap-3">
             {properties.map((_, index) => (
               <button
                 key={index}
                 onClick={() => setCurrentIndex(index)}
                 className={`
                   w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 touch-manipulation
                   ${index === currentIndex
                     ? "bg-white w-4 sm:w-6 md:w-8 shadow-lg"
                     : "bg-white/40 hover:bg-white/70 hover:scale-110"
                   }
                 `}
                 data-testid={`button-dot-${index}`}
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
