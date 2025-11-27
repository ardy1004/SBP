import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Helmet } from "react-helmet";
import { MapPin, Bed, Bath, Maximize, FileText, Share2, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { PropertyCard } from "@/components/PropertyCard";
import { ShareButtons } from "@/components/ShareButtons";
import { InquiryForm } from "@/components/InquiryForm";
import { PropertySchemaMarkup } from "@/components/SchemaMarkup";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { parsePropertySlug } from "@/lib/utils";
import type { Property } from "@shared/types";

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If no pattern matches, return the URL as-is (might already be an ID)
  return url;
}

export default function PropertyDetailPage() {
  console.log('🚀 PropertyDetailPage COMPONENT RENDERED');

  const [location, setLocation] = useLocation();
  const params = useParams();

  console.log('📍 Location from useLocation:', location);
  console.log('📍 Params from useParams:', params);

  // Check if we have structured route parameters (new format)
  const hasStructuredParams = params.status && params.jenis && params.kabupaten;

  let kodeListing: string | undefined;
  let propertyId: string | undefined;

  if (hasStructuredParams) {
    // New format: /{status}/{jenis}/{kabupaten}/{provinsi}/{judul}
    console.log('🆕 Using structured route parameters');
    const { status, jenis, kabupaten, provinsi, judul } = params;

    // Try to extract kode_listing from judul (last part after last dash)
    const judulParts = judul?.split('-') || [];
    const potentialKodeListing = judulParts[judulParts.length - 1];

    // Check if last part looks like kode_listing (K2.60, R1.25, A123, etc)
    if (potentialKodeListing && /^[A-Z]+\d+[\.\d]*$/.test(potentialKodeListing)) {
      kodeListing = potentialKodeListing;
      console.log('🏷️ Kode listing extracted from structured params:', kodeListing);
      propertyId = kodeListing;
    } else {
      // If no kode_listing found, reconstruct slug for parsing
      const reconstructedSlug = `${status}-${jenis}-${kabupaten}-${provinsi}-${judul}`;
      console.log('🔄 Reconstructing slug for parsing:', reconstructedSlug);
      const parsedSlug = parsePropertySlug(reconstructedSlug);
      kodeListing = parsedSlug.kode_listing;
      propertyId = kodeListing;
      console.log('🏷️ Kode listing from reconstructed slug:', kodeListing);
    }
  } else {
    // Legacy format: get slug from URL path (remove leading slash)
    const slug = location.substring(1);
    console.log('📝 Slug extracted (legacy):', slug);

    const parsedSlug = parsePropertySlug(slug);
    console.log('🔍 Parsed slug result (legacy):', parsedSlug);

    kodeListing = parsedSlug.kode_listing;
    console.log('🏷️ Kode listing from legacy slug:', kodeListing);

    propertyId = kodeListing;
  }

  // For backward compatibility, also check for direct ID parameter
  propertyId = params.id || propertyId;
  console.log('🆔 Final propertyId used for query:', propertyId);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['property-detail', propertyId],
    queryFn: async () => {
      if (!propertyId) throw new Error('No property identifier provided');

      console.log('=== PROPERTY DETAIL QUERY ===');
      console.log('Property ID/Kode Listing:', propertyId);
      console.log('Has structured params:', hasStructuredParams);
      console.log('Route params:', params);

      // Fetch from Supabase directly
      console.log('Fetching from Supabase...');
      let query = supabase.from('properties').select('*');

      // If we have a kode_listing from slug parsing, use kode_listing field; otherwise use ID field
      if (kodeListing) {
        console.log('Querying by kode_listing:', kodeListing);
        query = query.eq('kode_listing', kodeListing);
      } else {
        console.log('Querying by id:', propertyId);
        query = query.eq('id', propertyId);
      }

      console.log('Final query:', query);
      const { data, error } = await query.single();

      console.log('Query result - data:', data);
      console.log('Query result - error:', error);

      if (error) {
        console.error('Supabase query error:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        throw error;
      }

      if (!data) {
        console.error('No data returned from query');
        throw new Error('Property not found');
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
        youtubeUrl: data.youtube_url,
        isPremium: data.is_premium,
        isFeatured: data.is_featured,
        isHot: data.is_hot,
        isSold: data.is_sold,
        priceOld: data.price_old,
        isPropertyPilihan: data.is_property_pilihan,
        hargaPerMeter: data.harga_per_meter || false,
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
      // Scroll to top when property loads
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Track property view in Supabase
      const trackAnalytics = async () => {
        try {
          const { error } = await supabase
            .from('analytics_events')
            .insert({
              event_type: 'property_view',
              property_id: property.id,
              metadata: JSON.stringify({ path: location }),
            });

          if (error) {
            console.error('Analytics tracking failed:', error);
          } else {
            console.log('Analytics event tracked');
          }
        } catch (error) {
          console.error('Analytics tracking error:', error);
        }
      };

      trackAnalytics();
    }
  }, [property, location]);

  const handleInquirySubmit = async (data: { name: string; whatsapp: string; message: string }) => {
    if (!property) return;

    const { error } = await supabase
      .from('inquiries')
      .insert({
        property_id: property.id,
        name: data.name,
        whatsapp: data.whatsapp,
        message: data.message,
      });

    if (error) {
      console.error('Inquiry submission error:', error);
      throw new Error('Failed to submit inquiry');
    }
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

    // Use SEO-friendly slug URL for sharing
    const { generatePropertySlug } = await import('@/lib/utils');
    const slug = generatePropertySlug({
      status: property.status,
      jenis_properti: property.jenisProperti,
      provinsi: property.provinsi,
      kabupaten: property.kabupaten,
      judul_properti: property.judulProperti || undefined,
      kode_listing: property.kodeListing
    });
    const shareUrl = `${window.location.origin}/${slug}`;

    if (navigator.share) {
      await navigator.share({
        title: `${property.judulProperti || property.jenisProperti} - ${property.kabupaten}`,
        text: `Lihat properti ini di Salam Bumi Property`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
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
  ].filter((img): img is string => img != null && img.trim() !== '') as string[];

  // Get the primary image for social sharing (with comprehensive fallback)
  const getPrimaryImage = () => {
    // Check if we have valid images
    if (images.length > 0 && images[0] && images[0].trim() !== '') {
      // Validate URL format (basic check)
      try {
        new URL(images[0]);
        return images[0];
      } catch {
        // Invalid URL, try next image
        for (const img of images.slice(1)) {
          if (img && img.trim() !== '') {
            try {
              new URL(img);
              return img;
            } catch {
              continue;
            }
          }
        }
      }
    }

    // Fallback to property-type specific placeholder images (social media friendly)
    const propertyTypePlaceholders: Record<string, string> = {
      rumah: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      kost: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
      apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      villa: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop',
      ruko: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      tanah: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      gudang: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
      hotel: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop', // Changed to more reliable hotel image
    };

    // Return property-type specific placeholder or generic one
    return propertyTypePlaceholders[property.jenisProperti] ||
           'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
  };

  const formatPrice = (price: string, isPerMeter: boolean = false) => {
    const num = parseFloat(price);
    let displayPrice = num;

    if (isPerMeter) {
      // For per meter pricing, show as "Rp 8.5jt/m²"
      if (num >= 1000000000) {
        const value = num / 1000000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
      } else if (num >= 1000000) {
        const value = num / 1000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
      } else if (num >= 1000) {
        const value = num / 1000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}rb/m²`;
      }
      return `Rp ${num.toLocaleString('id-ID')}/m²`;
    } else {
      // Regular pricing - use full format for detail page
      if (num >= 1000000000) {
        const value = num / 1000000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
      } else if (num >= 1000000) {
        const value = num / 1000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
      }
      return `Rp ${num.toLocaleString('id-ID')}`;
    }
  };

  const getTitle = () => {
    return property.judulProperti || `${property.jenisProperti.charAt(0).toUpperCase() + property.jenisProperti.slice(1).replace(/_/g, ' ')} di ${property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}`;
  };

  return (
    <>
      {/* Schema Markup for SEO */}
      {property && <PropertySchemaMarkup property={property} />}

      <Helmet>
        <title>{`${getTitle()} - Salam Bumi Property`}</title>
        <meta name="description" content={property.deskripsi || `${property.jenisProperti} ${property.status} dengan ${property.kamarTidur} kamar tidur, ${property.kamarMandi} kamar mandi di ${property.kabupaten}, ${property.provinsi}. Harga: ${formatPrice(property.hargaProperti, (property as any).hargaPerMeter)}`} />

        {/* Open Graph */}
        <meta property="og:title" content={getTitle()} />
        <meta property="og:description" content={property.deskripsi || `${property.jenisProperti.charAt(0).toUpperCase() + property.jenisProperti.slice(1).replace(/_/g, ' ')} ${property.status} di ${property.kabupaten}, ${property.provinsi}. Harga: ${formatPrice(property.hargaProperti, (property as any).hargaPerMeter)}`} />
        <meta property="og:image" content={getPrimaryImage()} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Salam Bumi Property" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getTitle()} />
        <meta name="twitter:description" content={property.deskripsi || `Properti ${property.status} di ${property.kabupaten}`} />
        <meta name="twitter:image" content={getPrimaryImage()} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12 flex-1">
          <Breadcrumb property={property} />

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
              <PropertyImageGallery
                images={images}
                propertyTitle={property.kodeListing}
                propertyLabels={{
                  isPremium: property.isPremium,
                  isFeatured: property.isFeatured,
                  isHot: property.isHot,
                  isSold: property.isSold,
                }}
              />

              {/* Price and Title */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {/* Kode Listing */}
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Kode: {property.kodeListing}
                    </div>
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
                  </div>
                </div>

                <div className="space-y-1">
                  {property.isHot && property.priceOld && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(property.priceOld, (property as any).hargaPerMeter)}
                      </span>
                      <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        DROP PRICE
                      </span>
                    </div>
                  )}
                  <p className="text-3xl md:text-4xl font-bold text-primary" data-testid="text-price">
                    {formatPrice(property.hargaProperti, (property as any).hargaPerMeter)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </p>
                </div>
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
                    <div className="text-foreground leading-relaxed font-body max-w-prose whitespace-pre-line" data-testid="text-description">
                      {property.deskripsi}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Share Buttons */}
              <Card>
                <CardContent className="p-6">
                  <ShareButtons property={property} />
                </CardContent>
              </Card>

              {/* YouTube Video */}
              {property.youtubeUrl && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Video Properti</h3>
                    <div className="aspect-[9/16] w-full max-w-sm mx-auto">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(property.youtubeUrl)}`}
                        title="Video Properti"
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Inquiry Form */}
            <div className="lg:col-span-1">
              <InquiryForm propertyId={property.id} property={property} onSubmit={handleInquirySubmit} />
            </div>
          </div>

          {/* Related Properties Section */}
          <RelatedPropertiesSection currentProperty={property} />
        </div>
      </div>
    </>
  );
}

// Breadcrumb Component
function Breadcrumb({ property }: { property: Property }) {
  const [location, setLocation] = useLocation();

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <a href="/" className="text-muted-foreground hover:text-foreground">Home</a>
        </li>
        <li className="text-muted-foreground">/</li>
        <li>
          <span className="text-muted-foreground">
            {property.kabupaten}
          </span>
        </li>
        <li className="text-muted-foreground">/</li>
        <li className="text-foreground">{property.judulProperti}</li>
      </ol>
    </nav>
  );
}

// Related Properties Component with Enhanced Internal Links
function RelatedPropertiesSection({ currentProperty }: { currentProperty: Property }) {
  const [location, setLocation] = useLocation();

  const { data: relatedProperties = [], isLoading } = useQuery<{
    locationBased: Property[];
    typeBased: Property[];
    recent: Property[];
  }>({
    queryKey: ['related-properties', currentProperty.id],
    queryFn: async () => {
      console.log('=== FETCHING RELATED PROPERTIES ===');
      console.log('Current property:', currentProperty.kodeListing);

      // Fetch from Supabase directly
      console.log('Fetching from Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .neq('id', currentProperty.id) // Exclude current property
        .neq('status', 'sold') // Exclude sold properties
        .order('created_at', { ascending: false })
        .limit(30); // Get more to categorize

      if (error) {
        console.error('Supabase query error:', error);
        return { locationBased: [], typeBased: [], recent: [] };
      }

      const availableProperties = data.filter((prop: any) =>
        prop.id !== currentProperty.id && prop.status !== 'sold'
      );

      // Categorize properties
      const locationBased = availableProperties
        .filter((prop: any) => prop.kabupaten === currentProperty.kabupaten)
        .sort((a: any, b: any) => calculateRelevanceScore(b, currentProperty) - calculateRelevanceScore(a, currentProperty))
        .slice(0, 4);

      const typeBased = availableProperties
        .filter((prop: any) =>
          prop.jenis_properti === currentProperty.jenisProperti &&
          prop.kabupaten !== currentProperty.kabupaten
        )
        .sort((a: any, b: any) => calculateRelevanceScore(b, currentProperty) - calculateRelevanceScore(a, currentProperty))
        .slice(0, 4);

      const recent = availableProperties
        .filter((prop: any) =>
          !locationBased.some((p: any) => p.id === prop.id) &&
          !typeBased.some((p: any) => p.id === prop.id)
        )
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4);

      console.log('Categorized properties:', {
        locationBased: locationBased.length,
        typeBased: typeBased.length,
        recent: recent.length
      });

      return {
        locationBased: locationBased.map(transformSupabaseProperty),
        typeBased: typeBased.map(transformSupabaseProperty),
        recent: recent.map(transformSupabaseProperty)
      };
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

  return (
    <div className="mt-12 md:mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Properti Lainnya</h2>
          <p className="text-muted-foreground">
            Temukan properti lain yang mungkin Anda minati
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-3">
                      <div className="aspect-[4/3] bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : relatedProperties && typeof relatedProperties === 'object' && 'locationBased' in relatedProperties ? (
          <div className="space-y-12">
            {/* Properties in Same Location */}
            {relatedProperties.locationBased && relatedProperties.locationBased.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold">
                    Properti Lain di {currentProperty.kabupaten}
                  </h3>
                  <a
                    href={`/${currentProperty.kabupaten.toLowerCase()}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Lihat Semua →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProperties.locationBased.map((property: Property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onToggleFavorite={() => {}}
                      isFavorite={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Properties of Same Type */}
            {relatedProperties.typeBased && relatedProperties.typeBased.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold">
                    {currentProperty.jenisProperti.charAt(0).toUpperCase() + currentProperty.jenisProperti.slice(1)} Lainnya
                  </h3>
                  <a
                    href={`/${currentProperty.jenisProperti.toLowerCase()}-dijual`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Lihat Semua →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProperties.typeBased.map((property: Property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onToggleFavorite={() => {}}
                      isFavorite={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Properties */}
            {relatedProperties.recent && relatedProperties.recent.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold">
                    Properti Terbaru
                  </h3>
                  <a
                    href="/portfolio"
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Lihat Semua →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProperties.recent.map((property: Property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onToggleFavorite={() => {}}
                      isFavorite={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!relatedProperties.locationBased || relatedProperties.locationBased.length === 0) &&
             (!relatedProperties.typeBased || relatedProperties.typeBased.length === 0) &&
             (!relatedProperties.recent || relatedProperties.recent.length === 0) && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">Tidak ada properti terkait ditemukan</p>
                  <p className="text-sm">Coba lihat properti lainnya di halaman utama</p>
                </div>
              </div>
            )}
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
