import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Home, FileText, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      setLocation('/admin/login');
    }
  }, [isAdmin, loading, setLocation]);

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      console.log('Fetching dashboard stats from Supabase...');

      // Total Properties
      const { count: totalProperties, error: totalError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Error fetching total properties:', totalError);
      }

      // Active Properties (not sold)
      const { count: activeProperties, error: activeError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .neq('is_sold', true);

      if (activeError) {
        console.error('Error fetching active properties:', activeError);
      }

      // Total Views from analytics_events
      const { count: totalViews, error: viewsError } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'property_view');

      if (viewsError) {
        console.error('Error fetching total views:', viewsError);
      }

      // Total Inquiries
      const { count: totalInquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true });

      if (inquiriesError) {
        console.error('Error fetching total inquiries:', inquiriesError);
      }

      const result = {
        totalProperties: totalProperties || 0,
        activeProperties: activeProperties || 0,
        totalViews: totalViews || 0,
        totalInquiries: totalInquiries || 0,
      };

      console.log('Dashboard stats result:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const statCards = [
    {
      title: "Total Properti",
      value: stats?.totalProperties || 0,
      icon: Home,
      color: "text-blue-600",
    },
    {
      title: "Properti Aktif",
      value: stats?.activeProperties || 0,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Total Views",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-purple-600",
    },
    {
      title: "Inquiries",
      value: stats?.totalInquiries || 0,
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview properti dan statistik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Analytics Dashboard */}
          <div className="mt-8">
            <AnalyticsDashboard />
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Selamat Datang di Admin Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-body">
                  Gunakan menu di sebelah kiri untuk mengelola properti, melihat analytics, dan mengatur integrasi.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
