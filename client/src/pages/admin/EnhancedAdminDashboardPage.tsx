import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { AdminRootLayout } from "@/components/admin/layouts";
import { ShareLinkGenerator } from "@/components/admin/ShareLinkGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  FileText,
  Calendar,
  Link2
} from "lucide-react";

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  pendingApproval: number;
  totalInquiries: number;
}

interface RecentActivity {
  id: string;
  type: 'property_created' | 'inquiry' | 'submission';
  message: string;
  timestamp: string;
}

export default function EnhancedAdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { isAdmin, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    pendingApproval: 0,
    totalInquiries: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      setLocation('/admin/login');
    }
  }, [isAdmin, loading, setLocation]);

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoadingData(true);
    try {
      // Fetch all stats in parallel for better performance
      const [totalPropertiesRes, activeListingsRes, pendingApprovalRes, inquiriesRes] = await Promise.all([
        // Get total properties
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        // Get active listings (for sale)
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'dijual').eq('is_sold', false),
        // Get pending approval from properties with is_pending_approval
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_pending_approval', true),
        // Get total inquiries (if table exists)
        supabase.from('inquiries').select('*', { count: 'exact', head: true })
      ]);

      const totalProperties = totalPropertiesRes.count || 0;
      const activeListings = activeListingsRes.count || 0;
      const pendingApproval = pendingApprovalRes.count || 0;
      const totalInquiries = inquiriesRes.count || 0;

      setStats({
        totalProperties,
        activeListings,
        pendingApproval,
        totalInquiries
      });

      // Fetch recent activity
      await fetchRecentActivity();

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent properties
      const { data: recentProperties } = await supabase
        .from('properties')
        .select('id, judul_properti, created_at, submission_source')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      // Add property activities
      recentProperties?.forEach(prop => {
        activities.push({
          id: `prop-${prop.id}`,
          type: prop.submission_source === 'sharelink' ? 'submission' : 'property_created',
          message: prop.submission_source === 'sharelink' 
            ? `Properti baru melalui sharelink: ${prop.judul_properti || 'Tanpa judul'}`
            : `Properti ditambahkan: ${prop.judul_properti || 'Tanpa judul'}`,
          timestamp: prop.created_at
        });
      });

      // Get recent inquiries
      const { data: recentInquiries } = await supabase
        .from('inquiries')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      recentInquiries?.forEach(inq => {
        activities.push({
          id: `inq-${inq.id}`,
          type: 'inquiry',
          message: `Inquiry baru dari: ${inq.name}`,
          timestamp: inq.created_at
        });
      });

      // Sort by timestamp and take latest 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}d yang lalu`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}j yang lalu`;
    return `${Math.floor(diffInSeconds / 86400)}h yang lalu`;
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'property_created': return Building2;
      case 'submission': return FileText;
      case 'inquiry': return Users;
      default: return Clock;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'property_created': return 'text-blue-500 bg-blue-50';
      case 'submission': return 'text-orange-500 bg-orange-50';
      case 'inquiry': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (loading || isLoadingData) {
    return (
      <AdminRootLayout
        title="Dashboard"
        subtitle="Memuat data..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminRootLayout>
    );
  }

  return (
    <AdminRootLayout
      title="Dashboard"
      subtitle="Ringkasan bisnis properti Anda"
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          <TabsTrigger value="sharelink">ShareLink</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Properti
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  Total listing di sistem
                </p>
              </CardContent>
            </Card>

            {/* Active Listings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Listing Aktif
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeListings}</div>
                <p className="text-xs text-muted-foreground">
                  Properti sedang dijual
                </p>
              </CardContent>
            </Card>

            {/* Pending Approval */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Menunggu Persetujuan
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApproval}</div>
                <p className="text-xs text-muted-foreground">
                  Submission dari sharelink
                </p>
              </CardContent>
            </Card>

            {/* Total Inquiries */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Inquiry
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInquiries}</div>
                <p className="text-xs text-muted-foreground">
                  Semua inquiry masuk
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation('/admin/submissions')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Kelola Submission</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingApproval > 0 
                    ? `${stats.pendingApproval} properti menunggu persetujuan`
                    : 'Lihat submission masuk'
                  }
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation('/admin/leads')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Lihat Leads</h3>
                <p className="text-sm text-muted-foreground">Kelola inquiry masuk</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Belum ada aktivitas terbaru</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharelink">
          <ShareLinkGenerator />
        </TabsContent>
      </Tabs>
    </AdminRootLayout>
  );
}
