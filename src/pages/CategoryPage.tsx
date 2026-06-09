/**
 * CategoryPage - Programmatic SEO Page
 * Halaman otomatis berdasarkan jenis properti dan lokasi
 * Contoh: /rumah-dijual-yogyakarta, /kost-dijual-sleman
 */
import { useEffect, useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyBreadcrumb, getCategoryBreadcrumbs } from "@/components/ui/property-breadcrumb";
import { Button } from "@/components/ui/button";
import { propertiesApi } from "@/lib/api-client";
import { Property } from "@/data/properties";
import { apiToCardProperty } from "@/utils/propertyAdapter";
import {
  generateCategoryMetaTitle, generateCategoryMetaDescription,
  generateCategoryCanonicalUrl, generateBreadcrumbSchema,
  generateItemListSchema, generateOrganizationSchema,
  generateWebSiteSchema, injectSchema,
  PROPERTY_TYPE_LABELS, SITE_URL, SITE_NAME,
} from "@/utils/seoUtils";
import { ChevronLeft, ChevronRight, MapPin, Search, Loader2 } from "lucide-react";

// ============================================================================
// CONFIGURATION
// ============================================================================

const PROPERTY_TYPES = ["rumah", "kost", "tanah", "villa", "apartment", "ruko", "gudang", "hotel", "homestay"];

const LOCATIONS: Record<string, { name: string; label: string }[]> = {
  yogyakarta: [
    { name: "sleman", label: "Sleman" },
    { name: "bantul", label: "Bantul" },
    { name: "kulon-progo", label: "Kulon Progo" },
    { name: "gunungkidul", label: "Gunungkidul" },
    { name: "kota-yogyakarta", label: "Kota Yogyakarta" },
  ],
  sleman: [
    { name: "depok", label: "Depok" },
    { name: "ngaglik", label: "Ngaglik" },
    { name: "kalasan", label: "Kalasan" },
    { name: "mlati", label: "Mlati" },
    { name: "gamping", label: "Gamping" },
    { name: "berbah", label: "Berbah" },
    { name: "prambanan", label: "Prambanan" },
  ],
  bantul: [
    { name: "sewon", label: "Sewon" },
    { name: "kasihan", label: "Kasihan" },
    { name: "banguntapan", label: "Banguntapan" },
    { name: "imogiri", label: "Imogiri" },
    { name: "kretek", label: "Kretek" },
  ],
};

interface CategoryPageProps {
  propertyType: string;
  location?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CategoryPage({ propertyType, location = "yogyakarta" }: CategoryPageProps) {
  const [, setLocation] = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Normalize inputs
  const typeLabel = PROPERTY_TYPE_LABELS[propertyType.toLowerCase()] || propertyType;
  const locationLabel = location.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const ITEMS_PER_PAGE = 12;

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          limit: ITEMS_PER_PAGE,
          page,
          type: propertyType.toLowerCase(),
          purpose: "Dijual",
          is_sold: "false",
        };

        // Only apply location filter for specific sub-locations (not generic "yogyakarta")
        if (location.toLowerCase() !== "yogyakarta") {
          params.location = locationLabel;
        }

        const result = await propertiesApi.getAll(params as any);

        if (result.success && result.data && result.data.length > 0) {
          setProperties(result.data.map(apiToCardProperty));
          setTotalPages(result.pagination?.total_pages || 1);
        } else {
          setProperties([]);
          setTotalPages(1);
        }
      } catch {
        setProperties([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [propertyType, location, page]);

  // Inject SEO schemas
  useEffect(() => {
    // Meta title
    document.title = generateCategoryMetaTitle(propertyType, locationLabel);

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', generateCategoryMetaDescription(propertyType, locationLabel, properties.length));

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', generateCategoryCanonicalUrl(propertyType, location));

    // Breadcrumb schema
    injectSchema('breadcrumb-schema', generateBreadcrumbSchema([
      { name: "Beranda", url: SITE_URL },
      { name: `${typeLabel} Dijual`, url: `${SITE_URL}/${propertyType}-dijual-yogyakarta` },
      { name: `${typeLabel} Dijual ${locationLabel}`, url: generateCategoryCanonicalUrl(propertyType, location) },
    ]));

    // Organization schema
    injectSchema('organization-schema', generateOrganizationSchema());

    // WebSite schema
    injectSchema('website-schema', generateWebSiteSchema());

    // ItemList schema
    if (properties.length > 0) {
      injectSchema('itemlist-schema', generateItemListSchema(
        `${typeLabel} Dijual di ${locationLabel}`,
        properties.map(p => ({
          name: p.title,
          url: `${SITE_URL}/properti/${p.slug}`,
          image: p.images?.[0],
          price: p.price,
        }))
      ));
    }
  }, [propertyType, location, properties, typeLabel, locationLabel]);

  // Get related locations for internal linking
  const relatedLocations = useMemo(() => {
    const loc = location.toLowerCase();
    if (LOCATIONS[loc]) return LOCATIONS[loc];
    if (LOCATIONS.yogyakarta) return LOCATIONS.yogyakarta;
    return [];
  }, [location]);

  // Get other property types for internal linking
  const otherTypes = useMemo(() => {
    return PROPERTY_TYPES.filter(t => t.toLowerCase() !== propertyType.toLowerCase()).slice(0, 6);
  }, [propertyType]);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <PropertyBreadcrumb
            items={getCategoryBreadcrumbs(typeLabel, locationLabel)}
            className="mb-6"
          />

          {/* Header */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
              {typeLabel} Dijual di {locationLabel}
            </h1>
            <p className="text-gray-500">
              Temukan {typeLabel.toLowerCase()} dengan lokasi strategis di {locationLabel}, Yogyakarta.
              Harga terbaik, legalitas lengkap.
            </p>
          </div>

          {/* Internal Links - Lokasi lain */}
          {relatedLocations.length > 0 && (
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {typeLabel} di Lokasi Lain
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedLocations.map(loc => (
                  <Link
                    key={loc.name}
                    href={`/${propertyType}-dijual-${loc.name}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-primary/5 text-gray-700 hover:text-primary text-sm font-medium rounded-lg border border-gray-100 hover:border-primary/20 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {loc.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Internal Links - Jenis properti lain */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Properti Lain di {locationLabel}
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherTypes.map(type => {
                const label = PROPERTY_TYPE_LABELS[type] || type;
                return (
                  <Link
                    key={type}
                    href={`/${type}-dijual-${location}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-primary/5 text-gray-700 hover:text-primary text-sm font-medium rounded-lg border border-gray-100 hover:border-primary/20 transition-colors"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-500">Memuat properti...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && properties.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada {typeLabel} di {locationLabel}
              </h3>
              <p className="text-gray-500 mb-4">
                Coba lihat properti di lokasi lain atau jenis properti yang berbeda.
              </p>
              <Link href="/properties">
                <Button className="bg-primary hover:bg-primary/90">
                  Lihat Semua Properti
                </Button>
              </Link>
            </div>
          )}

          {/* Property Grid */}
          {!loading && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {properties.map(p => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                  </Button>
                  <span className="text-sm text-gray-500">
                    Halaman {page} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CategoryPage;
