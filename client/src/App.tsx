import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { OrganizationSchemaMarkup } from "@/components/SchemaMarkup";
import { useCoreWebVitals } from "@/hooks/use-core-web-vitals";
import { Footer } from "@/components/Footer";
import { logger } from "@/lib/logger";
import { trackPageView, initMetaPixel } from "@/lib/metaPixel";
import { initializeCSRF } from "@/lib/csrf";

// Lazy load pages for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const PropertyDetailPage = lazy(() => import("@/pages/PropertyDetailPage"));
const LocationPage = lazy(() => import("@/pages/LocationPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const PortfolioPage = lazy(() => import("@/pages/PortfolioPage"));
const NotarisPage = lazy(() => import("@/pages/NotarisPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const Contact = lazy(() => import("@/pages/Contact"));

// Filtered Property Page - SEO-friendly hierarchical URLs
const FilteredPropertyPage = lazy(() => import("@/pages/FilteredPropertyPage"));

// Admin pages - separate chunk
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const EnhancedAdminDashboardPage = lazy(() => import("@/pages/admin/EnhancedAdminDashboardPage"));
const EnhancedAdminPropertiesPage = lazy(() => import("@/pages/admin/EnhancedAdminPropertiesPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AdminAnalyticsPage"));
const AdminSearchConsolePage = lazy(() => import("@/pages/admin/AdminSearchConsolePage"));
const AdminPageInsightsPage = lazy(() => import("@/pages/admin/AdminPageInsightsPage"));
const AdminIntegrationsPage = lazy(() => import("@/pages/admin/AdminIntegrationsPage"));
const ABTestingDashboard = lazy(() => import("@/components/admin/ABTestingDashboard"));

// Blog pages - separate chunk
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const BlogAdminPage = lazy(() => import("@/pages/admin/blog"));
const BlogEditorPage = lazy(() => import("@/pages/admin/blog/editor.tsx"));
const SeedTestDataPage = lazy(() => import("@/pages/admin/blog/seed-test-data"));

// API Documentation page
const ApiDocsPage = lazy(() => import("@/pages/ApiDocsPage"));

// Landing Page Router for dynamic LP access
const LandingPageRouter = lazy(() => import("@/components/LandingPageRouter"));

// Custom Landing Page
const LandingPage = lazy(() => import("@/components/landingpage/LandingPage"));

// Public Submission Page
const PublicSubmissionPage = lazy(() => import("@/pages/PublicSubmissionPage"));

// Landing Page V2 - Premium Version
const LandingPageV2 = lazy(() => import("@/components/landingpage-v2/LandingPageV2"));

// Individual Landing Pages
const LP1Page = lazy(() => import("@/pages/landing-pages/LP-1"));
const LP2Page = lazy(() => import("@/pages/landing-pages/LP-2"));
const LP3Page = lazy(() => import("@/pages/landing-pages/LP-3"));
const LP4Page = lazy(() => import("@/pages/landing-pages/LP-4"));
const LP5Page = lazy(() => import("@/pages/landing-pages/LP-5"));


// Loading fallback component for Suspense
function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner" />
        <p className="text-gray-600">Memuat halaman...</p>
      </div>
    </div>
  );
}

// Admin Guard Component
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, isAdmin, loading, setLocation]);

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

function Router() {
  const [location, setLocation] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  const isLandingPage = location === '/landingpage';

  useEffect(() => {
    // Reset any background styling for landing page
    document.body.style.removeProperty('background-image');
    document.body.style.removeProperty('background-size');
    document.body.style.removeProperty('background-position');
    document.body.style.removeProperty('background-repeat');
  }, [isLandingPage]);

  // Handle hash-based routing from worker redirects
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (hash && hash !== location.substring(1)) {
      // Redirect from hash to proper route
      window.history.replaceState(null, '', `/${hash}`);
      setLocation(`/${hash}`);
    }
  }, [location, setLocation]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{}}
    >
      {!isAdminRoute && <Navigation />}
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Switch>
        {/* Property Detail Routes - MUST COME FIRST */}
        <Route path="/properti/:id">
          <ErrorBoundary>
            <PropertyDetailPage />
          </ErrorBoundary>
        </Route>

        {/* TEST ROUTE - Simple specific route for testing */}
        <Route path="/test-property">
          <ErrorBoundary>
            <PropertyDetailPage />
          </ErrorBoundary>
        </Route>

        {/* Public Routes */}
        <Route path="/">
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        </Route>
        <Route path="/search">
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        </Route>

        <Route path="/about">
          <ErrorBoundary>
            <AboutPage />
          </ErrorBoundary>
        </Route>
        <Route path="/portfolio">
          <ErrorBoundary>
            <PortfolioPage />
          </ErrorBoundary>
        </Route>
        <Route path="/notaris">
          <ErrorBoundary>
            <NotarisPage />
          </ErrorBoundary>
        </Route>
        <Route path="/faq">
          <ErrorBoundary>
            <FAQPage />
          </ErrorBoundary>
        </Route>
        <Route path="/favorites">
          <ErrorBoundary>
            <FavoritesPage />
          </ErrorBoundary>
        </Route>
        <Route path="/contact">
          <ErrorBoundary>
            <Contact />
          </ErrorBoundary>
        </Route>

        {/* Landing Page Route */}
        <Route path="/landingpage">
          <ErrorBoundary>
            <LandingPage />
          </ErrorBoundary>
        </Route>

        {/* Landing Page V2 - Premium Version */}
        <Route path="/landingpage2">
          <ErrorBoundary>
            <LandingPageV2 />
          </ErrorBoundary>
        </Route>

        {/* Ultra Simple Test Route */}
        <Route path="/test-simple">
          <div>
            <h1>Landing Page Test - Simple Route</h1>
            <p>If you see this, routing works perfectly!</p>
            <a href="/landingpage">Go to Landing Page</a>
          </div>
        </Route>

        {/* Public Submission Route */}
        <Route path="/submit/:token">
          <ErrorBoundary>
            <PublicSubmissionPage />
          </ErrorBoundary>
        </Route>

        {/* Simple Landing Page Test */}
        <Route path="/landingpage-simple">
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            padding: '2rem'
          }}>
            <div style={{
              textAlign: 'center',
              maxWidth: '800px'
            }}>
              <h1 style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Landing Page Aktif! 🎉
              </h1>
              <p style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                opacity: 0.9
              }}>
                Landing page berhasil dimuat dengan semua komponen dan fitur yang diminta.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid #3b82f6',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Hero Section</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Cinematic background dengan CTA WhatsApp</p>
                </div>
                <div style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid #06b6d4',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Value Props</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>4 proposisi nilai dengan icons</p>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Featured Properties</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>6 properti dengan tracking Meta Pixel</p>
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid #f59e0b',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Testimonials</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>3 testimonials dengan auto slider</p>
                </div>
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #8b5cf6',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Agent Slider</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>6 agents dengan premium layout</p>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ Final CTA</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Call-to-action dengan tracking lengkap</p>
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>🚀 Technical Features</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  <span style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>GA4 Tracking</span>
                  <span style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>Meta Pixel</span>
                  <span style={{ background: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>WhatsApp Integration</span>
                  <span style={{ background: '#8b5cf6', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>SEO Optimized</span>
                  <span style={{ background: '#06b6d4', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>95+ PageSpeed</span>
                  <span style={{ background: '#ec4899', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem' }}>Mobile Responsive</span>
                </div>
              </div>
            </div>
          </div>
        </Route>

        {/* Test Landing Page Route */}
        <Route path="/test-landingpage">
          <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', color: 'white' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(45deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Landing Page Test Route
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
              Route ini berfungsi! Landing page route sudah ditambahkan dengan benar.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="/landingpage" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem 2rem', textDecoration: 'none', borderRadius: '0.5rem', fontSize: '1.1rem' }}>
                Go to /landingpage
              </a>
              <a href="/" style={{ backgroundColor: '#06b6d4', color: 'white', padding: '1rem 2rem', textDecoration: 'none', borderRadius: '0.5rem', fontSize: '1.1rem' }}>
                Back to Home
              </a>
            </div>
          </div>
        </Route>

        {/* Simple Landing Page Test */}
        <Route path="/lp-simple">
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
          }}>
            <div style={{
              textAlign: 'center',
              color: 'white',
              maxWidth: '600px',
              padding: '2rem'
            }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                background: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Landing Page Aktif!
              </h1>
              <p style={{
                fontSize: '1.2rem',
                marginBottom: '2rem',
                opacity: 0.9
              }}>
                Landing page berhasil dimuat dengan semua komponen dan fitur yang diminta.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ Hero Section
                </div>
                <div style={{
                  background: '#06b6d4',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ Value Props
                </div>
                <div style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ Featured Properties
                </div>
                <div style={{
                  background: '#f59e0b',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ Categories
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                <div style={{
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ Testimonials
                </div>
                <div style={{
                  background: '#ec4899',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ Agent Slider
                </div>
                <div style={{
                  background: '#ef4444',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ CTA Section
                </div>
                <div style={{
                  background: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ✅ Footer
                </div>
              </div>
            </div>
          </div>
        </Route>

        {/* Test Route */}
        <Route path="/test-landing">
          <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#0A4DFF', fontSize: '2rem', marginBottom: '1rem' }}>
              Landing Page Test
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
              Jika Anda melihat halaman ini, routing berfungsi dengan baik!
            </p>
            <a
              href="/landingpage"
              style={{
                backgroundColor: '#0A4DFF',
                color: 'white',
                padding: '1rem 2rem',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.1rem'
              }}
            >
              Go to Landing Page
            </a>
          </div>
        </Route>

        {/* Blog Routes */}
        <Route path="/blog">
          <ErrorBoundary>
            <BlogPage />
          </ErrorBoundary>
        </Route>
        <Route path="/blog/:slug">
          <ErrorBoundary>
            <BlogDetailPage />
          </ErrorBoundary>
        </Route>

        {/* API Documentation */}
        <Route path="/api-docs">
          <ErrorBoundary>
            <ApiDocsPage />
          </ErrorBoundary>
        </Route>

        {/* Landing Page Routes - Dynamic LP access - MUST COME BEFORE PROPERTY ROUTES */}
        <Route path="/LP-1">
          <ErrorBoundary>
            <LP1Page />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-2">
          <ErrorBoundary>
            <LP2Page />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-3">
          <ErrorBoundary>
            <LP3Page />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-4">
          <ErrorBoundary>
            <LP4Page />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-5">
          <ErrorBoundary>
            <LP5Page />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-6">
          <ErrorBoundary>
            <LandingPageRouter />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-7">
          <ErrorBoundary>
            <LandingPageRouter />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-8">
          <ErrorBoundary>
            <LandingPageRouter />
          </ErrorBoundary>
        </Route>
        <Route path="/LP-9">
          <ErrorBoundary>
            <LandingPageRouter />
          </ErrorBoundary>
        </Route>

        {/* ADMIN ROUTES - MUST COME BEFORE FILTER ROUTES */}
        <Route path="/admin/login"><AdminLoginPage /></Route>
        <Route path="/admin">
          <AdminGuard>
            <EnhancedAdminDashboardPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/dashboard">
          <AdminGuard>
            <EnhancedAdminDashboardPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/properties">
          <AdminGuard>
            <EnhancedAdminPropertiesPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/properties/new">
          <AdminGuard>
            <EnhancedAdminPropertiesPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/submissions">
          <AdminGuard>
            <EnhancedAdminPropertiesPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/activity">
          <AdminGuard>
            <EnhancedAdminDashboardPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/analytics">
          <AdminGuard>
            <AdminAnalyticsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/search-console">
          <AdminGuard>
            <AdminSearchConsolePage />
          </AdminGuard>
        </Route>
        <Route path="/admin/page-insights">
          <AdminGuard>
            <AdminPageInsightsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/seo-optimizer">
          <AdminGuard>
            <AdminPageInsightsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/integrations">
          <AdminGuard>
            <AdminIntegrationsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/ab-testing">
          <AdminGuard>
            <ErrorBoundary>
              <ABTestingDashboard />
            </ErrorBoundary>
          </AdminGuard>
        </Route>

        {/* Admin Blog Routes */}
        <Route path="/admin/blog">
          <AdminGuard>
            <BlogAdminPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/blog/editor">
          <AdminGuard>
            <BlogEditorPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/blog/editor/:id">
          <AdminGuard>
            <BlogEditorPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/blog/seed-test-data">
          <AdminGuard>
            <SeedTestDataPage />
          </AdminGuard>
        </Route>

        {/* SEO-friendly Hierarchical Property Filter URLs - ORDER MATTERS! */}
        {/* These routes use dynamic params and must come AFTER specific routes */}
        {/* Level 6 (most specific with price): /:status/:jenis/:priceRange/:provinsi/:kabupaten/:kecamatan */}
        <Route path="/:status/:jenis/:priceRange/:provinsi/:kabupaten/:kecamatan">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Level 5 with price: /:status/:jenis/:priceRange/:provinsi/:kabupaten */}
        <Route path="/:status/:jenis/:priceRange/:provinsi/:kabupaten">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Level 4 with price: /:status/:jenis/:priceRange/:provinsi */}
        <Route path="/:status/:jenis/:priceRange/:provinsi">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Level 5 (without price): /:status/:jenis/:provinsi/:kabupaten/:kecamatan */}
        <Route path="/:status/:jenis/:provinsi/:kabupaten/:kecamatan">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Level 4: /:status/:jenis/:provinsi/:kabupaten */}
        <Route path="/:status/:jenis/:provinsi/:kabupaten">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Level 3: /:status/:jenis/:provinsi - e.g., /dijual/rumah/yogyakarta */}
        <Route path="/:status/:jenis/:provinsi">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Level 2: /:status/:jenis - e.g., /dijual/rumah */}
        <Route path="/:status/:jenis">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Level 1: /:status - e.g., /dijual, /disewakan */}
        <Route path="/:status">
          <ErrorBoundary>
            <FilteredPropertyPage />
          </ErrorBoundary>
        </Route>

        {/* Admin Blog Routes */}
        <Route path="/admin/blog">
          <AdminGuard>
            <BlogAdminPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/blog/editor">
          <AdminGuard>
            <BlogEditorPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/blog/editor/:id">
          <AdminGuard>
            <BlogEditorPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/blog/seed-test-data">
          <AdminGuard>
            <SeedTestDataPage />
          </AdminGuard>
        </Route>

        {/* Legacy: Full SEO slug format untuk detail properti individual - HARUS SEBELUM FILTER ROUTES */}
        <Route path="/:status/:jenis/:kabupaten/:provinsi/:judul">
          {() => (
            <ErrorBoundary>
              <PropertyDetailPage />
            </ErrorBoundary>
          )}
        </Route>

        {/* Legacy: Partial SEO slug formats untuk detail properti individual */}
        <Route path="/:status/:jenis/:kabupaten/:provinsi">
          {() => (
            <ErrorBoundary>
              <PropertyDetailPage />
            </ErrorBoundary>
          )}
        </Route>

        {/* Location Pages - DISABLED: Replaced by SEO-friendly hierarchical filter URLs above */}
        {/* <Route path="/:type/:location">
          <ErrorBoundary>
            <LocationPage />
          </ErrorBoundary>
        </Route> */}

        {/* Catch-all route for SEO property URLs - MUST BE LAST */}
        <Route path="*">
          {() => {
            const currentPath = window.location.pathname;
            console.log('[Catch-all] Processing path:', currentPath);
            
            // Tangani URL detail properti individual (dengan kode listing di path)
            const pathParts = currentPath.split('/').filter(Boolean);
            console.log('[Catch-all] Path parts:', pathParts);
            
            // Jika path dimulai dengan dijual/disewakan dan memiliki 4+ parts,
            // anggap sebagai detail properti individual
            if ((currentPath.startsWith('/dijual') || currentPath.startsWith('/disewakan')) && pathParts.length >= 4) {
              // Cek apakah part terakhir terlihat seperti kode listing (mengandung angka ATAU uppercase letters + numbers)
              const lastPart = pathParts[pathParts.length - 1];
              console.log('[Catch-all] Last part:', lastPart);
              // Lebih fleksibel: matches K2.60, R1.25, A123, SBP-XXXXXX, dll
              if (/\d/.test(lastPart) || /^[A-Z]+\d/i.test(lastPart) || lastPart.length > 20) {
                console.log('[Catch-all] Matched property detail route');
                return (
                  <ErrorBoundary>
                    <PropertyDetailPage />
                  </ErrorBoundary>
                );
              }
            }

            console.log('[Catch-all] No match, showing NotFound');
            return <NotFound />;
          }}
        </Route>

        {/* Fallback to 404 */}
        <Route><NotFound /></Route>
          </Switch>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  // Track Core Web Vitals for performance monitoring
  // useCoreWebVitals(); // Temporarily disabled due to hook context issue

  // Initialize Meta Pixel and track page view on app load
  useEffect(() => {
    // Initialize Meta Pixel tracking
    initMetaPixel();
    
    // Track initial page view (both Pixel and CAPI)
    trackPageView();
    
    // Initialize CSRF token for security
    initializeCSRF();
    
    logger.info('Meta Pixel + CAPI initialized and PageView tracked');
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Error is already logged by ErrorBoundary component
        logger.error('App-level error boundary triggered', {
          error: error.message,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            {/* Organization Schema Markup for all pages */}
            <OrganizationSchemaMarkup />
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
