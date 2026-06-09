import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { propertiesApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { TrendingUp, Eye, Users, DollarSign, Loader2, Home } from "lucide-react";

interface AnalyticsData {
  totalProperties: number;
  totalViews: number;
  totalLeads: number;
  estimatedRevenue: number;
  propertiesByType: { name: string; count: number; color: string }[];
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProperties: 0,
    totalViews: 0,
    totalLeads: 0,
    estimatedRevenue: 0,
    propertiesByType: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch properties
        const propsResult = await propertiesApi.getAll({ limit: 100 });
        
        if (propsResult.success) {
          const properties = propsResult.data || [];
          const totalProperties = propsResult.pagination?.total || properties.length;
          const totalViews = properties.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0);
          
          // Count by type
          const typeCounts: Record<string, number> = {};
          properties.forEach((p: any) => {
            const type = p.property_type || "Lainnya";
            typeCounts[type] = (typeCounts[type] || 0) + 1;
          });

          const colors = ["#1E3A8A", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#06B6D4"];
          const propertiesByType = Object.entries(typeCounts).map(([name, count], i) => ({
            name,
            count,
            color: colors[i % colors.length],
          }));

          setAnalytics({
            totalProperties,
            totalViews,
            totalLeads: 0, // Would need leads API
            estimatedRevenue: 0, // Would need revenue calculation
            propertiesByType,
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <AdminLayout title="Analytics">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Memuat data analytics...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Total Properti</div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.totalProperties}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Total Views</div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.totalViews}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Total Leads</div>
                  <div className="text-2xl font-bold text-gray-900">{analytics.totalLeads}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Estimasi Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.estimatedRevenue)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Properties by Type Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <h3 className="font-bold text-gray-900 mb-1">Properti per Tipe</h3>
            <p className="text-xs text-gray-400 mb-4">Distribusi properti berdasarkan tipe</p>
            {analytics.propertiesByType.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada data properti</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.propertiesByType} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => [value, "Jumlah"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.propertiesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">ℹ️ Tentang Analytics</h3>
            <p className="text-sm text-blue-800">
              Data analytics ditampilkan berdasarkan data properti dari database. 
              Fitur analytics lengkap (leads, revenue, conversion rate) akan segera tersedia.
            </p>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
