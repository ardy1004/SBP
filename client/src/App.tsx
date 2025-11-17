import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
// import { ChatWidget } from "@/components/ChatWidget"; // Temporarily disabled
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import AboutPage from "@/pages/AboutPage";
import PortfolioPage from "@/pages/PortfolioPage";
import NotarisPage from "@/pages/NotarisPage";
import FAQPage from "@/pages/FAQPage";
import FavoritesPage from "@/pages/FavoritesPage";
import Contact from "@/pages/Contact";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminPropertiesPage from "@/pages/admin/AdminPropertiesPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminIntegrationsPage from "@/pages/admin/AdminIntegrationsPage";

function Router() {
  const [location, setLocation] = useLocation();

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
    <Switch>
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
      <Route path="/properti/:id">
        <ErrorBoundary>
          <PropertyDetailPage />
        </ErrorBoundary>
      </Route>
      <Route path="/:slug*">
        <ErrorBoundary>
          <PropertyDetailPage />
        </ErrorBoundary>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login"><AdminLoginPage /></Route>
      <Route path="/admin/dashboard"><AdminDashboardPage /></Route>
      <Route path="/admin/properties"><AdminPropertiesPage /></Route>
      <Route path="/admin/analytics"><AdminAnalyticsPage /></Route>
      <Route path="/admin/integrations"><AdminIntegrationsPage /></Route>

      {/* Fallback to 404 */}
      <Route><NotFound /></Route>
    </Switch>
  );
}

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

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
