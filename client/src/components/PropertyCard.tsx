import { Link } from "wouter";
import { MapPin, Bed, Bath, Maximize, Heart, TrendingDown } from "lucide-react";
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
      // Jika bilangan bulat, tampilkan tanpa desimal, jika ada desimal tampilkan 1 digit
      return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
    } else if (num >= 1000000) {
      const value = num / 1000000;
      // Jika bilangan bulat, tampilkan tanpa desimal, jika ada desimal tampilkan 1 digit
      return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  // Determine label based on priority: SOLD > Hot Listing > Premium > Featured
  const getLabel = () => {
    if (property.isSold) return { type: 'sold', text: 'SOLD', color: 'destructive' };
    if (property.isHot) return { type: 'hot', text: '🔥 HOT', color: 'destructive' };
    if (property.isPremium) return { type: 'premium', text: '👑 PREMIUM', color: 'premium' };
    if (property.isFeatured) return { type: 'featured', text: '💎 FEATURED', color: 'featured' };
    return null;
  };

  const getTitle = () => {
    return property.judulProperti || `${property.jenisProperti.charAt(0).toUpperCase() + property.jenisProperti.slice(1).replace(/_/g, ' ')} di ${property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}`;
  };

  const label = getLabel();
  const slug = `/${property.status}-${property.jenisProperti}-${property.kabupaten}?id=${property.id}`;

  return (
    <Card 
      className={`overflow-hidden hover-elevate transition-all duration-200 ${
        property.isSold ? 'opacity-90' : ''
      }`}
      data-testid={`card-property-${property.id}`}
    >
      <Link href={slug}>
        <div className="relative aspect-[5/4] md:aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={property.imageUrl}
            alt={getTitle()}
            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
              property.isSold ? 'opacity-40' : ''
            }`}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
            }}
          />

          {/* Label Badge */}
          {label && label.type !== 'sold' && (
            <div className="absolute top-1 left-1">
              <Badge
                variant={label.color as any}
                className="px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide shadow-md"
                data-testid={`badge-${label.type}`}
              >
                {label.text}
              </Badge>
            </div>
          )}

          {/* SOLD Diagonal Banner */}
          {property.isSold && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 via-destructive/40 to-destructive/20 transform rotate-[-30deg] scale-150" />
              <span 
                className="relative text-5xl md:text-6xl font-bold text-destructive transform rotate-[-30deg] drop-shadow-lg"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                data-testid="text-sold"
              >
                SOLD
              </span>
            </div>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(property.id);
              }}
              data-testid="button-favorite"
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-destructive text-destructive' : ''}`}
              />
            </Button>
          )}
        </div>
      </Link>

      <div className="p-3 md:p-4">
        {/* Kode Listing (small size) */}
        <p className="text-xs text-muted-foreground mb-1 font-mono" data-testid="text-kode-listing">
          {property.kodeListing}
        </p>

        {/* Property Title */}
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-1.5 md:mb-2 line-clamp-2" data-testid="text-title">
          {getTitle()}
        </h3>

        {/* Location */}
        <div className="flex items-start gap-1.5 md:gap-2 mb-2 md:mb-3">
          <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs md:text-sm text-foreground font-medium line-clamp-2" data-testid="text-location">
            {property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}, {property.provinsi.charAt(0).toUpperCase() + property.provinsi.slice(1)}
          </p>
        </div>

        {/* Price with Hot Listing indicator */}
        <div className="mb-3 md:mb-4">
          {property.isHot && property.priceOld && (
            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
              <TrendingDown className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" />
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                {formatPrice(property.priceOld)}
              </span>
            </div>
          )}
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-foreground" data-testid="text-price">
            {formatPrice(property.hargaProperti)}
          </p>
        </div>

        {/* Property Specifications - Improved Layout */}
        <div className="grid grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
          {property.luasTanah && (
            <div className="flex items-center gap-1">
              <Maximize className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground font-medium">LT:</span>
              <span className="text-foreground" data-testid="text-land-area">{property.luasTanah}m²</span>
            </div>
          )}
          {property.luasBangunan && (
            <div className="flex items-center gap-1">
              <Maximize className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground font-medium">LB:</span>
              <span className="text-foreground" data-testid="text-building-area">{property.luasBangunan}m²</span>
            </div>
          )}
          {property.kamarTidur && (
            <div className="flex items-center gap-1">
              <Bed className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground font-medium">K.Tidur:</span>
              <span className="text-foreground" data-testid="text-bedrooms">{property.kamarTidur}</span>
            </div>
          )}
          {property.kamarMandi && (
            <div className="flex items-center gap-1">
              <Bath className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground font-medium">K.Mandi:</span>
              <span className="text-foreground" data-testid="text-bathrooms">{property.kamarMandi}</span>
            </div>
          )}
        </div>

        {/* Legalitas - Separate row if present */}
        {property.legalitas && (
          <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Legalitas:</span> <span className="text-foreground" data-testid="text-legalitas">{property.legalitas}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
