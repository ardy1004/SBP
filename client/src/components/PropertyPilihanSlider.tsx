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
      return `Rp ${(num / 1000000000).toFixed(1)}M`;
    } else if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}jt`;
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

        <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-xl">
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

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-property-title">
              {currentProperty.jenisProperti.charAt(0).toUpperCase() + currentProperty.jenisProperti.slice(1)} - {currentProperty.kabupaten.charAt(0).toUpperCase() + currentProperty.kabupaten.slice(1)}
            </h3>
            <p className="text-xl md:text-2xl font-semibold mb-4" data-testid="text-property-price">
              {formatPrice(currentProperty.hargaProperti)}
            </p>
            <div className="flex gap-4 text-sm md:text-base">
              {currentProperty.kamarTidur && (
                <span>{currentProperty.kamarTidur} Kamar Tidur</span>
              )}
              {currentProperty.kamarMandi && (
                <span>{currentProperty.kamarMandi} Kamar Mandi</span>
              )}
              {currentProperty.luasTanah && (
                <span>{currentProperty.luasTanah}m² Tanah</span>
              )}
            </div>
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
