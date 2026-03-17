import { useState, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import HeroSection from "@/components/HeroSection";
import { PropertyPilihanSlider } from "@/components/PropertyPilihanSlider";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { FilterValues } from "@/components/AdvancedFilters";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@shared/types";
import { supabase } from "@/lib/supabase";
import { usePropertyStore } from "@/store/propertyStore";

// Development mode logging helper
const devLog = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') console.log(...args);
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') console.error(...args);
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') console.warn(...args);
  }
};

export default function HomePage() {
  // setLocation is kept for potential future use
  const [, /*setLocation*/] = useLocation();
   const [searchFilters, setSearchFilters] = useState<any>({});
   const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
   const [keyword, setKeyword] = useState<string>("");
   const [hideSold, setHideSold] = useState<boolean>(false);
   const { favorites, addFavorite, removeFavorite } = usePropertyStore();

  // Debounce search keyword to avoid excessive API calls
  const debouncedKeyword = useDebounce(keyword, 300);

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
      kecamatan: supabaseProperty.kecamatan,
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
      devLog.log('🏠 HomePage: Fetching pilihan properties from Supabase...');

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_property_pilihan', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        devLog.error('❌ HomePage: Supabase pilihan query error:', error);
        throw error;
      }

      devLog.log(`✅ HomePage: Fetched ${data?.length || 0} raw pilihan properties from Supabase`);
      devLog.log('Raw pilihan first property:', data?.[0]);
      return data || [];
    },
  });

  // Transform the raw Supabase pilihan data
  const propertyPilihan = rawPropertyPilihan.map(transformSupabaseProperty);

  // Fetch total property counts
  const { data: totalCount } = useQuery<number>({
    queryKey: ['properties-total-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: availableCount } = useQuery<number>({
    queryKey: ['properties-available-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_sold', false);
      return count || 0;
    },
  });

  // Fetch filtered properties with infinite scroll using React Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['properties-infinite', searchFilters, advancedFilters, debouncedKeyword],
    queryFn: async ({ pageParam = 0 }) => {
      devLog.log('🏠 HomePage: Fetching properties from Supabase...', { pageParam });

      const PAGE_SIZE = 8;
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      // Apply filters - skip status filter when searching by keyword for more flexible results
      devLog.log('HomePage: Keyword check - debouncedKeyword:', debouncedKeyword, 'trimmed:', debouncedKeyword.trim(), 'hasKeyword:', !!debouncedKeyword.trim());

      if (searchFilters.status && !debouncedKeyword.trim()) {
        devLog.log('HomePage: Applying status filter:', searchFilters.status);
        query = query.eq('status', searchFilters.status);
      } else if (searchFilters.status && debouncedKeyword.trim()) {
        devLog.log('HomePage: Skipping status filter due to keyword search - status:', searchFilters.status, 'keyword:', debouncedKeyword);
      } else {
        devLog.log('HomePage: No status filter applied');
      }

      if (searchFilters.type) {
        query = query.eq('jenis_properti', searchFilters.type);
        devLog.log('HomePage: Applied property type filter:', searchFilters.type);
      }
      if (searchFilters.location) {
        const locationTerm = searchFilters.location.toLowerCase();
        query = query.or(`kabupaten.ilike.%${locationTerm}%,provinsi.ilike.%${locationTerm}%,alamat_lengkap.ilike.%${locationTerm}%`);
      }

      // Apply advanced filters
      if (advancedFilters.minPrice) {
        devLog.log('HomePage: Applying minPrice filter:', advancedFilters.minPrice);
        query = query.gte('harga_properti', advancedFilters.minPrice);
      }
      if (advancedFilters.maxPrice) {
        devLog.log('HomePage: Applying maxPrice filter:', advancedFilters.maxPrice);
        query = query.lte('harga_properti', advancedFilters.maxPrice);
      }
      if (advancedFilters.bedrooms) {
        query = query.eq('kamar_tidur', advancedFilters.bedrooms);
      }
      if (advancedFilters.bathrooms) {
        query = query.eq('kamar_mandi', advancedFilters.bathrooms);
      }
      if (advancedFilters.minLandArea) {
        query = query.gte('luas_tanah', advancedFilters.minLandArea);
      }
      if (advancedFilters.maxLandArea) {
        query = query.lte('luas_tanah', advancedFilters.maxLandArea);
      }
      if (advancedFilters.minBuildingArea) {
        query = query.gte('luas_bangunan', advancedFilters.minBuildingArea);
      }
      if (advancedFilters.maxBuildingArea) {
        query = query.lte('luas_bangunan', advancedFilters.maxBuildingArea);
      }
      if (advancedFilters.legalStatus && advancedFilters.legalStatus.length > 0) {
        devLog.log('🔍 Applying legal status filter:', advancedFilters.legalStatus);
        query = query.in('legalitas', advancedFilters.legalStatus);
      }
      if (advancedFilters.province) {
        query = query.ilike('provinsi', `%${advancedFilters.province}%`);
      }
      if (advancedFilters.regency) {
        query = query.ilike('kabupaten', `%${advancedFilters.regency}%`);
      }
      // Implementasi pencarian fleksibel dengan ilike di multiple kolom
      if (debouncedKeyword.trim()) {
        const searchTerm = debouncedKeyword.trim();
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        const searchConditions = [];

        devLog.log('HomePage: Building search query for term:', searchTerm, 'words:', searchWords);

        // Search only in kode_listing and judul_properti
        searchConditions.push(`kode_listing.ilike.%${searchTerm}%`);
        searchConditions.push(`judul_properti.ilike.%${searchTerm}%`);

        // Search for individual words if multiple words (for better matching)
        if (searchWords.length > 1) {
          searchWords.forEach(word => {
            if (word.length > 2) { // Skip very short words
              searchConditions.push(`kode_listing.ilike.%${word}%`);
              searchConditions.push(`judul_properti.ilike.%${word}%`);
            }
          });
        }

        devLog.log('HomePage: Search conditions count:', searchConditions.length);
        query = query.or(searchConditions.join(','));
      }

      const { data, error } = await query;

      if (error) {
        devLog.error('❌ HomePage: Supabase query error:', error);
        // Fallback to seed data if Supabase fails
        devLog.log('🔄 Fallback: Using seed data...');
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
          }, {
            id: "fallback-2",
            kode_listing: "KAL001",
            judul_properti: "Rumah Mewah di Jl Kaliurang Yogyakarta",
            deskripsi: "Rumah cantik di lokasi strategis Jl Kaliurang dengan akses mudah ke pusat kota",
            jenis_properti: "rumah",
            luas_tanah: "200",
            luas_bangunan: "150",
            kamar_tidur: 4,
            kamar_mandi: 3,
            legalitas: "SHM & PBG",
            harga_properti: "1200000000",
            provinsi: "Yogyakarta",
            kabupaten: "Sleman",
            alamat_lengkap: "Jl. Kaliurang KM 5, Sleman, Yogyakarta",
            image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
            status: "dijual",
            is_premium: true,
            is_featured: true,
            is_hot: false,
            is_sold: false,
            is_property_pilihan: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }],
          nextCursor: null
        };
      }

      devLog.log(`✅ HomePage: Fetched ${data?.length || 0} raw properties from Supabase`);
      devLog.log('Raw first property:', data?.[0]);

      // Debug: Check if data is empty and what filters were applied
      if (!data || data.length === 0) {
        devLog.warn('HomePage: No properties found with current filters');
        devLog.warn('Active filters:', { searchFilters, advancedFilters, keyword });
      } else {
        // Log the types of properties found
        const propertyTypes = data.map(p => p.jenis_properti);
        const uniqueTypes = Array.from(new Set(propertyTypes));
        devLog.log('HomePage: Property types found:', uniqueTypes);

        // Log legal statuses found for debugging
        const legalStatuses = data.map(p => p.legalitas).filter(Boolean);
        const uniqueLegalStatuses = Array.from(new Set(legalStatuses));
        devLog.log('HomePage: Legal statuses found:', uniqueLegalStatuses);
        devLog.log('HomePage: All legal statuses in data:', legalStatuses);
      }

      return {
        properties: data || [],
        nextCursor: data && data.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  // Search ranking function for better relevance
  const calculateSearchRelevance = (property: any, searchTerm: string): number => {
    if (!searchTerm.trim()) return 0;

    const term = searchTerm.toLowerCase();
    const terms = term.split(/\s+/).filter(word => word.length > 0);
    let score = 0;

    // Helper function to count matches
    const countMatches = (text: string, searchTerm: string): number => {
      if (!text) return 0;
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.toLowerCase().match(regex);
      return matches ? matches.length : 0;
    };

    // Exact matches get highest score
    if (property.kode_listing?.toLowerCase() === term) score += 100;
    if (property.judul_properti?.toLowerCase().includes(term)) score += 50;
    if (property.deskripsi?.toLowerCase().includes(term)) score += 30;

    // Partial matches with different weights
    terms.forEach(word => {
      if (word.length < 3) return; // Skip very short words

      // Primary fields (highest weight)
      score += countMatches(property.kode_listing, word) * 20;
      score += countMatches(property.judul_properti, word) * 15;
      score += countMatches(property.deskripsi, word) * 10;

      // Secondary fields (medium weight)
      score += countMatches(property.jenis_properti, word) * 8;
      score += countMatches(property.kabupaten, word) * 6;
      score += countMatches(property.provinsi, word) * 6;
      score += countMatches(property.alamat_lengkap, word) * 4;

      // Tertiary fields (lower weight)
      score += countMatches(property.status, word) * 2;
      score += countMatches(property.legalitas, word) * 2;
    });

    // Boost score for properties that match multiple search terms
    const matchedTerms = terms.filter(word =>
      word.length >= 3 && (
        property.kode_listing?.toLowerCase().includes(word) ||
        property.judul_properti?.toLowerCase().includes(word) ||
        property.deskripsi?.toLowerCase().includes(word) ||
        property.jenis_properti?.toLowerCase().includes(word) ||
        property.kabupaten?.toLowerCase().includes(word) ||
        property.provinsi?.toLowerCase().includes(word) ||
        property.alamat_lengkap?.toLowerCase().includes(word)
      )
    );
    score += matchedTerms.length * 5; // Bonus for matching multiple terms

    return score;
  };

  // Flatten and rank the infinite query data
   const rawProperties = data?.pages.flatMap(page => page.properties) || [];
   const allProperties = useMemo(() => {
     return rawProperties
       .map(transformSupabaseProperty)
       .map(property => ({
         ...property,
         searchRelevance: debouncedKeyword.trim() ? calculateSearchRelevance(property, debouncedKeyword) : 0
       }))
       .filter(property => !hideSold || !property.isSold)
       .sort((a, b) => {
         // If searching, sort by relevance score (descending)
         if (debouncedKeyword.trim()) {
           return b.searchRelevance - a.searchRelevance;
         }
         // Otherwise, maintain original order (newest first)
         return 0;
       });
   }, [rawProperties, debouncedKeyword, hideSold]);

  const handleSearch = (filters: { [key: string]: any }) => {
    devLog.log('HomePage: handleSearch called with filters:', filters);

    const { status, type, q, legalitas, minPrice, maxPrice, lt_min, lt_max, lb_min, lb_max, bedrooms } = filters;

    setSearchFilters({ status, type, location: q });

    const newAdvancedFilters: FilterValues = {};
    if (legalitas && legalitas !== 'ALL') {
      newAdvancedFilters.legalStatus = [legalitas.replace(/_/g, ' & ')];
    } else {
      newAdvancedFilters.legalStatus = [];
    }

    if (minPrice) newAdvancedFilters.minPrice = Number(minPrice);
    if (maxPrice) newAdvancedFilters.maxPrice = Number(maxPrice);
    if (lt_min) newAdvancedFilters.minLandArea = Number(lt_min);
    if (lt_max) newAdvancedFilters.maxLandArea = Number(lt_max);
    if (lb_min) newAdvancedFilters.minBuildingArea = Number(lb_min);
    if (lb_max) newAdvancedFilters.maxBuildingArea = Number(lb_max);
    if (bedrooms) newAdvancedFilters.bedrooms = Number(bedrooms);

    setAdvancedFilters(newAdvancedFilters);
    
    if (q) {
      setKeyword(q);
    }

    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* SearchBar and AdvancedFilters are now hidden - using HeroSection only */}

      <HeroSection onSearch={handleSearch} />

      {propertyPilihan.length > 0 && (
        <PropertyPilihanSlider properties={propertyPilihan} />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Semua Properti
              </h2>
              {totalCount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Total Listing: {totalCount}{hideSold && availableCount ? ` (${availableCount} ditampilkan)` : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="hide-sold-toggle" className="text-sm font-medium text-gray-700">
                Sembunyikan Listing Terjual
              </label>
              <Switch
                id="hide-sold-toggle"
                checked={hideSold}
                onCheckedChange={setHideSold}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
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
              {debouncedKeyword ? `Tidak ada properti yang sesuai dengan kata kunci "${debouncedKeyword}"` : 'Tidak ada properti yang sesuai dengan filter Anda'}
            </p>
            {debouncedKeyword && (
              <p className="text-sm text-muted-foreground mt-2">
                Coba gunakan kata kunci yang berbeda atau kurangi filter lainnya
              </p>
            )}
          </div>
        ) : (
          <>
            <div
              data-testid="property-grid"
              className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6"
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
