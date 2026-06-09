import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import NotFound from "@/pages/not-found";
import PropertyDetail from "@/pages/PropertyDetail";
import Contact from "@/pages/Contact";
import { CategoryPage } from "@/pages/CategoryPage";
import { AuthProvider, useAuth } from "@/admin/context/AuthContext";
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminProperties from "@/admin/pages/AdminProperties";
import AdminPropertyForm from "@/admin/pages/AdminPropertyForm";
import AdminPropertiesAll from "@/admin/pages/AdminPropertiesAll";
import AdminPropertiesSold from "@/admin/pages/AdminPropertiesSold";
import AdminSubmissions from "@/admin/pages/AdminSubmissions";
import AdminContracts from "@/admin/pages/AdminContracts";
import AdminContractsNew from "@/admin/pages/AdminContractsNew";
import AdminLeads from "@/admin/pages/AdminLeads";
import AdminAnalytics from "@/admin/pages/AdminAnalytics";
import AdminSettings from "@/admin/pages/AdminSettings";
import ImportCsv from "@/admin/pages/ImportCsv";
import ImportHistory from "@/admin/pages/ImportHistory";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/admin/login" />;
  return <Component />;
}

// Parse route: {propertyType}-dijual-{location}
// Contoh: rumah-dijual-sleman → { propertyType: "rumah", location: "sleman" }
function CategoryRoute({ params }: { params: { slug: string } }) {
  const slug = params.slug || "";
  const parts = slug.split("-dijual-");
  
  if (parts.length !== 2) {
    return <NotFound />;
  }

  const propertyType = parts[0];
  const location = parts[1];

  return <CategoryPage propertyType={propertyType} location={location} />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properti" component={Properties} />
      <Route path="/properti/:param1" component={Properties} />
      <Route path="/properti/:param1/:param2" component={Properties} />
      <Route path="/property/:slug" component={PropertyDetail} />
      <Route path="/contact" component={Contact} />

      {/* Admin */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path="/admin/properties/add" component={() => <ProtectedRoute component={AdminPropertyForm} />} />
      <Route path="/admin/properties/edit/:id" component={() => <ProtectedRoute component={AdminPropertyForm} />} />
      <Route path="/admin/properties/all" component={() => <ProtectedRoute component={AdminPropertiesAll} />} />
      <Route path="/admin/properties/sold" component={() => <ProtectedRoute component={AdminPropertiesSold} />} />
      <Route path="/admin/properties" component={() => <ProtectedRoute component={AdminProperties} />} />
      <Route path="/admin/submissions" component={() => <ProtectedRoute component={AdminSubmissions} />} />
      <Route path="/admin/contracts/new" component={() => <ProtectedRoute component={AdminContractsNew} />} />
      <Route path="/admin/contracts" component={() => <ProtectedRoute component={AdminContracts} />} />
      <Route path="/admin/leads" component={() => <ProtectedRoute component={AdminLeads} />} />
      <Route path="/admin/analytics" component={() => <ProtectedRoute component={AdminAnalytics} />} />
      <Route path="/admin/settings" component={() => <ProtectedRoute component={AdminSettings} />} />
      <Route path="/admin/import-csv" component={() => <ProtectedRoute component={ImportCsv} />} />
      <Route path="/admin/import-history" component={() => <ProtectedRoute component={ImportHistory} />} />
      <Route path="/admin" component={() => <Redirect to="/admin/dashboard" />} />

       {/* Programmatic SEO Pages: {propertyType}-dijual-{location} */}
       {/* Pattern: :slug captures everything; CategoryRoute parses it */}
       <Route path="/:slug" component={CategoryRoute} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
