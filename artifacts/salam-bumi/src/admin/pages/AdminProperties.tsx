import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AdminLayout } from "../components/AdminLayout";
import { propertiesApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Eye, Edit, Trash2, Copy, ChevronLeft, ChevronRight, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  listing_code: string;
  title: string;
  slug: string;
  price: number;
  old_price?: number;
  purpose: string;
  property_type: string;
  location: string;
  city: string;
  image?: string;
  image_count?: number;
  is_premium?: boolean;
  is_featured?: boolean;
  is_hot?: boolean;
  is_sold?: boolean;
  is_choice?: boolean;
  views_count?: number;
  created_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const ITEMS_PER_PAGE = 20;

export default function AdminProperties() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: ITEMS_PER_PAGE, total: 0, total_pages: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const result = await propertiesApi.getAll({
          limit: ITEMS_PER_PAGE,
          page: page,
          search: search || undefined,
          purpose: purposeFilter !== "All" ? purposeFilter : undefined,
          type: typeFilter !== "All" ? typeFilter : undefined,
        });
        
        if (result.success) {
          setProperties(result.data || []);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        toast({ title: "Error", description: "Gagal memuat data properti", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [page, search, statusFilter, typeFilter, purposeFilter, toast]);

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (deleteId !== id) {
      setDeleteId(id);
      return;
    }

    setDeleting(true);
    try {
      await propertiesApi.delete(id);
      toast({ title: "Properti dihapus", description: `"${title}" berhasil dihapus.` });
      setProperties(properties.filter(p => p.id !== id));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: "Gagal menghapus properti", variant: "destructive" });
    } finally {
      setDeleteId(null);
      setDeleting(false);
    }
  };

  // Handle duplicate (create copy)
  const handleDuplicate = async (property: Property) => {
    toast({ 
      title: "Fitur belum tersedia", 
      description: "Duplikasi properti akan segera hadir." 
    });
  };

  // Client-side filtering for status (since API might not support all filters)
  const filtered = properties.filter(p => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Active") return !p.is_sold;
    if (statusFilter === "Sold") return p.is_sold;
    if (statusFilter === "Premium") return p.is_premium;
    if (statusFilter === "Featured") return p.is_featured;
    if (statusFilter === "Hot") return p.is_hot;
    return true;
  });

  const totalPages = pagination.total_pages || Math.ceil(pagination.total / ITEMS_PER_PAGE) || 1;

  const badgeColors: Record<string, string> = {
    PREMIUM: "bg-amber-100 text-amber-700 border border-amber-200",
    FEATURED: "bg-blue-100 text-blue-700 border border-blue-200",
    HOT: "bg-red-100 text-red-700 border border-red-200",
    SOLD: "bg-gray-100 text-gray-600 border border-gray-200",
    AKTIF: "bg-green-100 text-green-700 border border-green-200",
  };

  return (
    <AdminLayout title="Kelola Properti">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Cari judul, kode listing, atau lokasi..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
              className="pl-10" 
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              {["All", "Active", "Sold", "Premium", "Featured", "Hot"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              {["All", "Rumah", "Kost", "Tanah", "Villa", "Ruko", "Hotel", "Gudang", "Lainnya"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={purposeFilter} onChange={e => { setPurposeFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              {["All", "Dijual", "Disewa", "Dijual & Disewa"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <Link href="/admin/properties/add">
            <Button className="bg-primary hover:bg-primary/90 gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Tambah
            </Button>
          </Link>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {loading ? "Memuat..." : `Menampilkan ${filtered.length} dari ${pagination.total} properti`}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Memuat data properti...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada properti ditemukan</h3>
          <p className="text-gray-500 mb-4">
            {search || statusFilter !== "All" || typeFilter !== "All" || purposeFilter !== "All"
              ? "Coba ubah filter pencarian Anda"
              : "Mulai dengan menambahkan properti pertama Anda"}
          </p>
          <Link href="/admin/properties/add">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Tambah Properti
            </Button>
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 w-16">Foto</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Kode</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Judul</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Lokasi</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Harga</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Views</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <img 
                        src={p.image || "https://via.placeholder.com/100"} 
                        alt={p.title} 
                        className="w-14 h-14 rounded-lg object-cover border border-gray-100" 
                        loading="lazy" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{p.listing_code}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-semibold text-gray-900 text-sm leading-tight truncate">{p.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.property_type} · {p.purpose}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-600 truncate max-w-[160px]">{p.city}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="font-bold text-primary text-sm">{formatCurrency(p.price)}</div>
                      {p.old_price && <div className="text-xs text-gray-400 line-through">{formatCurrency(p.old_price)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.is_sold ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors.SOLD}`}>SOLD</span>
                        ) : (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors.AKTIF}`}>AKTIF</span>
                        )}
                        {p.is_premium && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors.PREMIUM}`}>PREMIUM</span>}
                        {p.is_featured && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors.FEATURED}`}>FEAT</span>}
                        {p.is_hot && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors.HOT}`}>HOT</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-sm font-medium">{p.views_count ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/properties/edit/${p.id}`}>
                          <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <a href={`/property/${p.slug}`} target="_blank" rel="noreferrer">
                          <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat">
                            <Eye className="w-4 h-4" />
                          </button>
                        </a>
                        <button onClick={() => handleDuplicate(p)} className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Duplikasi">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deleting && deleteId === p.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            deleteId === p.id 
                              ? "text-white bg-red-500" 
                              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                          }`}
                          title={deleteId === p.id ? "Klik lagi untuk konfirmasi" : "Hapus"}
                        >
                          {deleting && deleteId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">Hal {page} dari {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
