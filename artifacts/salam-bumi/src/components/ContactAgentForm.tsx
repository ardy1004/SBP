import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { leadsApi } from "@/lib/api-client";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface ContactAgentFormProps {
  propertyTitle: string;
}

export function ContactAgentForm({ propertyTitle }: ContactAgentFormProps) {
  const { toast } = useToast();
  const [role, setRole] = useState<"Calon Pembeli" | "Penjual / Pemilik Properti" | "Broker / Agent Properti">("Calon Pembeli");
  
  // Shared fields
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [message, setMessage] = useState("");
  
  // Buyer fields
  const [budget, setBudget] = useState("");
  const [payment, setPayment] = useState("");
  
  // Seller fields
  const [helpType, setHelpType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  
  // Broker fields
  const [purpose, setPurpose] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !origin) {
      toast({
        title: "Mohon lengkapi data",
        description: "Nama dan asal daerah wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    // Simpan lead ke database (best effort — jangan block WhatsApp)
    try {
      await leadsApi.create({
        name,
        whatsapp: "", // tidak ada field whatsapp di form, user akan dihubungi via WA
        origin,
        role: role === "Calon Pembeli" ? "Calon Pembeli" : role === "Penjual / Pemilik Properti" ? "Penjual" : "Broker",
        property_interest: propertyTitle,
        budget: budget || null,
        payment_plan: payment || null,
        message: message || `${helpType} - ${purpose}`.replace(/^- /, ""),
        source: "Website Form",
      });
    } catch {
      // Lead gagal disimpan — tetap lanjut ke WhatsApp
      console.warn("[ContactForm] Gagal simpan lead ke database");
    }

    let waMessage = "";

    if (role === "Calon Pembeli") {
      waMessage = `Halo Monica Vera S!\n\nSaya tertarik dengan properti:\n\n*${propertyTitle}*\n\n*Saya Adalah Calon Pembeli*\n\nNama: ${name}\nAsal Daerah: ${origin}\nEstimasi Budget: ${budget || '-'}\nRencana Pembayaran: ${payment || '-'}\nPesan: ${message || '-'}\n\nMohon informasi lebih lanjut.`;
    } else if (role === "Penjual / Pemilik Properti") {
      waMessage = `Halo Monica Vera S!\n\n*Saya Adalah Penjual / Pemilik Properti*\n\nNama: ${name}\nAsal Daerah: ${origin}\nBantuan: ${helpType || '-'}\nJenis Properti: ${propertyType || '-'}\nLokasi: ${location || '-'}\nPesan: ${message || '-'}`;
    } else {
      waMessage = `Halo Monica Vera S!\n\n*Saya Adalah Broker / Agent Properti*\n\nNama: ${name}\nAsal Daerah: ${origin}\nTujuan: ${purpose || '-'}\nPesan: ${message || '-'}`;
    }

    const encodedMessage = encodeURIComponent(waMessage);
    window.open(`https://wa.me/6281391278889?text=${encodedMessage}`, '_blank');
    
    toast({
      title: "Membuka WhatsApp",
      description: "Anda akan dialihkan ke WhatsApp untuk mengirim pesan.",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
      <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
        <img 
          src="https://images.salambumi.xyz/monic%20sbp.webp" 
          alt="Monica Vera S" 
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div>
          <h3 className="font-bold text-lg text-primary">Monica Vera S</h3>
          <p className="text-sm font-medium text-gray-500">Admin / Agent Properti</p>
          <p className="text-xs text-secondary mt-1 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
            Membalas dalam 1-2 jam
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Saya Adalah</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="Calon Pembeli">Calon Pembeli</option>
            <option value="Penjual / Pemilik Properti">Penjual / Pemilik Properti</option>
            <option value="Broker / Agent Properti">Broker / Agent Properti</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Asal Daerah <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Kota Anda"
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {role === "Calon Pembeli" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estimasi Budget</label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="">Pilih Budget</option>
                <option value="Dibawah 1M">Dibawah 1 Miliar</option>
                <option value="1M-2M">1 Miliar - 2 Miliar</option>
                <option value="2M-3M">2 Miliar - 3 Miliar</option>
                <option value="3M-5M">3 Miliar - 5 Miliar</option>
                <option value="Diatas 5M">Diatas 5 Miliar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rencana Pembayaran</label>
              <select 
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="">Pilih Metode</option>
                <option value="Hard Cash">Hard Cash</option>
                <option value="Soft Cash">Soft Cash</option>
                <option value="KPR/Pembiayaan Bank">KPR / Pembiayaan Bank</option>
              </select>
            </div>
          </>
        )}

        {role === "Penjual / Pemilik Properti" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apa yang bisa kami bantu?</label>
              <select 
                value={helpType}
                onChange={(e) => setHelpType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="">Pilih Bantuan</option>
                <option value="Saya Ingin Titip Jual Properti">Saya Ingin Titip Jual Properti</option>
                <option value="Saya Mau Konsultasi">Saya Mau Konsultasi</option>
              </select>
            </div>
            
            {helpType === "Saya Ingin Titip Jual Properti" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Properti</label>
                  <select 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="Rumah">Rumah</option>
                    <option value="Tanah">Tanah</option>
                    <option value="Kost">Kost</option>
                    <option value="Ruko">Ruko</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lokasi Properti</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Jl. Kaliurang, Sleman"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </>
            )}
          </>
        )}

        {role === "Broker / Agent Properti" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apa Tujuan Anda?</label>
            <select 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Pilih Tujuan</option>
              <option value="Apakah Bisa Bekerjasama?">Apakah Bisa Bekerjasama?</option>
              <option value="Saya Mau Konsultasi">Saya Mau Konsultasi</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pesan Tambahan</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan Anda..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base rounded-xl shadow-lg shadow-[#25D366]/20 transition-all hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Hubungi via WhatsApp
        </Button>
      </form>
    </div>
  );
}
