import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { OrganizationSchemaMarkup } from "@/components/SchemaMarkup";
import { useCoreWebVitals } from "@/hooks/use-core-web-vitals";
import { Footer } from "@/components/Footer";
// import { ChatWidget } from "@/components/ChatWidget"; // Temporarily disabled

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

// Admin pages - separate chunk
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminPropertiesPage = lazy(() => import("@/pages/admin/AdminPropertiesPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AdminAnalyticsPage"));
const AdminSearchConsolePage = lazy(() => import("@/pages/admin/AdminSearchConsolePage"));
const AdminPageInsightsPage = lazy(() => import("@/pages/admin/AdminPageInsightsPage"));
const AdminIntegrationsPage = lazy(() => import("@/pages/admin/AdminIntegrationsPage"));

// Loading fallback component for Suspense
function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-600">Memuat halaman...</p>
      </div>
    </div>
  );
}

function Router() {
  const [location, setLocation] = useLocation();

  console.log('🛣️ Router Component Rendered');
  console.log('📍 Router location:', location);
  console.log('🔍 Checking routes for:', location);

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

        {/* SEO-friendly Property URLs - Handle property detail slugs */}
        <Route path="/dijual">
          {() => {
            console.log('🟢 Matched /dijual route');
            return (
              <ErrorBoundary>
                <PropertyDetailPage />
              </ErrorBoundary>
            );
          }}
        </Route>

        <Route path="/disewakan">
          {() => {
            console.log('🟢 Matched /disewakan route');
            return (
              <ErrorBoundary>
                <PropertyDetailPage />
              </ErrorBoundary>
            );
          }}
        </Route>

        {/* Full SEO slug format: /{status}/{jenis}/{kabupaten}/{provinsi}/{judul} */}
        <Route path="/:status/:jenis/:kabupaten/:provinsi/:judul">
          {() => {
            console.log('🟢 Matched full SEO slug route');
            return (
              <ErrorBoundary>
                <PropertyDetailPage />
              </ErrorBoundary>
            );
          }}
        </Route>

        {/* Partial SEO slug formats for flexibility */}
        <Route path="/:status/:jenis/:kabupaten/:provinsi">
          {() => {
            console.log('🟢 Matched partial SEO slug route (no title)');
            return (
              <ErrorBoundary>
                <PropertyDetailPage />
              </ErrorBoundary>
            );
          }}
        </Route>

        {/* Admin Routes - MUST COME BEFORE LOCATION ROUTES */}
        <Route path="/admin/login"><AdminLoginPage /></Route>
        <Route path="/admin/dashboard"><AdminDashboardPage /></Route>
        <Route path="/admin/properties"><AdminPropertiesPage /></Route>
        <Route path="/admin/analytics"><AdminAnalyticsPage /></Route>
        <Route path="/admin/search-console"><AdminSearchConsolePage /></Route>
        <Route path="/admin/page-insights"><AdminPageInsightsPage /></Route>
        <Route path="/admin/integrations"><AdminIntegrationsPage /></Route>

        {/* Location Pages - only for specific patterns */}
        <Route path="/:type/:location">
          <ErrorBoundary>
            <LocationPage />
          </ErrorBoundary>
        </Route>

        {/* Catch-all route for SEO property URLs - MUST BE LAST */}
        <Route path="*">
          {() => {
            const currentPath = window.location.pathname;
            console.log('🔄 Catch-all route triggered for:', currentPath);

            if (currentPath.startsWith('/dijual') || currentPath.startsWith('/disewakan')) {
              console.log('🟢 Property URL detected, loading PropertyDetailPage');
              return (
                <ErrorBoundary>
                  <PropertyDetailPage />
                </ErrorBoundary>
              );
            }

            console.log('🔴 Not a property URL, showing 404');
            return <NotFound />;
          }}
        </Route>

        {/* Fallback to 404 */}
        <Route><NotFound /></Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // Track Core Web Vitals for performance monitoring
  useCoreWebVitals();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error('App Error:', error, errorInfo);

        // In production, you could send to error reporting service
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            {/* Organization Schema Markup for all pages */}
            <OrganizationSchemaMarkup />
            {!isAdminRoute && <Navigation />}
            <Router />
            {!isAdminRoute && <Footer />}
            {/* {!isAdminRoute && <ChatWidget />} // Temporarily disabled */}
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
