import { useState, useCallback, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { HeroSection } from "@/components/HeroSection";
import { PropertyPilihanSlider } from "@/components/PropertyPilihanSlider";
import { PropertyCard } from "@/components/PropertyCard";
import { AdvancedFilters, FilterValues } from "@/components/AdvancedFilters";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@shared/types";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
  const [keyword, setKeyword] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Transform function to convert Supabase snake_case to camelCase
  const transformSupabaseProperty = (supabaseProperty: any): Property => {
    return {
      id: supabaseProperty.id,
      kodeListing: supabaseProperty.kode_listing,
      judulProperti: supabaseProperty.judul_properti,
      deskripsi: supabaseProperty.deskripsi,
      jenisProperti: supabaseProperty.jenis_properti,
      luasTanah: supabaseProperty.luas_tanah,
      luasBangunan: supabaseProperty.luas_bangunan,
      kamarTidur: supabaseProperty.kamar_tidur,
      kamarMandi: supabaseProperty.kamar_mandi,
      legalitas: supabaseProperty.legalitas,
      hargaProperti: supabaseProperty.harga_properti,
      hargaPerMeter: Boolean(supabaseProperty.harga_per_meter || false),
      provinsi: supabaseProperty.provinsi,
      kabupaten: supabaseProperty.kabupaten,
      alamatLengkap: supabaseProperty.alamat_lengkap,
      imageUrl: supabaseProperty.image_url,
      imageUrl1: supabaseProperty.image_url1,
      imageUrl2: supabaseProperty.image_url2,
      imageUrl3: supabaseProperty.image_url3,
      imageUrl4: supabaseProperty.image_url4,
      imageUrl5: supabaseProperty.image_url5,
      imageUrl6: supabaseProperty.image_url6,
      imageUrl7: supabaseProperty.image_url7,
      imageUrl8: supabaseProperty.image_url8,
      imageUrl9: supabaseProperty.image_url9,
      isPremium: supabaseProperty.is_premium,
      isFeatured: supabaseProperty.is_featured,
      isHot: supabaseProperty.is_hot,
      isSold: supabaseProperty.is_sold,
      priceOld: supabaseProperty.price_old,
      isPropertyPilihan: supabaseProperty.is_property_pilihan,
      ownerContact: supabaseProperty.owner_contact,
      status: supabaseProperty.status,
      createdAt: new Date(supabaseProperty.created_at),
      updatedAt: new Date(supabaseProperty.updated_at),
    };
  };

  // Fetch property pilihan directly from Supabase
  const { data: rawPropertyPilihan = [] } = useQuery<any[]>({
    queryKey: ['properties-pilihan-homepage'],
    queryFn: async () => {
      console.log('🏠 HomePage: Fetching pilihan properties from Supabase...');

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_property_pilihan', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ HomePage: Supabase pilihan query error:', error);
        throw error;
      }

      console.log(`✅ HomePage: Fetched ${data?.length || 0} raw pilihan properties from Supabase`);
      console.log('Raw pilihan first property:', data?.[0]);
      return data || [];
    },
  });

  // Transform the raw Supabase pilihan data
  const propertyPilihan = rawPropertyPilihan.map(transformSupabaseProperty);

  // Fetch filtered properties with infinite scroll using React Query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['properties-infinite', searchFilters, advancedFilters, keyword],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🏠 HomePage: Fetching properties from Supabase...', { pageParam });

      const PAGE_SIZE = 8;
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      // Apply filters
      if (searchFilters.status) {
        query = query.eq('status', searchFilters.status);
      }
      if (searchFilters.type) {
        query = query.eq('jenis_properti', searchFilters.type);
      }
      if (searchFilters.location) {
        const locationTerm = searchFilters.location.toLowerCase();
        query = query.or(`kabupaten.ilike.%${locationTerm}%,provinsi.ilike.%${locationTerm}%,alamat_lengkap.ilike.%${locationTerm}%`);
      }

      // Apply advanced filters
      if (advancedFilters.minPrice) {
        query = query.gte('harga_properti', advancedFilters.minPrice.toString());
      }
      if (advancedFilters.maxPrice) {
        query = query.lte('harga_properti', advancedFilters.maxPrice.toString());
      }
      if (advancedFilters.bedrooms) {
        query = query.eq('kamar_tidur', advancedFilters.bedrooms);
      }
      if (advancedFilters.bathrooms) {
        query = query.eq('kamar_mandi', advancedFilters.bathrooms);
      }
      if (advancedFilters.minLandArea) {
        query = query.gte('luas_tanah', advancedFilters.minLandArea.toString());
      }
      if (advancedFilters.maxLandArea) {
        query = query.lte('luas_tanah', advancedFilters.maxLandArea.toString());
      }
      if (advancedFilters.minBuildingArea) {
        query = query.gte('luas_bangunan', advancedFilters.minBuildingArea.toString());
      }
      if (advancedFilters.maxBuildingArea) {
        query = query.lte('luas_bangunan', advancedFilters.maxBuildingArea.toString());
      }
      if (advancedFilters.legalStatus) {
        query = query.eq('legalitas', advancedFilters.legalStatus);
      }
      if (keyword.trim()) {
        const searchTerm = keyword.trim().toLowerCase();
        query = query.or(`kode_listing.ilike.%${searchTerm}%,judul_properti.ilike.%${searchTerm}%,jenis_properti.ilike.%${searchTerm}%,kabupaten.ilike.%${searchTerm}%,provinsi.ilike.%${searchTerm}%,alamat_lengkap.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%,legalitas.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ HomePage: Supabase query error:', error);
        // Fallback to seed data if Supabase fails
        console.log('🔄 Fallback: Using seed data...');
        return {
          properties: [{
            id: "fallback-1",
            kode_listing: "DEMO001",
            judul_properti: "Rumah Demo Minimalis Jakarta",
            deskripsi: "Rumah demo untuk testing",
            jenis_properti: "rumah",
            luas_tanah: "100",
            luas_bangunan: "80",
            kamar_tidur: 3,
            kamar_mandi: 2,
            legalitas: "SHM",
            harga_properti: "500000000",
            provinsi: "jakarta",
            kabupaten: "jakarta-selatan",
            alamat_lengkap: "Jl. Demo No. 123",
            image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
            status: "dijual",
            is_premium: false,
            is_featured: false,
            is_hot: false,
            is_sold: false,
            is_property_pilihan: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }],
          nextCursor: null
        };
      }

      console.log(`✅ HomePage: Fetched ${data?.length || 0} raw properties from Supabase`);
      console.log('Raw first property:', data?.[0]);

      return {
        properties: data || [],
        nextCursor: data && data.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  // Flatten the infinite query data
  const allProperties = data?.pages.flatMap(page => page.properties).map(transformSupabaseProperty) || [];

  const handleSearch = (filters: { status?: string; type?: string }) => {
    setSearchFilters(filters);
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const handleApplyAdvancedFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
  };

  const handleKeywordSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
  };

  const handleAdvancedFiltersChange = (filters: FilterValues) => {
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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : status === 'error' ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Terjadi kesalahan saat memuat properti
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Silakan coba lagi atau hubungi tim kami
            </p>
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
            <div
              data-testid="property-grid"
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
            >
              {allProperties.map((property, index) => (
                <PropertyCard
                  key={`${property.id}-${index}`}
                  property={property}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(property.id)}
                />
              ))}
            </div>

            {hasNextPage && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  data-testid="load-more"
                >
                  {isFetchingNextPage ? 'Memuat...' : `Lihat Lebih Banyak`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
