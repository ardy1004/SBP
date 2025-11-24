import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { supabase } from "@/lib/supabase";
import { PropertyCard } from "@/components/PropertyCard";
import type { Property } from "@shared/types";

export default function LocationPage() {
  const params = useParams();
  const [location, setLocation] = useLocation();

  // Extract parameters from URL
  const locationParam = params.location || '';
  const typeParam = params.type || '';

  // Parse location and type from URL
  // URL format: /rumah-dijual/sleman or /kost/yogyakarta-utara or /sleman
  let propertyType = '';
  let area = '';

  if (typeParam && locationParam) {
    // Format: /rumah-dijual/sleman
    propertyType = typeParam.replace('-', ' ');
    area = locationParam.replace('-', ' ');
  } else if (locationParam) {
    // Format: /sleman (general location page)
    area = locationParam.replace('-', ' ');
  }

  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['location-properties', propertyType, area],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('kabupaten', area)
        .neq('status', 'sold')
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by property type if specified
      if (propertyType) {
        const typeMap: Record<string, string> = {
          'rumah dijual': 'rumah',
          'rumah disewakan': 'rumah',
          'kost': 'kost',
          'apartemen': 'apartemen',
          'tanah': 'tanah',
          'ruko': 'ruko',
          'villa': 'villa',
          'gudang': 'gudang'
        };

        const mappedType = typeMap[propertyType.toLowerCase()];
        if (mappedType) {
          query = query.eq('jenis_properti', mappedType);

          // Also filter by status for rental/sale
          if (propertyType.includes('disewakan')) {
            query = query.eq('status', 'disewakan');
          } else if (propertyType.includes('dijual')) {
            query = query.eq('status', 'dijual');
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Location page query error:', error);
        throw error;
      }

      // Transform data
      return data.map(transformSupabaseProperty);
    },
    enabled: !!area,
  });

  // Generate page title and description
  const getPageTitle = () => {
    if (propertyType && area) {
      return `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} ${area.charAt(0).toUpperCase() + area.slice(1)} - Salam Bumi Property`;
    } else if (area) {
      return `Properti ${area.charAt(0).toUpperCase() + area.slice(1)} - Salam Bumi Property`;
    }
    return 'Properti - Salam Bumi Property';
  };

  const getPageDescription = () => {
    const baseDesc = `Temukan properti terbaik di ${area.charAt(0).toUpperCase() + area.slice(1)}`;
    if (propertyType) {
      return `${baseDesc} dengan jenis ${propertyType}. Lihat koleksi lengkap properti ${propertyType} di area ${area} dengan harga terbaik.`;
    }
    return `${baseDesc}. Rumah, kost, apartemen, tanah, ruko, villa, gudang dengan lokasi strategis dan harga kompetitif.`;
  };

  const getLocalKeywords = (area: string) => {
    const localMap: Record<string, string[]> = {
      'sleman': ['dekat ugm', 'kampus ugm', 'mahasiswa ugm', 'stasiun maguwo', 'terminal giwangan', 'dekat malioboro'],
      'bantul': ['dekat bandara', 'kuliner bantul', 'pantai parangtritis', 'desa wisata', 'dekat stasiun'],
      'yogyakarta kota': ['malioboro', 'kraton yogyakarta', 'tugu yogyakarta', 'pasar bringharjo', 'dekat universitas'],
      'kulonprogo': ['dekat bandara', 'pantai glagah', 'desa wisata', 'borobudur', 'dekat pantai'],
      'gunungkidul': ['pantai', 'desa wisata', 'pegunungan', 'air terjun', 'wisata alam']
    };

    return localMap[area.toLowerCase()] || [];
  };

  const localKeywords = getLocalKeywords(area);
  const keywords = ['properti', 'real estate', 'yogyakarta', area, ...localKeywords];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h1>
          <p className="text-muted-foreground mb-4">Tidak dapat memuat properti di lokasi ini.</p>
          <button
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta name="keywords" content={keywords.join(', ')} />

        {/* Open Graph */}
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Salam Bumi Property" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />

        {/* Additional SEO */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-foreground">Home</a>
              </li>
              <li className="text-muted-foreground">/</li>
              <li className="text-foreground">
                {propertyType && area ? `${propertyType} ${area}` : `Properti ${area}`}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{getPageTitle().replace(' - Salam Bumi Property', '')}</h1>
            <p className="text-muted-foreground text-lg">
              {properties ? `${properties.length} properti ditemukan` : 'Mencari properti...'}
            </p>
            {localKeywords.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Area populer di {area}:</p>
                <div className="flex flex-wrap gap-2">
                  {localKeywords.slice(0, 4).map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}

          {/* Properties Grid */}
          {!isLoading && properties && properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onToggleFavorite={() => {}}
                  isFavorite={false}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!properties || properties.length === 0) && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <h3 className="text-lg font-semibold mb-2">Belum ada properti</h3>
                <p className="mb-4">Belum ada properti yang tersedia di lokasi ini.</p>
                <button
                  onClick={() => setLocation('/portfolio')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Lihat Semua Properti
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Transform function (same as in PropertyDetailPage)
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
    youtubeUrl: supabaseProperty.youtube_url,
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