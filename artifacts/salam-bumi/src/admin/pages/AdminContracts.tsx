import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { Eye, Edit, Download, RefreshCw, X, PenLine, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { contractsApi } from "@/lib/api-client";

interface Contract {
  id: string;
  contract_number: string;
  owner_name: string;
  property_title: string;
  listing_code: string;
  contract_type: string;
  signed_date?: string;
  expiry_date?: string;
  status: string;
  fee_percent: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_signature: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  terminated: "bg-red-200 text-red-800",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", pending_signature: "Pending Signature",
  active: "Aktif", expired: "Expired", terminated: "Diberhentikan",
};
const CONTRACT_TYPE_LABELS: Record<string, string> = {
  OPEN_LISTING: "Open Listing",
  EXCLUSIVE_BOOSTER: "Exclusive Booster",
  EXCLUSIVE_COMPANY: "Exclusive Company",
};

export default function AdminContracts() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch contracts from API
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await contractsApi.getAll();
      if (data.success && data.data) {
        setContracts(data.data as Contract[]);
      } else {
        setContracts([]);
      }
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Filter contracts
  const filtered = contracts.filter(c => {
    if (statusFilter === "All") return true;
    return c.status === statusFilter;
  });

  const handleExportPDF = (contract: Contract) => {
    toast({ 
      title: "Export PDF", 
      description: "Fitur export PDF akan segera tersedia." 
    });
  };

  return (
    <AdminLayout title="Perjanjian & Kontrak">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
          <div className="text-sm text-gray-500">Total Kontrak</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="text-2xl font-bold text-green-600">{contracts.filter(c => c.status === "active").length}</div>
          <div className="text-sm text-gray-500">Aktif</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
          <div className="text-2xl font-bold text-yellow-600">{contracts.filter(c => c.status === "pending_signature").length}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-500">{contracts.filter(c => c.status === "draft").length}</div>
          <div className="text-sm text-gray-500">Draft</div>
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
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Kontrak Baru
          </Button>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {loading ? "Memuat..." : `Menampilkan ${filtered.length} dari ${contracts.length} kontrak`}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Memuat data kontrak...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && contracts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <PenLine className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Kontrak</h3>
          <p className="text-gray-500 mb-4">Buat kontrak pertama Anda untuk memulai.</p>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Buat Kontrak
          </Button>
        </div>
      )}

      {/* Contract List */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">No. Kontrak</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Pemilik</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Properti</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Tipe</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Fee</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(contract => (
                  <tr key={contract.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm text-gray-900">{contract.contract_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{contract.owner_name}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-600 truncate max-w-[200px]">{contract.property_title}</div>
                      <div className="text-xs text-gray-400">{contract.listing_code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {CONTRACT_TYPE_LABELS[contract.contract_type] || contract.contract_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[contract.status]}`}>
                        {STATUS_LABELS[contract.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm font-medium text-gray-700">{contract.fee_percent}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Lihat">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleExportPDF(contract)}
                          className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
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
