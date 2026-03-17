import Link from "next/link"
import Image from "next/image"
import { MapPin, Bed, Bath, Maximize, Eye, Diamond, Crown, Flame } from "@/components/icons"
import type { Property } from "@/lib/types"
import { formatPrice, getPropertyTypeLabel, getPropertyStatusLabel } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const cardClasses = `group block bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-all ${
    property.isPremium ? 'border-yellow-500 shadow-yellow-500/60 shadow-lg animate-pulse' : ''
  }`

  return (
    <Link
      href={`/properties/${property.id}`}
      className={cardClasses}
    >
      {/* Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <Image
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground">{getPropertyStatusLabel(property.status)}</Badge>
          <Badge variant="secondary">{getPropertyTypeLabel(property.type)}</Badge>
        </div>

        {/* Property Labels */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {property.featured && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold shadow-lg animate-pulse">
              <Diamond className="h-3 w-3" />
              <span>Featured</span>
            </div>
          )}
          {property.isPremium && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold shadow-lg animate-pulse">
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
          {property.isHot && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold shadow-lg animate-pulse">
              <Flame className="h-3 w-3" />
              <span>Hot</span>
            </div>
          )}
        </div>

        {/* Sold Overlay */}
        {property.isSold && (
          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
            <div className="bg-red-600/80 text-white px-4 py-2 rounded-md font-bold text-lg transform -rotate-12 shadow-lg">
              TERJUAL
            </div>
          </div>
        )}

        {/* Views */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs">
          <Eye className="h-3 w-3" />
          <span>{property.views}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="text-2xl font-bold text-primary">{formatPrice(property.price)}</div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          {property.kodeListing && (
            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
              {property.kodeListing}
            </code>
          )}
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {[property.location.city, property.location.province].filter(Boolean).join(", ")}
          </span>
        </div>

        {/* Specifications */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
          {property.specifications.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span>{property.specifications.bedrooms} KT</span>
            </div>
          )}
          {property.specifications.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              <span>{property.specifications.bathrooms} KM</span>
            </div>
          )}
          {property.specifications.landArea > 0 && (
            <div className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4" />
              <span>{property.specifications.landArea} m²</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
