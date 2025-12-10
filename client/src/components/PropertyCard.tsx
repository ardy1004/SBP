import { Link } from "wouter";
import { MapPin, Bed, Bath, Maximize, Heart, TrendingDown, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { ImageVariants } from "@/lib/imageUtils";
import { generatePropertySlug } from "@/lib/utils";
import type { Property } from "@shared/types";
import { lazy, Suspense } from "react";

// Lazy load heavy components
const ShareButtons = lazy(() => import("@/components/ShareButtons").then(module => ({ default: module.ShareButtons })));

interface PropertyCardProps {
  property: Property;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export function PropertyCard({ property, onToggleFavorite, isFavorite }: PropertyCardProps) {
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
        new URL(property.imageUrl);
        return property.imageUrl;
      } catch {
        // Invalid URL, continue to fallback
      }
    }

    // Return property-type specific placeholder
    return getPropertyTypePlaceholder();
  };

  const getImageVariants = (): ImageVariants | undefined => {
    // Check if property has image variants (from Cloudflare Images)
    const imageUrl = getPropertyImage();
    if (imageUrl && imageUrl.includes('imagedelivery.net')) {
      // Extract image ID from Cloudflare Images URL
      const urlParts = imageUrl.split('/');
      const imageId = urlParts[urlParts.length - 2]; // Get image ID before 'public'
      const accountId = urlParts[3]; // Get account ID

      if (imageId && accountId) {
        return {
          thumbnail: `https://imagedelivery.net/${accountId}/${imageId}/w=300,sharpen=1,format=auto`,
          small: `https://imagedelivery.net/${accountId}/${imageId}/w=600,sharpen=1,format=auto`,
          medium: `https://imagedelivery.net/${accountId}/${imageId}/w=800,sharpen=1,format=auto`,
          large: `https://imagedelivery.net/${accountId}/${imageId}/w=1200,sharpen=1,format=auto`,
          original: imageUrl
        };
      }
    }
    return undefined; // No variants available
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
    return status === 'dijual' ? 'bg-emerald-500' : 'bg-blue-500';
  };

  const getLabel = () => {
    if (property.isHot) return { type: 'hot', text: 'HOT LISTING', color: 'bg-orange-500', icon: '🔥' };
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
  const slug = `/${generatePropertySlug({
    status: property.status,
    jenis_properti: property.jenisProperti,
    provinsi: property.provinsi,
    kabupaten: property.kabupaten,
    judul_properti: property.judulProperti || undefined,
    kode_listing: property.kodeListing
  })}`;
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
        {/* Image Container - Adjusted padding for mobile */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-1 sm:p-2">
          <ResponsiveImage
            src={getPropertyImage()}
            variants={getImageVariants()}
            alt={getTitle()}
            loading="lazy"
            className={`
              w-full h-full object-cover transition-all duration-500
              group-hover:scale-110 group-hover:brightness-110
              ${property.isSold ? 'opacity-50 grayscale' : ''}
            `}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          />

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
                {(property.status || 'dijual') === 'dijual' ? 'DIJUAL' : 'DISEWAKAN'}
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
                onToggleFavorite(property.id);
              }}
              data-testid="button-favorite"
            >
              <Heart
                className={`h-4 w-4 transition-colors duration-200 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
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
          {property.isHot && property.priceOld && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                {formatPrice(property.priceOld, (property as any).hargaPerMeter)}
              </span>
            </div>
          )}
          <p
            className="text-lg sm:text-xl font-bold text-gray-900"
            data-testid="text-price"
          >
            {formatPrice(property.hargaProperti, (property as any).hargaPerMeter)}
          </p>
        </div>

        {/* Specifications - Adjusted padding for mobile */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2 sm:py-3 px-1 border-t border-gray-100">
          {property.luasTanah && (
            <div className="flex items-center gap-2 text-gray-600">
              <Maximize className="h-4 w-4 text-gray-400" />
              <div className="text-xs">
                <span className="font-medium">LT:</span>
                <span className="ml-1" data-testid="text-land-area">{property.luasTanah}m²</span>
              </div>
            </div>
          )}
          {property.luasBangunan && (
            <div className="flex items-center gap-2 text-gray-600">
              <Maximize className="h-4 w-4 text-gray-400" />
              <div className="text-xs">
                <span className="font-medium">LB:</span>
                <span className="ml-1" data-testid="text-building-area">{property.luasBangunan}m²</span>
              </div>
            </div>
          )}
          {property.kamarTidur && (
            <div className="flex items-center gap-2 text-gray-600">
              <Bed className="h-4 w-4 text-gray-400" />
              <div className="text-xs">
                <span className="font-medium">Kamar:</span>
                <span className="ml-1" data-testid="text-bedrooms">{property.kamarTidur}</span>
              </div>
            </div>
          )}
          {property.kamarMandi && (
            <div className="flex items-center gap-2 text-gray-600">
              <Bath className="h-4 w-4 text-gray-400" />
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

        {/* Footer Actions - More compact for mobile */}
        <div className="flex items-center justify-end pt-1.5 sm:pt-3 border-t border-gray-100">
          <Button
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              // Use window.location for reliable navigation
              window.location.href = slug;
            }}
            data-testid="button-lihat-detail"
          >
            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            Lihat Detail
          </Button>
        </div>
      </div>
    </Card>
  );
}
