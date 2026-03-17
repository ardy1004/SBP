import { Link } from "wouter";
import { MapPin, Bed, Bath, Maximize, Heart, TrendingDown, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { generateBlurPlaceholder } from "@/utils/imageOptimization";
import { formatPriceNew } from "@/lib/utils";
import { usePropertyStore } from "@/store/propertyStore";
import type { Property } from "@shared/types";
import { lazy, Suspense, memo, useState } from "react";

// Lazy load heavy components
const ShareButtons = lazy(() => import("@/components/ShareButtons").then(module => ({ default: module.ShareButtons })));

interface PropertyCardProps {
  property: Property;
  onToggleFavorite?: (id: string) => void; // Kept for backward compatibility
  isFavorite?: boolean; // Kept for backward compatibility
}

const PropertyCardComponent = ({ property, onToggleFavorite, isFavorite }: PropertyCardProps) => {
  // Use store for favorites management
  const { toggleFavorite, isFavorite: isFavoriteFromStore } = usePropertyStore()
  const isFav = isFavorite !== undefined ? isFavorite : isFavoriteFromStore(property.id)

  // State for image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all available images for this property
  const getAllImages = () => {
    const images: string[] = [];
    if (property.imageUrl && property.imageUrl.trim() !== '') images.push(property.imageUrl);
    if (property.imageUrl1 && property.imageUrl1.trim() !== '') images.push(property.imageUrl1);
    if (property.imageUrl2 && property.imageUrl2.trim() !== '') images.push(property.imageUrl2);
    if (property.imageUrl3 && property.imageUrl3.trim() !== '') images.push(property.imageUrl3);
    if (property.imageUrl4 && property.imageUrl4.trim() !== '') images.push(property.imageUrl4);
    if (property.imageUrl5 && property.imageUrl5.trim() !== '') images.push(property.imageUrl5);
    if (property.imageUrl6 && property.imageUrl6.trim() !== '') images.push(property.imageUrl6);
    if (property.imageUrl7 && property.imageUrl7.trim() !== '') images.push(property.imageUrl7);
    if (property.imageUrl8 && property.imageUrl8.trim() !== '') images.push(property.imageUrl8);
    if (property.imageUrl9 && property.imageUrl9.trim() !== '') images.push(property.imageUrl9);
    return images;
  };

  const allImages = getAllImages();
  const hasMultipleImages = allImages.length > 1;

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const getPropertyTypeLabel = (type: string) => {
    if (!type) return '🏠 Properti';
    const typeMap: Record<string, string> = {
      rumah: '🏠 Rumah',
      kost: '🏢 Kost',
      apartment: '🏙️ Apartment',
      villa: '🏖️ Villa',
      gudang: '📦 Gudang',
      ruko: '🏪 Ruko',
      tanah: '🌱 Tanah',
      bangunan_komersial: '🏢 Komersial',
      hotel: '🏨 Hotel'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  const getPropertyImage = () => {
    // Check primary image first
    if (property.imageUrl && property.imageUrl.trim() !== '') {
      try {
        const url = new URL(property.imageUrl);
        // Otomatis crop 1:1 untuk Unsplash
        if (url.hostname.includes('images.unsplash.com')) {
          url.searchParams.set('w', '600');
          url.searchParams.set('h', '600');
          url.searchParams.set('fit', 'crop');
          url.searchParams.set('crop', 'faces,edges');
          return url.toString();
        }
        // Bisa ditambah transformasi lain untuk CDN lain di sini
        return property.imageUrl;
      } catch {
        // Invalid URL, continue to fallback
      }
    }

    // Return property-type specific placeholder
    return getPropertyTypePlaceholder();
  };

  const getBlurDataURL = () => {
    // Generate a simple blur placeholder for the property type
    return generateBlurPlaceholder(16, 12);
  };

  const getPropertyTypePlaceholder = () => {
    const propertyTypePlaceholders: Record<string, string> = {
      rumah: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      kost: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
      apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      villa: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop',
      ruko: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      tanah: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      gudang: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    };

    return propertyTypePlaceholders[property.jenisProperti] ||
           'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-500';
    if (status === 'dijual') return 'bg-emerald-500';
    if (status === 'disewakan') return 'bg-blue-500';
    if (status === 'dijual_disewakan') return 'bg-gradient-to-r from-emerald-500 to-blue-500';
    return 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    if (!status || status === 'dijual') return 'DIJUAL';
    if (status === 'disewakan') return 'DISEWAKAN';
    if (status === 'dijual_disewakan') return 'DIJUAL & DISEWAKAN';
    return 'DIJUAL';
  };

  const getLabel = () => {
    // Auto HOT if there's a discounted price (price_old exists)
    if (property.isHot || property.priceOld) return { type: 'hot', text: 'HOT', color: 'bg-orange-500', icon: '🔥' };
    if (property.isPremium) return { type: 'premium', text: 'PREMIUM', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: '👑' };
    if (property.isFeatured) return { type: 'featured', text: 'FEATURED', color: 'bg-cyan-500', icon: '💎' };
    return null;
  };

  const getTitle = () => {
    if (!property.jenisProperti || !property.kabupaten) {
      return property.judulProperti || 'Properti';
    }
    return property.judulProperti || `${getPropertyTypeLabel(property.jenisProperti)} di ${property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}`;
  };

  const label = getLabel();
  // Use simple /properti/:kodeListing format for property detail page
  const slug = `/properti/${property.kodeListing}`;
  const shareSlug = `/p/${property.kodeListing}`;

  return (
    <Card
      className={`
        group relative overflow-hidden bg-white border-2 border-blue-500 shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-600
        rounded-lg
        ${property.isSold ? 'opacity-75' : 'hover:shadow-2xl'}
        ${property.isPremium ? 'premium-glow-border' : ''}
      `}
      data-testid={`card-property-${property.id}`}
    >
      {/* Main Link Area */}
      <div onClick={() => window.location.href = slug} className="block cursor-pointer">
        {/* Image Container - Responsive aspect ratio for full image */}
        <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <OptimizedImage
            src={hasMultipleImages ? allImages[currentImageIndex] : getPropertyImage()}
            alt={getTitle()}
            width={400}
            height={400}
            quality={80}
            placeholder="blur"
            blurDataURL={getBlurDataURL()}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            className={`
              w-full h-full object-cover transition-all duration-300 ease-out
              transform-gpu will-change-transform origin-center
              group-hover:scale-110 group-hover:brightness-105
              group-active:scale-110 group-active:brightness-105
              ${property.isSold ? 'opacity-50 grayscale' : ''}
            `}
          />

          {/* Image Navigation - Pagination Dots */}
          {hasMultipleImages && (
            <>
              {/* Left Arrow */}
              <button
                onClick={goToPreviousImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              {/* Right Arrow */}
              <button
                onClick={goToNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`transition-all duration-200 rounded-full ${
                      index === currentImageIndex
                        ? 'w-2.5 h-2.5 bg-white scale-110'
                        : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Property Type Badge - Raised and shifted towards top-left corner */}
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="px-1.5 py-0.5 text-[10px] font-medium bg-white/90 text-gray-800 border-0 shadow-md"
            >
              {getPropertyTypeLabel(property.jenisProperti)}
            </Badge>
          </div>

          {/* Special Label - Now in top-right, shifted closer to corner */}
          {label && (
            <div className="absolute top-2 right-2">
              <Badge
                className={`
                  px-2 py-1 text-[10px] font-bold uppercase tracking-wider
                  ${label.color} text-white border-0 shadow-lg
                  animate-pulse
                `}
                data-testid={`badge-${label.type}`}
              >
                {label.icon} {label.text}
              </Badge>
            </div>
          )}

          {/* Status Badge - Now in bottom-left, shifted closer to corner, hide if property is sold */}
          {!property.isSold && (
            <div className="absolute bottom-2 left-2">
              <Badge
                className={`
                  px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider
                  ${getStatusColor(property.status)} text-white border-0
                  shadow-lg backdrop-blur-sm
                `}
              >
                {getStatusLabel(property.status)}
              </Badge>
            </div>
          )}

          {/* SOLD Overlay - More compact for mobile */}
          {property.isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/40">
              <div className="bg-red-600 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-md sm:rounded-lg font-bold text-sm sm:text-xl shadow-2xl transform -rotate-6 sm:-rotate-12 border-2 sm:border-4 border-white/20">
                TERJUAL
              </div>
            </div>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="
                absolute top-3 right-3 w-9 h-9 rounded-full
                bg-white/20 backdrop-blur-md border border-white/30
                hover:bg-white/30 hover:scale-110
                transition-all duration-200 shadow-lg
                opacity-0 group-hover:opacity-100
              "
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use store's toggleFavorite, fallback to prop for backward compatibility
                if (onToggleFavorite) {
                  onToggleFavorite(property.id);
                } else {
                  toggleFavorite(property.id);
                }
              }}
              data-testid="button-favorite"
            >
              <Heart
                className={`h-4 w-4 transition-colors duration-200 ${
                  isFav ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Content - Adjusted padding for mobile */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-500 mb-1.5 sm:mb-1" data-testid="text-kode-listing">
              {property.kodeListing}
            </p>
            <Link href={slug}>
              <h3
                className="
                  text-sm font-bold text-gray-900 line-clamp-2
                  hover:text-blue-600 transition-colors duration-200
                  cursor-pointer leading-snug mb-1.5 sm:mb-2
                "
                data-testid="text-title"
              >
                {getTitle()}
              </h3>
            </Link>
          </div>
        </div>

        {/* Location - Smaller text on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium line-clamp-1" data-testid="text-location">
            {property.kabupaten ? property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1) : 'Lokasi tidak tersedia'}
            {property.provinsi ? `, ${property.provinsi.charAt(0).toUpperCase() + property.provinsi.slice(1)}` : ''}
          </span>
        </div>

        {/* Price - More compact spacing */}
        <div className="space-y-0.5 sm:space-y-1">
          {property.priceOld && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                {formatPriceNew(property.priceOld, (property as any).hargaPerMeter)}
              </span>
            </div>
          )}
          <p
            className="text-lg sm:text-xl font-bold text-gray-900"
            data-testid="text-price"
          >
            {property.jenisProperti === 'tanah' && (property as any).hargaPerMeter
              ? formatPriceNew(property.hargaProperti, { isPerMeter: true })
              : formatPriceNew(property.hargaProperti, { isPerMeter: false })
            }
          </p>
        </div>

        {/* Specifications - Adjusted padding for mobile */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2 sm:py-3 px-1 border-t border-gray-100">
          {property.luasTanah && (
            <div className="flex items-center gap-2 text-gray-600">
              <Maximize className="h-4 w-4 text-gray-400 sm:hidden" />
              <div className="text-xs">
                <span className="font-medium">LT:</span>
                <span className="ml-1" data-testid="text-land-area">{property.luasTanah}m²</span>
              </div>
            </div>
          )}
          {property.luasBangunan && (
            <div className="flex items-center gap-2 text-gray-600">
              <Maximize className="h-4 w-4 text-gray-400 sm:hidden" />
              <div className="text-xs">
                <span className="font-medium">LB:</span>
                <span className="ml-1" data-testid="text-building-area">{property.luasBangunan}m²</span>
              </div>
            </div>
          )}
          {property.kamarTidur && (
            <div className="flex items-center gap-2 text-gray-600">
              <Bed className="h-4 w-4 text-gray-400 sm:hidden" />
              <div className="text-xs">
                <span className="font-medium">Kamar:</span>
                <span className="ml-1" data-testid="text-bedrooms">{property.kamarTidur}</span>
              </div>
            </div>
          )}
          {property.kamarMandi && (
            <div className="flex items-center gap-2 text-gray-600">
              <Bath className="h-4 w-4 text-gray-400 sm:hidden" />
              <div className="text-xs">
                <span className="font-medium">K.Mandi:</span>
                <span className="ml-1" data-testid="text-bathrooms">{property.kamarMandi}</span>
              </div>
            </div>
          )}
        </div>

        {/* Legalitas - Adjusted padding for mobile */}
        {property.legalitas && (
          <div className="pt-2 sm:pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Legalitas:</span>
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 border-gray-300 text-gray-700"
                data-testid="text-legalitas"
              >
                {property.legalitas}
              </Badge>
            </div>
          </div>
        )}

        {/* Footer Actions - Larger button for mobile */}
        <div className="flex items-center justify-end pt-1.5 sm:pt-3 border-t border-gray-100">
          <a
            href={slug}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-9 sm:h-8 px-4 sm:px-3 text-xs sm:text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            data-testid="button-lihat-detail"
          >
            <Eye className="h-3 w-3 sm:h-3 sm:w-3 mr-1.5" />
            Lihat Detail
          </a>
        </div>
      </div>
    </Card>
  );
};

// Export with React.memo for performance optimization
export const PropertyCard = memo(PropertyCardComponent);
