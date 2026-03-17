import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRootLayout } from "@/components/admin/layouts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7D");
  const { toast } = useToast();

  const { data: analytics, refetch } = useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: async () => {
      console.log('Fetching analytics data for time range:', timeRange);

      // Calculate date range based on timeRange
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case '1D':
          startDate.setDate(now.getDate() - 1);
          break;
        case '3D':
          startDate.setDate(now.getDate() - 3);
          break;
        case '7D':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 7); // Default to 7 days
      }

      console.log('Date range:', startDate.toISOString(), 'to', now.toISOString());

      // Get analytics events within date range
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (eventsError) {
        console.error('Error fetching analytics events:', eventsError);
      }

      // Get inquiries within date range
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (inquiriesError) {
        console.error('Error fetching inquiries:', inquiriesError);
      }

      // Calculate metrics
      const totalViews = eventsData?.filter(event => event.event_type === 'property_view').length || 0;
      const totalInquiries = inquiriesData?.length || 0;

      // For searches, we might need to add search events to analytics_events table
      // For now, we'll set it to 0 or implement based on available data
      const totalSearches = eventsData?.filter(event => event.event_type === 'search').length || 0;

      // Get top properties by views
      const propertyViews = new Map();
      eventsData?.filter(event => event.event_type === 'property_view' && event.property_id).forEach(event => {
        const propertyId = event.property_id;
        propertyViews.set(propertyId, (propertyViews.get(propertyId) || 0) + 1);
      });

      // Get property details for top properties
      const topPropertiesPromises = Array.from(propertyViews.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(async ([propertyId, views]) => {
          const { data: property } = await supabase
            .from('properties')
            .select('kode_listing, jenis_properti')
            .eq('id', propertyId)
            .single();

          return property ? {
            kodeListing: property.kode_listing,
            jenisProperti: property.jenis_properti,
            views
          } : null;
        });

      const topProperties = (await Promise.all(topPropertiesPromises)).filter(Boolean);

      const result = {
        totalViews,
        totalInquiries,
        totalSearches,
        topProperties,
        timeRange
      };

      console.log('Analytics result:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleExportCSV = async () => {
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case '1D':
          startDate.setDate(now.getDate() - 1);
          break;
        case '3D':
          startDate.setDate(now.getDate() - 3);
          break;
        case '7D':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Get data for export
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      // Generate CSV content
      const csvHeaders = ['Date', 'Event Type', 'Property ID', 'Details'];
      const csvRows = [
        csvHeaders.join(','),
        ...(eventsData || []).map(event => [
          new Date(event.created_at).toISOString().split('T')[0],
          event.event_type,
          event.property_id || '',
          JSON.stringify(event.metadata || {}).replace(/"/g, '""')
        ].join(',')),
        ...(inquiriesData || []).map(inquiry => [
          new Date(inquiry.created_at).toISOString().split('T')[0],
          'inquiry',
          inquiry.property_id,
          `"${inquiry.name} - ${inquiry.whatsapp} - ${inquiry.message?.substring(0, 50)}..."`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({ title: "Export berhasil" });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export gagal",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (confirm('Apakah Anda yakin ingin mereset semua data analytics? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        const { error } = await supabase
          .from('analytics_events')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

        if (error) {
          throw error;
        }

        refetch();
        toast({ title: "Data analytics berhasil direset" });
      } catch (error) {
        console.error('Reset error:', error);
        toast({
          title: "Reset gagal",
          description: "Terjadi kesalahan saat reset data",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <AdminRootLayout
      title="Analytics"
      subtitle="Statistik dan performa properti"
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-end">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1D">1 Hari</SelectItem>
              <SelectItem value="3D">3 Hari</SelectItem>
              <SelectItem value="7D">7 Hari</SelectItem>
              <SelectItem value="1M">1 Bulan</SelectItem>
              <SelectItem value="3M">3 Bulan</SelectItem>
              <SelectItem value="1Y">1 Tahun</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportCSV} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" onClick={handleReset} data-testid="button-reset">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="stat-total-views">
                {analytics?.totalViews || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                dalam {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="stat-total-inquiries">
                {analytics?.totalInquiries || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                dalam {timeRange}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="stat-total-searches">
                {analytics?.totalSearches || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                dalam {timeRange}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Properti Paling Populer</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topProperties && analytics.topProperties.length > 0 ? (
              <div className="space-y-4">
                {analytics.topProperties.map((property: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{property.kodeListing}</p>
                      <p className="text-sm text-muted-foreground">{property.jenisProperti}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{property.views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ada data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminRootLayout>
  );
}
