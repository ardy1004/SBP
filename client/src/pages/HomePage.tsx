import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { HeroSection } from "@/components/HeroSection";
import { PropertyPilihanSlider } from "@/components/PropertyPilihanSlider";
import { PropertyCard } from "@/components/PropertyCard";
import { AdvancedFilters, FilterValues } from "@/components/AdvancedFilters";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@shared/schema";

// VANILLA JAVASCRIPT PAGINATION - Complete replacement for React state issues
function VanillaPagination({
  properties,
  onToggleFavorite,
  favorites,
  initialVisibleCount = 8
}: {
  properties: Property[];
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  initialVisibleCount?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalVisibleCount, setInternalVisibleCount] = useState(initialVisibleCount);

  // Direct DOM manipulation for pagination
  const loadMoreVanilla = () => {
    console.log('=== VANILLA LOAD MORE ===');
    console.log('Current visible:', internalVisibleCount);
    console.log('Total properties:', properties.length);

    const newCount = internalVisibleCount + 8;
    console.log('Setting to:', newCount);

    setInternalVisibleCount(newCount);

    // Force DOM update
    setTimeout(() => {
      if (containerRef.current) {
        const event = new Event('vanilla-load-more', { bubbles: true });
        containerRef.current.dispatchEvent(event);
      }
    }, 0);
  };

  const displayedProperties = properties.slice(0, internalVisibleCount);

  return (
    <div ref={containerRef}>
      <div
        data-testid="vanilla-property-grid"
        key={`vanilla-grid-${Date.now()}-${internalVisibleCount}`}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
      >
        {displayedProperties.map((property, index) => {
          console.log(`VANILLA: Rendering property ${index + 1}/${displayedProperties.length}:`, property.kodeListing);
          return (
            <PropertyCard
              key={`vanilla-${property.id}-${Date.now()}-${internalVisibleCount}-${index}`}
              property={property}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(property.id)}
            />
          );
        })}
      </div>

      {properties.length > internalVisibleCount && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMoreVanilla}
            data-testid="vanilla-load-more"
          >
            Lihat Lebih Banyak ({properties.length - internalVisibleCount} tersisa)
          </Button>
        </div>
      )}

      {/* Counter removed for cleaner UI */}
    </div>
  );
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
  const [keyword, setKeyword] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Use ref for direct DOM manipulation as last resort
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [forceRender, setForceRender] = useState(0);

  // Fetch property pilihan
  const { data: propertyPilihan = [] } = useQuery<Property[]>({
    queryKey: [`${import.meta.env.VITE_API_URL}/api/properties/pilihan`],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/pilihan`);
      if (!response.ok) {
        console.error('Failed to fetch property pilihan:', response.status);
        return [];
      }
      return response.json();
    },
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
    if (advancedFilters.minLandArea) params.set('minLandArea', advancedFilters.minLandArea.toString());
    if (advancedFilters.maxLandArea) params.set('maxLandArea', advancedFilters.maxLandArea.toString());
    if (advancedFilters.minBuildingArea) params.set('minBuildingArea', advancedFilters.minBuildingArea.toString());
    if (advancedFilters.maxBuildingArea) params.set('maxBuildingArea', advancedFilters.maxBuildingArea.toString());
    if (advancedFilters.legalStatus) params.set('legalStatus', advancedFilters.legalStatus);
    if (keyword.trim()) params.set('keyword', keyword.trim());
    return params.toString();
  };

  // Fetch filtered properties from backend
  const queryString = buildQueryParams();
    const queryUrl = queryString ? `/api/properties?${queryString}` : '/api/properties';
    const { data: allProperties = [], isLoading } = useQuery<Property[]>({
      queryKey: [`${import.meta.env.VITE_API_URL}${queryUrl}`],
      queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}${queryUrl}`);
        if (!response.ok) {
          console.error('Failed to fetch properties:', response.status);
          return [];
        }
        return response.json();
      },
    });
  // Simple approach: just use slice directly in render
  const displayedProperties = allProperties.slice(0, visibleCount);

  // Force re-render when visibleCount changes
  useEffect(() => {
    console.log('=== FORCE RE-RENDER ===');
    console.log('visibleCount changed to:', visibleCount);
    console.log('displayedProperties length:', displayedProperties.length);
    console.log('forceRender:', forceRender);
  }, [visibleCount, forceRender]);

  const handleSearch = (filters: { status?: string; type?: string; location?: string }) => {
    setSearchFilters(filters);
    // Reset to first page when hero search changes
    setVisibleCount(8);
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const handleApplyAdvancedFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
  };

  const handleKeywordSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
    // Reset to first page when searching
    setVisibleCount(8);
  };

  const handleAdvancedFiltersChange = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    // Reset to first page when filters change
    setVisibleCount(8);
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleLoadMore = () => {
    console.log('=== LOAD MORE CLICKED ===');
    console.log('Current visibleCount:', visibleCount);
    console.log('Total allProperties:', allProperties.length);

    // Calculate new count
    const newCount = visibleCount + 8;
    const newForceRender = forceRender + 1;

    console.log('Setting visibleCount to:', newCount);
    console.log('Setting forceRender to:', newForceRender);

    // Batch state updates
    setVisibleCount(newCount);
    setForceRender(newForceRender);

    // Force immediate re-render with multiple techniques
    setTimeout(() => {
      console.log('=== FORCED RE-RENDER ATTEMPT ===');
      // Force React to re-render by dispatching custom event
      window.dispatchEvent(new CustomEvent('force-rerender', {
        detail: { visibleCount: newCount, forceRender: newForceRender }
      }));

      // Direct DOM manipulation
      const gridElement = document.querySelector('[data-testid="property-grid"]') as HTMLElement;
      if (gridElement) {
        console.log('Found grid element, forcing update');
        // Force style recalculation
        gridElement.style.display = 'none';
        gridElement.offsetHeight; // Trigger reflow
        gridElement.style.display = '';
      }
    }, 0);
  };

  return (
    <div key={`home-${visibleCount}`} className="min-h-screen flex flex-col">
      <HeroSection onSearch={handleSearch} />

      {propertyPilihan.length > 0 && (
        <PropertyPilihanSlider properties={propertyPilihan} />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Properti Terbaru
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              onSearch={handleKeywordSearch}
              placeholder="Cari properti..."
              initialValue={keyword}
              className="w-full sm:w-96"
            />
            <AdvancedFilters
              onApplyFilters={handleAdvancedFiltersChange}
              currentFilters={advancedFilters}
            />
          </div>
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
        ) : allProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {keyword ? `Tidak ada properti yang sesuai dengan kata kunci "${keyword}"` : 'Tidak ada properti yang sesuai dengan filter Anda'}
            </p>
            {keyword && (
              <p className="text-sm text-muted-foreground mt-2">
                Coba gunakan kata kunci yang berbeda atau kurangi filter lainnya
              </p>
            )}
          </div>
        ) : (
          <>
            <VanillaPagination
              properties={allProperties}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
              initialVisibleCount={8}
            />
            {/* Counter removed for cleaner UI */}
          </>
        )}

        {/* Load more button removed - now handled by VanillaPagination */}
      </div>
    </div>
  );
}
