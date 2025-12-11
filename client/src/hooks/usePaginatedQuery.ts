import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import type { Property } from "@shared/types";

interface UsePaginatedPropertiesOptions {
  filters?: Record<string, any>;
  pageSize?: number;
  enabled?: boolean;
}

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
    youtubeUrl: supabaseProperty.youtube_url,
    status: supabaseProperty.status,
    createdAt: new Date(supabaseProperty.created_at),
    updatedAt: new Date(supabaseProperty.updated_at),
  };
};

export function usePaginatedProperties({
  filters = {},
  pageSize = 12,
  enabled = true
}: UsePaginatedPropertiesOptions = {}) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['properties-paginated', filters, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      logger.debug('Fetching paginated properties', { pageParam, filters, pageSize });

      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('jenis_properti', filters.type);
      }
      if (filters.location) {
        const locationTerm = filters.location.toLowerCase();
        query = query.or(`kabupaten.ilike.%${locationTerm}%,provinsi.ilike.%${locationTerm}%,alamat_lengkap.ilike.%${locationTerm}%`);
      }

      // Advanced filters
      if (filters.minPrice) {
        query = query.gte('harga_properti', filters.minPrice.toString());
      }
      if (filters.maxPrice) {
        query = query.lte('harga_properti', filters.maxPrice.toString());
      }
      if (filters.bedrooms) {
        query = query.eq('kamar_tidur', filters.bedrooms);
      }
      if (filters.minLandArea) {
        query = query.gte('luas_tanah', filters.minLandArea.toString());
      }
      if (filters.maxLandArea) {
        query = query.lte('luas_tanah', filters.maxLandArea.toString());
      }
      if (filters.legalStatus) {
        query = query.eq('legalitas', filters.legalStatus);
      }
      if (filters.province) {
        query = query.ilike('provinsi', `%${filters.province}%`);
      }
      if (filters.regency) {
        query = query.ilike('kabupaten', `%${filters.regency}%`);
      }

      // Search query
      if (filters.keyword?.trim()) {
        const searchTerm = filters.keyword.trim().toLowerCase();
        query = query.or(
          `kode_listing.ilike.%${searchTerm}%,` +
          `judul_properti.ilike.%${searchTerm}%,` +
          `jenis_properti.ilike.%${searchTerm}%,` +
          `kabupaten.ilike.%${searchTerm}%,` +
          `provinsi.ilike.%${searchTerm}%,` +
          `alamat_lengkap.ilike.%${searchTerm}%,` +
          `status.ilike.%${searchTerm}%,` +
          `legalitas.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        logger.apiError('Properties query failed', error, { pageParam, filters });
        throw error;
      }

      logger.debug('Properties query successful', {
        count: data?.length || 0,
        totalCount: count,
        hasNextPage: (pageParam + pageSize) < (count || 0)
      });

      return {
        properties: data?.map(transformSupabaseProperty) || [],
        nextCursor: data && data.length === pageSize ? pageParam + pageSize : null,
        totalCount: count || 0
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled,
  });

  // Flatten the data
  const allProperties = data?.pages.flatMap(page => page.properties) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  return {
    properties: allProperties,
    totalCount,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    // Helper to check if we have more data
    hasMore: hasNextPage && !isFetchingNextPage,
    // Helper to load more
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };
}