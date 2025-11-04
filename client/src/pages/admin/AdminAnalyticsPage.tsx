import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7D");
  const { toast } = useToast();

  const { data: analytics, refetch } = useQuery<any>({
    queryKey: ['/api/admin/analytics', timeRange],
  });

  const handleExportCSV = async () => {
    try {
      const data = await apiRequest('GET', `/api/admin/analytics/export?range=${timeRange}`, {});
      
      const csvContent = data.csv;
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({ title: "Export berhasil" });
    } catch (error) {
      toast({
        title: "Export gagal",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (confirm('Apakah Anda yakin ingin mereset semua data analytics?')) {
      try {
        await apiRequest('POST', '/api/admin/analytics/reset', {});
        refetch();
        toast({ title: "Data analytics berhasil direset" });
      } catch (error) {
        toast({
          title: "Reset gagal",
          description: "Terjadi kesalahan saat reset data",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics</h1>
              <p className="text-muted-foreground">
                Statistik dan performa properti
              </p>
            </div>

            <div className="flex gap-2">
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
          </div>

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

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Properti Paling Populer</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.topProperties?.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topProperties.map((property: any, index: number) => (
                      <div key={index} className="flex justify-between items-center border-b pb-3">
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
        </div>
      </div>
    </div>
  );
}
