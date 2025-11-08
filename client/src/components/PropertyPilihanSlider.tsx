import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@shared/schema";
import { supabase } from "@/lib/supabase";

interface PropertyPilihanSliderProps {
  properties: Property[];
}

export function PropertyPilihanSlider({ properties }: PropertyPilihanSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1000000000) {
      const value = num / 1000000000;
      // Jika bilangan bulat, tampilkan tanpa desimal, jika ada desimal tampilkan 1 digit
      return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
    } else if (num >= 1000000) {
      const value = num / 1000000;
      // Jika bilangan bulat, tampilkan tanpa desimal, jika ada desimal tampilkan 1 digit
      return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % properties.length);
  };

  const currentProperty = properties[currentIndex];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 md:py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
            Properti Pilihan
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan properti terbaik dengan lokasi strategis dan fasilitas lengkap
          </p>
        </div>

        <div className="group relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:shadow-3xl">
          {/* Image */}
          <img
            src={currentProperty.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop'}
            alt={currentProperty.kodeListing}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop';
            }}
          />

          {/* Modern Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

          {/* Property Label Badge - Modern Design */}
          {(currentProperty.isPremium || currentProperty.isFeatured || currentProperty.isHot) && (
            <div className="absolute top-4 left-4 z-10">
              {currentProperty.isPremium && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-2xl animate-pulse border-2 border-white/20">
                  👑 PREMIUM
                </span>
              )}
              {currentProperty.isFeatured && !currentProperty.isPremium && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-2xl border-2 border-white/20">
                  💎 FEATURED
                </span>
              )}
              {currentProperty.isHot && !currentProperty.isPremium && !currentProperty.isFeatured && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-2xl border-2 border-white/20">
                  🔥 HOT LISTING
                </span>
              )}
            </div>
          )}

          {/* Property Type Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg">
              {currentProperty.jenisProperti ? currentProperty.jenisProperti.charAt(0).toUpperCase() + currentProperty.jenisProperti.slice(1).replace(/_/g, ' ') : 'Properti'}
            </span>
          </div>

          {/* Content Overlay - Modern Design */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
            <div className="max-w-2xl">
              {/* Kode Listing */}
              <p className="text-sm text-white/90 mb-2 font-mono font-medium tracking-wider" data-testid="text-kode-listing">
                {currentProperty.kodeListing}
              </p>

              {/* Property Title */}
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 leading-tight drop-shadow-lg" data-testid="text-property-title">
                {currentProperty.judulProperti || `${currentProperty.jenisProperti ? currentProperty.jenisProperti.charAt(0).toUpperCase() + currentProperty.jenisProperti.slice(1).replace(/_/g, ' ') : 'Properti'} di ${currentProperty.kabupaten ? currentProperty.kabupaten.charAt(0).toUpperCase() + currentProperty.kabupaten.slice(1) : 'Lokasi'}`}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">📍</span>
                </div>
                <p className="text-sm md:text-base text-white/95 font-medium">
                  {currentProperty.kabupaten ? currentProperty.kabupaten.charAt(0).toUpperCase() + currentProperty.kabupaten.slice(1) : 'Lokasi tidak tersedia'},
                  {currentProperty.provinsi ? currentProperty.provinsi.charAt(0).toUpperCase() + currentProperty.provinsi.slice(1) : ''}
                </p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg" data-testid="text-property-price">
                  {formatPrice(currentProperty.hargaProperti)}
                </p>
                {currentProperty.isHot && currentProperty.priceOld && (
                  <p className="text-lg text-white/80 line-through mt-1">
                    {formatPrice(currentProperty.priceOld)}
                  </p>
                )}
              </div>

              {/* Property Specifications - Modern Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {currentProperty.luasTanah && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-xs text-white/80 font-medium mb-1">Luas Tanah</div>
                    <div className="text-sm font-bold">{currentProperty.luasTanah}m²</div>
                  </div>
                )}
                {currentProperty.luasBangunan && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-xs text-white/80 font-medium mb-1">Luas Bangunan</div>
                    <div className="text-sm font-bold">{currentProperty.luasBangunan}m²</div>
                  </div>
                )}
                {currentProperty.kamarTidur && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-xs text-white/80 font-medium mb-1">Kamar Tidur</div>
                    <div className="text-sm font-bold">{currentProperty.kamarTidur}</div>
                  </div>
                )}
                {currentProperty.kamarMandi && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-xs text-white/80 font-medium mb-1">Kamar Mandi</div>
                    <div className="text-sm font-bold">{currentProperty.kamarMandi}</div>
                  </div>
                )}
              </div>

              {/* Legalitas */}
              {currentProperty.legalitas && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <span className="text-xs text-white/80 font-medium">Legalitas:</span>
                  <span className="text-sm font-bold text-white">{currentProperty.legalitas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons - Modern Design */}
          <Button
            variant="ghost"
            size="icon"
            className="
              absolute left-4 top-1/2 -translate-y-1/2
              w-12 h-12 rounded-full
              bg-white/10 backdrop-blur-md border border-white/30
              hover:bg-white/20 hover:scale-110
              transition-all duration-300 shadow-2xl
              opacity-0 group-hover:opacity-100
            "
            onClick={goToPrevious}
            data-testid="button-previous"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              w-12 h-12 rounded-full
              bg-white/10 backdrop-blur-md border border-white/30
              hover:bg-white/20 hover:scale-110
              transition-all duration-300 shadow-2xl
              opacity-0 group-hover:opacity-100
            "
            onClick={goToNext}
            data-testid="button-next"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>

          {/* Dots Navigation - Modern Design */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            {properties.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${index === currentIndex
                    ? "bg-white w-8 shadow-lg"
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
