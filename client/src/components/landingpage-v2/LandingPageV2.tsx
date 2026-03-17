import { lazy, Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { MessageCircle } from 'lucide-react';
import { initTracking } from '@/utils/tracking';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Lazy load premium components for optimal performance
const HeroV2 = lazy(() => import('./HeroV2'));
const ValuePropsV2 = lazy(() => import('./ValuePropsV2'));
const PortfolioGalleryV2 = lazy(() => import('./PortfolioGalleryV2'));
const TestimonialsV2 = lazy(() => import('./TestimonialsV2'));
const CTAV2 = lazy(() => import('./CTAV2'));

// Premium loading fallback dengan animasi lebih smooth
function PremiumLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="text-center relative z-10">
        {/* Enhanced spinner dengan multiple rings */}
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-amber-400 border-r-amber-400 mx-auto"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 border-r-blue-400 mx-auto absolute top-2 left-1/2 transform -translate-x-1/2" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-400 border-r-purple-400 mx-auto absolute top-4 left-1/2 transform -translate-x-1/2" style={{ animationDuration: '2s' }}></div>
        </div>
        
        <h2 className="text-white text-2xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
          Loading Premium Experience
        </h2>
        <p className="text-blue-100 text-lg mb-1">Preparing your exclusive property journey</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}

// Error fallback for premium components
const PremiumComponentErrorFallback = () => (
  <div className="py-12 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl mx-4">
    <div className="text-red-600 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <p className="text-gray-700 font-medium">Premium component loading...</p>
    <p className="text-gray-500 text-sm mt-1">Please refresh if this persists</p>
  </div>
);

export default function LandingPageV2() {
  useEffect(() => {
    initTracking();
  }, []);

  return (
    <>
      {/* Premium SEO Meta Tags */}
      <Helmet>
        <title>Premium Properties Yogyakarta - Luxury Real Estate Experience | Salam Bumi Property</title>
        <meta name="description" content="Discover exclusive premium properties in Yogyakarta. Luxury homes, villas, and commercial spaces with VIP concierge service. 500+ verified properties, 98% client satisfaction." />
        <meta name="keywords" content="premium properties yogyakarta, luxury real estate, exclusive villas, high-end homes, commercial spaces jogja, property investment" />

        {/* Premium Open Graph */}
        <meta property="og:title" content="Premium Properties Yogyakarta - Luxury Real Estate Experience" />
        <meta property="og:description" content="Discover exclusive premium properties in Yogyakarta with VIP concierge service and 98% client satisfaction." />
        <meta property="og:image" content="/lp-previews/LP-2.jpg" />
        <meta property="og:url" content="https://salambumiproperty.com/landingpage2" />
        <meta property="og:type" content="website" />

        {/* Premium Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium Properties Yogyakarta - Luxury Real Estate Experience" />
        <meta name="twitter:description" content="Discover exclusive premium properties in Yogyakarta with VIP concierge service." />
        <meta name="twitter:image" content="/lp-previews/LP-2.jpg" />

        {/* Enhanced Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Salam Bumi Property - Premium Division",
            "description": "Luxury real estate specialist in Yogyakarta offering premium properties with VIP service",
            "url": "https://salambumiproperty.com/landingpage2",
            "telephone": "+62-812-3456-7890",
            "email": "premium@salambumiproperty.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Jl. Malioboro No. 123",
              "addressLocality": "Yogyakarta",
              "addressRegion": "DIY",
              "postalCode": "55271",
              "addressCountry": "ID"
            },
            "areaServed": {
              "@type": "City",
              "name": "Yogyakarta"
            },
            "serviceType": ["Luxury Real Estate", "Premium Property Consulting", "VIP Property Investment"],
            "priceRange": "$$$$",
            "paymentAccepted": ["Cash", "Bank Transfer", "Mortgage"],
            "currenciesAccepted": "IDR"
          })}
        </script>
      </Helmet>

      {/* Premium Landing Page Container */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Suspense fallback={<PremiumLoadingFallback />}>
          <HeroV2 />
        </Suspense>

        <Suspense fallback={<PremiumLoadingFallback />}>
          <ValuePropsV2 />
        </Suspense>

        <ErrorBoundary fallback={<PremiumComponentErrorFallback />}>
          <Suspense fallback={<PremiumLoadingFallback />}>
            <PortfolioGalleryV2 />
          </Suspense>
        </ErrorBoundary>

        <Suspense fallback={<PremiumLoadingFallback />}>
          <TestimonialsV2 />
        </Suspense>

        <Suspense fallback={<PremiumLoadingFallback />}>
          <CTAV2 />
        </Suspense>
      </div>

      {/* Premium Sticky WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <a
          href="https://wa.me/6281391278889?text=Halo,%20saya%20ingin%20konsultasi%20properti%20premium"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group-hover:shadow-green-500/50 flex items-center justify-center border-2 border-white"
          aria-label="Chat WhatsApp untuk konsultasi premium"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Hubungi Kami
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </div>
    </>
  );
}