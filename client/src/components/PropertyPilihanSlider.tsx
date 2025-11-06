import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@shared/schema";

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
    <div className="bg-muted py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
          Properti Pilihan
        </h2>

        <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden shadow-xl">
          {/* Image */}
          <img
            src={currentProperty.imageUrl}
            alt={currentProperty.kodeListing}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Property Label Badge - Top Left Corner */}
          {(currentProperty.isPremium || currentProperty.isFeatured || currentProperty.isHot) && (
            <div className="absolute top-2 left-2 z-10">
              {currentProperty.isPremium && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg animate-pulse">
                  👑 PREMIUM
                </span>
              )}
              {currentProperty.isFeatured && !currentProperty.isPremium && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg">
                  💎 FEATURED
                </span>
              )}
              {currentProperty.isHot && !currentProperty.isPremium && !currentProperty.isFeatured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-600 text-white shadow-lg">
                  🔥 HOT
                </span>
              )}
            </div>
          )}

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-6 text-white">

            {/* Kode Listing (small size) */}
            <p className="text-xs text-white/80 mb-0.5 font-mono" data-testid="text-kode-listing">
              {currentProperty.kodeListing}
            </p>

            {/* Property Title - Responsive sizing */}
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-0.5 md:mb-1 leading-tight" data-testid="text-property-title">
              {currentProperty.judulProperti || `${currentProperty.jenisProperti.charAt(0).toUpperCase() + currentProperty.jenisProperti.slice(1).replace(/_/g, ' ')} di ${currentProperty.kabupaten.charAt(0).toUpperCase() + currentProperty.kabupaten.slice(1)}`}
            </h3>

            {/* Location */}
            <p className="text-xs md:text-sm text-white/90 mb-1 md:mb-1.5 leading-tight">
              📍 {currentProperty.kabupaten.charAt(0).toUpperCase() + currentProperty.kabupaten.slice(1)}, {currentProperty.provinsi.charAt(0).toUpperCase() + currentProperty.provinsi.slice(1)}
            </p>

            {/* Price */}
            <p className="text-base md:text-lg lg:text-xl font-semibold mb-1 md:mb-1.5" data-testid="text-property-price">
              {formatPrice(currentProperty.hargaProperti)}
            </p>

            {/* Property Specifications - Compact Layout */}
            <div className="flex flex-wrap gap-x-2 md:gap-x-3 gap-y-0.5 text-xs md:text-sm">
              {currentProperty.luasTanah && (
                <span className="font-medium">
                  LT: <span className="font-normal">{currentProperty.luasTanah}m²</span>
                </span>
              )}
              {currentProperty.luasBangunan && (
                <span className="font-medium">
                  LB: <span className="font-normal">{currentProperty.luasBangunan}m²</span>
                </span>
              )}
              {currentProperty.kamarTidur && (
                <span className="font-medium">
                  K.Tidur: <span className="font-normal">{currentProperty.kamarTidur}</span>
                </span>
              )}
              {currentProperty.kamarMandi && (
                <span className="font-medium">
                  K.Mandi: <span className="font-normal">{currentProperty.kamarMandi}</span>
                </span>
              )}
            </div>

            {/* Legalitas - if present */}
            {currentProperty.legalitas && (
              <div className="mt-0.5 md:mt-1 pt-0.5 md:pt-1 border-t border-white/20">
                <p className="text-xs text-white/80">
                  <span className="font-medium">Legalitas:</span> {currentProperty.legalitas}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={goToPrevious}
            data-testid="button-previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={goToNext}
            data-testid="button-next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {properties.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                data-testid={`button-dot-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
