import { useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { transformSupabaseProperty } from '@/lib/utils/property';
import { PropertyCard } from '@/components/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight, MapPin, Building2, Tag, SearchX, Filter } from 'lucide-react';
import { Link } from 'wouter';
import type { Property } from '@shared/types';
import { Helmet } from 'react-helmet';
import { formatPriceNew, capitalize, slugToTitle } from '@/lib/utils';
import { locationService } from '@/services/locationService';

// Interface untuk params URL
interface FilterParams {
  status?: string;
  jenis?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Interface untuk breadcrumb item
interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// Fungsi untuk normalisasi parameter URL
const normalizeParam = (param: string | undefined): string | undefined => {
  if (!param) return undefined;
  return param.toLowerCase().replace(/-/g, ' ');
};

// Fungsi untuk parse price range dari URL
// Format: "1m-2m", "500jt-1m", "1m", "-2m", "500jt"
const parsePriceRange = (priceRange: string | undefined): { min?: number; max?: number; label?: string } => {
  if (!priceRange) return {};

  // Convert to lowercase and remove spaces
  const normalized = priceRange.toLowerCase().replace(/\s/g, '');

  // Helper function to convert string to number
  const parseValue = (value: string): number => {
    if (value.includes('m')) {
      // Millions (miliar)
      return parseFloat(value.replace('m', '')) * 1000000000;
    } else if (value.includes('jt')) {
      // Thousands (juta)
      return parseFloat(value.replace('jt', '')) * 1000000;
    } else if (value.includes('rb')) {
      // Hundreds (ribu) - rare for properties
      return parseFloat(value.replace('rb', '')) * 1000;
    }
    return parseFloat(value) || 0;
  };

  // Format: "min-max" (e.g., "1m-2m", "500jt-1m", "0-1m")
  if (normalized.includes('-')) {
    const [minStr, maxStr] = normalized.split('-');
    const min = minStr ? parseValue(minStr) : undefined;
    const max = maxStr ? parseValue(maxStr) : undefined;
    
    // Generate label - check explicit undefined, not falsy (to handle min=0)
    let label = '';
    const hasMin = minStr && minStr.length > 0;
    const hasMax = maxStr && maxStr.length > 0;
    
    if (hasMin && hasMax && min !== undefined && max !== undefined) {
      if (min === 0) {
        label = `Dibawah ${formatPriceLabel(max)}`;
      } else {
        label = `${formatPriceLabel(min)} - ${formatPriceLabel(max)}`;
      }
    } else if (hasMin && min !== undefined) {
      label = `Di atas ${formatPriceLabel(min)}`;
    } else if (hasMax && max !== undefined) {
      label = `Dibawah ${formatPriceLabel(max)}`;
    }
    
    return { min, max, label };
  }

  // Format: just a value (treated as minimum)
  const value = parseValue(normalized);
  return { min: value, label: `Di atas ${formatPriceLabel(value)}` };
};

// Helper function to format price for label
const formatPriceLabel = (price: number): string => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(price % 1000000000 === 0 ? 0 : 1)} M`;
  } else if (price >= 1000000) {
    return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)} Jt`;
  }
  return price.toString();
};

// Fungsi untuk membuat breadcrumb berdasarkan filter
const generateBreadcrumbs = (filters: FilterParams): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Properti', href: '/search' }
  ];

  if (filters.status) {
    const statusLabel = filters.status === 'dijual' ? 'Dijual' : 
                       filters.status === 'disewakan' ? 'Disewakan' : 
                       capitalize(filters.status);
    breadcrumbs.push({
      label: statusLabel,
      href: `/${filters.status}`,
      isActive: !filters.jenis
    });
  }

  if (filters.jenis && filters.jenis !== 'semua') {
    const jenisLabel = capitalize(filters.jenis).replace(/_/g, ' ');
    breadcrumbs.push({
      label: jenisLabel,
      href: filters.status ? `/${filters.status}/${filters.jenis}` : undefined,
      isActive: !filters.provinsi
    });
  }

  if (filters.provinsi) {
    const provinsiLabel = capitalize(filters.provinsi);
    breadcrumbs.push({
      label: provinsiLabel,
      href: filters.status && filters.jenis 
        ? `/${filters.status}/${filters.jenis}/${filters.provinsi}` 
        : undefined,
      isActive: !filters.kabupaten
    });
  }

  if (filters.kabupaten) {
    const kabupatenLabel = capitalize(filters.kabupaten);
    breadcrumbs.push({
      label: kabupatenLabel,
      href: filters.status && filters.jenis && filters.provinsi
        ? `/${filters.status}/${filters.jenis}/${filters.provinsi}/${filters.kabupaten}`
        : undefined,
      isActive: !filters.kecamatan
    });
  }

  if (filters.kecamatan) {
    const kecamatanLabel = capitalize(filters.kecamatan);
    breadcrumbs.push({
      label: kecamatanLabel,
      href: filters.status && filters.jenis && filters.provinsi && filters.kabupaten
        ? `/${filters.status}/${filters.jenis}/${filters.provinsi}/${filters.kabupaten}/${filters.kecamatan}`
        : undefined,
      isActive: !filters.priceRange
    });
  }

  if (filters.priceRange) {
    const priceInfo = parsePriceRange(filters.priceRange);
    breadcrumbs.push({
      label: priceInfo.label || filters.priceRange,
      isActive: true
    });
  }

  return breadcrumbs;
};

// Fungsi untuk generate title SEO
const generateSEOTitle = (filters: FilterParams): string => {
  const parts: string[] = [];
  
  if (filters.jenis && filters.jenis !== 'semua') {
    parts.push(capitalize(filters.jenis).replace(/_/g, ' '));
  } else {
    parts.push('Properti');
  }

  if (filters.status) {
    parts.push(filters.status === 'dijual' ? 'Dijual' : 'Disewakan');
  }

  if (filters.kecamatan) {
    parts.push(`di ${capitalize(filters.kecamatan)}, ${capitalize(filters.kabupaten || '')}`);
  } else if (filters.kabupaten) {
    parts.push(`di ${capitalize(filters.kabupaten)}`);
  } else if (filters.provinsi) {
    parts.push(`di ${capitalize(filters.provinsi)}`);
  }

  parts.push('- Salam Bumi Property');
  
  return parts.join(' ');
};

// Fungsi untuk generate meta description
const generateSEODescription = (filters: FilterParams, count: number = 0): string => {
  const jenisLabel = (filters.jenis && filters.jenis !== 'semua')
    ? capitalize(filters.jenis).replace(/_/g, ' ')
    : 'Properti';
  
  const statusLabel = filters.status === 'dijual' 
    ? 'dijual' 
    : filters.status === 'disewakan' 
    ? 'disewakan' 
    : 'dijual dan disewakan';

  let locationLabel = 'Indonesia';
  if (filters.kecamatan) {
    locationLabel = `${capitalize(filters.kecamatan)}, ${capitalize(filters.kabupaten || '')}, ${capitalize(filters.provinsi || '')}`;
  } else if (filters.kabupaten) {
    locationLabel = `${capitalize(filters.kabupaten)}, ${capitalize(filters.provinsi || '')}`;
  } else if (filters.provinsi) {
    locationLabel = capitalize(filters.provinsi);
  }

  const countText = count > 0 ? `${count} ${jenisLabel.toLowerCase()} ${statusLabel}` : `${jenisLabel} ${statusLabel}`;

  return `Temukan ${countText} terbaik di ${locationLabel}. Harga terbaik, lokasi strategis, dan legalitas lengkap. Hubungi Salam Bumi Property sekarang!`;
};

// Fungsi untuk generate canonical URL
const generateCanonicalUrl = (filters: FilterParams): string => {
  const baseUrl = 'https://salambumiproperty.com';
  const parts = [filters.status, filters.jenis, filters.priceRange, filters.provinsi, filters.kabupaten, filters.kecamatan]
    .filter(Boolean);
  
  if (parts.length === 0) return baseUrl;
  return `${baseUrl}/${parts.join('/')}`;
};

// Fungsi untuk fetch properties dari Supabase
const fetchFilteredProperties = async (filters: FilterParams): Promise<Property[]> => {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_sold', false)
    .order('is_premium', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  // Filter berdasarkan status (dijual/disewakan)
  if (filters.status) {
    const normalizedStatus = normalizeParam(filters.status);
    if (normalizedStatus === 'dijual') {
      query = query.in('status', ['dijual', 'dijual_disewakan']);
    } else if (normalizedStatus === 'disewakan') {
      query = query.in('status', ['disewakan', 'dijual_disewakan']);
    }
  }

  // Filter berdasarkan jenis_properti (abaikan jika "semua")
  if (filters.jenis && filters.jenis !== 'semua') {
    const normalizedJenis = normalizeParam(filters.jenis);
    query = query.ilike('jenis_properti', normalizedJenis || '');
  }

  // Filter berdasarkan provinsi menggunakan LocationService
  if (filters.provinsi) {
    const locationFilters = locationService.buildQueryFilters(filters.provinsi, filters.kabupaten);

    // Build OR condition for provinsi variations
    if (locationFilters.allProvinsiTerms.length > 0) {
      const provinsiConditions = locationFilters.allProvinsiTerms
        .map((term) => `provinsi.ilike.%${term}%`)
        .join(',');
      query = query.or(provinsiConditions);
    }

    // Filter berdasarkan kabupaten dengan multiple variations
    if (filters.kabupaten && locationFilters.allKabupatenTerms.length > 0) {
      const kabupatenConditions = locationFilters.allKabupatenTerms
        .map((term) => `kabupaten.ilike.%${term}%`)
        .join(',');
      query = query.or(kabupatenConditions);
    }
  }

  // Filter berdasarkan kecamatan
  if (filters.kecamatan) {
    const normalizedKecamatan = normalizeParam(filters.kecamatan);
    query = query.ilike('kecamatan', `%${normalizedKecamatan}%`);
  }

  // Filter berdasarkan price range
  if (filters.priceRange) {
    const priceInfo = parsePriceRange(filters.priceRange);
    console.log('Price filter:', {
      priceRange: filters.priceRange,
      min: priceInfo.min,
      max: priceInfo.max,
      label: priceInfo.label
    });
    // Apply min filter if defined (including 0, though gte 0 is effectively a no-op)
    if (priceInfo.min !== undefined) {
      query = query.gte('harga_properti', priceInfo.min);
      console.log('Applied gte filter:', priceInfo.min);
    }
    // Apply max filter if defined and > 0
    if (priceInfo.max !== undefined && priceInfo.max > 0) {
      query = query.lte('harga_properti', priceInfo.max);
      console.log('Applied lte filter:', priceInfo.max);
    }
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Error fetching properties:', error);
    throw new Error(error.message);
  }

  return (data || []).map(transformSupabaseProperty);
};

// Komponen Breadcrumb
const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
            {item.isActive ? (
              <span className="font-semibold text-blue-600" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <Link href={item.href}>
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Komponen Filter Badge
const FilterBadge = ({ 
  icon: Icon, 
  label, 
  value, 
  onRemove 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  onRemove?: () => void;
}) => (
  <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200">
    <Icon className="h-4 w-4" />
    <span className="text-gray-600">{label}:</span>
    <span className="font-semibold">{value}</span>
    {onRemove && (
      <button 
        onClick={onRemove}
        className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
        aria-label={`Hapus filter ${label}`}
      >
        ×
      </button>
    )}
  </Badge>
);

// Komponen Loading State
const PropertyGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Komponen Empty State
const EmptyState = ({ filters }: { filters: FilterParams }) => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="text-center py-16 px-4">
      <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <SearchX className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Tidak Ada Properti Ditemukan
      </h2>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        Maaf, kami tidak menemukan properti yang sesuai dengan filter yang Anda pilih. 
        Coba ubah filter atau lihat semua properti yang tersedia.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button 
          onClick={() => setLocation('/search')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Lihat Semua Properti
        </Button>
        {filters.status && (
          <Button 
            variant="outline"
            onClick={() => setLocation(`/${filters.status}`)}
          >
            Hapus Filter Lokasi
          </Button>
        )}
      </div>
    </div>
  );
};

// Valid values for status parameter
const VALID_STATUS_VALUES = ['dijual', 'disewakan'];

// Komponen utama FilteredPropertyPage
export default function FilteredPropertyPage() {
  const params = useParams();
  const [, setLocation] = useLocation();

  // Debug log
  console.log('FilteredPropertyPage: Rendered with params:', params);

  // Parse params dari URL
  const filters = useMemo<FilterParams>(() => {
    // Route dengan price range: /:status/:jenis/:priceRange/:provinsi/:kabupaten/:kecamatan
    // Jika params.priceRange ada, itu berarti route dengan price range yang matched
    
    if (params.priceRange) {
      // Route dengan price range - params sudah sesuai
      return {
        status: params.status,
        jenis: params.jenis,
        priceRange: params.priceRange,
        provinsi: params.provinsi,
        kabupaten: params.kabupaten,
        kecamatan: params.kecamatan,
      };
    }
    
    // Standard format without price range
    return {
      status: params.status,
      jenis: params.jenis,
      provinsi: params.provinsi,
      kabupaten: params.kabupaten,
      kecamatan: params.kecamatan,
    };
  }, [params]);

  // Debug log
  console.log('FilteredPropertyPage: Parsed filters:', filters);

  // Validate status parameter - redirect to 404 if invalid
  useEffect(() => {
    // Skip validation if this looks like a property detail URL (has kode listing pattern)
    const fullPath = window.location.pathname;
    const pathParts = fullPath.split('/').filter(Boolean);
    
    // If the URL has 4+ parts and the last part looks like a kode listing, it's a property detail URL
    // Don't validate, let the catch-all handle it
    if (pathParts.length >= 4) {
      const lastPart = pathParts[pathParts.length - 1];
      if (/\d/.test(lastPart) || /^[A-Z]+\d/i.test(lastPart)) {
        console.log('FilteredPropertyPage: Detected property detail URL pattern, skipping validation');
        return; // Let catch-all handle it
      }
    }
    
    if (params.status && !VALID_STATUS_VALUES.includes(params.status.toLowerCase())) {
      console.log('FilteredPropertyPage: Invalid status, redirecting to 404:', params.status);
      setLocation('/not-found');
    }
  }, [params.status, setLocation]);

  // Generate breadcrumbs, title, dan description
  const breadcrumbs = useMemo(() => generateBreadcrumbs(filters), [filters]);
  const seoTitle = useMemo(() => generateSEOTitle(filters), [filters]);
  const canonicalUrl = useMemo(() => generateCanonicalUrl(filters), [filters]);

  // Fetch properties dengan React Query
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['filtered-properties', filters],
    queryFn: () => fetchFilteredProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 menit
    gcTime: 10 * 60 * 1000, // 10 menit
  });

  // Generate meta description setelah mendapatkan data
  const seoDescription = useMemo(() => 
    generateSEODescription(filters, properties.length), 
    [filters, properties.length]
  );

  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Error loading properties:', error);
    }
  }, [error]);

  // Fungsi untuk menghapus filter
  const removeFilter = (key: keyof FilterParams) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    
    // Build new URL - priceRange comes after jenis, before provinsi
    const parts = [
      newFilters.status,
      newFilters.jenis,
      newFilters.priceRange,
      newFilters.provinsi,
      newFilters.kabupaten,
      newFilters.kecamatan
    ].filter(Boolean);
    
    if (parts.length === 0) {
      setLocation('/search');
    } else {
      setLocation(`/${parts.join('/')}`);
    }
  };

  // Fungsi untuk navigate ke level parent
  const navigateToParent = () => {
    const parts = [
      filters.status,
      filters.jenis,
      filters.provinsi,
      filters.kabupaten,
    ].filter(Boolean);
    
    if (parts.length === 0) {
      setLocation('/search');
    } else {
      setLocation(`/${parts.join('/')}`);
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`properti ${filters.jenis || ''} ${filters.status || ''} ${filters.kabupaten || ''} ${filters.provinsi || ''}, rumah dijual, tanah dijual, properti yogyakarta`.trim().replace(/\s+/g, ', ')} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://salambumiproperty.com/og-image.jpg" />
        <meta property="og:site_name" content="Salam Bumi Property" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="https://salambumiproperty.com/og-image.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: seoTitle,
            description: seoDescription,
            url: canonicalUrl,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: breadcrumbs.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                item: item.href ? `https://salambumiproperty.com${item.href}` : undefined,
              })),
            },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: properties.slice(0, 10).map((property, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'RealEstateListing',
                  name: property.judulProperti || `${capitalize(property.jenisProperti)} di ${capitalize(property.kabupaten)}`,
                  url: `https://salambumiproperty.com/properti/${property.kodeListing}`,
                  image: property.imageUrl,
                  price: property.hargaProperti,
                  priceCurrency: 'IDR',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: capitalize(property.kabupaten),
                    addressRegion: capitalize(property.provinsi),
                    addressCountry: 'ID',
                  },
                },
              })),
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbs} />

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {(filters.jenis && filters.jenis !== 'semua')
                ? `${capitalize(filters.jenis).replace(/_/g, ' ')} ${filters.status === 'disewakan' ? 'Disewakan' : 'Dijual'}`
                : `Properti ${filters.status === 'disewakan' ? 'Disewakan' : 'Dijual'}`
              }
              {filters.kecamatan && (
                <span className="text-blue-600"> di {capitalize(filters.kecamatan)}</span>
              )}
              {!filters.kecamatan && filters.kabupaten && (
                <span className="text-blue-600"> di {capitalize(filters.kabupaten)}</span>
              )}
              {!filters.kecamatan && !filters.kabupaten && filters.provinsi && (
                <span className="text-blue-600"> di {capitalize(filters.provinsi)}</span>
              )}
            </h1>
            <p className="text-gray-600 text-lg">
              {isLoading 
                ? 'Memuat properti...' 
                : `${properties.length} properti ditemukan`
              }
            </p>
          </div>

          {/* Active Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter aktif:
              </span>
              
              {filters.status && (
                <FilterBadge
                  icon={Tag}
                  label="Status"
                  value={filters.status === 'dijual' ? 'Dijual' : 'Disewakan'}
                  onRemove={() => removeFilter('status')}
                />
              )}
              
              {filters.jenis && filters.jenis !== 'semua' && (
                <FilterBadge
                  icon={Building2}
                  label="Jenis"
                  value={capitalize(filters.jenis).replace(/_/g, ' ')}
                  onRemove={() => removeFilter('jenis')}
                />
              )}
              
              {filters.provinsi && (
                <FilterBadge
                  icon={MapPin}
                  label="Provinsi"
                  value={capitalize(filters.provinsi)}
                  onRemove={() => removeFilter('provinsi')}
                />
              )}
              
              {filters.kabupaten && (
                <FilterBadge
                  icon={MapPin}
                  label="Kabupaten"
                  value={capitalize(filters.kabupaten)}
                  onRemove={() => removeFilter('kabupaten')}
                />
              )}
              
              {filters.kecamatan && (
                <FilterBadge
                  icon={MapPin}
                  label="Kecamatan"
                  value={capitalize(filters.kecamatan)}
                  onRemove={() => navigateToParent()}
                />
              )}
              
              {filters.priceRange && (
                <FilterBadge
                  icon={Tag}
                  label="Harga"
                  value={parsePriceRange(filters.priceRange).label || filters.priceRange}
                  onRemove={() => removeFilter('priceRange')}
                />
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <PropertyGridSkeleton />
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <SearchX className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Terjadi Kesalahan
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Maaf, terjadi kesalahan saat memuat data properti. Silakan coba lagi nanti.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Coba Lagi
              </Button>
            </div>
          ) : properties.length === 0 ? (
            <EmptyState filters={filters} />
          ) : (
            <>
              {/* Property Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>

              {/* Load More / Bottom CTA */}
              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">
                  Menampilkan {properties.length} properti
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/search">
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter Lanjutan
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Hubungi Kami
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
