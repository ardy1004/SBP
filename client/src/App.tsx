import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminPropertiesPage from "@/pages/admin/AdminPropertiesPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminIntegrationsPage from "@/pages/admin/AdminIntegrationsPage";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/:status-:type-:location" component={PropertyDetailPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/notaris" component={NotarisPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/favorites" component={FavoritesPage} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/properties" component={AdminPropertiesPage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/admin/integrations" component={AdminIntegrationsPage} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!isAdminRoute && <Navigation />}
        <Router />
        {!isAdminRoute && <Footer />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
