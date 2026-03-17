import { useEffect, useState, Suspense } from "react";
import { useParams, useLocation } from "wouter";
import { useLandingPages, useLandingPageConfig } from "@/hooks/use-landing-pages";
import { useLPContent } from "@/hooks/use-lp-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Home, ExternalLink } from "lucide-react";
import { LandingPageConfigInput } from "@/lib/validation";

// Dynamic landing page component
function DynamicLandingPage({ lpId, config }: { lpId: string; config?: Partial<LandingPageConfigInput> | null }) {
  const lpNumber = lpId.split('-')[1];

  // Get dynamic content from database
  const { data: contentData, isLoading: loadingContent } = useLPContent(lpId);

  // Template descriptions for each LP
  const templates = {
    "1": { title: "Landing Page 1", desc: "Template klasik dengan fokus pada properti premium", color: "blue" },
    "2": { title: "Landing Page 2", desc: "Template modern dengan desain minimalis", color: "green" },
    "3": { title: "Landing Page 3", desc: "Template elegan dengan fokus visual", color: "purple" },
    "4": { title: "Landing Page 4", desc: "Template dinamis dengan animasi smooth", color: "red" },
    "5": { title: "Landing Page 5", desc: "Template profesional untuk bisnis properti", color: "indigo" },
    "6": { title: "Landing Page 6", desc: "Template kreatif dengan layout unik", color: "pink" },
    "7": { title: "Landing Page 7", desc: "Template responsif dengan performa tinggi", color: "cyan" },
    "8": { title: "Landing Page 8", desc: "Template interaktif dengan fitur advanced", color: "orange" },
    "9": { title: "Landing Page 9", desc: "Template premium dengan desain eksklusif", color: "teal" },
  };

  const template = templates[lpNumber as keyof typeof templates] || templates["1"];
  const gradientClasses = {
    blue: "from-blue-50 to-indigo-100",
    green: "from-green-50 to-emerald-100",
    purple: "from-purple-50 to-violet-100",
    red: "from-red-50 to-rose-100",
    indigo: "from-indigo-50 to-blue-100",
    pink: "from-pink-50 to-rose-100",
    cyan: "from-cyan-50 to-blue-100",
    orange: "from-orange-50 to-amber-100",
    teal: "from-teal-50 to-cyan-100",
  };

  // Extract content from database
  const heroContent = contentData?.find(c => c.content_type === 'hero')?.content_data;
  const agentContent = contentData?.find(c => c.content_type === 'agent')?.content_data;
  const testimonialsContent = contentData?.find(c => c.content_type === 'testimonials')?.content_data;
  const propertiesContent = contentData?.find(c => c.content_type === 'properties')?.content_data;

  if (loadingContent) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${gradientClasses[template.color as keyof typeof gradientClasses]} flex items-center justify-center`}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Memuat Konten
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Mengambil konten dari database...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientClasses[template.color as keyof typeof gradientClasses]}`}>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {heroContent?.title || template.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {heroContent?.subtitle || template.desc}
          </p>

          {/* Hero CTA */}
          {heroContent?.ctaText && (
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => window.open(heroContent.ctaLink || '/', '_blank')}
            >
              {heroContent.ctaText}
            </Button>
          )}
        </div>

        {/* Agent Section */}
        {agentContent && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tentang Agent Kami</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={agentContent.photo || '/default-agent.jpg'}
                    alt={agentContent.name || 'Agent'}
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/default-agent.jpg';
                    }}
                  />
                </div>
                <div className="text-left md:text-left">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {agentContent.name || 'Nama Agent'}
                  </h3>
                  <p className="text-lg text-blue-600 mb-4">
                    {agentContent.title || 'Property Consultant'}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {agentContent.bio || 'Berpengalaman dalam bidang properti dengan track record yang terbukti.'}
                  </p>
                  <div className="text-sm text-gray-600">
                    <p>📞 {agentContent.phone || '+62 812-3456-7890'}</p>
                    <p>✉️ {agentContent.email || 'agent@salambumi.com'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Section */}
        {propertiesContent && propertiesContent.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Properti Unggulan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {propertiesContent.slice(0, 6).map((property: any, index: number) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={property.image || '/default-property.jpg'}
                      alt={property.title || 'Property'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/default-property.jpg';
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{property.title || 'Judul Property'}</h3>
                    <p className="text-blue-600 font-bold text-xl mb-2">{property.price || 'Harga'}</p>
                    <p className="text-gray-600 text-sm mb-4">{property.location || 'Lokasi'}</p>
                    <Button
                      className="w-full"
                      onClick={() => window.open(property.link || '/', '_blank')}
                    >
                      Lihat Detail
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        {testimonialsContent && testimonialsContent.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Testimoni Customer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonialsContent.slice(0, 3).map((testimonial: any, index: number) => (
                <div key={index} className="text-center">
                  <img
                    src={testimonial.photo || '/default-testimonial.jpg'}
                    alt={testimonial.name || 'Customer'}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
                    onError={(e) => {
                      e.currentTarget.src = '/default-testimonial.jpg';
                    }}
                  />
                  <p className="text-gray-700 italic mb-4">"{testimonial.quote || 'Testimoni customer'}"</p>
                  <p className="font-semibold text-gray-900">{testimonial.name || 'Nama Customer'}</p>
                  <div className="flex justify-center mt-2">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">Hubungi Kami</h2>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Tertarik dengan properti kami? Hubungi tim profesional kami untuk konsultasi gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Hubungi Kami
              </a>
              <a
                href="/properties"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Lihat Properti
              </a>
            </div>
          </div>

          <div className="text-sm text-gray-500 border-t pt-4 text-center mt-6">
            <div>LP ID: {lpId}</div>
            <div>Status: {config?.active_lp === lpId ? 'Aktif' : 'Tidak Aktif'}</div>
            <div>Template: {template.title}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LandingPageRouterProps {
  // Optional props for customization
}

export default function LandingPageRouter({}: LandingPageRouterProps) {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Extract LP ID from location since we're using explicit routes now
  const lpId = location && location.match(/\/LP-(\d+)/)?.[1] ? `LP-${location.match(/\/LP-(\d+)/)?.[1]}` : null;

  // Get available landing pages with fallback
  const { data: availableLPs = [], isLoading: loadingLPs, error: lpError } = useLandingPages();

  // Mock available LPs for development fallback
  const mockAvailableLPs = [
    { lp_id: 'LP-1', name: 'Landing Page 1', description: 'Template klasik', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-2', name: 'Landing Page 2', description: 'Template modern', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-3', name: 'Landing Page 3', description: 'Template elegan', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-4', name: 'Landing Page 4', description: 'Template dinamis', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-5', name: 'Landing Page 5', description: 'Template profesional', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-6', name: 'Landing Page 6', description: 'Template kreatif', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-7', name: 'Landing Page 7', description: 'Template responsif', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-8', name: 'Landing Page 8', description: 'Template interaktif', preview_url: '', folder_path: '', is_active: true },
    { lp_id: 'LP-9', name: 'Landing Page 9', description: 'Template premium', preview_url: '', folder_path: '', is_active: true },
  ];

  // Use real data if available, otherwise use mock data
  const effectiveAvailableLPs = availableLPs.length > 0 ? availableLPs : mockAvailableLPs;

  // Get current configuration with fallback
  const { data: config, isLoading: loadingConfig } = useLandingPageConfig();
  const mockConfig = { active_lp: 'LP-1', google_ads_link: '', tiktok_link: '', custom_links: {} };
  const effectiveConfig = config || mockConfig;

  // Validate LP ID
  useEffect(() => {
    if (loadingLPs || loadingConfig) return;

    setIsValidating(true);
    setValidationError(null);

    // Check if LP ID is provided
    if (!lpId) {
      setValidationError("Landing page ID tidak ditemukan dalam URL");
      setIsValidating(false);
      return;
    }

    // Check if LP ID is valid format
    if (!/^LP-\d+$/.test(lpId)) {
      setValidationError(`Format landing page tidak valid: ${lpId}`);
      setIsValidating(false);
      return;
    }

    // Check if LP exists in available LPs
    const lpExists = effectiveAvailableLPs.some(lp => lp.lp_id === lpId);
    if (!lpExists) {
      setValidationError(`Landing page ${lpId} tidak ditemukan atau tidak aktif`);
      setIsValidating(false);
      return;
    }

    // All LP IDs are valid for now (using dynamic component)

    setIsValidating(false);
  }, [lpId, effectiveAvailableLPs, loadingLPs, loadingConfig]);

  // Handle redirects
  useEffect(() => {
    if (!loadingConfig && !validationError && !isValidating) {
      // If no specific LP requested, redirect to active LP
      if (!lpId && effectiveConfig?.active_lp) {
        setLocation(`/LP-${effectiveConfig.active_lp.split('-')[1]}`, { replace: true });
        return;
      }
    }
  }, [lpId, effectiveConfig, validationError, isValidating, loadingConfig, setLocation]);

  // Loading state
  if (loadingLPs || loadingConfig || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Memuat Landing Page
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {loadingLPs ? "Memverifikasi landing page..." :
                   loadingConfig ? "Memuat konfigurasi..." :
                   "Menyiapkan halaman..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (validationError || lpError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-red-900">Landing Page Tidak Ditemukan</CardTitle>
            </div>
            <CardDescription>
              Terjadi kesalahan saat memuat landing page yang diminta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationError || lpError?.message || "Landing page tidak dapat diakses"}
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                onClick={() => setLocation("/")}
                className="flex-1"
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>

              {effectiveConfig?.active_lp && (
                <Button
                  onClick={() => setLocation(`/LP-${effectiveConfig.active_lp.split('-')[1]}`)}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  LP Aktif
                </Button>
              )}
            </div>

            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Debug Information
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                  <div>Requested LP: {lpId || 'null'}</div>
                  <div>Available LPs: {effectiveAvailableLPs.map(lp => lp.lp_id).join(', ')}</div>
                  <div>Active LP: {effectiveConfig?.active_lp || 'null'}</div>
                  <div>Error: {validationError || lpError?.message || 'none'}</div>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - render the landing page
  if (lpId) {
    return (
      <DynamicLandingPage
        lpId={lpId}
        config={effectiveConfig}
      />
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Terjadi kesalahan tak terduga. Silakan coba lagi.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}