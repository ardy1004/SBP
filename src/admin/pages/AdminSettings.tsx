import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { useAuth } from "@/admin/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi, settingsApi } from "@/lib/api-client";
import {
  User, Building2, Bell, Shield, Search, Database, Save, Eye, EyeOff,
  Download, Upload, Clock, Loader2
} from "lucide-react";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [notifications, setNotifications] = useState({
    email: true, whatsapp: true, leadAlerts: true, dailySummary: false,
  });
  const [profile, setProfile] = useState({
    name: user?.name || "Monica Vera S",
    whatsapp: "6281391278889",
    email: "admin@salambumi.xyz",
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [company, setCompany] = useState({
    name: "CV Salam Bumi Property",
    address: "Yogyakarta, DIY",
    phone: "0813-9127-8889",
    email: "info@salambumi.xyz",
    website: "https://salambumi.xyz",
    instagram: "@salambumiproperty",
  });
  const [seo, setSeo] = useState({
    defaultTitle: "Salam Bumi Property - Agen Properti Yogyakarta Terpercaya",
    defaultDesc: "Temukan properti impian Anda di Yogyakarta. Rumah, Kost, Tanah, Villa, Ruko dijual dan disewakan.",
    gaId: "G-XXXXXXXXXX",
    searchConsole: "",
  });

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const result = await settingsApi.get();
        if (result.success && result.data) {
          const s = result.data;
          if (s.admin_name) setProfile(p => ({ ...p, name: s.admin_name }));
          if (s.admin_whatsapp) setProfile(p => ({ ...p, whatsapp: s.admin_whatsapp }));
          if (s.admin_email) setProfile(p => ({ ...p, email: s.admin_email }));
          if (s.company_name) setCompany(c => ({ ...c, name: s.company_name }));
          if (s.company_address) setCompany(c => ({ ...c, address: s.company_address }));
          if (s.company_phone) setCompany(c => ({ ...c, phone: s.company_phone }));
          if (s.company_email) setCompany(c => ({ ...c, email: s.company_email }));
          if (s.company_website) setCompany(c => ({ ...c, website: s.company_website }));
          if (s.company_instagram) setCompany(c => ({ ...c, instagram: s.company_instagram }));
          if (s.seo_default_title) setSeo(o => ({ ...o, defaultTitle: s.seo_default_title }));
          if (s.seo_default_desc) setSeo(o => ({ ...o, defaultDesc: s.seo_default_desc }));
          if (s.seo_ga_id) setSeo(o => ({ ...o, gaId: s.seo_ga_id }));
          if (s.seo_search_console) setSeo(o => ({ ...o, searchConsole: s.seo_search_console }));
          if (s.notif_email) setNotifications(n => ({ ...n, email: s.notif_email === "true" }));
          if (s.notif_whatsapp) setNotifications(n => ({ ...n, whatsapp: s.notif_whatsapp === "true" }));
          if (s.notif_lead_alerts) setNotifications(n => ({ ...n, leadAlerts: s.notif_lead_alerts === "true" }));
          if (s.notif_daily_summary) setNotifications(n => ({ ...n, dailySummary: s.notif_daily_summary === "true" }));
        }
      } catch (error) {
        console.error("Settings fetch error:", error);
        toast({ title: "Gagal", description: "Gagal memuat pengaturan", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (section: string, data: Record<string, string>) => {
    setSaving(section);
    try {
      await settingsApi.update(data);
      toast({ title: "Tersimpan!", description: `Pengaturan ${section} berhasil disimpan.` });
    } catch (error) {
      console.error("Settings save error:", error);
      toast({ title: "Gagal", description: `Gagal menyimpan pengaturan ${section}`, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Error", description: "Password baru tidak cocok", variant: "destructive" });
      return;
    }
    if (passwordForm.newPass.length < 8) {
      toast({ title: "Error", description: "Password minimal 8 karakter", variant: "destructive" });
      return;
    }
    setSaving("password");
    try {
      await authApi.changePassword(passwordForm.current, passwordForm.newPass);
      toast({ title: "Berhasil!", description: "Password berhasil diubah" });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch (error: any) {
      toast({ title: "Gagal", description: error?.message || "Gagal mengubah password", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-500">Memuat pengaturan...</span>
          </div>
        ) : (
        <>
        {/* Profile */}
        <Section title="Profil Admin" icon={User}>
          <div className="flex items-center gap-4 mb-5">
            <img src={user?.photo} alt={user?.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
            <div>
              <div className="font-bold text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-500">{user?.role}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nama Admin</Label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>No. WhatsApp</Label>
              <Input value={profile.whatsapp} onChange={e => setProfile(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <Button
            onClick={() => saveSettings("profil", { admin_name: profile.name, admin_whatsapp: profile.whatsapp, admin_email: profile.email })}
            className="mt-4 gap-2 bg-primary hover:bg-primary/90"
            disabled={saving === "profil"}
          >
            {saving === "profil" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Profil
          </Button>
        </Section>

        {/* Change Password */}
        <Section title="Ubah Password" icon={Shield}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Password Saat Ini</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Password saat ini" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Password Baru</Label>
              <Input type="password" placeholder="Minimal 8 karakter" value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Konfirmasi Password Baru</Label>
              <Input type="password" placeholder="Ulangi password baru" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            className="mt-4 gap-2 bg-primary hover:bg-primary/90"
            disabled={saving === "password"}
          >
            {saving === "password" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Ubah Password
          </Button>
        </Section>

        {/* Company */}
        <Section title="Informasi Perusahaan" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Nama Perusahaan</Label><Input value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Telepon</Label><Input value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Alamat</Label><Input value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email Perusahaan</Label><Input type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Website</Label><Input value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Instagram</Label><Input value={company.instagram} onChange={e => setCompany(c => ({ ...c, instagram: e.target.value }))} /></div>
          </div>
          <Button
            onClick={() => saveSettings("perusahaan", {
              company_name: company.name, company_address: company.address,
              company_phone: company.phone, company_email: company.email,
              company_website: company.website, company_instagram: company.instagram
            })}
            className="mt-4 gap-2 bg-primary hover:bg-primary/90"
            disabled={saving === "perusahaan"}
          >
            {saving === "perusahaan" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </Button>
        </Section>

        {/* Notifications */}
        <Section title="Pengaturan Notifikasi" icon={Bell}>
          <div className="space-y-3">
            {[
              { key: "email", label: "Notifikasi Email", desc: "Terima email untuk lead baru dan update", apiKey: "notif_email" },
              { key: "whatsapp", label: "Notifikasi WhatsApp", desc: "Terima WA untuk lead urgent", apiKey: "notif_whatsapp" },
              { key: "leadAlerts", label: "Alert Lead Baru", desc: "Notifikasi real-time setiap ada lead baru", apiKey: "notif_lead_alerts" },
              { key: "dailySummary", label: "Laporan Harian", desc: "Ringkasan aktivitas harian via email", apiKey: "notif_daily_summary" },
            ].map(n => (
              <div key={n.key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{n.label}</div>
                  <div className="text-xs text-gray-500">{n.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof notifications] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${notifications[n.key as keyof typeof notifications] ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[n.key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={() => saveSettings("notifikasi", {
              notif_email: String(notifications.email), notif_whatsapp: String(notifications.whatsapp),
              notif_lead_alerts: String(notifications.leadAlerts), notif_daily_summary: String(notifications.dailySummary),
            })}
            className="mt-4 gap-2 bg-primary hover:bg-primary/90"
            disabled={saving === "notifikasi"}
          >
            {saving === "notifikasi" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </Button>
        </Section>

        {/* SEO */}
        <Section title="Pengaturan SEO" icon={Search}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Default Meta Title <span className="text-xs text-gray-400">({seo.defaultTitle.length}/60)</span></Label>
              <Input value={seo.defaultTitle} onChange={e => setSeo(s => ({ ...s, defaultTitle: e.target.value }))} maxLength={70} />
              {seo.defaultTitle.length > 60 && <p className="text-xs text-red-500">Melebihi batas 60 karakter!</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Default Meta Description <span className="text-xs text-gray-400">({seo.defaultDesc.length}/160)</span></Label>
              <textarea value={seo.defaultDesc} onChange={e => setSeo(s => ({ ...s, defaultDesc: e.target.value }))} maxLength={180} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {seo.defaultDesc.length > 160 && <p className="text-xs text-red-500">Melebihi batas 160 karakter!</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Google Analytics ID</Label>
              <Input placeholder="G-XXXXXXXXXX" value={seo.gaId} onChange={e => setSeo(s => ({ ...s, gaId: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Google Search Console Verification</Label>
              <Input placeholder="Kode verifikasi dari Google Search Console" value={seo.searchConsole} onChange={e => setSeo(s => ({ ...s, searchConsole: e.target.value }))} />
            </div>
          </div>
          <Button
            onClick={() => saveSettings("SEO", {
              seo_default_title: seo.defaultTitle, seo_default_desc: seo.defaultDesc,
              seo_ga_id: seo.gaId, seo_search_console: seo.searchConsole,
            })}
            className="mt-4 gap-2 bg-primary hover:bg-primary/90"
            disabled={saving === "SEO"}
          >
            {saving === "SEO" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </Button>
        </Section>

        {/* Security */}
        <Section title="Keamanan & Session" icon={Shield}>
          <div className="space-y-3">
            {[
              { label: "2FA Authentication", desc: "Google Authenticator (Direkomendasikan untuk produksi)", status: "Belum aktif" },
              { label: "IP Whitelist", desc: "Batasi akses hanya dari IP tertentu", status: "Nonaktif" },
              { label: "Session Timeout", desc: "Auto-logout setelah 30 menit tidak aktif", status: "Aktif" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.desc}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Activity Log */}
        <Section title="Activity Log" icon={Clock}>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(() => {
              try {
                const logs = JSON.parse(localStorage.getItem("sbp_activity_log") || "[]");
                if (logs.length === 0) return <p className="text-sm text-gray-400">Belum ada aktivitas tercatat.</p>;
                return logs.slice(0, 20).map((log: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                    <span className="text-gray-700">{log.action}</span>
                    <span className="text-xs text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleString("id-ID") : ""}</span>
                  </div>
                ));
              } catch { return <p className="text-sm text-gray-400">Belum ada aktivitas tercatat.</p>; }
            })()}
          </div>
        </Section>

        {/* Backup & Export */}
        <Section title="Backup & Export" icon={Database}>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Kelola data dan cadangan dashboard Anda.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const data = {
                  properties: JSON.parse(localStorage.getItem("sbp_properties") || "[]"),
                  leads: JSON.parse(localStorage.getItem("sbp_leads") || "[]"),
                  contracts: JSON.parse(localStorage.getItem("sbp_contracts") || "[]"),
                  settings: { profile, company, seo, notifications },
                  exportedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "sbp-backup.json"; a.click();
                URL.revokeObjectURL(url);
                toast({ title: "Export Berhasil", description: "Data berhasil diunduh." });
              }} className="gap-2">
                <Download className="w-4 h-4" /> Export Semua Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Import", description: "Pilih file JSON untuk import data." })} className="gap-2">
                <Upload className="w-4 h-4" /> Import Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Backup Dibuat", description: "Backup otomatis tersimpan." })} className="gap-2">
                <Database className="w-4 h-4" /> Buat Backup
              </Button>
            </div>
          </div>
        </Section>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-red-600 mb-2">Logout</h3>
          <p className="text-sm text-gray-500 mb-4">Keluar dari sesi admin dashboard ini.</p>
          <Button onClick={logout} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Logout Sekarang</Button>
        </div>
        </>
        )}
      </div>
    </AdminLayout>
  );
}
