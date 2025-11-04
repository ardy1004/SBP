import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { HeroSection } from "@/components/HeroSection";
import { PropertyPilihanSlider } from "@/components/PropertyPilihanSlider";
import { PropertyCard } from "@/components/PropertyCard";
import { AdvancedFilters, FilterValues } from "@/components/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch property pilihan
  const { data: propertyPilihan = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties/pilihan'],
  });

  // Build query params from all filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchFilters.status) params.set('status', searchFilters.status);
    if (searchFilters.type) params.set('type', searchFilters.type);
    if (searchFilters.location) params.set('location', searchFilters.location);
    if (advancedFilters.minPrice) params.set('minPrice', advancedFilters.minPrice.toString());
    if (advancedFilters.maxPrice) params.set('maxPrice', advancedFilters.maxPrice.toString());
    if (advancedFilters.bedrooms) params.set('bedrooms', advancedFilters.bedrooms.toString());
    if (advancedFilters.bathrooms) params.set('bathrooms', advancedFilters.bathrooms.toString());
    if (advancedFilters.legalStatus) params.set('legalStatus', advancedFilters.legalStatus);
    return params.toString();
  };

  // Fetch filtered properties from backend
  const queryString = buildQueryParams();
  const queryUrl = queryString ? `/api/properties?${queryString}` : '/api/properties';
  const { data: filteredProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: [queryUrl],
  });

  const handleSearch = (filters: { status?: string; type?: string; location?: string }) => {
    setSearchFilters(filters);
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const handleApplyAdvancedFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection onSearch={handleSearch} />

      {propertyPilihan.length > 0 && (
        <PropertyPilihanSlider properties={propertyPilihan} />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Properti Terbaru
          </h2>
          <AdvancedFilters
            onApplyFilters={handleApplyAdvancedFilters}
            currentFilters={advancedFilters}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Tidak ada properti yang sesuai dengan filter Anda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {filteredProperties.slice(0, 8).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(property.id)}
              />
            ))}
          </div>
        )}

        {filteredProperties.length > 8 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" data-testid="button-load-more">
              Lihat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
