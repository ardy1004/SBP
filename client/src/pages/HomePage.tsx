import { useState, useCallback, useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import HeroSection from "@/components/HeroSection";
import { PropertyPilihanSlider } from "@/components/PropertyPilihanSlider";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import type { FilterValues } from "@/components/AdvancedFilters";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@shared/types";
import { supabase } from "@/lib/supabase";
import { usePropertyStore } from "@/store/propertyStore";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({});
  const [keyword, setKeyword] = useState<string>("");
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
    queryKey: ['properties-infinite', searchFilters, advancedFilters, debouncedKeyword],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🏠 HomePage: Fetching properties from Supabase...', { pageParam });

      const PAGE_SIZE = 8;
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      // Apply filters - skip status filter when searching by keyword for more flexible results
      console.log('HomePage: Keyword check - debouncedKeyword:', debouncedKeyword, 'trimmed:', debouncedKeyword.trim(), 'hasKeyword:', !!debouncedKeyword.trim());

      if (searchFilters.status && !debouncedKeyword.trim()) {
        console.log('HomePage: Applying status filter:', searchFilters.status);
        query = query.eq('status', searchFilters.status);
      } else if (searchFilters.status && debouncedKeyword.trim()) {
        console.log('HomePage: Skipping status filter due to keyword search - status:', searchFilters.status, 'keyword:', debouncedKeyword);
      } else {
        console.log('HomePage: No status filter applied');
      }

      if (searchFilters.type) {
        query = query.eq('jenis_properti', searchFilters.type);
        console.log('HomePage: Applied property type filter:', searchFilters.type);
      }
      if (searchFilters.location) {
        const locationTerm = searchFilters.location.toLowerCase();
        query = query.or(`kabupaten.ilike.%${locationTerm}%,provinsi.ilike.%${locationTerm}%,alamat_lengkap.ilike.%${locationTerm}%`);
      }

      // Apply advanced filters
      if (advancedFilters.minPrice) {
        console.log('HomePage: Applying minPrice filter:', advancedFilters.minPrice);
        query = query.gte('harga_properti', advancedFilters.minPrice);
      }
      if (advancedFilters.maxPrice) {
        console.log('HomePage: Applying maxPrice filter:', advancedFilters.maxPrice);
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
        console.log('🔍 Applying legal status filter:', advancedFilters.legalStatus);
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

        console.log('HomePage: Building search query for term:', searchTerm, 'words:', searchWords);

        // Primary search fields (judul, deskripsi, kode_listing)
        searchConditions.push(`judul_properti.ilike.%${searchTerm}%`);
        searchConditions.push(`deskripsi.ilike.%${searchTerm}%`);
        searchConditions.push(`kode_listing.ilike.%${searchTerm}%`);

        // Location fields (kabupaten, provinsi, alamat_lengkap)
        searchConditions.push(`kabupaten.ilike.%${searchTerm}%`);
        searchConditions.push(`provinsi.ilike.%${searchTerm}%`);
        searchConditions.push(`alamat_lengkap.ilike.%${searchTerm}%`);

        // Property type and status
        searchConditions.push(`jenis_properti.ilike.%${searchTerm}%`);
        searchConditions.push(`status.ilike.%${searchTerm}%`);

        // Search for individual words if multiple words (for better matching)
        if (searchWords.length > 1) {
          searchWords.forEach(word => {
            if (word.length > 2) { // Skip very short words
              searchConditions.push(`judul_properti.ilike.%${word}%`);
              searchConditions.push(`deskripsi.ilike.%${word}%`);
              searchConditions.push(`kabupaten.ilike.%${word}%`);
              searchConditions.push(`provinsi.ilike.%${word}%`);
              searchConditions.push(`alamat_lengkap.ilike.%${word}%`);
            }
          });
        }

        console.log('HomePage: Search conditions count:', searchConditions.length);
        query = query.or(searchConditions.join(','));
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

      console.log(`✅ HomePage: Fetched ${data?.length || 0} raw properties from Supabase`);
      console.log('Raw first property:', data?.[0]);

      // Debug: Check if data is empty and what filters were applied
      if (!data || data.length === 0) {
        console.warn('HomePage: No properties found with current filters');
        console.warn('Active filters:', { searchFilters, advancedFilters, keyword });
      } else {
        // Log the types of properties found
        const propertyTypes = data.map(p => p.jenis_properti);
        const uniqueTypes = Array.from(new Set(propertyTypes));
        console.log('HomePage: Property types found:', uniqueTypes);

        // Log legal statuses found for debugging
        const legalStatuses = data.map(p => p.legalitas).filter(Boolean);
        const uniqueLegalStatuses = Array.from(new Set(legalStatuses));
        console.log('HomePage: Legal statuses found:', uniqueLegalStatuses);
        console.log('HomePage: All legal statuses in data:', legalStatuses);
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
      .sort((a, b) => {
        // If searching, sort by relevance score (descending)
        if (debouncedKeyword.trim()) {
          return b.searchRelevance - a.searchRelevance;
        }
        // Otherwise, maintain original order (newest first)
        return 0;
      });
  }, [rawProperties, debouncedKeyword]);

  const handleSearch = (filters: { [key: string]: any }) => {
    console.log('HomePage: handleSearch called with filters:', filters);

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

  const handleApplyAdvancedFilters = (filters: FilterValues) => {
    console.log('Applying advanced filters:', filters);
    setAdvancedFilters(filters);
  };

  // Smart search parsing function
  const parseSearchIntent = (searchTerm: string) => {
    const term = searchTerm.toLowerCase().trim();
    const suggestions: Partial<FilterValues & { propertyType?: string; status?: string }> = {};

    // Property type detection
    const propertyTypes = {
      'rumah': 'rumah',
      'apartemen': 'apartemen',
      'kost': 'kost',
      'villa': 'villa',
      'ruko': 'ruko',
      'tanah': 'tanah',
      'kantor': 'kantor',
      'gedung': 'gedung',
      'gudang': 'gudang'
    };

    for (const [key, value] of Object.entries(propertyTypes)) {
      if (term.includes(key)) {
        suggestions.propertyType = value;
        break;
      }
    }

    // Status detection
    if (term.includes('jual') || term.includes('dijual')) {
      suggestions.status = 'dijual';
    } else if (term.includes('sewa') || term.includes('disewa')) {
      suggestions.status = 'disewakan';
    }

    // Landmark and location mapping (Indonesian landmarks and their cities)
    const landmarkMap: { [key: string]: { province: string; regency?: string } } = {
      // Yogyakarta landmarks
      'ugm': { province: 'Yogyakarta', regency: 'Sleman' },
      'universitas gadjah mada': { province: 'Yogyakarta', regency: 'Sleman' },
      'ugm yogyakarta': { province: 'Yogyakarta', regency: 'Sleman' },
      'ugm jogja': { province: 'Yogyakarta', regency: 'Sleman' },
      'ugm sleman': { province: 'Yogyakarta', regency: 'Sleman' },
      'universitas islam indonesia': { province: 'Yogyakarta', regency: 'Sleman' },
      'uii': { province: 'Yogyakarta', regency: 'Sleman' },
      'universitas negeri yogyakarta': { province: 'Yogyakarta', regency: 'Sleman' },
      'uny': { province: 'Yogyakarta', regency: 'Sleman' },
      'institut teknologi bandung': { province: 'Jawa Barat', regency: 'Bandung' },
      'itb': { province: 'Jawa Barat', regency: 'Bandung' },
      'universitas indonesia': { province: 'Jakarta', regency: 'Depok' },
      'ui': { province: 'Jakarta', regency: 'Depok' },
      'institut teknologi sepuluh nopember': { province: 'Jawa Timur', regency: 'Surabaya' },
      'its': { province: 'Jawa Timur', regency: 'Surabaya' },
      'universitas brawijaya': { province: 'Jawa Timur', regency: 'Malang' },
      'ub': { province: 'Jawa Timur', regency: 'Malang' },
      'universitas diponegoro': { province: 'Jawa Tengah', regency: 'Semarang' },
      'undip': { province: 'Jawa Tengah', regency: 'Semarang' },

      // Shopping centers and landmarks
      'grand indonesia mall': { province: 'Jakarta', regency: 'Jakarta Pusat' },
      'grand indonesia': { province: 'Jakarta', regency: 'Jakarta Pusat' },
      'plaza indonesia': { province: 'Jakarta', regency: 'Jakarta Pusat' },
      'trans studio mall': { province: 'Jawa Barat', regency: 'Bandung' },
      'trans studio': { province: 'Jawa Barat', regency: 'Bandung' },
      'ciputra mall': { province: 'Jawa Barat', regency: 'Bandung' },
      'ciputra': { province: 'Jawa Barat', regency: 'Bandung' },
      'malioboro': { province: 'Yogyakarta', regency: 'Yogyakarta' },
      'kraton yogyakarta': { province: 'Yogyakarta', regency: 'Yogyakarta' },
      'kraton jogja': { province: 'Yogyakarta', regency: 'Yogyakarta' },
      'tugu yogyakarta': { province: 'Yogyakarta', regency: 'Yogyakarta' },
      'tugu jogja': { province: 'Yogyakarta', regency: 'Yogyakarta' },

      // Transportation hubs
      'stasiun yogyakarta': { province: 'Yogyakarta', regency: 'Yogyakarta' },
      'stasiun jogja': { province: 'Yogyakarta', regency: 'Yogyakarta' },
      'stasiun tugu': { province: 'Yogyakarta', regency: 'Yogyakarta' },
      'bandara adisutjipto': { province: 'Yogyakarta', regency: 'Sleman' },
      'bandara yogyakarta': { province: 'Yogyakarta', regency: 'Sleman' },
      'bandara jogja': { province: 'Yogyakarta', regency: 'Sleman' },
      'bandara soekarno hatta': { province: 'Jakarta', regency: 'Tangerang' },
      'bandara cengkareng': { province: 'Jakarta', regency: 'Tangerang' },

      // Districts and areas
      'condong catur': { province: 'Yogyakarta', regency: 'Sleman' },
      'seturan': { province: 'Yogyakarta', regency: 'Sleman' },
      'depok': { province: 'Yogyakarta', regency: 'Sleman' },
      'gamping': { province: 'Yogyakarta', regency: 'Sleman' },
      'mlati': { province: 'Yogyakarta', regency: 'Sleman' },
      'sleman': { province: 'Yogyakarta', regency: 'Sleman' },
      'bantul': { province: 'Yogyakarta', regency: 'Bantul' },
      'kulon progo': { province: 'Yogyakarta', regency: 'Kulon Progo' },
      'gunung kidul': { province: 'Yogyakarta', regency: 'Gunung Kidul' }
    };

    // Check for landmarks first (more specific)
    for (const [landmark, location] of Object.entries(landmarkMap)) {
      if (term.includes(landmark) || landmark.includes(term)) {
        suggestions.province = location.province;
        if (location.regency) {
          suggestions.regency = location.regency;
        }
        console.log(`🏛️ Landmark detected: "${landmark}" → ${location.province}${location.regency ? `, ${location.regency}` : ''}`);
        break;
      }
    }

    // Location detection (Indonesian cities/provinces) - fallback if no landmark found
    if (!suggestions.province) {
      const locations = [
        'jakarta', 'bandung', 'surabaya', 'yogyakarta', 'jogja', 'semarang', 'medan', 'makassar',
        'palembang', 'batam', 'pekanbaru', 'bali', 'lombok', 'jawa', 'sumatera', 'kalimantan'
      ];

      for (const location of locations) {
        if (term.includes(location)) {
          if (location.length > 3) { // Avoid false positives with short words
            suggestions.province = location.charAt(0).toUpperCase() + location.slice(1);
            // Special case for 'jogja' → 'Yogyakarta'
            if (location === 'jogja') {
              suggestions.province = 'Yogyakarta';
            }
            break;
          }
        }
      }
    }

    // Contextual phrase detection (e.g., "dekat UGM", "sekitar ITB")
    const contextualPatterns = [
      /(dekat|sekitar|deket|sekitar)\s+(\w+)/i,
      /(di\s+area|di\s+daerah)\s+(\w+)/i,
      /(lokasi|area)\s+(\w+)/i
    ];

    for (const pattern of contextualPatterns) {
      const match = term.match(pattern);
      if (match && match[2]) {
        const contextLocation = match[2].toLowerCase();
        // Check if the contextual word is a known landmark
        for (const [landmark, location] of Object.entries(landmarkMap)) {
          if (landmark.includes(contextLocation) || contextLocation.includes(landmark.split(' ')[0])) {
            suggestions.province = location.province;
            if (location.regency) {
              suggestions.regency = location.regency;
            }
            console.log(`📍 Contextual location detected: "${match[0]}" → ${location.province}${location.regency ? `, ${location.regency}` : ''}`);
            break;
          }
        }
        break;
      }
    }

    // Price range detection
    const pricePatterns = [
      /(\d+(?:\.\d+)?)\s*juta/i,
      /(\d+(?:\.\d+)?)\s*milyar/i,
      /rp\s*(\d+(?:\.\d+)?(?:m|juta|milyar)?)/i,
      /(\d+(?:\.\d+)?)\s*jt/i,
      /(\d+(?:\.\d+)?)\s*m/i
    ];

    for (const pattern of pricePatterns) {
      const match = term.match(pattern);
      if (match) {
        let price = parseFloat(match[1]);

        // Convert to rupiah
        if (match[0].includes('milyar') || match[0].includes('m ') || match[0].includes(' m')) {
          price *= 1000000000; // Convert billion to rupiah
        } else if (match[0].includes('juta') || match[0].includes('jt') || match[0].includes('m')) {
          price *= 1000000; // Convert million to rupiah
        }

        // Set as minimum price, allow some flexibility
        suggestions.minPrice = Math.max(0, price * 0.8); // 80% of stated price
        suggestions.maxPrice = price * 1.5; // 150% of stated price
        break;
      }
    }

    return suggestions;
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
          <h2 className="text-3xl md:text-4xl font-bold">
            Properti Terbaru
          </h2>
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
