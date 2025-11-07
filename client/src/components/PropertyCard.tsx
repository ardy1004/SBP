import { Link } from "wouter";
import { MapPin, Bed, Bath, Maximize, Heart, TrendingDown, Eye, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export function PropertyCard({ property, onToggleFavorite, isFavorite }: PropertyCardProps) {
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1000000000) {
      const value = num / 1000000000;
      return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
    } else if (num >= 1000000) {
      const value = num / 1000000;
      return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const getPropertyTypeLabel = (type: string) => {
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

  const getStatusColor = (status: string) => {
    return status === 'dijual' ? 'bg-emerald-500' : 'bg-blue-500';
  };

  const getLabel = () => {
    if (property.isHot) return { type: 'hot', text: 'HOT LISTING', color: 'bg-orange-500', icon: '🔥' };
    if (property.isPremium) return { type: 'premium', text: 'PREMIUM', color: 'bg-purple-500', icon: '👑' };
    if (property.isFeatured) return { type: 'featured', text: 'FEATURED', color: 'bg-cyan-500', icon: '💎' };
    return null;
  };

  const getTitle = () => {
    return property.judulProperti || `${getPropertyTypeLabel(property.jenisProperti)} di ${property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}`;
  };

  const label = getLabel();
  const slug = `/${property.status}-${property.jenisProperti}-${property.kabupaten}?id=${property.id}`;

  return (
    <Card
      className={`
        group relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-300
        rounded-lg
        ${property.isSold ? 'opacity-75' : 'hover:shadow-2xl'}
      `}
      data-testid={`card-property-${property.id}`}
    >
      {/* Main Link Area */}
      <Link href={slug} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={property.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'}
            alt={getTitle()}
            className={`
              w-full h-full object-cover transition-all duration-500
              group-hover:scale-110 group-hover:brightness-110
              ${property.isSold ? 'opacity-50 grayscale' : ''}
            `}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Property Type Badge - Raised and shifted towards top-left corner */}
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="px-2 py-1 text-xs font-medium bg-white/90 text-gray-800 border-0 shadow-md"
            >
              {getPropertyTypeLabel(property.jenisProperti)}
            </Badge>
          </div>

          {/* Special Label - Now in top-right, shifted closer to corner */}
          {label && (
            <div className="absolute top-2 right-2">
              <Badge
                className={`
                  px-3 py-1.5 text-xs font-bold uppercase tracking-wider
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
                  px-3 py-1 text-xs font-bold uppercase tracking-wider
                  ${getStatusColor(property.status)} text-white border-0
                  shadow-lg backdrop-blur-sm
                `}
              >
                {property.status === 'dijual' ? 'DIJUAL' : 'DISEWAKAN'}
              </Badge>
            </div>
          )}

          {/* SOLD Overlay */}
          {property.isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-2xl transform -rotate-12 border-4 border-white/20">
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
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-500 mb-1" data-testid="text-kode-listing">
              {property.kodeListing}
            </p>
            <Link href={slug}>
              <h3
                className="
                  text-sm font-bold text-gray-900 line-clamp-2
                  hover:text-blue-600 transition-colors duration-200
                  cursor-pointer leading-tight
                "
                data-testid="text-title"
              >
                {getTitle()}
              </h3>
            </Link>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium line-clamp-1" data-testid="text-location">
            {property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)},
            {property.provinsi.charAt(0).toUpperCase() + property.provinsi.slice(1)}
          </span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          {property.isHot && property.priceOld && (
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(property.priceOld)}
              </span>
            </div>
          )}
          <p
            className="text-xl font-bold text-gray-900"
            data-testid="text-price"
          >
            {formatPrice(property.hargaProperti)}
          </p>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-3 py-3 px-1 border-t border-gray-100">
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

        {/* Legalitas */}
        {property.legalitas && (
          <div className="pt-3 border-t border-gray-200">
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

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date(property.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
          </div>
          <Link href={slug}>
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="h-3 w-3 mr-1" />
              Lihat Detail
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
