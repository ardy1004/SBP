export interface Lead {
  id: string;
  name: string;
  origin: string;
  whatsapp: string;
  email: string;
  source: string;
  property_interest: string;
  property_slug: string;
  budget: string;
  payment_plan: string;
  message: string;
  role: "Calon Pembeli" | "Penjual/Pemilik" | "Broker/Agent";
  status: "new" | "contacted" | "viewing_scheduled" | "negotiating" | "closed_won" | "closed_lost";
  priority: "hot" | "warm" | "cold";
  created_at: string;
  last_contact: string;
  next_followup: string;
  notes: string;
}

export interface Contract {
  id: string;
  contract_number: string;
  owner_name: string;
  property_title: string;
  listing_code: string;
  contract_type: "OPEN_LISTING" | "EXCLUSIVE_BOOSTER" | "EXCLUSIVE_COMPANY";
  signed_date: string;
  expiry_date: string;
  status: "draft" | "pending_signature" | "active" | "expired" | "terminated";
  fee_percent: number;
}

export interface Submission {
  id: string;
  submitted_at: string;
  owner_name: string;
  whatsapp: string;
  property_type: string;
  location: string;
  status: "new" | "reviewing" | "approved" | "rejected" | "published";
  notes: string;
}

export interface AnalyticsMonth {
  month: string;
  leads: number;
  views: number;
  deals: number;
  revenue: number;
}

export const mockLeads: Lead[] = [
  { id: "l1", name: "Budi Santoso", origin: "Sleman", whatsapp: "6281234567890", email: "budi@gmail.com", source: "Website Form", property_interest: "Rumah Mewah Hook Tropis Dekat UGM", property_slug: "rumah-mewah-hook-tropis-dekat-ugm", budget: "Rp 1-2 Miliar", payment_plan: "KPR", message: "Saya tertarik dengan properti ini, bisa dijadwalkan survey?", role: "Calon Pembeli", status: "viewing_scheduled", priority: "hot", created_at: "2026-03-10T09:30:00", last_contact: "2026-03-15T14:00:00", next_followup: "2026-03-22T10:00:00", notes: "Sudah survey tanggal 12 Maret, tertarik lanjut negosiasi" },
  { id: "l2", name: "Siti Rahayu", origin: "Bantul", whatsapp: "6289876543210", email: "siti@yahoo.com", source: "Facebook", property_interest: "Kost Eksklusif 20 Kamar Babarsari", property_slug: "kost-eksklusif-20-kamar-babarsari", budget: "Rp 2-3 Miliar", payment_plan: "Cash", message: "Harga bisa nego? Saya punya dana cash.", role: "Calon Pembeli", status: "negotiating", priority: "hot", created_at: "2026-03-08T11:00:00", last_contact: "2026-03-18T09:00:00", next_followup: "2026-03-23T11:00:00", notes: "Menawar Rp 2,8M. Owner belum setuju." },
  { id: "l3", name: "Eko Prasetyo", origin: "Yogyakarta", whatsapp: "6285512345678", email: "eko@gmail.com", source: "Google Organic", property_interest: "Tanah Kavling Strategis Godean", property_slug: "tanah-kavling-strategis-godean", budget: "Rp 300-500 Juta", payment_plan: "Cash Bertahap", message: "Apakah tanah ini dekat jalan besar?", role: "Calon Pembeli", status: "contacted", priority: "warm", created_at: "2026-03-12T08:00:00", last_contact: "2026-03-13T10:30:00", next_followup: "2026-03-25T09:00:00", notes: "Sudah dihubungi via WA, belum balas" },
  { id: "l4", name: "Dewi Kurniawati", origin: "Gunung Kidul", whatsapp: "6281398765432", email: "dewi@gmail.com", source: "WhatsApp Direct", property_interest: "Rumah Joglo Heritage Kasongan", property_slug: "rumah-joglo-heritage-kasongan", budget: "Rp 800 Juta - 1 Miliar", payment_plan: "KPR", message: "Saya sangat tertarik dengan rumah joglo ini. Bisa survey akhir pekan?", role: "Calon Pembeli", status: "new", priority: "hot", created_at: "2026-03-19T16:00:00", last_contact: "2026-03-19T16:00:00", next_followup: "2026-03-21T10:00:00", notes: "" },
  { id: "l5", name: "Rizki Firmansyah", origin: "Jakarta", whatsapp: "6287612345678", email: "rizki@company.com", source: "Instagram", property_interest: "Villa Bukit Panorama Kaliurang", property_slug: "villa-bukit-panorama-kaliurang", budget: "Rp 3-5 Miliar", payment_plan: "Cash", message: "Saya broker dari Jakarta, ada buyer yang tertarik dengan villa ini.", role: "Broker/Agent", status: "contacted", priority: "warm", created_at: "2026-03-05T13:00:00", last_contact: "2026-03-14T15:00:00", next_followup: "2026-03-26T13:00:00", notes: "Broker luar kota, koordinasi komissi 1%" },
  { id: "l6", name: "Ahmad Hidayat", origin: "Magelang", whatsapp: "6281234000000", email: "", source: "Referral", property_interest: "Ruko Malioboro Strategis", property_slug: "ruko-malioboro-strategis", budget: "Rp 1,5 - 2 Miliar", payment_plan: "KPR", message: "Mau buat toko baju, cari ruko yang strategis.", role: "Calon Pembeli", status: "closed_lost", priority: "cold", created_at: "2026-02-15T10:00:00", last_contact: "2026-03-01T09:00:00", next_followup: "", notes: "Tidak jadi beli, budget kurang" },
  { id: "l7", name: "Hendra Wijaya", origin: "Sleman", whatsapp: "6289987654321", email: "hendra@gmail.com", source: "Google Organic", property_interest: "Apartemen Mataram City Unit Baru", property_slug: "apartemen-mataram-city-unit-baru", budget: "Rp 500 - 700 Juta", payment_plan: "KPR", message: "Unit lantai berapa yang tersedia?", role: "Calon Pembeli", status: "new", priority: "warm", created_at: "2026-03-20T10:30:00", last_contact: "2026-03-20T10:30:00", next_followup: "2026-03-22T09:00:00", notes: "" },
  { id: "l8", name: "Rina Pertiwi", origin: "Bantul", whatsapp: "6281300098765", email: "rina@gmail.com", source: "Website Form", property_interest: "Gudang Industri Cebongan", property_slug: "gudang-industri-cebongan", budget: "Rp 1-1,5 Miliar", payment_plan: "Cash", message: "Butuh gudang untuk usaha distro, berapa luas minimalnya?", role: "Calon Pembeli", status: "closed_won", priority: "hot", created_at: "2026-02-20T08:00:00", last_contact: "2026-03-10T14:00:00", next_followup: "", notes: "DEAL! Sudah tanda tangan SPK." },
];

export const mockContracts: Contract[] = [
  { id: "c1", contract_number: "SBP-R3.01", owner_name: "Pak Surya Budi", property_title: "Rumah Mewah Hook Tropis Dekat UGM", listing_code: "R3.01", contract_type: "EXCLUSIVE_COMPANY", signed_date: "2026-01-15", expiry_date: "2026-07-15", status: "active", fee_percent: 5 },
  { id: "c2", contract_number: "SBP-K2.05", owner_name: "Ibu Nurul Huda", property_title: "Kost Eksklusif 20 Kamar Babarsari", listing_code: "K2.05", contract_type: "EXCLUSIVE_BOOSTER", signed_date: "2026-02-01", expiry_date: "2026-08-01", status: "active", fee_percent: 3 },
  { id: "c3", contract_number: "SBP-T1.03", owner_name: "Pak Joko Santoso", property_title: "Tanah Kavling Strategis Godean", listing_code: "T1.03", contract_type: "OPEN_LISTING", signed_date: "2025-12-01", expiry_date: "2026-12-01", status: "active", fee_percent: 3 },
  { id: "c4", contract_number: "SBP-V1.07", owner_name: "Bu Maharani", property_title: "Villa Bukit Panorama Kaliurang", listing_code: "V1.07", contract_type: "EXCLUSIVE_COMPANY", signed_date: "2025-10-01", expiry_date: "2026-04-01", status: "expired", fee_percent: 5 },
  { id: "c5", contract_number: "SBP-R2.09", owner_name: "Pak Darmawan", property_title: "Rumah Joglo Heritage Kasongan", listing_code: "R2.09", contract_type: "OPEN_LISTING", signed_date: "", expiry_date: "", status: "draft", fee_percent: 3 },
];

export const mockSubmissions: Submission[] = [
  { id: "s1", submitted_at: "2026-03-19T14:30:00", owner_name: "Pak Agus Salim", whatsapp: "6281234567001", property_type: "Rumah", location: "Sleman, Depok", status: "new", notes: "" },
  { id: "s2", submitted_at: "2026-03-17T09:00:00", owner_name: "Bu Wulandari", whatsapp: "6289876543002", property_type: "Kost", location: "Bantul, Sewon", status: "reviewing", notes: "Sudah dihubungi via WA, menunggu dokumen" },
  { id: "s3", submitted_at: "2026-03-10T11:00:00", owner_name: "Pak Teguh Santoso", whatsapp: "6285512345003", property_type: "Tanah", location: "Godean, Sleman", status: "approved", notes: "Dokumen lengkap, publish besok" },
  { id: "s4", submitted_at: "2026-03-05T08:30:00", owner_name: "Bu Kartini", whatsapp: "6281398765004", property_type: "Ruko", location: "Yogyakarta Kota", status: "rejected", notes: "Sertifikat tidak lengkap" },
  { id: "s5", submitted_at: "2026-02-28T16:00:00", owner_name: "Pak Bintang Nugroho", whatsapp: "6287612345005", property_type: "Villa", location: "Kaliurang, Sleman", status: "published", notes: "Sudah live di website" },
];

export const mockAnalytics: AnalyticsMonth[] = [
  { month: "Okt 2025", leads: 12, views: 340, deals: 1, revenue: 150000000 },
  { month: "Nov 2025", leads: 18, views: 420, deals: 2, revenue: 220000000 },
  { month: "Des 2025", leads: 14, views: 380, deals: 1, revenue: 180000000 },
  { month: "Jan 2026", leads: 22, views: 510, deals: 3, revenue: 350000000 },
  { month: "Feb 2026", leads: 19, views: 480, deals: 2, revenue: 280000000 },
  { month: "Mar 2026", leads: 28, views: 620, deals: 4, revenue: 420000000 },
];

export const mockPropertyTypes = [
  { name: "Rumah", count: 5, color: "#1E3A8A" },
  { name: "Kost", count: 3, color: "#F59E0B" },
  { name: "Tanah", count: 2, color: "#10B981" },
  { name: "Villa", count: 1, color: "#8B5CF6" },
  { name: "Ruko", count: 1, color: "#EF4444" },
  { name: "Lainnya", count: 0, color: "#06B6D4" },
];

export const mockLeadSources = [
  { source: "Google Organic", leads: 32 },
  { source: "Facebook", leads: 24 },
  { source: "WhatsApp", leads: 18 },
  { source: "Instagram", leads: 15 },
  { source: "Direct", leads: 11 },
  { source: "Referral", leads: 8 },
];
