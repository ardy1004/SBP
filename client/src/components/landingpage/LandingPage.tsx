import { lazy, Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { MessageCircle } from 'lucide-react';
import { initTracking } from '@/utils/tracking';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Lazy load components for better performance
const Hero = lazy(() => import('../landingpage-v2/HeroV2Optimized'));
const ValueProps = lazy(() => import('./ValueProps'));
const TrustBadges = lazy(() => import('./TrustBadges'));
const FeaturedProperties = lazy(() => import('./FeaturedProperties'));
const TestimonialSlider = lazy(() => import('./TestimonialSlider'));
const AgentSlider = lazy(() => import('./AgentSlider'));
const CTA = lazy(() => import('./CTA'));

// Error fallback for individual components
const ComponentErrorFallback = () => (
  <div className="py-8 text-center">
    <p className="text-gray-500">Komponen sedang dimuat...</p>
  </div>
);

// Loading fallback
function SectionLoadingFallback() {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-gray-600 mt-4">Memuat konten...</p>
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => {
    initTracking();
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Properti Premium Yogyakarta - Salam Bumi Property</title>
        <meta name="description" content="Temukan properti premium di Yogyakarta. Rumah, villa, kost, tanah & investasi komersial dengan layanan terpercaya." />
        <meta name="keywords" content="properti yogyakarta, rumah dijual, villa yogyakarta, tanah kavling, kost yogyakarta" />

        {/* Open Graph */}
        <meta property="og:title" content="Properti Premium Yogyakarta - Salam Bumi Property" />
        <meta property="og:description" content="Temukan properti premium di Yogyakarta dengan layanan agen properti terpercaya." />
        <meta property="og:image" content="/lp-previews/LP-1.jpg" />
        <meta property="og:url" content="https://salambumiproperty.com/landingpage" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Properti Premium Yogyakarta - Salam Bumi Property" />
        <meta name="twitter:description" content="Temukan properti premium di Yogyakarta dengan layanan agen properti terpercaya." />
        <meta name="twitter:image" content="/lp-previews/LP-1.jpg" />

        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Salam Bumi Property",
            "description": "Agen properti terpercaya di Yogyakarta spesialis properti premium",
            "url": "https://salambumiproperty.com",
            "telephone": "+62-812-3456-7890",
            "email": "info@salambumiproperty.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Jl. Malioboro",
              "addressLocality": "Yogyakarta",
              "addressRegion": "DIY",
              "postalCode": "55271",
              "addressCountry": "ID"
            },
            "areaServed": {
              "@type": "City",
              "name": "Yogyakarta"
            },
            "serviceType": ["Real Estate Sales", "Property Consulting", "Property Investment"]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Salam Bumi Property",
            "image": "/lp-previews/LP-1.jpg",
            "telephone": "+62-812-3456-7890",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Jl. Malioboro",
              "addressLocality": "Yogyakarta",
              "addressRegion": "DIY",
              "postalCode": "55271",
              "addressCountry": "ID"
            },
            "url": "https://salambumiproperty.com/landingpage",
            "sameAs": [
              "https://www.facebook.com/salambumiproperty",
              "https://www.instagram.com/salambumiproperty"
            ]
          })}
        </script>
      </Helmet>

      {/* Main Content */}
      <div className="min-h-screen">
        <Suspense fallback={<SectionLoadingFallback />}>
          <Hero />
        </Suspense>

        <Suspense fallback={<SectionLoadingFallback />}>
          <TrustBadges />
        </Suspense>

        <Suspense fallback={<SectionLoadingFallback />}>
          <ValueProps />
        </Suspense>

        <ErrorBoundary fallback={<ComponentErrorFallback />}>
          <Suspense fallback={<SectionLoadingFallback />}>
            <FeaturedProperties />
          </Suspense>
        </ErrorBoundary>

        <Suspense fallback={<SectionLoadingFallback />}>
          <TestimonialSlider />
        </Suspense>

        <Suspense fallback={<SectionLoadingFallback />}>
          <AgentSlider />
        </Suspense>

        <Suspense fallback={<SectionLoadingFallback />}>
          <CTA />
        </Suspense>
      </div>

      {/* Sticky WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/6281391278889?text=Halo,%20saya%20ingin%20konsultasi%20properti"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </>
  );
}