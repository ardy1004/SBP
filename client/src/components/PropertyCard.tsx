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
      return `Rp ${(num / 1000000000).toFixed(1)}M`;
    } else if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  // Determine label based on priority: SOLD > Hot Listing > Premium > Featured
  const getLabel = () => {
    if (property.isSold) return { type: 'sold', text: 'SOLD', color: 'destructive' };
    if (property.isHot) return { type: 'hot', text: 'Hot', color: 'destructive' };
    if (property.isPremium) return { type: 'premium', text: 'Premium', color: 'blue' };
    if (property.isFeatured) return { type: 'featured', text: 'Featured', color: 'amber' };
    return null;
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
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={property.imageUrl}
            alt={property.kodeListing}
            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
              property.isSold ? 'opacity-40' : ''
            }`}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
            }}
          />

          {/* Label Badge */}
          {label && label.type !== 'sold' && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant={label.color as any}
                className="px-3 py-1.5 text-xs md:text-sm font-semibold uppercase tracking-wide shadow-md"
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

      <div className="p-4">
        {/* Price with Hot Listing indicator */}
        <div className="mb-2">
          {property.isHot && property.priceOld && (
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(property.priceOld)}
              </span>
            </div>
          )}
          <p className="text-xl md:text-2xl font-bold text-foreground" data-testid="text-price">
            {formatPrice(property.hargaProperti)}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground font-medium line-clamp-2" data-testid="text-location">
            {property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}, {property.provinsi.charAt(0).toUpperCase() + property.provinsi.slice(1)}
          </p>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
          {property.kamarTidur && (
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground" data-testid="text-bedrooms">{property.kamarTidur}</span>
            </div>
          )}
          {property.kamarMandi && (
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground" data-testid="text-bathrooms">{property.kamarMandi}</span>
            </div>
          )}
          {property.luasTanah && (
            <div className="flex items-center gap-2">
              <Maximize className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground" data-testid="text-land-area">{property.luasTanah}m²</span>
            </div>
          )}
          {property.luasBangunan && (
            <div className="flex items-center gap-2">
              <Maximize className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground" data-testid="text-building-area">{property.luasBangunan}m²</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
