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
const EnhancedAdminDashboardPage = lazy(() => import("@/pages/admin/EnhancedAdminDashboardPage"));
const EnhancedAdminPropertiesPage = lazy(() => import("@/pages/admin/EnhancedAdminPropertiesPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AdminAnalyticsPage"));
const AdminSearchConsolePage = lazy(() => import("@/pages/admin/AdminSearchConsolePage"));
const AdminPageInsightsPage = lazy(() => import("@/pages/admin/AdminPageInsightsPage"));
const AdminIntegrationsPage = lazy(() => import("@/pages/admin/AdminIntegrationsPage"));
const AdminLeadsPage = lazy(() => import("@/pages/admin/AdminLeadsPage"));

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
    <div className="min-h-screen flex flex-col">
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
          {() => (
            <ErrorBoundary>
              <PropertyDetailPage />
            </ErrorBoundary>
          )}
        </Route>

        <Route path="/disewakan">
          {() => (
            <ErrorBoundary>
              <PropertyDetailPage />
            </ErrorBoundary>
          )}
        </Route>

        {/* Full SEO slug format: /{status}/{jenis}/{kabupaten}/{provinsi}/{judul} */}
        <Route path="/:status/:jenis/:kabupaten/:provinsi/:judul">
          {() => (
            <ErrorBoundary>
              <PropertyDetailPage />
            </ErrorBoundary>
          )}
        </Route>

        {/* Partial SEO slug formats for flexibility */}
        <Route path="/:status/:jenis/:kabupaten/:provinsi">
          {() => (
            <ErrorBoundary>
              <PropertyDetailPage />
            </ErrorBoundary>
          )}
        </Route>

        {/* Admin Routes - MUST COME BEFORE LOCATION ROUTES */}
        <Route path="/admin/login"><AdminLoginPage /></Route>
        <Route path="/admin/dashboard">
          <AdminGuard>
            <EnhancedAdminDashboardPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/properties/:tab?">
          <AdminGuard>
            <EnhancedAdminPropertiesPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/properties/add">
          <AdminGuard>
            <EnhancedAdminPropertiesPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/properties/categories">
          <AdminGuard>
            <EnhancedAdminPropertiesPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/properties/templates">
          <AdminGuard>
            <EnhancedAdminPropertiesPage />
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
        <Route path="/admin/leads">
          <AdminGuard>
            <AdminLeadsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/leads/scoring">
          <AdminGuard>
            <AdminLeadsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/leads/followup">
          <AdminGuard>
            <AdminLeadsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/leads/analytics">
          <AdminGuard>
            <AdminLeadsPage />
          </AdminGuard>
        </Route>
        <Route path="/admin/activity">
          <AdminGuard>
            <EnhancedAdminDashboardPage />
          </AdminGuard>
        </Route>

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

            if (currentPath.startsWith('/dijual') || currentPath.startsWith('/disewakan')) {
              return (
                <ErrorBoundary>
                  <PropertyDetailPage />
                </ErrorBoundary>
              );
            }

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
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
