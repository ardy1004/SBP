// Dynamic Property Form Component
// Comprehensive property form with dynamic fields based on property type

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Home, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Building2,
  Building,
  Warehouse,
  Trees,
  Store,
  Castle
} from "lucide-react";

// Property Types
const PROPERTY_TYPES = [
  { value: "rumah", label: "Rumah", icon: Home },
  { value: "tanah", label: "Tanah", icon: Trees },
  { value: "kost", label: "Kost", icon: Building },
  { value: "hotel", label: "Hotel", icon: Castle },
  { value: "homestay", label: "Homestay / Guesthouse", icon: Building2 },
  { value: "villa", label: "Villa", icon: Building2 },
  { value: "apartment", label: "Apartment", icon: Building },
  { value: "gudang", label: "Gudang", icon: Warehouse },
  { value: "komersial", label: "Bangunan Komersial", icon: Store },
];

// Tujuan Options
const TUJUAN_OPTIONS = [
  { value: "Dijual", label: "Dijual" },
  { value: "Disewakan", label: "Disewakan" },
  { value: "Dijual & Disewakan", label: "Dijual & Disewakan" },
];

// Legalitas Options
const LEGALITAS_OPTIONS = [
  { value: "SHM & IMB", label: "SHM & IMB / PBG Lengkap" },
  { value: "SHGB & IMB", label: "SHGB & IMB / PBG Lengkap" },
  { value: "SHM Saja", label: "SHM Pekarangan Saja Tanpa IMB / PBG" },
  { value: "SHM Sawah", label: "SHM Sawah / Tegalan" },
  { value: "SHGB Saja", label: "SHGB Saja Tanpa IMB / PBG" },
  { value: "Girik", label: "Girik / Letter C / PPJB / dll" },
  { value: "Izin Usaha", label: "Izin Usaha" },
];

// Jenis Kost Options
const JENIS_KOST_OPTIONS = [
  { value: "Putra", label: "Putra" },
  { value: "Putri", label: "Putri" },
  { value: "Campur", label: "Campur" },
];

// Jenis Hotel Options
const JENIS_HOTEL_OPTIONS = [
  { value: "Budget / Melati", label: "Budget / Melati" },
  { value: "Bintang 1", label: "Bintang 1" },
  { value: "Bintang 2", label: "Bintang 2" },
  { value: "Bintang 3", label: "Bintang 3" },
  { value: "Bintang 4", label: "Bintang 4" },
  { value: "Bintang 5", label: "Bintang 5" },
  { value: "Boutique", label: "Boutique" },
];

// Kelengkapan Options
const KELENGKAPAN_OPTIONS = [
  { value: "Fully Furnished", label: "Fully Furnished" },
  { value: "Semi Furnished", label: "Semi Furnished" },
  { value: "Unfurnished", label: "Unfurnished" },
];

interface DynamicPropertyFormProps {
  propertyId?: string;
  propertyDetailsId?: string;
  onSuccess?: (propertyId: string, propertyDetailsId: string) => void;
  initialData?: any;
}

export function DynamicPropertyForm({ propertyId, propertyDetailsId, onSuccess, initialData }: DynamicPropertyFormProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    tujuan: "Dijual",
    jenisProperti: "",
    
    // Price
    hargaJual: "",
    hargaJualNego: true,
    hargaJualNett: false,
    hargaSewaTahunan: "",
    
    // Location
    alamatLengkap: "",
    googleMapsLink: "",
    provinsi: "",
    kabupaten: "",
    
    // Dynamic Fields - Rumah
    luasTanah: "",
    luasBangunan: "",
    lebarDepan: "",
    jumlahLantai: "",
    kamarTidur: "",
    kamarMandi: "",
    
    // Dynamic Fields - Kost
    jenisKost: "",
    ruangPenjaga: false,
    tokenListrikPerkamar: false,
    hargaSewaKamarBulan: "",
    biayaPengeluaranBulan: "",
    
    // Dynamic Fields - Hotel/Homestay/Villa
    jenisHotel: "",
    incomeRataRataBulan: "",
    
    // Dynamic Fields - Apartment
    noUnit: "",
    
    // Kelengkapan
    kelengkapan: "",
    
    // Legalitas
    legalitas: "",
    statusLegalitas: "On Hand",
    bankTerhubung: "",
    outstandingBank: "",
    
    // Lingkungan
    dekatSungai: false,
    jarakSungaiMeter: "",
    dekatMakam: false,
    jarakMakamMeter: "",
    dekatSutet: false,
    jarakSutetMeter: "",
    lebarJalanMeter: "",
    
    // Additional
    alasanDijual: "",
    deskripsiProperti: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatCurrency = (value: string): string => {
    const num = value.replace(/[^\d]/g, '');
    if (!num) return '';
    return parseInt(num).toLocaleString('id-ID');
  };

  const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const handlePriceChange = (field: string, value: string) => {
    const formatted = formatCurrency(value);
    handleChange(field, formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jenisProperti) {
      toast({
        title: "Validasi Gagal",
        description: "Pilih jenis properti terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let newPropertyId = propertyId;
      let newPropertyDetailsId = propertyDetailsId;

      // Prepare property details payload
      const detailsPayload: any = {
        property_id: newPropertyId || null,
        tujuan: formData.tujuan,
        jenis_properti: formData.jenisProperti,
        
        // Price
        harga_jual: formData.hargaJual ? parseCurrency(formData.hargaJual) : null,
        harga_jual_nego: formData.hargaJualNego,
        harga_jual_nett: formData.hargaJualNett,
        harga_sewa_tahunan: formData.hargaSewaTahunan ? parseCurrency(formData.hargaSewaTahunan) : null,
        
        // Location
        alamat_lengkap: formData.alamatLengkap || null,
        google_maps_link: formData.googleMapsLink || null,
        
        // Dynamic Fields
        luas_tanah: formData.luasTanah ? parseFloat(formData.luasTanah) : null,
        luas_bangunan: formData.luasBangunan ? parseFloat(formData.luasBangunan) : null,
        lebar_depan: formData.lebarDepan ? parseFloat(formData.lebarDepan) : null,
        jumlah_lantai: formData.jumlahLantai ? parseInt(formData.jumlahLantai) : null,
        kamar_tidur: formData.kamarTidur ? parseInt(formData.kamarTidur) : null,
        kamar_mandi: formData.kamarMandi ? parseInt(formData.kamarMandi) : null,
        
        // Kost
        jenis_kost: formData.jenisKost || null,
        ruang_penjaga: formData.ruangPenjaga,
        token_listrik_perkamar: formData.tokenListrikPerkamar,
        harga_sewa_kamar_bulan: formData.hargaSewaKamarBulan ? parseCurrency(formData.hargaSewaKamarBulan) : null,
        biaya_pengeluaran_bulan: formData.biayaPengeluaranBulan ? parseCurrency(formData.biayaPengeluaranBulan) : null,
        
        // Hotel
        jenis_hotel: formData.jenisHotel || null,
        income_rata_rata_bulan: formData.incomeRataRataBulan ? parseCurrency(formData.incomeRataRataBulan) : null,
        
        // Apartment
        no_unit: formData.noUnit || null,
        
        // Kelengkapan
        kelengkapan: formData.kelengkapan || null,
        
        // Legalitas
        legalitas: formData.legalitas || null,
        status_legalitas: formData.statusLegalitas || null,
        bank_terkait: formData.bankTerhubung || null,
        outstanding_bank: formData.outstandingBank ? parseCurrency(formData.outstandingBank) : null,
        
        // Lingkungan
        dekat_sungai: formData.dekatSungai,
        jarak_sungai_meter: formData.jarakSungaiMeter ? parseFloat(formData.jarakSungaiMeter) : null,
        dekat_makam: formData.dekatMakam,
        jarak_makam_meter: formData.jarakMakamMeter ? parseFloat(formData.jarakMakamMeter) : null,
        dekat_sutet: formData.dekatSutet,
        jarak_sutet_meter: formData.jarakSutetMeter ? parseFloat(formData.jarakSutetMeter) : null,
        lebar_jalan_meter: formData.lebarJalanMeter ? parseFloat(formData.lebarJalanMeter) : null,
        
        // Additional
        alasan_dijual: formData.alasanDijual || null,
        deskripsi_properti: formData.deskripsiProperti || null,
      };

      // Save property details
      if (propertyDetailsId) {
        const { error } = await supabase
          .from('property_details')
          .update(detailsPayload)
          .eq('id', propertyDetailsId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('property_details')
          .insert(detailsPayload)
          .select()
          .single();
        if (error) throw error;
        newPropertyDetailsId = data?.id;
      }

      toast({
        title: "Berhasil",
        description: "Data properti berhasil disimpan",
      });

      if (onSuccess && newPropertyId && newPropertyDetailsId) {
        onSuccess(newPropertyId, newPropertyDetailsId);
      }
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan properti",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render dynamic fields based on property type
  const renderDynamicFields = () => {
    switch (formData.jenisProperti) {
      case "rumah":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²)</Label>
              <Input
                type="number"
                value={formData.luasTanah}
                onChange={(e) => handleChange("luasTanah", e.target.value)}
                placeholder="Contoh: 150"
              />
            </div>
            <div>
              <Label>Luas Bangunan (m²)</Label>
              <Input
                type="number"
                value={formData.luasBangunan}
                onChange={(e) => handleChange("luasBangunan", e.target.value)}
                placeholder="Contoh: 100"
              />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input
                type="number"
                value={formData.lebarDepan}
                onChange={(e) => handleChange("lebarDepan", e.target.value)}
                placeholder="Contoh: 8"
              />
            </div>
            <div>
              <Label>Jumlah Lantai</Label>
              <Input
                type="number"
                value={formData.jumlahLantai}
                onChange={(e) => handleChange("jumlahLantai", e.target.value)}
                placeholder="Contoh: 2"
              />
            </div>
            <div>
              <Label>Jumlah Kamar Tidur</Label>
              <Input
                type="number"
                value={formData.kamarTidur}
                onChange={(e) => handleChange("kamarTidur", e.target.value)}
                placeholder="Contoh: 3"
              />
            </div>
            <div>
              <Label>Jumlah Kamar Mandi</Label>
              <Input
                type="number"
                value={formData.kamarMandi}
                onChange={(e) => handleChange("kamarMandi", e.target.value)}
                placeholder="Contoh: 2"
              />
            </div>
          </div>
        );

      case "tanah":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Luas Tanah (m²)</Label>
              <Input
                type="number"
                value={formData.luasTanah}
                onChange={(e) => handleChange("luasTanah", e.target.value)}
                placeholder="Contoh: 500"
              />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input
                type="number"
                value={formData.lebarDepan}
                onChange={(e) => handleChange("lebarDepan", e.target.value)}
                placeholder="Contoh: 20"
              />
            </div>
          </div>
        );

      case "kost":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Jenis Kost</Label>
                <select
                  value={formData.jenisKost}
                  onChange={(e) => handleChange("jenisKost", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Pilih Jenis</option>
                  {JENIS_KOST_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Luas Tanah (m²)</Label>
                <Input
                  type="number"
                  value={formData.luasTanah}
                  onChange={(e) => handleChange("luasTanah", e.target.value)}
                />
              </div>
              <div>
                <Label>Luas Bangunan (m²)</Label>
                <Input
                  type="number"
                  value={formData.luasBangunan}
                  onChange={(e) => handleChange("luasBangunan", e.target.value)}
                />
              </div>
              <div>
                <Label>Lebar Depan (m)</Label>
                <Input
                  type="number"
                  value={formData.lebarDepan}
                  onChange={(e) => handleChange("lebarDepan", e.target.value)}
                />
              </div>
              <div>
                <Label>Jumlah Lantai</Label>
                <Input
                  type="number"
                  value={formData.jumlahLantai}
                  onChange={(e) => handleChange("jumlahLantai", e.target.value)}
                />
              </div>
              <div>
                <Label>Jumlah Kamar Tidur</Label>
                <Input
                  type="number"
                  value={formData.kamarTidur}
                  onChange={(e) => handleChange("kamarTidur", e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ruangPenjaga"
                  checked={formData.ruangPenjaga}
                  onCheckedChange={(checked) => handleChange("ruangPenjaga", checked)}
                />
                <Label htmlFor="ruangPenjaga">Ruang Penjaga</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tokenListrikPerkamar"
                  checked={formData.tokenListrikPerkamar}
                  onCheckedChange={(checked) => handleChange("tokenListrikPerkamar", checked)}
                />
                <Label htmlFor="tokenListrikPerkamar">Token Listrik Sudah Perkamar</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input
                  value={formData.hargaSewaKamarBulan}
                  onChange={(e) => handlePriceChange("hargaSewaKamarBulan", e.target.value)}
                  placeholder="Contoh: 500.000"
                />
              </div>
              <div>
                <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
                <Input
                  value={formData.biayaPengeluaranBulan}
                  onChange={(e) => handlePriceChange("biayaPengeluaranBulan", e.target.value)}
                  placeholder="Contoh: 1.000.000"
                />
              </div>
            </div>

            <div>
              <Label>Kelengkapan</Label>
              <select
                value={formData.kelengkapan}
                onChange={(e) => handleChange("kelengkapan", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Pilih Kelengkapan</option>
                {KELENGKAPAN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case "hotel":
      case "homestay":
      case "villa":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.jenisProperti === "hotel" && (
                <div>
                  <Label>Jenis Hotel</Label>
                  <select
                    value={formData.jenisHotel}
                    onChange={(e) => handleChange("jenisHotel", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Pilih Jenis</option>
                    {JENIS_HOTEL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label>Luas Tanah (m²)</Label>
                <Input
                  type="number"
                  value={formData.luasTanah}
                  onChange={(e) => handleChange("luasTanah", e.target.value)}
                />
              </div>
              <div>
                <Label>Luas Bangunan (m²)</Label>
                <Input
                  type="number"
                  value={formData.luasBangunan}
                  onChange={(e) => handleChange("luasBangunan", e.target.value)}
                />
              </div>
              <div>
                <Label>Lebar Depan (m)</Label>
                <Input
                  type="number"
                  value={formData.lebarDepan}
                  onChange={(e) => handleChange("lebarDepan", e.target.value)}
                />
              </div>
              <div>
                <Label>Jumlah Lantai</Label>
                <Input
                  type="number"
                  value={formData.jumlahLantai}
                  onChange={(e) => handleChange("jumlahLantai", e.target.value)}
                />
              </div>
              <div>
                <Label>Jumlah Kamar Tidur</Label>
                <Input
                  type="number"
                  value={formData.kamarTidur}
                  onChange={(e) => handleChange("kamarTidur", e.target.value)}
                />
              </div>
              <div>
                <Label>Jumlah Kamar Mandi</Label>
                <Input
                  type="number"
                  value={formData.kamarMandi}
                  onChange={(e) => handleChange("kamarMandi", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input
                  value={formData.hargaSewaKamarBulan}
                  onChange={(e) => handlePriceChange("hargaSewaKamarBulan", e.target.value)}
                />
              </div>
              <div>
                <Label>Income Rata-Rata Per Bulan (Rp)</Label>
                <Input
                  value={formData.incomeRataRataBulan}
                  onChange={(e) => handlePriceChange("incomeRataRataBulan", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
              <Input
                value={formData.biayaPengeluaranBulan}
                onChange={(e) => handlePriceChange("biayaPengeluaranBulan", e.target.value)}
              />
            </div>

            <div>
              <Label>Kelengkapan</Label>
              <select
                value={formData.kelengkapan}
                onChange={(e) => handleChange("kelengkapan", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Pilih Kelengkapan</option>
                {KELENGKAPAN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case "apartment":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Luas Bangunan (m²)</Label>
                <Input
                  type="number"
                  value={formData.luasBangunan}
                  onChange={(e) => handleChange("luasBangunan", e.target.value)}
                />
              </div>
              <div>
                <Label>Lantai</Label>
                <Input
                  type="number"
                  value={formData.jumlahLantai}
                  onChange={(e) => handleChange("jumlahLantai", e.target.value)}
                />
              </div>
              <div>
                <Label>No. Unit</Label>
                <Input
                  value={formData.noUnit}
                  onChange={(e) => handleChange("noUnit", e.target.value)}
                  placeholder="Contoh: Unit 101"
                />
              </div>
              <div>
                <Label>Jumlah Kamar Tidur</Label>
                <Input
                  type="number"
                  value={formData.kamarTidur}
                  onChange={(e) => handleChange("kamarTidur", e.target.value)}
                />
              </div>
              <div>
                <Label>Jumlah Kamar Mandi</Label>
                <Input
                  type="number"
                  value={formData.kamarMandi}
                  onChange={(e) => handleChange("kamarMandi", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Kelengkapan</Label>
              <select
                value={formData.kelengkapan}
                onChange={(e) => handleChange("kelengkapan", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Pilih Kelengkapan</option>
                {KELENGKAPAN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case "gudang":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²)</Label>
              <Input
                type="number"
                value={formData.luasTanah}
                onChange={(e) => handleChange("luasTanah", e.target.value)}
              />
            </div>
            <div>
              <Label>Luas Bangunan (m²)</Label>
              <Input
                type="number"
                value={formData.luasBangunan}
                onChange={(e) => handleChange("luasBangunan", e.target.value)}
              />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input
                type="number"
                value={formData.lebarDepan}
                onChange={(e) => handleChange("lebarDepan", e.target.value)}
              />
            </div>
          </div>
        );

      case "komersial":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²)</Label>
              <Input
                type="number"
                value={formData.luasTanah}
                onChange={(e) => handleChange("luasTanah", e.target.value)}
              />
            </div>
            <div>
              <Label>Luas Bangunan (m²)</Label>
              <Input
                type="number"
                value={formData.luasBangunan}
                onChange={(e) => handleChange("luasBangunan", e.target.value)}
              />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input
                type="number"
                value={formData.lebarDepan}
                onChange={(e) => handleChange("lebarDepan", e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Form Properti
        </CardTitle>
        <CardDescription>
          Lengkapi data properti sesuai jenis yang dipilih
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tujuan */}
          <div className="space-y-2">
            <Label>Tujuan Transaksi <span className="text-red-500">*</span></Label>
            <div className="flex gap-4">
              {TUJUAN_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={opt.value}
                    checked={formData.tujuan === opt.value}
                    onCheckedChange={() => handleChange("tujuan", opt.value)}
                  />
                  <Label htmlFor={opt.value} className="cursor-pointer">{opt.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Jenis Properti */}
          <div className="space-y-2">
            <Label>Jenis Properti <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.value}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${formData.jenisProperti === type.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => handleChange("jenisProperti", type.value)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Fields Based on Property Type */}
          {formData.jenisProperti && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Detail Properti</h3>
              {renderDynamicFields()}
            </div>
          )}

          {/* Harga */}
          {(formData.tujuan === "Dijual" || formData.tujuan === "Dijual & Disewakan") && (
            <div className="space-y-4">
              <h3 className="font-semibold">Harga Jual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Harga Penawaran (Rp)</Label>
                  <Input
                    value={formData.hargaJual}
                    onChange={(e) => handlePriceChange("hargaJual", e.target.value)}
                    placeholder="Contoh: 500.000.000"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hargaJualNego"
                      checked={formData.hargaJualNego}
                      onCheckedChange={(checked) => handleChange("hargaJualNego", checked)}
                    />
                    <Label htmlFor="hargaJualNego" className="cursor-pointer">Nego</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hargaJualNett"
                      checked={formData.hargaJualNett}
                      onCheckedChange={(checked) => handleChange("hargaJualNett", checked)}
                    />
                    <Label htmlFor="hargaJualNett" className="cursor-pointer">Nett</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(formData.tujuan === "Disewakan" || formData.tujuan === "Dijual & Disewakan") && (
            <div className="space-y-4">
              <h3 className="font-semibold">Harga Sewa</h3>
              <div>
                <Label>Harga Sewa Per Tahun (Rp)</Label>
                <Input
                  value={formData.hargaSewaTahunan}
                  onChange={(e) => handlePriceChange("hargaSewaTahunan", e.target.value)}
                  placeholder="Contoh: 60.000.000"
                />
              </div>
            </div>
          )}

          {/* Alamat */}
          <div className="space-y-4">
            <h3 className="font-semibold">Lokasi Properti</h3>
            <div>
              <Label>Alamat Lengkap Properti</Label>
              <Textarea
                value={formData.alamatLengkap}
                onChange={(e) => handleChange("alamatLengkap", e.target.value)}
                placeholder="Jl. Nama Jalan, Kelurahan, Kecamatan, Kabupaten, Provinsi"
                rows={3}
              />
            </div>
            <div>
              <Label>Link Google Maps (Admin Only)</Label>
              <Input
                value={formData.googleMapsLink}
                onChange={(e) => handleChange("googleMapsLink", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provinsi</Label>
                <Input
                  value={formData.provinsi}
                  onChange={(e) => handleChange("provinsi", e.target.value)}
                  placeholder="Contoh: DIY"
                />
              </div>
              <div>
                <Label>Kabupaten/Kota</Label>
                <Input
                  value={formData.kabupaten}
                  onChange={(e) => handleChange("kabupaten", e.target.value)}
                  placeholder="Contoh: Sleman"
                />
              </div>
            </div>
          </div>

          {/* Legalitas */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legalitas</h3>
            <div>
              <Label>Status Legalitas</Label>
              <select
                value={formData.legalitas}
                onChange={(e) => handleChange("legalitas", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Pilih Legalitas</option>
                {LEGALITAS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <Label>Status:</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="statusOnHand"
                  checked={formData.statusLegalitas === "On Hand"}
                  onCheckedChange={() => handleChange("statusLegalitas", "On Hand")}
                />
                <Label htmlFor="statusOnHand">On Hand</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="statusOnBank"
                  checked={formData.statusLegalitas === "On Bank"}
                  onCheckedChange={() => handleChange("statusLegalitas", "On Bank")}
                />
                <Label htmlFor="statusOnBank">On Bank</Label>
              </div>
            </div>

            {formData.statusLegalitas === "On Bank" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Diagunkan di Bank Apa?</Label>
                  <Input
                    value={formData.bankTerhubung}
                    onChange={(e) => handleChange("bankTerhubung", e.target.value)}
                    placeholder="Nama Bank"
                  />
                </div>
                <div>
                  <Label>Outstanding Properti Di Bank (Rp)</Label>
                  <Input
                    value={formData.outstandingBank}
                    onChange={(e) => handlePriceChange("outstandingBank", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lingkungan */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informasi Lingkungan</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="dekatSungai"
                  checked={formData.dekatSungai}
                  onCheckedChange={(checked) => handleChange("dekatSungai", checked)}
                />
                <Label htmlFor="dekatSungai">Dekat Sungai</Label>
              </div>
              {formData.dekatSungai && (
                <div className="ml-6">
                  <Label>Jarak ke Sungai (meter)</Label>
                  <Input
                    type="number"
                    value={formData.jarakSungaiMeter}
                    onChange={(e) => handleChange("jarakSungaiMeter", e.target.value)}
                    className="w-40"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="dekatMakam"
                  checked={formData.dekatMakam}
                  onCheckedChange={(checked) => handleChange("dekatMakam", checked)}
                />
                <Label htmlFor="dekatMakam">Dekat Makam</Label>
              </div>
              {formData.dekatMakam && (
                <div className="ml-6">
                  <Label>Jarak ke Makam (meter)</Label>
                  <Input
                    type="number"
                    value={formData.jarakMakamMeter}
                    onChange={(e) => handleChange("jarakMakamMeter", e.target.value)}
                    className="w-40"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="dekatSutet"
                  checked={formData.dekatSutet}
                  onCheckedChange={(checked) => handleChange("dekatSutet", checked)}
                />
                <Label htmlFor="dekatSutet">Dekat Sutet</Label>
              </div>
              {formData.dekatSutet && (
                <div className="ml-6">
                  <Label>Jarak ke Sutet (meter)</Label>
                  <Input
                    type="number"
                    value={formData.jarakSutetMeter}
                    onChange={(e) => handleChange("jarakSutetMeter", e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Lebar Jalan (meter)</Label>
              <Input
                type="number"
                value={formData.lebarJalanMeter}
                onChange={(e) => handleChange("lebarJalanMeter", e.target.value)}
                placeholder="Contoh: 4"
                className="w-40"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informasi Tambahan</h3>
            <div>
              <Label>Alasan Dijual</Label>
              <Textarea
                value={formData.alasanDijual}
                onChange={(e) => handleChange("alasanDijual", e.target.value)}
                placeholder="Jelaskan mengapa properti ini dijual..."
                rows={2}
              />
            </div>
            <div>
              <Label>Deskripsi Properti</Label>
              <Textarea
                value={formData.deskripsiProperti}
                onChange={(e) => handleChange("deskripsiProperti", e.target.value)}
                placeholder="Jelaskan secara lengkap dan detail mengenai properti..."
                rows={4}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Simpan Properti
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default DynamicPropertyForm;
