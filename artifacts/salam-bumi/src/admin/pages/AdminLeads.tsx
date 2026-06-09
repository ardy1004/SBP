import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { Search, Eye, MessageCircle, Calendar, FileText, ChevronDown, Flame, Sun, Snowflake, X, Clock, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { leadsApi } from "@/lib/api-client";

interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  property_interest?: string;
  property_slug?: string;
  property_id?: string;
  message?: string;
  role: string;
  status: "new" | "contacted" | "viewing_scheduled" | "negotiating" | "closed_won" | "closed_lost";
  priority: "hot" | "warm" | "cold";
  budget?: string;
  payment_plan?: string;
  notes?: string;
  last_contact?: string;
  next_followup?: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  viewing_scheduled: "bg-purple-100 text-purple-700",
  negotiating: "bg-orange-100 text-orange-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Baru", contacted: "Dihubungi", viewing_scheduled: "Jadwal Kunjungan",
  negotiating: "Negosiasi", closed_won: "Deal", closed_lost: "Gagal",
};

const PRIORITY_ICON: Record<string, React.ElementType> = {
  hot: Flame, warm: Sun, cold: Snowflake,
};
const PRIORITY_COLOR: Record<string, string> = {
  hot: "text-red-500", warm: "text-amber-500", cold: "text-blue-400",
};

function LeadDetailModal({ lead, onClose, onUpdate }: { lead: Lead; onClose: () => void; onUpdate: () => void }) {
  const { toast } = useToast();
  const [note, setNote] = useState(lead.notes || "");
  const [status, setStatus] = useState(lead.status);
  const [followupDate, setFollowupDate] = useState(lead.next_followup?.slice(0, 16) || "");
  const [saving, setSaving] = useState(false);

  const handleWA = (template?: string) => {
    let msg = template || `Halo ${lead.name}! Terima kasih telah menghubungi Salam Bumi Property. Kami telah menerima inquiry Anda untuk properti ${lead.property_interest || "Anda"}. Admin kami akan segera merespons.`;
    msg = msg.replace("{name}", lead.name).replace("{property_title}", lead.property_interest || "");
    window.open(`https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await leadsApi.update(lead.id, {
        status,
        notes: note,
        next_followup: followupDate || null,
      });

      toast({ title: "Lead diupdate", description: "Perubahan berhasil disimpan." });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast({ title: "Error", description: "Gagal menyimpan perubahan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const waTemplates = [
    { label: "Respon Awal", msg: `Halo {name}! Terima kasih telah menghubungi Salam Bumi Property. Kami telah menerima inquiry Anda untuk properti {property_title}. Admin kami akan segera merespons.` },
    { label: "Konfirmasi Viewing", msg: `Halo {name}! Konfirmasi jadwal kunjungan properti {property_title}. Mohon konfirmasi ketersediaan waktu Anda.` },
    { label: "Follow-up", msg: `Halo {name}! Apakah Anda masih tertarik dengan properti {property_title}? Ada yang bisa kami bantu?` },
    { label: "Deal Closed", msg: `Selamat {name}! Transaksi properti {property_title} telah berhasil. Terima kasih telah percaya pada Salam Bumi Property!` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Detail Lead</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Informasi Kontak</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Nama:</span> <span className="font-medium">{lead.name}</span></div>
              <div><span className="text-gray-500">WhatsApp:</span> <span className="font-medium">{lead.whatsapp}</span></div>
              <div><span className="text-gray-500">Role:</span> <span className="font-medium">{lead.role}</span></div>
              <div><span className="text-gray-500">Budget:</span> <span className="font-medium">{lead.budget || "—"}</span></div>
            </div>
          </div>

          {/* Property Interest */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Properti yang Diminati</h3>
            <p className="text-sm font-medium">{lead.property_interest || "Tidak ada data"}</p>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <div className={`flex items-center gap-2 ${PRIORITY_COLOR[lead.priority]}`}>
                {PRIORITY_ICON[lead.priority] ? (() => {
                  const PriorityIcon = PRIORITY_ICON[lead.priority];
                  return <PriorityIcon className="w-5 h-5" />;
                })() : null}
                <span className="font-medium capitalize">{lead.priority}</span>
              </div>
            </div>
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Next Follow-up</label>
            <input 
              type="datetime-local"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Catatan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="Tambahkan catatan..."
            />
          </div>

          {/* WhatsApp Templates */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Quick WhatsApp</label>
            <div className="flex flex-wrap gap-2">
              {waTemplates.map((t, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => handleWA(t.msg)}>
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
            </Button>
            <Button variant="outline" onClick={() => handleWA()} className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads from API — max 50 per halaman (sesuai limit API leads)
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await leadsApi.getAll({ limit: 50, page: 1 });
      if (data.success && data.data) {
        setLeads(data.data as Lead[]);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter leads
  const filtered = leads.filter(l => {
    const matchSearch = !search || 
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.whatsapp.includes(search) ||
      (l.property_interest && l.property_interest.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchPriority = priorityFilter === "All" || l.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const newLeadsCount = leads.filter(l => l.status === "new").length;
  const hotLeadsCount = leads.filter(l => l.priority === "hot").length;

  return (
    <AdminLayout title="Lead Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
          <div className="text-sm text-gray-500">Total Lead</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{newLeadsCount}</div>
          <div className="text-sm text-gray-500">Lead Baru</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <div className="text-2xl font-bold text-red-600">{hotLeadsCount}</div>
          <div className="text-sm text-gray-500">Hot Lead</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Cari nama, WhatsApp, atau properti..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-10" 
            />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="All">Semua Status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="All">Semua Prioritas</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {loading ? "Memuat..." : `Menampilkan ${filtered.length} dari ${leads.length} lead`}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Memuat data lead...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && leads.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Lead</h3>
          <p className="text-gray-500 mb-4">Lead akan muncul ketika ada pengunjung yang mengisi form kontak di halaman properti.</p>
        </div>
      )}

      {/* Lead List */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Nama</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">WhatsApp</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Properti</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Tanggal</th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(lead => {
                  const PriorityIcon = PRIORITY_ICON[lead.priority];
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-500">{lead.role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">{lead.whatsapp}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-sm text-gray-600 truncate max-w-[200px]">{lead.property_interest || "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status]}`}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 ${PRIORITY_COLOR[lead.priority]}`}>
                          {PriorityIcon && <PriorityIcon className="w-4 h-4" />}
                          <span className="text-xs font-medium capitalize">{lead.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-xs text-gray-500">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString("id-ID") : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => window.open(`https://wa.me/${lead.whatsapp}`, '_blank')}
                            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={fetchLeads}
        />
      )}
    </AdminLayout>
  );
}
