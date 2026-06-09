import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AdminLayout } from "../components/AdminLayout";
import { propertiesApi, leadsApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area
} from "recharts";
import {
  Home, Tag, CheckCircle, Users, Plus, FileSignature,
  BarChart3, TrendingUp, ArrowUpRight, Eye, Clock,
  FileText, Activity, DollarSign, Loader2, Pencil, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PIE_COLORS = ["#1E3A8A", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#06B6D4"];

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  totalLeads: number;
  newLeads: number;
  hotLeads: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive = true,
  color,
  sub
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: string;
  trendPositive?: boolean;
  color: string;
  sub?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue:  { bg: "bg-blue-500/10",   text: "text-blue-600",   border: "border-blue-100" },
    green: { bg: "bg-green-500/10",  text: "text-green-600",  border: "border-green-100" },
    gold:  { bg: "bg-amber-500/10",  text: "text-amber-600",  border: "border-amber-100" },
    red:   { bg: "bg-red-500/10",    text: "text-red-600",    border: "border-red-100" },
  };
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${c.border} flex items-start gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-extrabold text-gray-900 mt-1 leading-none">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        <div className={`text-xs font-semibold flex items-center gap-1 mt-1.5 ${trendPositive ? "text-green-600" : "text-red-500"}`}>
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-3 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.name === "Revenue" ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    soldProperties: 0,
    totalLeads: 0,
    newLeads: 0,
    hotLeads: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);

   // Fetch dashboard data from API
   useEffect(() => {
     const fetchDashboardData = async () => {
       setLoading(true);
       try {
         // Fetch ALL properties (no is_sold filter) for accurate total count
         const propsResult = await propertiesApi.getAll({ limit: 100 });
         
         if (propsResult.success) {
           const properties = propsResult.data || [];
           const totalProperties = propsResult.pagination?.total || properties.length;
           const activeProperties = properties.filter((p: any) => !p.is_sold).length;
           const soldProperties = properties.filter((p: any) => p.is_sold).length;
           
           setStats(prev => ({
             ...prev,
             totalProperties,
             activeProperties,
             soldProperties,
           }));
           
           // Sort recent properties by created_at DESC
           const sorted = [...properties]
             .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
             .slice(0, 5);
           setRecentProperties(sorted);
         }

         // Fetch leads
         try {
           const leadsResult = await leadsApi.getAll({ limit: 50, page: 1 });
           if (leadsResult.success && leadsResult.data) {
             const leads = leadsResult.data;
             const totalLeads = leadsResult.pagination?.total || leads.length;
             const newLeads = leads.filter((l: any) => l.status === "new").length;
             const hotLeads = leads.filter((l: any) => l.priority === "hot").length;
             setStats(prev => ({
               ...prev,
               totalLeads,
               newLeads,
               hotLeads,
             }));
           }
         } catch (e) {
           // Leads API error — inform user but don't crash dashboard
           console.warn("[AdminDashboard] Leads fetch failed:", e);
           setLeadsError("Gagal memuat data leads. API mungkin tidak tersedia.");
           toast({
             title: "Peringatan",
             description: "Data leads tidak dapat dimuat. Periksa koneksi API.",
             variant: "destructive",
           });
         }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Activities from recent properties
  const activities = recentProperties.slice(0, 5).map((p, i) => ({
    text: `Properti: ${p.title?.slice(0, 35) || "—"}`,
    time: p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "—",
    icon: Home,
  }));

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Memuat data dashboard...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Error Alert */}
          {leadsError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{leadsError}</span>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Home}
              label="Total Properti"
              value={stats.totalProperties}
              sub={`${stats.activeProperties} tersedia`}
              trend={`${stats.totalProperties} properti`}
              color="blue"
            />
            <StatCard
              icon={Tag}
              label="Properti Aktif"
              value={stats.activeProperties}
              sub={`${stats.activeProperties} tersedia`}
              trend={`${stats.activeProperties} aktif`}
              color="green"
            />
            <StatCard
              icon={CheckCircle}
              label="Terjual"
              value={stats.soldProperties}
              sub={`Total terjual`}
              trend={`${stats.soldProperties} terjual`}
              color="gold"
            />
            <StatCard
              icon={Users}
              label="Total Lead"
              value={stats.totalLeads}
              sub={`${stats.newLeads} belum direspond`}
              trend={`${stats.hotLeads} lead panas`}
              trendPositive={stats.newLeads === 0}
              color="red"
            />
          </div>

          {/* Alert Bar */}
          {stats.newLeads > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <Link href="/admin/leads">
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-red-100 transition-colors">
                  <Activity className="w-4 h-4" />
                  {stats.newLeads} lead baru menunggu respons →
                </div>
              </Link>
            </div>
          )}

          {/* Recent Properties */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Properti Terbaru</h3>
              <Link href="/admin/properties">
                <Button variant="outline" size="sm">Lihat Semua</Button>
              </Link>
            </div>
            {recentProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada properti. Tambahkan properti pertama Anda!</p>
                <Link href="/admin/properties/add">
                  <Button className="mt-4 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Properti
                  </Button>
                </Link>
              </div>
            ) : (
                <div className="space-y-3">
                  {recentProperties.map((p, i) => (
                    <div key={p.id || i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <img 
                          src={p.image || p.primary_image || "https://via.placeholder.com/100?text=No+Image"} 
                          alt={p.title}
                          className="w-full h-full object-contain p-1"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{p.title}</div>
                        <div className="text-xs text-gray-500">{p.listing_code} · {p.property_type}</div>
                        <div className="text-xs font-bold text-primary">{formatCurrency(p.price || p.price_offer || 0)}</div>
                      </div>
                    <div className="flex gap-1">
                      <Link href={`/admin/properties/edit/${p.id}`}>
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit properti">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Tambah Properti", icon: Plus, path: "/admin/properties/add", color: "bg-[#1E3A8A]" },
                { label: "Lihat Lead", icon: Users, path: "/admin/leads", color: "bg-green-500", badge: stats.newLeads },
                { label: "Kontrak Baru", icon: FileSignature, path: "/admin/contracts/new", color: "bg-[#F59E0B]" },
                { label: "Analytics", icon: BarChart3, path: "/admin/analytics", color: "bg-purple-500" },
              ].map(q => {
                const Icon = q.icon;
                return (
                  <Link key={q.path} href={q.path}>
                    <div className={`${q.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity relative min-h-[80px] justify-center`}>
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-semibold text-center leading-tight">{q.label}</span>
                      {q.badge ? (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {q.badge}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
