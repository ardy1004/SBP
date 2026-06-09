import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { Eye, Edit, Download, RefreshCw, X, PenLine, Trash2, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleViewDetail = async (id: string) => {
    try {
      const result = await contractsApi.getById(id);
      if (result.success && result.data) {
        setSelectedContract(result.data as Contract);
        setEditMode(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat detail kontrak", variant: "destructive" });
    }
  };

  const handleSaveDetail = async () => {
    if (!selectedContract) return;
    setSaving(true);
    try {
      await contractsApi.update(selectedContract.id, selectedContract as any);
      toast({ title: "Tersimpan", description: "Kontrak berhasil diupdate" });
      setEditMode(false);
      fetchContracts();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan kontrak", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contractsApi.delete(id);
      toast({ title: "Dihapus", description: "Kontrak berhasil dihapus" });
      setDeleteConfirm(null);
      fetchContracts();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus kontrak", variant: "destructive" });
    }
  };

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
                        <button
                          onClick={() => handleViewDetail(contract.id)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedContract(contract); setEditMode(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleExportPDF(contract)}
                          className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(contract.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Contract Detail/Edit Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">
                {editMode ? "Edit Kontrak" : "Detail Kontrak"}
                <span className="ml-2 text-sm font-normal text-gray-500">{selectedContract.contract_number}</span>
              </h2>
              <button onClick={() => { setSelectedContract(null); setEditMode(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informasi Pemilik</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Nama:</span>
                    {editMode
                      ? <input className="ml-2 border border-gray-200 rounded px-2 py-1" value={selectedContract.owner_name} onChange={e => setSelectedContract({ ...selectedContract, owner_name: e.target.value })} />
                      : <span className="ml-2 font-medium">{selectedContract.owner_name}</span>}
                  </div>
                  <div><span className="text-gray-500">KTP:</span>
                    <span className="ml-2 font-medium">{selectedContract.owner_ktp || "—"}</span>
                  </div>
                  <div><span className="text-gray-500">WhatsApp:</span>
                    <span className="ml-2 font-medium">{selectedContract.owner_whatsapp || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informasi Properti</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2"><span className="text-gray-500">Properti:</span>
                    {editMode
                      ? <input className="ml-2 border border-gray-200 rounded px-2 py-1 w-64" value={selectedContract.property_title || ""} onChange={e => setSelectedContract({ ...selectedContract, property_title: e.target.value })} />
                      : <span className="ml-2 font-medium">{selectedContract.property_title || "—"}</span>}
                  </div>
                  <div><span className="text-gray-500">Listing Code:</span>
                    <span className="ml-2 font-medium">{selectedContract.listing_code || "—"}</span>
                  </div>
                  <div><span className="text-gray-500">Tipe Kontrak:</span>
                    <span className="ml-2 font-medium">{CONTRACT_TYPE_LABELS[selectedContract.contract_type] || selectedContract.contract_type}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  {editMode
                    ? <select value={selectedContract.status} onChange={e => setSelectedContract({ ...selectedContract, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                      </select>
                    : <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedContract.status]}`}>{STATUS_LABELS[selectedContract.status]}</span>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Fee (%)</label>
                  <span className="font-medium">{selectedContract.fee_percent}%</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal Ditandatangani</label>
                  <span className="font-medium">{selectedContract.signed_date ? new Date(selectedContract.signed_date).toLocaleDateString("id-ID") : "—"}</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Berlaku Sampai</label>
                  <span className="font-medium">{selectedContract.expiry_date ? new Date(selectedContract.expiry_date).toLocaleDateString("id-ID") : "—"}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Catatan</label>
                {editMode
                  ? <textarea value={selectedContract.notes || ""} onChange={e => setSelectedContract({ ...selectedContract, notes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Catatan..." />
                  : <p className="text-sm text-gray-600">{selectedContract.notes || "Tidak ada catatan"}</p>}
              </div>

              {editMode && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button onClick={handleSaveDetail} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedContract(null); setEditMode(false); }} className="flex-1">Batal</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kontrak</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus kontrak ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700">Hapus</Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Batal</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
