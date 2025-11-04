import { useQuery } from "@tanstack/react-query";
import { Home, FileText, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminDashboardPage() {
  const { data: stats } = useQuery<any>({
    queryKey: ['/api/admin/stats'],
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
