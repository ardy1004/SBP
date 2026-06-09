import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AdminLayout } from "../components/AdminLayout";
import { propertiesApi } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Search, Edit, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  listing_code: string;
  title: string;
  slug: string;
  price: number;
  property_type: string;
  city: string;
  image?: string;
  is_sold?: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 20;

export default function AdminPropertiesSold() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch sold properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const result = await propertiesApi.getAll({ limit: 100 });
        
        if (result.success) {
          // Filter sold properties
          const soldProps = (result.data || []).filter((p: any) => p.is_sold);
          setProperties(soldProps);
        }
      } catch (error) {
        console.error("Failed to fetch sold properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter by search
  const filtered = properties.filter(p => {
    if (!search) return true;
    return p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.listing_code.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <AdminLayout title="Properti Terjual">
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
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {loading ? "Memuat..." : `Menampilkan ${filtered.length} properti terjual`}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Memuat data...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Properti Terjual</h3>
          <p className="text-gray-500 mb-4">
            {search ? "Coba ubah pencarian Anda" : "Belum ada properti yang ditandai sebagai terjual"}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && paged.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3 w-16">Foto</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Kode</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Judul</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Harga</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map(p => (
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
                      <div className="text-xs text-gray-400 mt-0.5">{p.property_type}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="font-bold text-primary text-sm">{formatCurrency(p.price)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">SOLD</span>
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
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
