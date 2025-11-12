import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { MapPin, Bed, Bath, Maximize, FileText, Share2, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { PropertyCard } from "@/components/PropertyCard";
import { InquiryForm } from "@/components/InquiryForm";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import type { Property } from "@shared/schema";

export default function PropertyDetailPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const propertyId = searchParams.get('id');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['property-detail', propertyId],
    queryFn: async () => {
      if (!propertyId) throw new Error('No property ID provided');

      console.log('=== PROPERTY DETAIL QUERY ===');
      console.log('Property ID:', propertyId);

      // Try to fetch from server API first
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched from server API:', data);
          return data;
        }
      } catch (error) {
        console.log('Server API failed, trying Supabase:', error);
      }

      // Fallback to Supabase direct query
      console.log('Fetching from Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Raw Supabase data:', data);

      // Transform snake_case to camelCase
      const transformedProperty = {
        id: data.id,
        kodeListing: data.kode_listing,
        judulProperti: data.judul_properti,
        deskripsi: data.deskripsi,
        jenisProperti: data.jenis_properti,
        luasTanah: data.luas_tanah,
        luasBangunan: data.luas_bangunan,
        kamarTidur: data.kamar_tidur,
        kamarMandi: data.kamar_mandi,
        legalitas: data.legalitas,
        hargaProperti: data.harga_properti,
        provinsi: data.provinsi,
        kabupaten: data.kabupaten,
        alamatLengkap: data.alamat_lengkap,
        imageUrl: data.image_url,
        imageUrl1: data.image_url1,
        imageUrl2: data.image_url2,
        imageUrl3: data.image_url3,
        imageUrl4: data.image_url4,
        imageUrl5: data.image_url5,
        imageUrl6: data.image_url6,
        imageUrl7: data.image_url7,
        imageUrl8: data.image_url8,
        imageUrl9: data.image_url9,
        isPremium: data.is_premium,
        isFeatured: data.is_featured,
        isHot: data.is_hot,
        isSold: data.is_sold,
        priceOld: data.price_old,
        isPropertyPilihan: data.is_property_pilihan,
        ownerContact: data.owner_contact,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      console.log('Transformed property:', transformedProperty);
      return transformedProperty;
    },
    enabled: !!propertyId,
  });

  useEffect(() => {
    if (property) {
      // Track property view
      apiRequest('POST', '/api/analytics/event', {
        eventType: 'property_view',
        propertyId: property.id,
        metadata: JSON.stringify({ path: location }),
      }).catch(() => {});
    }
  }, [property, location]);

  const handleInquirySubmit = async (data: { name: string; whatsapp: string; message: string }) => {
    if (!property) return;
    await apiRequest('POST', '/api/inquiries', {
      propertyId: property.id,
      ...data,
    });
  };

  const toggleFavorite = () => {
    if (!property) return;
    const newFavorites = favorites.includes(property.id)
      ? favorites.filter((fav) => fav !== property.id)
      : [...favorites, property.id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleShare = async () => {
    if (!property) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${property.jenisProperti} - ${property.kabupaten}`,
        text: `Lihat properti ini di Salam Bumi Property`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link telah disalin ke clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Memuat properti...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Properti Tidak Ditemukan</h1>
          <Button onClick={() => setLocation('/')}>Kembali ke Home</Button>
        </div>
      </div>
    );
  }

  const images = [
    property.imageUrl,
    property.imageUrl1,
    property.imageUrl2,
    property.imageUrl3,
    property.imageUrl4,
  ].filter(Boolean) as string[];

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const getTitle = () => {
    return property.judulProperti || `${property.jenisProperti.charAt(0).toUpperCase() + property.jenisProperti.slice(1).replace(/_/g, ' ')} di ${property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}`;
  };

  return (
    <>
      <Helmet>
        <title>{`${getTitle()} - Salam Bumi Property`}</title>
        <meta name="description" content={property.deskripsi || `${property.jenisProperti} ${property.status} dengan ${property.kamarTidur} kamar tidur, ${property.kamarMandi} kamar mandi di ${property.kabupaten}, ${property.provinsi}. Harga: ${formatPrice(property.hargaProperti)}`} />

        {/* Open Graph */}
        <meta property="og:title" content={getTitle()} />
        <meta property="og:description" content={property.deskripsi || `Properti ${property.status} di ${property.kabupaten}`} />
        <meta property="og:image" content={property.imageUrl} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getTitle()} />
        <meta name="twitter:description" content={property.deskripsi || `Properti ${property.status} di ${property.kabupaten}`} />
        <meta name="twitter:image" content={property.imageUrl} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12 flex-1">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <PropertyImageGallery images={images} propertyTitle={property.kodeListing} />

              {/* Price and Title */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-property-title">
                      {getTitle()}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <p data-testid="text-location">{property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}, {property.provinsi.charAt(0).toUpperCase() + property.provinsi.slice(1)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFavorite}
                      data-testid="button-favorite"
                    >
                      <Heart
                        className={`h-5 w-5 ${favorites.includes(property.id) ? 'fill-destructive text-destructive' : ''}`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                      data-testid="button-share"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <p className="text-3xl md:text-4xl font-bold text-primary" data-testid="text-price">
                  {formatPrice(property.hargaProperti)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </p>
              </div>

              {/* Property Specs */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Spesifikasi Properti</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.kamarTidur && (
                      <div className="flex items-center gap-3">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Kamar Tidur</p>
                          <p className="font-semibold" data-testid="text-detail-bedrooms">{property.kamarTidur}</p>
                        </div>
                      </div>
                    )}
                    {property.kamarMandi && (
                      <div className="flex items-center gap-3">
                        <Bath className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Kamar Mandi</p>
                          <p className="font-semibold" data-testid="text-detail-bathrooms">{property.kamarMandi}</p>
                        </div>
                      </div>
                    )}
                    {property.luasTanah && (
                      <div className="flex items-center gap-3">
                        <Maximize className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Luas Tanah</p>
                          <p className="font-semibold" data-testid="text-detail-land-area">{property.luasTanah}m²</p>
                        </div>
                      </div>
                    )}
                    {property.luasBangunan && (
                      <div className="flex items-center gap-3">
                        <Maximize className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Luas Bangunan</p>
                          <p className="font-semibold" data-testid="text-detail-building-area">{property.luasBangunan}m²</p>
                        </div>
                      </div>
                    )}
                    {property.legalitas && (
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Status Legal</p>
                          <p className="font-semibold" data-testid="text-detail-legal-status">{property.legalitas}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {property.deskripsi && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Deskripsi</h3>
                    <p className="text-foreground leading-relaxed font-body max-w-prose" data-testid="text-description">
                      {property.deskripsi}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Property Labels */}
              <div className="flex flex-wrap gap-2">
                {property.isPremium && <Badge variant="secondary">Premium</Badge>}
                {property.isFeatured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                {property.isHot && <Badge variant="destructive">Hot Listing</Badge>}
                {property.isSold && <Badge variant="destructive">SOLD</Badge>}
              </div>
            </div>

            {/* Sidebar - Inquiry Form */}
            <div className="lg:col-span-1">
              <InquiryForm propertyId={property.id} onSubmit={handleInquirySubmit} />
            </div>
          </div>

          {/* Related Properties Section */}
          <RelatedPropertiesSection currentProperty={property} />
        </div>
      </div>
    </>
  );
}

// Related Properties Component
function RelatedPropertiesSection({ currentProperty }: { currentProperty: Property }) {
  const { data: relatedProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['related-properties', currentProperty.id],
    queryFn: async () => {
      console.log('=== FETCHING RELATED PROPERTIES ===');
      console.log('Current property:', currentProperty.kodeListing);

      try {
        // Try server API first
        const response = await fetch('/api/properties');
        if (response.ok) {
          const allProperties = await response.json();
          console.log('Fetched from server API:', allProperties.length, 'properties');

          // Filter and sort related properties with more inclusive logic
          let filtered = allProperties
            .filter((prop: any) => prop.id !== currentProperty.id) // Exclude current property
            .filter((prop: any) => prop.status !== 'sold') // Exclude sold properties
            .map((prop: any) => ({
              ...prop,
              relevanceScore: calculateRelevanceScore(prop, currentProperty)
            }))
            .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
            .slice(0, 3); // Get top 3 by relevance

          // If we don't have enough high-relevance matches, add some fallback properties
          if (filtered.length < 2) {
            const fallbackProperties = allProperties
              .filter((prop: any) =>
                prop.id !== currentProperty.id &&
                prop.status !== 'sold' &&
                !filtered.some((f: any) => f.id === prop.id) // Not already included
              )
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3 - filtered.length);

            filtered = [...filtered, ...fallbackProperties];
          }

          console.log('Filtered related properties:', filtered.length);
          return filtered.map(transformSupabaseProperty);
        }
      } catch (error) {
        console.log('Server API failed, trying Supabase:', error);
      }

      // Fallback to Supabase
      console.log('Fetching from Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .neq('id', currentProperty.id) // Exclude current property
        .order('created_at', { ascending: false })
        .limit(20); // Get more to filter

      if (error) {
        console.error('Supabase query error:', error);
        return [];
      }

      // Filter and sort on client side with more inclusive logic
      let filtered = data
        .filter((prop: any) => prop.id !== currentProperty.id && prop.status !== 'sold')
        .map((prop: any) => ({
          ...prop,
          relevanceScore: calculateRelevanceScore(prop, currentProperty)
        }))
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      // If we don't have enough high-relevance matches, add recent properties as fallback
      if (filtered.length < 2) {
        const fallbackProperties = data
          .filter((prop: any) =>
            prop.id !== currentProperty.id &&
            prop.status !== 'sold' &&
            !filtered.some((f: any) => f.id === prop.id)
          )
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3 - filtered.length);

        filtered = [...filtered, ...fallbackProperties];
      }

      console.log('Supabase filtered related properties:', filtered.length);
      return filtered.map(transformSupabaseProperty);
    },
    enabled: !!currentProperty.id,
  });

  // Helper function to check price similarity (within 30% range)
  const checkPriceSimilarity = (price1: string, price2: string): boolean => {
    const num1 = parseFloat(price1) || 0;
    const num2 = parseFloat(price2) || 0;
    const ratio = Math.min(num1, num2) / Math.max(num1, num2);
    return ratio >= 0.7; // Within 30% range
  };

  // Calculate relevance score for sorting (more inclusive)
  const calculateRelevanceScore = (property: any, current: Property): number => {
    let score = 10; // Base score for all properties

    // Same location + same type = highest score
    if (property.kabupaten === current.kabupaten && property.jenis_properti === current.jenisProperti) {
      score += 100;
    }
    // Same location = high score
    else if (property.kabupaten === current.kabupaten) {
      score += 50;
    }
    // Same type + similar price = medium score
    else if (property.jenis_properti === current.jenisProperti && checkPriceSimilarity(property.harga_properti, current.hargaProperti)) {
      score += 30;
    }
    // Same type = medium score
    else if (property.jenis_properti === current.jenisProperti) {
      score += 20;
    }
    // Similar price range = low score
    else if (checkPriceSimilarity(property.harga_properti, current.hargaProperti)) {
      score += 15;
    }
    // Same province = low score
    else if (property.provinsi === current.provinsi) {
      score += 10;
    }

    // Premium properties get boost
    if (property.is_premium) score += 8;
    if (property.is_featured) score += 5;
    if (property.is_hot) score += 3;

    // Recent properties get slight boost
    const daysSinceCreated = (new Date().getTime() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) score += 5; // Less than a week old
    else if (daysSinceCreated < 30) score += 2; // Less than a month old

    return score;
  };

  // Transform function (same as in main component)
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

  return (
    <div className="mt-12 md:mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Properti Terkait</h2>
          <p className="text-muted-foreground">
            Temukan properti lain yang mungkin Anda minati
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : relatedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProperties.map((relatedProperty) => (
              <PropertyCard
                key={relatedProperty.id}
                property={relatedProperty}
                onToggleFavorite={() => {}} // Related properties don't need favorite toggle
                isFavorite={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Tidak ada properti terkait ditemukan</p>
              <p className="text-sm">Coba lihat properti lainnya di halaman utama</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
