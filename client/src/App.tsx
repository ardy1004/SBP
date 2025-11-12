import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/"><HomePage /></Route>
      <Route path="/about"><AboutPage /></Route>
      <Route path="/portfolio"><PortfolioPage /></Route>
      <Route path="/notaris"><NotarisPage /></Route>
      <Route path="/faq"><FAQPage /></Route>
      <Route path="/favorites"><FavoritesPage /></Route>
      <Route path="/contact"><Contact /></Route>
      <Route path="/:status-:type-:location"><PropertyDetailPage /></Route>

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {!isAdminRoute && <Navigation />}
          <Router />
          {!isAdminRoute && <Footer />}
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
