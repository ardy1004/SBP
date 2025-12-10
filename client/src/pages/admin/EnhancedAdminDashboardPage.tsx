import { useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RealTimeDashboard } from "@/components/admin/RealTimeDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

export default function EnhancedAdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { isAdmin, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not admin
  if (!loading && !isAdmin) {
    setLocation('/admin/login');
    return null;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality across dashboard
    console.log('Searching dashboard for:', query);
  };

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Real-time overview of your property business"
      showSearch={true}
      onSearch={handleSearch}
      notifications={3} // Mock notification count
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RealTimeDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Report Cards */}
            <div className="col-span-full">
              <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium">Monthly Performance</h4>
                  <p className="text-sm text-muted-foreground">Revenue, views, and conversion metrics</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium">Property Analytics</h4>
                  <p className="text-sm text-muted-foreground">Most viewed and highest converting properties</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium">Lead Analysis</h4>
                  <p className="text-sm text-muted-foreground">Lead sources and conversion rates</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium">SEO Performance</h4>
                  <p className="text-sm text-muted-foreground">Search rankings and organic traffic</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium">Market Trends</h4>
                  <p className="text-sm text-muted-foreground">Property market analysis and trends</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium">Custom Report</h4>
                  <p className="text-sm text-muted-foreground">Build your own custom analytics report</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}