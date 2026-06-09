import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { Eye, Check, X, FilePlus, MessageCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  submitted_at: string;
  owner_name: string;
  whatsapp: string;
  property_type: string;
  location: string;
  status: string;
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  published: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Baru", reviewing: "Ditinjau", approved: "Disetujui",
  rejected: "Ditolak", published: "Dipublish",
};

export default function AdminSubmissions() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    // Submissions would need a dedicated API endpoint
    // For now, show empty state
    setLoading(false);
  }, []);

  const filtered = submissions.filter(s => {
    if (statusFilter === "All") return true;
    return s.status === statusFilter;
  });

  const newCount = submissions.filter(s => s.status === "new").length;

  return (
    <AdminLayout title="Form Submission">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
          <div className="text-sm text-gray-500">Total Submission</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{newCount}</div>
          <div className="text-sm text-gray-500">Baru</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="text-2xl font-bold text-green-600">{submissions.filter(s => s.status === "approved" || s.status === "published").length}</div>
          <div className="text-sm text-gray-500">Diproses</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">Semua Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {loading ? "Memuat..." : `Menampilkan ${filtered.length} dari ${submissions.length} submission`}
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
      {!loading && submissions.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FilePlus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Submission</h3>
          <p className="text-gray-500">Form submission dari website akan muncul di sini.</p>
        </div>
      )}

      {/* Submission List */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Tanggal</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Pemilik</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">WhatsApp</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Tipe</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Lokasi</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(sub.submitted_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{sub.owner_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sub.whatsapp}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sub.property_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sub.location}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.status]}`}>
                        {STATUS_LABELS[sub.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => window.open(`https://wa.me/${sub.whatsapp}`, '_blank')}
                          className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
