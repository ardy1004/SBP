// Production Property Form Component - SESUAI REQUEST USER
// Maps to EXISTING properties table columns - NO MODIFICATIONS TO TABLE
// Uses existing columns + extension columns from migration

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { MultiImageDropzone } from "@/components/MultiImageDropzone";
import { uploadFileToWorker } from "@/services/admin/imageService";
import {
  Home,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  Building2,
  Building,
  Warehouse,
  Trees,
  Store,
  Castle,
  Eye,
  EyeOff,
  Upload,
  X,
  RefreshCw,
  Plus,
  Trash2,
  Download
} from "lucide-react";

// Data lokasi Indonesia (Provinsi, Kabupaten, Kecamatan) - SAMA DENGAN HEROSECTION
interface LocationData {
  [province: string]: {
    [city: string]: string[];
  };
}

const indonesiaLocations: LocationData = {
  "yogyakarta": {
    "sleman": ["depok", "gamping", "mlati", "ngaglik", "ngemplak", "pakem", "seyegan", "tempel", "turi"],
    "bantul": ["bambanglipuro", "banguntapan", "bantul", "dlingo", "imogiri", "jetis", "kasihan", "kretek", "pajangan", "pandak", "piyungan", "pleret", "pundong", "sanden", "sewon", "srandakan"],
    "gunungkidul": ["gedangsari", "girisubo", "karangmojo", "ngawen", "nglipar", "paliyan", "panggang", "patuk", "playen", "ponjong", "purwosari", "rongkop", "saptosari", "semanu", "semin", "tanjungsari", "tepus", "trowono"],
    "kulonprogo": ["galur", "girimulyo", "kalibawang", "kokap", "lendah", "nanggulan", "panjatan", "pengasih", "samigaluh", "sentolo", "temon", "wates"],
    "kota-yogyakarta": ["danurejan", "gedongtengen", "gondokusuman", "gondomanan", "jetis", "kotagede", "kraton", "mantrijeron", "mergangsan", "mlangkali", "ngampilan", "pakualaman", "tegalrejo", "umbulharjo", "wirobrajan"]
  },
  "jawa-timur": {
    "surabaya": ["aye", "benowo", "bubutan", "bulak", "darmo", "gubeng", "gununganyar", "jambangan", "karangpilang", "kenjeran", "krembangan", "lakarsantri", "mulyorejo", "pabean-cantian", "pakal", "rungkut", "sambikerep", "sawahan", "semampir", "simokerto", "sukolilo", "sukomanunggal", "tambaksari", "tegalsari", "tenggilis-mejoyo", "wiyung", "wonocolo", "wonokromo"],
    "malang": ["blimbing", "kedungkandang", "klojen", "lowokwaru", "sukun"],
    "sidoarjo": ["balongbendo", "buduran", "candi", "gedangan", "jabon", "krembung", "krian", "porong", "prambon", "sedati", "sidoarjo", "sukodono", "taman", "tanggulangin", "tarik", "tulangan", "waru", "wonoayu"],
    "gresik": ["balongpanggang", "benjeng", "bunjah", "cerme", "dukun", "gresik", "kebomas", "kedamean", "manyar", "menganti", "panceng", "sidayu", "sungai-berem", "tambak", "udanan", "wringinanom"],
    "pasuruan": ["bangil", "beji", "grati", "kejayan", "kraton", "leksono", "nguling", "pandaan", "pasrepan", "pohjentrek", "prigen", "purwodadi", "purwosari", "puspo", "rejoso", "rembang", "sukorejo", "tosari", "tutur", "winongan", "wonorejo"]
  },
  "jawa-barat": {
    "bandung": ["antapani", "arcamanik", "andir", "babakan-ciparay", "bandung-kulon", "bandung-wetan", "batununggal", "bojongloa-kaler", "bojongloa-kidul", "buahbatu", "cibeunying-kaler", "cibeunying-kidul", "cibiru", "cicendo", "cidadap", "cinambo", "coblong", "gede-bage", "kiaracondong", "lengkong", "mandalajati", "panyileukan", "rancasari", "regol", "sukajadi", "sukasari", "sumur-bandung", "ujung-berung"],
    "bekasi": ["bantar-gebang", "bekasi-barat", "bekasi-selatan", "bekasi-timur", "bekasi-utara", "jati-sampurna", "jatisari", "medan-satria", "mustika-jaya", "pondok-gede", "pondok-melati", "rawalumbu"],
    "bogor": ["bogor-barat", "bogor-selatan", "bogor-tengah", "bogor-timur", "bogor-utara", "tanah-sareal"],
    "depok": ["beji", "bojongsari", "cilodong", "cimanggis", "cinere", "cipayung", "depok", "limo", "pancoran-mas", "sawangan", "sukmajaya", "tapos"],
    "cirebon": ["arjawinangun", "astanajapura", "babakan", "ciledug", "cirebon-barat", "cirebon-selatan", "cirebon-timur", "cirebon-utara", "depok", "gempol", "greged", "grogol", "gunungjati", "harjamukti", "kapetakan", "kedawung", "kertajaya", "kesambi", "lemahwungkuk", "mundu", "pangenan", "panjunan", "pasaleman", "pekalipan", "plumbon", "sedong", "sumber", "sumber-tengah", "surakerta", "tengah-tani", "waled"]
  },
  "dki-jakarta": {
    "jakarta-barat": ["cengkareng", "grogol-petamburan", "kalideres", "kebon-jeruk", "kembangan", "palmerah", "taman-sari", "tambora"],
    "jakarta-pusat": ["cempaka-putih", "gambir", "johar-baru", "kemayoran", "menteng", "sawah-besar", "senen", "tanah-abang"],
    "jakarta-selatan": ["cilandak", "jagakarsa", "kebayoran-baru", "kebayoran-lama", "mampang-prapatan", "pancoran", "pasar-minggu", "pesanggrahan", "setia-budi", "tebet"],
    "jakarta-timur": ["cakung", "cipayung", "ciracas", "duren-sawit", "jatinegara", "kramat-jati", "makasar", "matraman", "pasar-rebo", "pulo-gadung"],
    "jakarta-utara": ["cilincing", "kelapa-gading", "kojaya", "padang", "penjaringan", "tanjung-priok"]
  },
  "bali": {
    "badung": ["abiansemal", "kuta", "kuta-selatan", "kuta-utara", "megwi", "mengwi", "petang"],
    "denpasar": ["denpasar-barat", "denpasar-selatan", "denpasar-timur", "denpasar-utara"],
    "gianyar": ["blahbatuh", "gianyar", "payangan", "sukawati", "tegallalang", "ubud"],
    "tabanan": ["baturiti", "kediri", "kerambitan", "margarana", "penebel", "pupuan", "salemadeg", "selemadeg", "selemadeg-barat", "selemadeg-timur", "tabanan"],
    "bangli": ["bangli", "kintamani", "susut", "tembuku"]
  },
  "jawa-tengah": {
    "semarang": ["banyumanik", "candisari", "gajahmungkur", "gayamsari", "genuk", "gunungpati", "mijen", "ngaliyan", "pedurungan", "semarang-barat", "semarang-selatan", "semarang-tengah", "semarang-timur", "semarang-utara", "tembalang", "tugu"],
    "solo": ["banjarsari", "jebres", "laweyan", "pasar-kliwon", "serengan"],
    "magelang": ["bandongan", "borobudur", "candimulyo", "dukun", "grabag", "kaliangkrik", "mertoyudan", "mungkid", "muntilan", "ngablak", "ngamprah", "ngluwar", "pahekan", "pakis", "salam", "salaman", "sawangan", "secang", "srumbung", "tegaldlimo", "tempuran", "windusari"]
  },
  "banten": {
    "tangerang": ["batuceper", "benda", "cibodas", "ciledug", "cipondoh", "jatiuwung", "karang-tengah", "karawaci", "larangan", "neglasari", "periuk", "pinang", "tangerang"],
    "tangerang-selatan": ["ciputat", "ciputat-timur", "pamulang", "pondok-aren", "serpong", "serpong-utara", "setu"],
    "serang": ["anyar", "binuang", "boi", "carenang", "cikande", "cikeusal", "ciruas", "gunungsari", "jawilan", "kibin", "kragilan", "kramatwatu", "lebak-wangi", "mancak", "masing", "pabuaran", "padarincang", "pamarayan", "petir", "pontang", "pulo-ampel", "tanara", "tirtayasa", "tunjung-teja", "waringinkurung"]
  },
  "sumatera-utara": {
    "medan": ["medan-amplas", "medan-area", "medan-barat", "medan-baru", "medan-beliawan", "medan-denai", "medan-helvetia", "medan-johor", "medan-kota", "medan-labuhan", "medan-maimun", "medan-marelan", "medan-perjuangan", "medan-petisah", "medan-polonia", "medan-selayang", "medan-sunggal", "medan-tembung", "medan-timur", "medan-tuntungan"],
    "deli-serdang": ["babal", "bangun-purba", "batan-gwolum", "biru-biru", "deli-tua", "galang", "gunung-meriah", "hamparan-perak", "kutalimbaru", "labuhan-delhi", "lubuk-pakam", "namo-rambe", "pagar-merbau", "pancur-batu", "pantai-labu", "patumbak", "percunt-sei", "sibolangit", "sinembah-tanjung-muda-hilir", "sinembah-tanjung-muda-ulu", "sunggal", "tanjung-morawa"]
  },
  "riau": {
    "pekanbaru": ["bukit-raya", "kulim", "limapuluh", "marpoyan-damai", "payung-sekaki", "pekanbaru-kota", "sail", "senaapelan", "sukajadi", "tampan", "tenayan-raya", "tuah-madu"],
    "dumai": ["bukit-kapuas", "dumai-barat", "dumai-kota", "dumai-selatan", "dumai-timur", "medang-kamol", "sungai-sembilan"]
  },
  "sumatera-barat": {
    "padang": ["bungus-teluk-kabung", "koto-tangah", "kurao-pagang", "lubuk-begalung", "lubuk-kilangan", "nanggalo", "padang-barat", "padang-selatan", "padang-timur", "padang-utara", "pauh"],
    "bukittinggi": ["aur-birugo-tigo-baleh", "guguk-panjang", "mandiangin-koto-selayan", "sungai-tarabang"]
  }
};

// PROPERTY TYPES - maps to properties.jenis_properti
const PROPERTY_TYPES = [
  { value: "rumah", label: "Rumah" },
  { value: "tanah", label: "Tanah" },
  { value: "kost", label: "Kost" },
  { value: "hotel", label: "Hotel" },
  { value: "homestay", label: "Homestay / Guesthouse" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "gudang", label: "Gudang" },
  { value: "komersial", label: "Bangunan Komersial" },
];

// LEGALITAS - sesuai request user
const LEGALITAS_OPTIONS = [
  { value: "SHM & IMB", label: "SHM & IMB / PBG Lengkap" },
  { value: "SHGB & IMB", label: "SHGB & IMB / PBG Lengkap (Berlaku Sampai: [tgl])" },
  { value: "SHM Saja", label: "SHM Pekarangan Saja Tanpa IMB / PBG" },
  { value: "SHM Sawah", label: "SHM Sawah / Tegalan" },
  { value: "SHGB Saja", label: "SHGB Saja Tanpa IMB / PBG" },
  { value: "Girik", label: "Girik / Letter C / PPJB / dll" },
  { value: "Izin Usaha", label: "Izin Usaha" },
];

// JENIS HOTEL - sesuai request user
const JENIS_HOTEL_OPTIONS = [
  { value: "Budget", label: "Budget / Melati" },
  { value: "Bintang 1", label: "Bintang 1" },
  { value: "Bintang 2", label: "Bintang 2" },
  { value: "Bintang 3", label: "Bintang 3" },
  { value: "Bintang 4", label: "Bintang 4" },
  { value: "Bintang 5", label: "Bintang 5" },
  { value: "Boutique", label: "Boutique" },
];

interface OwnerData {
  nama_lengkap: string;
  no_ktp: string;
  alamat_ktp: string;
  whatsapp_1: string;
}

interface AgreementData {
  id?: string;
  agreement_type: string;
  tujuan?: string; // dijual/disewakan
  exclusive_booster_duration_months: number;
  meta_ads_enabled: boolean;
  tiktok_ads_enabled: boolean;
}

interface ProductionPropertyFormProps {
  property?: any;
  sourceInput: 'ADMIN' | 'OWNER';
  ownerData?: OwnerData | null;
  agreementData?: AgreementData | null;
  agreementId?: string | null;
  onSuccess?: (propertyId: string, goToComplete?: boolean) => void;
}

export function ProductionPropertyForm({ 
  property, 
  sourceInput = 'ADMIN',
  ownerData,
  agreementData,
  agreementId,
  onSuccess 
}: ProductionPropertyFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    // Core fields
    kode_listing: property?.kode_listing || property?.kodeListing || "",
    judul_properti: property?.judul_properti || property?.judulProperti || "",
    deskripsi: property?.deskripsi || "",
    harga_properti: property?.harga_properti || property?.hargaProperti || "",
    harga_per_meter: property?.harga_per_meter || property?.hargaPerMeter || false,
    price_old: property?.price_old || property?.priceOld || "",
    luas_tanah: property?.luas_tanah || property?.luasTanah || "",
    luas_bangunan: property?.luas_bangunan || property?.luasBangunan || "",
    kamar_tidur: property?.kamar_tidur || property?.kamarTidur || "",
    kamar_mandi: property?.kamar_mandi || property?.kamarMandi || "",
    jenis_properti: property?.jenis_properti || property?.jenisProperti || "",
    legalitas: property?.legalitas || "",
    shgb_expired_at: property?.shgb_expired_at || "",
    provinsi: property?.provinsi || property?.Provinsi || "",
    kabupaten: property?.kabupaten || "",
    kecamatan: property?.kecamatan || "",
    kelurahan: property?.kelurahan || "",
    alamat_lengkap: property?.alamat_lengkap || property?.alamatLengkap || "",
    
    // Images
    image_url: property?.image_url || "",
    image_url1: property?.image_url1 || "",
    image_url2: property?.image_url2 || "",
    image_url3: property?.image_url3 || "",
    image_url4: property?.image_url4 || "",
    image_url5: property?.image_url5 || "",
    image_url6: property?.image_url6 || "",
    image_url7: property?.image_url7 || "",
    image_url8: property?.image_url8 || "",
    image_url9: property?.image_url9 || "",
    youtube_url: property?.youtube_url || "",
    
    // Status - Updated: multiple selections allowed
    status_dijual: property?.status === "dijual" || property?.status === "dijual_disewakan" || false,
    status_disewakan: property?.status === "disewakan" || property?.status === "dijual_disewakan" || false,
    
    // Owner Contact
    owner_contact: property?.owner_contact || "",
    
    // Labels
    is_hot: property?.is_hot || false,
    is_sold: property?.is_sold || false,
    is_property_pilihan: property?.is_property_pilihan || false,
    is_premium: property?.is_premium || false,
    is_featured: property?.is_featured || false,
    
    // Meta
    meta_title: property?.meta_title || "",
    meta_description: property?.meta_description || "",
    
    // Extension fields
    lebar_depan: property?.lebar_depan || "",
    jumlah_lantai: property?.jumlah_lantai || "",
    jenis_kost: property?.jenis_kost || "",
    jenis_hotel: property?.jenis_hotel || "",
    ruang_penjaga: property?.ruang_penjaga || false,
    token_listrik_perkamar: property?.token_listrik_perkamar || false,
    no_unit: property?.no_unit || "",
    kelengkapan: property?.kelengkapan || "",
    status_legalitas: property?.status_legalitas || "On Hand",
    bank_terkait: property?.bank_terkait || "",
    outstanding_bank: property?.outstanding_bank || "",
    dekat_sungai: property?.dekat_sungai || false,
    jarak_sungai: property?.jarak_sungai || "",
    dekat_makam: property?.dekat_makam || false,
    jarak_makam: property?.jarak_makam || "",
    dekat_sutet: property?.dekat_sutet || false,
    jarak_sutet: property?.jarak_sutet || "",
    lebar_jalan: property?.lebar_jalan || "",
    alasan_dijual: property?.alasan_dijual || "",
    
    // Price variants
    harga_sewa_tahunan: property?.harga_sewa_tahunan || "",
    harga_nego: property?.harga_nego !== false,
    harga_nett: property?.harga_nett || false,
    
    // Rental price fields for agreement
    harga_sewa: property?.harga_sewa || "",
    periode_harga_sewa: property?.periode_harga_sewa || "tahun", // bulan/tahun
    
    // Income/Operational
    income_per_bulan: property?.income_per_bulan || "",
    biaya_pengeluaran_per_bulan: property?.biaya_pengeluaran_per_bulan || "",
    harga_sewa_kamar: property?.harga_sewa_kamar || "",
    
    // Google Maps (admin only - not on homepage)
    google_maps_link: property?.google_maps_link || "",
    
    // Source tracking
    source_input: sourceInput,
    publish_status: property?.publish_status || (sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED'),
    
    // Agreement
    agreement_status: property?.agreement_status || "none",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleMaps, setShowGoogleMaps] = useState(false);
  const [submittedProperties, setSubmittedProperties] = useState<string[]>([]);
  const [showAddAnother, setShowAddAnother] = useState(false);
  const [showAgreementPreview, setShowAgreementPreview] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [ownerSignature, setOwnerSignature] = useState<string>('');
  const [savedAgreementUrl, setSavedAgreementUrl] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [materaiDataUrl, setMateraiDataUrl] = useState<string>('');
  const [agentSignatureDataUrl, setAgentSignatureDataUrl] = useState<string>('');
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const agreementPreviewRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Preload materai and agent signature images
  const preloadAgreementImages = useCallback(async () => {
    try {
      // Load materai image
      const materaiImg = new Image();
      materaiImg.crossOrigin = 'anonymous';
      materaiImg.src = 'https://images.salambumi.xyz/materai/hg.png';
      
      await new Promise((resolve, reject) => {
        materaiImg.onload = () => {
          // Convert to canvas and get data URL
          const canvas = document.createElement('canvas');
          canvas.width = materaiImg.width;
          canvas.height = materaiImg.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(materaiImg, 0, 0);
            setMateraiDataUrl(canvas.toDataURL('image/png'));
          }
          resolve(null);
        };
        materaiImg.onerror = () => {
          console.error('[Materai] Failed to preload');
          resolve(null); // Don't reject, just continue without image
        };
      });

      // Load agent signature image
      const agentImg = new Image();
      agentImg.crossOrigin = 'anonymous';
      agentImg.src = 'https://images.salambumi.xyz/materai/gsd-removebg-preview%20-%20Copy.png';
      
      await new Promise((resolve, reject) => {
        agentImg.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = agentImg.width;
          canvas.height = agentImg.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(agentImg, 0, 0);
            setAgentSignatureDataUrl(canvas.toDataURL('image/png'));
          }
          resolve(null);
        };
        agentImg.onerror = () => {
          console.error('[Agent Signature] Failed to preload');
          resolve(null);
        };
      });

      console.log('[Agreement] Images preloaded successfully');
      setImagesPreloaded(true);
    } catch (error) {
      console.error('[Agreement] Error preloading images:', error);
      // Still set to true to avoid blocking UI if images fail to load
      setImagesPreloaded(true);
    }
  }, []);

  // Preload images when agreement preview is opened
  useEffect(() => {
    if (showAgreementPreview) {
      preloadAgreementImages();
    }
  }, [showAgreementPreview, preloadAgreementImages]);

  // Location dropdown state (cascading)
  const [selectedProvince, setSelectedProvince] = useState<string>(property?.provinsi?.toLowerCase().replace(/\s+/g, '-') || "");
  const [selectedCity, setSelectedCity] = useState<string>(property?.kabupaten?.toLowerCase().replace(/\s+/g, '-') || "");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(property?.kecamatan?.toLowerCase().replace(/\s+/g, '-') || "");

  // Get list cities berdasarkan province yang dipilih
  const availableCities = useMemo(() => {
    if (!selectedProvince) return [];
    return Object.keys(indonesiaLocations[selectedProvince] || {});
  }, [selectedProvince]);

  // Get list districts berdasarkan city yang dipilih
  const availableDistricts = useMemo(() => {
    if (!selectedProvince || !selectedCity) return [];
    return indonesiaLocations[selectedProvince]?.[selectedCity] || [];
  }, [selectedProvince, selectedCity]);

  // Get list provinces
  const provinces = useMemo(() => Object.keys(indonesiaLocations), []);

  // Handle provinsi change
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity("");
    setSelectedDistrict("");
    // Convert ke format tampilan (Title Case)
    const displayProvince = province.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    handleChange("provinsi", displayProvince);
    handleChange("kabupaten", "");
    handleChange("kecamatan", "");
    handleChange("kelurahan", "");
  };

  // Handle kabupaten change
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict("");
    const displayCity = city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    handleChange("kabupaten", displayCity);
    handleChange("kecamatan", "");
    handleChange("kelurahan", "");
  };

  // Handle kecamatan change
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    const displayDistrict = district.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    handleChange("kecamatan", displayDistrict);
    handleChange("kelurahan", "");
  };

  // Handle kelurahan change (free text untuk backward compatibility)
  const handleVillageChange = (village: string) => {
    handleChange("kelurahan", village);
  };

  // Sync dropdown state with formData (for editing existing properties)
  useEffect(() => {
    if (formData.provinsi) {
      const provinceSlug = formData.provinsi.toLowerCase().replace(/\s+/g, '-');
      if (indonesiaLocations[provinceSlug]) {
        setSelectedProvince(provinceSlug);
      }
    }
    if (formData.kabupaten) {
      const citySlug = formData.kabupaten.toLowerCase().replace(/\s+/g, '-');
      if (selectedProvince && indonesiaLocations[selectedProvince]?.[citySlug]) {
        setSelectedCity(citySlug);
      }
    }
    if (formData.kecamatan) {
      const districtSlug = formData.kecamatan.toLowerCase().replace(/\s+/g, '-');
      if (selectedProvince && selectedCity && indonesiaLocations[selectedProvince]?.[selectedCity]?.includes(districtSlug)) {
        setSelectedDistrict(districtSlug);
      }
    }
  }, [formData.provinsi, formData.kabupaten, formData.kecamatan]);

  // Update form when property prop changes (e.g., when editing different property)
  useEffect(() => {
    if (property?.id) {
      setFormData({
        // Core fields
        kode_listing: property?.kode_listing || property?.kodeListing || "",
        judul_properti: property?.judul_properti || property?.judulProperti || "",
        deskripsi: property?.deskripsi || "",
        harga_properti: property?.harga_properti || property?.hargaProperti || "",
        harga_per_meter: property?.harga_per_meter || property?.hargaPerMeter || false,
        price_old: property?.price_old || property?.priceOld || "",
        luas_tanah: property?.luas_tanah || property?.luasTanah || "",
        luas_bangunan: property?.luas_bangunan || property?.luasBangunan || "",
        kamar_tidur: property?.kamar_tidur || property?.kamarTidur || "",
        kamar_mandi: property?.kamar_mandi || property?.kamarMandi || "",
        jenis_properti: property?.jenis_properti || property?.jenisProperti || "",
        legalitas: property?.legalitas || "",
        shgb_expired_at: property?.shgb_expired_at || property?.shgbExpiredAt || "",
        provinsi: property?.provinsi || property?.Provinsi || "",
        kabupaten: property?.kabupaten || "",
        kecamatan: property?.kecamatan || "",
        kelurahan: property?.kelurahan || "",
        alamat_lengkap: property?.alamat_lengkap || property?.alamatLengkap || "",
        
        // Images
        image_url: property?.image_url || property?.imageUrl || "",
        image_url1: property?.image_url1 || property?.imageUrl1 || "",
        image_url2: property?.image_url2 || property?.imageUrl2 || "",
        image_url3: property?.image_url3 || property?.imageUrl3 || "",
        image_url4: property?.image_url4 || property?.imageUrl4 || "",
        image_url5: property?.image_url5 || property?.imageUrl5 || "",
        image_url6: property?.image_url6 || property?.imageUrl6 || "",
        image_url7: property?.image_url7 || property?.imageUrl7 || "",
        image_url8: property?.image_url8 || property?.imageUrl8 || "",
        image_url9: property?.image_url9 || property?.imageUrl9 || "",
        youtube_url: property?.youtube_url || "",
        
        // Status
        status_dijual: property?.status === "dijual" || property?.status === "dijual_disewakan" || false,
        status_disewakan: property?.status === "disewakan" || property?.status === "dijual_disewakan" || false,
        
        // Owner Contact
        owner_contact: property?.owner_contact || property?.ownerContact || "",
        
        // Labels
        is_hot: property?.is_hot || false,
        is_sold: property?.is_sold || false,
        is_property_pilihan: property?.is_property_pilihan || false,
        is_premium: property?.is_premium || false,
        is_featured: property?.is_featured || false,
        
        // Meta
        meta_title: property?.meta_title || "",
        meta_description: property?.meta_description || "",
        
        // Extension fields
        kelengkapan: property?.kelengkapan || "",
        status_legalitas: property?.status_legalitas || "On Hand",
        lebar_depan: property?.lebar_depan || "",
        jumlah_lantai: property?.jumlah_lantai || "",
        jenis_kost: property?.jenis_kost || "",
        jenis_hotel: property?.jenis_hotel || "",
        ruang_penjaga: property?.ruang_penjaga || false,
        token_listrik_perkamar: property?.token_listrik_perkamar || false,
        no_unit: property?.no_unit || "",
        bank_terkait: property?.bank_terkait || "",
        outstanding_bank: property?.outstanding_bank || "",
        dekat_sungai: property?.dekat_sungai || false,
        jarak_sungai: property?.jarak_sungai || "",
        dekat_makam: property?.dekat_makam || false,
        jarak_makam: property?.jarak_makam || "",
        dekat_sutet: property?.dekat_sutet || false,
        jarak_sutet: property?.jarak_sutet || "",
        lebar_jalan: property?.lebar_jalan || "",
        alasan_dijual: property?.alasan_dijual || "",
        
        // Price variants
        harga_sewa_tahunan: property?.harga_sewa_tahunan || "",
        harga_nego: property?.harga_nego !== false,
        harga_nett: property?.harga_nett || false,
        
        // Rental price fields for agreement
        harga_sewa: property?.harga_sewa || "",
        periode_harga_sewa: property?.periode_harga_sewa || "tahun",
        
        // Income/Operational
        income_per_bulan: property?.income_per_bulan || "",
        biaya_pengeluaran_per_bulan: property?.biaya_pengeluaran_per_bulan || "",
        harga_sewa_kamar: property?.harga_sewa_kamar || "",
        
        // Google Maps
        google_maps_link: property?.google_maps_link || "",
        
        // Source tracking
        source_input: property?.source_input || sourceInput,
        publish_status: property?.publish_status || (sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED'),
        
        // Agreement
        agreement_status: property?.agreement_status || "none",
      });
    }
  }, [property?.id]);

  // Resize canvas to match CSS size - 1:1 mapping for accurate coordinate tracking
  const resizeCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Set internal resolution to match CSS size 1:1 (no pixel ratio scaling)
    // This ensures coordinates from getBoundingClientRect() map directly
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Set drawing styles - thicker lines for signature overlapping materai
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Initialize signature canvas
  useEffect(() => {
    if (showAgreementPreview && signatureCanvasRef.current) {
      resizeCanvas();
    }
  }, [showAgreementPreview, resizeCanvas]);

  // Get canvas-relative coordinates
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setLastPos(coords);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const coords = getCanvasCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setLastPos(coords);
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    if (signatureCanvasRef.current) {
      setOwnerSignature(signatureCanvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      const ctx = signatureCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
        setOwnerSignature('');
      }
    }
  };

  // Generate PDF from agreement
  const generatePDF = () => {
    const agreementContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Perjanjian Jasa Pemasaran - ${formData.kode_listing || 'SBP'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 16px; margin: 0; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; margin-bottom: 5px; }
          .party { border: 1px solid #000; padding: 10px; margin-bottom: 10px; }
          .signature-area { margin-top: 30px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 3px solid #000; margin-top: 60px; padding-top: 5px; }
          .stamp-area { position: relative; width: 250px; height: 160px; margin: 10px auto; }
          .stamp-img { position: absolute; width: 140px; bottom: 0; left: 0; }
          .ttd-img { position: absolute; width: 170px; bottom: 15px; left: 35px; }
          .agent-ttd { width: 200px; margin-top: 20px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PERJANJIAN JASA PEMASARAN</h1>
          <h2>SALAM BUMI PROPERTY</h2>
          <p>${agreementData?.agreement_type === 'exclusive_booster' ? `( EXCLUSIVE BOOSTER – KONTRAK ${agreementData?.exclusive_booster_duration_months || 6} BULAN )` : '( OPEN LISTING – PEMASARAN BEBAS )'}</p>
          <p>Nomor: ${formData.kode_listing || 'AUTO-GENERATE'}</p>
        </div>
        
        <p>Pada hari ini, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, telah dibuat dan disepakati Perjanjian Jasa Pemasaran Properti antara:</p>
        
        <div class="section">
          <div class="party">
            <div class="section-title">PIHAK PERTAMA</div>
            <div><strong>Nama Perusahaan :</strong> CV Salam Bumi Property</div>
            <div><strong>Alamat Kantor :</strong> Jl Pajajaran, Catur Tunggal, Depok, Sleman (Sekarang Menggunakan Virtual Office)</div>
            <div><strong>Telp / WhatsApp :</strong> 0813-9127-8889</div>
            <div><strong>Email :</strong> salambumiproperty@gmail.com</div>
            <div><strong>Website :</strong> salambumi.xyz</div>
            <p>Dalam hal ini bertindak sebagai Penyedia Jasa Pemasaran Properti, selanjutnya disebut PIHAK PERTAMA.</p>
          </div>
        </div>
        
        <div class="section">
          <div class="party">
            <div class="section-title">PIHAK KEDUA</div>
            <div><strong>Nama :</strong> ${ownerData?.nama_lengkap || '[Nama Pemilik]'}</div>
            <div><strong>No. KTP :</strong> ${ownerData?.no_ktp || '[No. KTP]'}</div>
            <div><strong>Alamat KTP :</strong> ${ownerData?.alamat_ktp || '[Alamat KTP]'}</div>
            <p>Dalam hal ini bertindak sebagai Pemilik Properti, selanjutnya disebut PIHAK KEDUA.</p>
            <p>PIHAK PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut para Pihak.</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 1 - OBJEK PERJANJIAN</div>
          <p>PIHAK KEDUA memberikan hak pemasaran secara ${agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE' : 'BEBAS / TIDAK TERIKAT'} kepada PIHAK PERTAMA untuk memasarkan properti milik PIHAK KEDUA dengan data sebagai berikut:</p>
          <div style="background: #f5f5f5; padding: 10px;">
            <div><strong>Jenis Properti :</strong> ${formData.jenis_properti || '-'}</div>
            <div><strong>Legalitas :</strong> ${formData.legalitas || '-'}</div>
            <div><strong>Alamat :</strong> ${formData.alamat_lengkap || `${formData.kelurahan || ''}, ${formData.kecamatan || ''}, ${formData.kabupaten || ''}, ${formData.provinsi || ''}`}</div>
            ${agreementData?.tujuan === 'disewakan'
              ? `<div><strong>Harga Sewa :</strong> Rp ${formData.harga_sewa ? parseInt(formData.harga_sewa).toLocaleString('id-ID') : '.................................'} / (${formData.periode_harga_sewa || 'tahun'})</div>`
              : `<div><strong>Harga Penawaran :</strong> ${formData.harga_properti ? `Rp ${parseInt(formData.harga_properti).toLocaleString('id-ID')}` : '-'} ${formData.harga_nego ? 'Nego' : ''} ${formData.harga_nett ? 'Nett' : ''}</div>`
            }
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 2 - JENIS LISTING DAN MASA KONTRAK</div>
          <p>Jenis listing yang disepakati adalah ${agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE LISTING' : 'OPEN LISTING'}.</p>
          ${agreementData?.agreement_type === 'exclusive_booster' ? `<p>Masa kontrak berlaku selama ${agreementData?.exclusive_booster_duration_months || 6} bulan, terhitung sejak tanggal ditandatanganinya perjanjian ini.</p>` : ''}
          ${agreementData?.agreement_type !== 'exclusive_booster' ? `<p>PIHAK KEDUA boleh dan bebas memasarkan propertinya sendiri atau melalui Agent / Perantara Lain selain kepada PIHAK PERTAMA.</p>` : ''}
          ${agreementData?.agreement_type !== 'exclusive_booster' ? `<p>Apabila properti terjual oleh calon pembeli dari PIHAK PERTAMA, maka PIHAK KEDUA wajib membayarkan fee 3% dari harga deal penjualan kepada pihak pertama.</p>` : ''}
          ${agreementData?.agreement_type === 'exclusive_booster' ? '<p>Apabila properti terjual selama masa kontrak, maka transaksi tersebut tetap dianggap sebagai hasil kerja PIHAK PERTAMA.</p>' : ''}
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 3 - KETENTUAN FEE / KOMISI</div>
          <p>PIHAK KEDUA menyetujui membayar fee atau komisi sebesar 3% (tiga persen) dari harga deal PENJUALAN kepada PIHAK PERTAMA jika PIHAK PERTAMA berhasil menjualkan properti milik PIHAK KEDUA.</p>
          <p>Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:</p>
          <ul>
            <li>Akta Jual Beli (AJB) ditandatangani, atau</li>
            <li>Apabila transaksi dilakukan secara tunai bertahap, maka pembayaran fee dilakukan setelah pembayaran mencapai minimal 30% (Down Payment) dari total harga.</li>
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 5 - KEWAJIBAN PIHAK PERTAMA</div>
          <ul>
            <li>Melakukan pemasaran properti secara profesional dan maksimal</li>
            <li>Menyusun strategi pemasaran sesuai standar Salam Bumi Property</li>
            <li>Memberikan laporan pemasaran secara berkala kepada PIHAK KEDUA</li>
          </ul>
          <div class="section-title">KEWAJIBAN PIHAK KEDUA</div>
          <ul>
            <li>Menyediakan data dan dokumen legalitas properti yang benar dan sah</li>
            <li>Memberikan akses yang diperlukan untuk kepentingan pemasaran</li>
            <li>Membayar fee sesuai ketentuan perjanjian ini</li>
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 6 - PENYELESAIAN SENGKETA</div>
          <p>Apabila terjadi perselisihan, para Pihak kesepakatan menyelesaikannya terlebih dahulu secara musyawarah untuk mufakat. Apabila tidak tercapai, diselesaikan melalui jalur hukum di wilayah hukum setempat.</p>
        </div>
        
        <div class="section">
          <div class="section-title">PASAL 7 - LAIN-LAIN</div>
          <ul>
            <li>Perjanjian ini mulai berlaku sejak ditandatangani oleh Para Pihak</li>
            <li>Perubahan atau penambahan hanya sah apabila dibuat secara tertulis dan disepakati oleh Para Pihak</li>
            <li>Perjanjian ini dibuat dalam 2 (dua) rangkap, masing-masing mempunyai kekuatan hukum yang sama</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          Yogyakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        
        <div class="signature-area">
          <div class="signature-box">
            <div>Yang Memberi Persetujuan</div>
            <div class="stamp-area">
              <img src="https://images.salambumi.xyz/materai/hg.png" class="stamp-img" />
              ${ownerSignature ? `<img src="${ownerSignature}" class="ttd-img" style="mix-blend-mode: multiply;" />` : ''}
            </div>
            <div class="signature-line">( ${ownerData?.nama_lengkap || '[Nama Pemilik]'} )</div>
          </div>
          
          <div class="signature-box">
            <div>Agent Pemasaran</div>
            <img src="https://images.salambumi.xyz/materai/gsd-removebg-preview%20-%20Copy.png" class="agent-ttd" />
            <div class="signature-line">( ARDY SALAM )</div>
            <div style="font-size: 10px; color: #666;">Salam Bumi Property</div>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 10px; background: #fffde7; font-size: 10px;">
          <strong>Catatan:</strong>
          <ul>
            <li>Tanda tangan ini sah secara hukum</li>
            <li>Pembayaran fee dilakukan setelah AJB ditandatangani</li>
            <li>50% dari booking fee akan diberikan ke agen jika pembatalan bukan caused by agent</li>
          </ul>
        </div>
      </body>
      </html>
    `;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(agreementContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    toast({
      title: "Mengunduh PDF",
      description: "Membuka dialog cetak. Pilih 'Simpan sebagai PDF' untuk menyimpan.",
      duration: 3000
    });
  };

  // Capture agreement preview as PDF document
  const captureAgreementPreview = async (): Promise<string | null> => {
    if (!ownerSignature) {
      toast({
        title: "Error",
        description: "Silakan tanda tangan terlebih dahulu",
        variant: "destructive"
      });
      return null;
    }

    setIsCapturing(true);
    try {
      // Create a canvas with larger height to fit all content
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Set canvas size - A4 landscape with higher quality
      // Using larger canvas for better quality
      canvas.width = 1600; // Higher width for A4 landscape
      canvas.height = 2260; // Higher height for A4
      
      // No scaling - use original coordinates with larger canvas
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Black text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PERJANJIAN JASA PEMASARAN', canvas.width / 2, 50);
      ctx.font = 'bold 14px Arial';
      ctx.fillText('SALAM BUMI PROPERTY', canvas.width / 2, 75);
      
      ctx.font = '12px Arial';
      const agreementType = agreementData?.agreement_type === 'exclusive_booster' 
        ? `(EXCLUSIVE BOOSTER - KONTRAK ${agreementData?.exclusive_booster_duration_months || 6} BULAN)`
        : '(OPEN LISTING - PEMASARAN BEBAS)';
      ctx.fillText(agreementType, canvas.width / 2, 100);
      
      ctx.fillText(`Nomor: ${formData.kode_listing || 'AUTO-GENERATE'}`, canvas.width / 2, 125);
      
      ctx.fillText(`Pada hari ini, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })},`, canvas.width / 2, 160);
      ctx.fillText('telah dibuat dan disepakati Perjanjian Jasa Pemasaran Properti antara:', canvas.width / 2, 185);
      
      // PIHAK PERTAMA
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('PIHAK PERTAMA', 50, 180);
      ctx.font = '9px Arial';
      ctx.fillText('Nama Perusahaan : CV Salam Bumi Property', 50, 198);
      ctx.fillText('Alamat Kantor : Jl Pajajaran, Catur Tunggal, Depok, Sleman', 50, 212);
      ctx.fillText('Telp / WhatsApp : 0813-9127-8889', 50, 226);
      ctx.fillText('Email : salambumiproperty@gmail.com', 50, 240);
      ctx.fillText('Website : salambumi.xyz', 50, 254);
      
      // PIHAK KEDUA
      ctx.font = 'bold 11px Arial';
      ctx.fillText('PIHAK KEDUA', 50, 284);
      ctx.font = '9px Arial';
      ctx.fillText(`Nama : ${ownerData?.nama_lengkap || '[Nama Pemilik]'}`, 50, 302);
      ctx.fillText(`No. KTP : ${ownerData?.no_ktp || '[No. KTP]'}`, 50, 316);
      ctx.fillText(`Alamat KTP : ${ownerData?.alamat_ktp || '[Alamat KTP]'}`, 50, 330);
      
      // Pasal 1 - OBJEK PERJANJIAN
      ctx.font = 'bold 10px Arial';
      ctx.fillText('PASAL 1 - OBJEK PERJANJIAN', 50, 365);
      ctx.font = '9px Arial';
      ctx.fillText('PIHAK KEDUA memberikan hak pemasaran secara ' + (agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE' : 'BEBAS / TIDAK TERIKAT') + ' kepada PIHAK PERTAMA', 50, 382);
      ctx.fillText('untuk memasarkan properti milik PIHAK KEDUA dengan data sebagai berikut:', 50, 396);
      
      // Property Details Box
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(45, 408, canvas.width - 90, 55);
      ctx.fillStyle = '#000000';
      ctx.fillText(`Jenis Properti : ${formData.jenis_properti || '-'}`, 55, 425);
      ctx.fillText(`Legalitas : ${formData.legalitas || '-'}`, 55, 442);
      const address = formData.alamat_lengkap || `${formData.kelurahan || ''}, ${formData.kecamatan || ''}, ${formData.kabupaten || ''}, ${formData.provinsi || ''}`;
      ctx.fillText(`Alamat : ${address.substring(0, 70)}`, 55, 456);
      if (agreementData?.tujuan === 'disewakan') {
        const hargaSewaText = formData.harga_sewa ? parseInt(formData.harga_sewa).toLocaleString('id-ID') : '.................................';
        ctx.fillText(`Harga Sewa : Rp ${hargaSewaText} / (${formData.periode_harga_sewa || 'tahun'})`, 55, 470);
      } else {
        const priceText = formData.harga_properti ? `Rp ${parseInt(formData.harga_properti).toLocaleString('id-ID')}` : '-';
        ctx.fillText(`Harga Penawaran : ${priceText} ${formData.harga_nego ? 'Nego' : ''} ${formData.harga_nett ? 'Nett' : ''}`, 55, 470);
      }
      
      // Pasal 2 - JENIS LISTING DAN MASA KONTRAK
      ctx.font = 'bold 10px Arial';
      ctx.fillText('PASAL 2 - JENIS LISTING DAN MASA KONTRAK', 50, 500);
      ctx.font = '9px Arial';
      const listingType = agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE LISTING' : 'OPEN LISTING';
      ctx.fillText(`Jenis listing yang disepakati adalah ${listingType}.`, 50, 518);
      
      if (agreementData?.agreement_type === 'exclusive_booster') {
        ctx.fillText(`Masa kontrak berlaku selama ${agreementData?.exclusive_booster_duration_months || 6} bulan, terhitung sejak tanggal ditandatanganinya perjanjian ini.`, 50, 536);
        ctx.fillText('Selama masa kontrak berlangsung, PIHAK KEDUA tidak diperkenankan menunjuk agen properti lain.', 50, 554);
      } else {
        ctx.fillText('PIHAK KEDUA boleh dan bebas memasarkan propertinya sendiri atau melalui Agent / Perantara Lain.', 50, 554);
        if (agreementData?.tujuan === 'disewakan') {
          ctx.fillText('Apabila properti tersewa oleh calon penyewa dari PIHAK PERTAMA, maka PIHAK KEDUA wajib', 50, 572);
          ctx.fillText('membayarkan fee 10% dari harga deal sewa kepada pihak pertama.', 50, 590);
        } else {
          ctx.fillText('Apabila properti terjual oleh calon pembeli dari PIHAK PERTAMA, maka PIHAK KEDUA wajib', 50, 572);
          ctx.fillText('membayarkan fee 3% dari harga deal penjualan kepada pihak pertama.', 50, 590);
        }
      }
      
      // Pasal 3 - KETENTUAN FEE / KOMISI
      ctx.font = 'bold 10px Arial';
      ctx.fillText('PASAL 3 - KETENTUAN FEE / KOMISI', 50, 620);
      ctx.font = '9px Arial';
      if (agreementData?.tujuan === 'disewakan') {
        ctx.fillText('PIHAK KEDUA menyetujui membayar fee jasa pemasaran sebesar 10% (sepuluh persen) dari harga', 50, 638);
        ctx.fillText('deal sewa properti kepada PIHAK PERTAMA apabila berhasil mendapatkan penyewa.', 50, 656);
        ctx.fillText('Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:', 50, 674);
        ctx.fillText('  - Perjanjian Sewa ditandatangani, atau', 50, 692);
        ctx.fillText('  - Pembayaran sewa pertama (minimal 1 tahun) diterima.', 50, 710);
      } else {
        ctx.fillText('PIHAK KEDUA menyetujui membayar fee atau komisi sebesar 3% (tiga persen) dari harga deal', 50, 638);
        ctx.fillText('PENJUALAN kepada PIHAK PERTAMA jika PIHAK PERTAMA berhasil menjualkan properti.', 50, 656);
        ctx.fillText('Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:', 50, 674);
        ctx.fillText('  - Akta Jual Beli (AJB) ditandatangani, atau', 50, 692);
        ctx.fillText('  - Pembayaran mencapai minimal 30% (Down Payment) dari total harga.', 50, 710);
      }
      
      // Pasal 4 (for Exclusive Booster - Marketing)
      if (agreementData?.agreement_type === 'exclusive_booster') {
        ctx.font = 'bold 10px Arial';
        ctx.fillText('PASAL 4 - JENIS PEMASARAN', 50, 740);
        ctx.font = '9px Arial';
        ctx.fillText('PIHAK PERTAMA akan melakukan pemasaran melalui:', 50, 758);
        if (agreementData?.meta_ads_enabled) ctx.fillText('  - Meta Ads (Instagram & Facebook)', 50, 776);
        if (agreementData?.tiktok_ads_enabled) ctx.fillText('  - TikTok Ads', 50, 794);
        ctx.fillText('  - Penargetan berdasarkan usia, buying power, lokasi, demografi, minat, dan perilaku', 50, 812);
        
        ctx.font = 'bold 10px Arial';
        ctx.fillText('PASAL 5 - BIAYA PEMASARAN', 50, 840);
        ctx.font = '9px Arial';
        ctx.fillText('  - Biaya Admin: Rp 1.500.000 (dibayar di awal/fixed)', 50, 858);
        ctx.fillText('  - Biaya Ads: Dimulai dari Rp 50.000/hari', 50, 876);
      }
      
      // Pasal 4 (for Open Listing - Pembatalan)
      if (agreementData?.agreement_type !== 'exclusive_booster') {
        ctx.font = 'bold 10px Arial';
        ctx.fillText('PASAL 4 - PEMBATALAN TRANSAKSI', 50, 740);
        ctx.font = '9px Arial';
        ctx.fillText('Apabila terjadi pembatalan sepihak oleh calon pembeli, maka PIHAK KEDUA menyetujui', 50, 758);
        ctx.fillText('memberikan 50% (lima puluh persen) dari booking fee / tanda jadi kepada PIHAK PERTAMA.', 50, 776);
        ctx.fillText('Ketentuan ini berlaku sepanjang pembatalan bukan disebabkan oleh kesalahan PIHAK PERTAMA.', 50, 794);
      }
      
      // Pasal 5/6 - KEWAJIBAN & PENYELESAIAN SENGKETA
      const PasalNum = agreementData?.agreement_type === 'exclusive_booster' ? '6' : '5';
      ctx.font = 'bold 10px Arial';
      ctx.fillText(`PASAL ${PasalNum} - KEWAJIBAN PIHAK PERTAMA`, 50, 930);
      ctx.font = '9px Arial';
      ctx.fillText('  - Melakukan pemasaran properti secara profesional dan maksimal', 50, 948);
      ctx.fillText('  - Menyusun strategi pemasaran sesuai standar Salam Bumi Property', 50, 966);
      ctx.fillText('  - Memberikan laporan pemasaran secara berkala kepada PIHAK KEDUA', 50, 984);
      
      ctx.font = 'bold 10px Arial';
      ctx.fillText(`PASAL ${parseInt(PasalNum) + 1} - KEWAJIBAN PIHAK KEDUA`, 50, 1010);
      ctx.font = '9px Arial';
      ctx.fillText('  - Menyediakan data dan dokumen legalitas properti yang benar dan sah', 50, 1028);
      ctx.fillText('  - Memberikan akses yang diperlukan untuk kepentingan pemasaran', 50, 1046);
      ctx.fillText('  - Membayar fee sesuai ketentuan perjanjian ini', 50, 1064);
      
      // Pasal 6/7 - PENYELESAIAN SENGKETA
      ctx.font = 'bold 10px Arial';
      ctx.fillText(`PASAL ${parseInt(PasalNum) + 2} - PENYELESAIAN SENGKETA`, 50, 1090);
      ctx.font = '9px Arial';
      ctx.fillText('Apabila terjadi perselisihan, para Pihak sepakat menyelesaikannya terlebih dahulu secara', 50, 1108);
      ctx.fillText('musyawarah untuk mufakat. Apabila tidak tercapai, diselesaikan melalui jalur hukum.', 50, 1126);
      
      // Pasal 7/8 - LAIN-LAIN
      ctx.font = 'bold 10px Arial';
      ctx.fillText(`PASAL ${parseInt(PasalNum) + 3} - LAIN-LAIN`, 50, 1150);
      ctx.font = '9px Arial';
      ctx.fillText('  - Perjanjian ini mulai berlaku sejak ditandatangani oleh Para Pihak', 50, 1168);
      ctx.fillText('  - Perubahan hanya sah apabila dibuat secara tertulis dan disepakati', 50, 1186);
      ctx.fillText('  - Perjanjian ini dibuat dalam 2 (dua) rangkap', 50, 1204);
      
      // Tanggal dan Tanda Tangan
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Yogyakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, canvas.width / 2, 1240);
      
      // Signature Area - Owner (LEFT side)
      // SYNC WITH HTML PREVIEW: Materai at left: 110px, Signature at left: 35px in 250px container
      // Canvas scale: 1600px width ≈ 800px container in preview
      // Scale factor: 1600/800 = 2x
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const ownerSectionCenter = 360; // Left section center
      ctx.fillText('Yang Memberi Persetujuan', ownerSectionCenter, 1280);
      
      // Draw materai - SYNC WITH HTML PREVIEW: left: 110px in 250px container
      // Canvas equivalent: ownerSectionCenter - 70 (offset to match left: 110px)
      try {
        const materaiImg = new Image();
        materaiImg.crossOrigin = 'anonymous';
        materaiImg.src = 'https://images.salambumi.xyz/materai/hg.png';
        await new Promise((resolve, reject) => {
          materaiImg.onload = resolve;
          materaiImg.onerror = reject;
        });
        // Position materai to match HTML preview: left: 110px ≈ center - 70
        ctx.drawImage(materaiImg, ownerSectionCenter - 70, 1295, 140, 100);
      } catch (e) {
        console.log('Materai image load failed:', e);
        // Draw placeholder rectangle if materai fails to load
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(ownerSectionCenter - 70, 1295, 140, 100);
        ctx.fillStyle = '#cccccc';
        ctx.font = '8px Arial';
        ctx.fillText('[Materai]', ownerSectionCenter, 1350);
      }
      
      // Draw owner signature - SYNC WITH HTML PREVIEW: left: 35px, width: 170px
      // Position signature to overlap materai from left side
      if (ownerSignature) {
        const signatureImg = new Image();
        signatureImg.src = ownerSignature;
        await new Promise((resolve) => { signatureImg.onload = resolve; });
        // Position signature to match HTML preview: left: 35px ≈ center - 125
        ctx.drawImage(signatureImg, ownerSectionCenter - 125, 1310, 170, 80);
      }
      
      ctx.font = '9px Arial';
      ctx.fillText(`(${ownerData?.nama_lengkap || '[Nama Pemilik]'})`, ownerSectionCenter, 1400);
      
      // Agent section (RIGHT side)
      const agentSectionCenter = 1240; // Right section center
      ctx.font = '10px Arial';
      ctx.fillText('Agent Pemasaran', agentSectionCenter, 1280);
      
      // Draw agent signature - position on right side
      try {
        const agentImg = new Image();
        agentImg.crossOrigin = 'anonymous';
        agentImg.src = 'https://images.salambumi.xyz/materai/gsd-removebg-preview%20-%20Copy.png';
        await new Promise((resolve, reject) => {
          agentImg.onload = resolve;
          agentImg.onerror = reject;
        });
        // Position agent signature centered on agent section
        ctx.drawImage(agentImg, agentSectionCenter - 60, 1295, 120, 60);
      } catch (e) {
        console.log('Agent signature image load failed:', e);
        // Draw placeholder if agent signature fails
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(agentSectionCenter - 60, 1295, 120, 60);
        ctx.fillStyle = '#cccccc';
        ctx.font = '8px Arial';
        ctx.fillText('[Ttd. Agent]', agentSectionCenter, 1330);
      }
      
      ctx.font = 'bold 11px Arial';
      ctx.fillText('(ARDY SALAM)', agentSectionCenter, 1400);
      ctx.font = '8px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('Salam Bumi Property', agentSectionCenter, 1415);
      
      // Catatan
      ctx.fillStyle = '#fffde7';
      ctx.fillRect(45, 1440, canvas.width - 90, 50);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Catatan:', 55, 1458);
      ctx.font = '8px Arial';
      ctx.fillText('  - Tanda tangan ini sah secara hukum', 55, 1475);
      ctx.fillText('  - Pembayaran fee dilakukan setelah AJB ditandatangani', 55, 1490);
      ctx.fillText('  - 50% dari booking fee akan diberikan ke agen jika pembatalan bukan caused by agent', 55, 1505);
      
      // Convert to PDF using jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      let yPos = 20;

      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PERJANJIAN JASA PEMASARAN', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      pdf.setFontSize(12);
      pdf.text('SALAM BUMI PROPERTY', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      pdf.setFontSize(10);
      const agreementTypePdf = agreementData?.agreement_type === 'exclusive_booster' 
        ? `(EXCLUSIVE BOOSTER - KONTRAK ${agreementData?.exclusive_booster_duration_months || 6} BULAN)`
        : '(OPEN LISTING - PEMASARAN BEBAS)';
      pdf.text(agreementTypePdf, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      pdf.text(`Nomor: ${formData.kode_listing || 'AUTO-GENERATE'}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Pada hari ini, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })},`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      pdf.text('telah dibuat dan disepakati Perjanjian Jasa Pemasaran Properti antara:', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // PIHAK PERTAMA
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PIHAK PERTAMA', margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Nama Perusahaan : CV Salam Bumi Property', margin, yPos);
      yPos += 5;
      pdf.text('Alamat Kantor : Jl Pajajaran, Catur Tunggal, Depok, Sleman', margin, yPos);
      yPos += 5;
      pdf.text('Telp / WhatsApp : 0813-9127-8889', margin, yPos);
      yPos += 5;
      pdf.text('Email : salambumiproperty@gmail.com', margin, yPos);
      yPos += 5;
      pdf.text('Website : salambumi.xyz', margin, yPos);
      yPos += 10;

      // PIHAK KEDUA
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PIHAK KEDUA', margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nama : ${ownerData?.nama_lengkap || '[Nama Pemilik]'}`, margin, yPos);
      yPos += 5;
      pdf.text(`No. KTP : ${ownerData?.no_ktp || '[No. KTP]'}`, margin, yPos);
      yPos += 5;
      pdf.text(`Alamat KTP : ${ownerData?.alamat_ktp || '[Alamat KTP]'}`, margin, yPos);
      yPos += 10;

      // Pasal 1
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PASAL 1 - OBJEK PERJANJIAN', margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const objText = 'PIHAK KEDUA memberikan hak pemasaran secara ' + (agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE' : 'BEBAS / TIDAK TERIKAT') + ' kepada PIHAK PERTAMA untuk memasarkan properti milik PIHAK KEDUA.';
      const splitObj = pdf.splitTextToSize(objText, contentWidth);
      pdf.text(splitObj, margin, yPos);
      yPos += splitObj.length * 5 + 5;

      // Property Details Box
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPos, contentWidth, 25, 'F');
      yPos += 6;

      pdf.text(`Jenis Properti : ${formData.jenis_properti || '-'}`, margin + 2, yPos);
      yPos += 5;
      pdf.text(`Legalitas : ${formData.legalitas || '-'}`, margin + 2, yPos);
      yPos += 5;
      const addressPdf = formData.alamat_lengkap || `${formData.kelurahan || ''}, ${formData.kecamatan || ''}, ${formData.kabupaten || ''}, ${formData.provinsi || ''}`;
      pdf.text(`Alamat : ${addressPdf.substring(0, 60)}`, margin + 2, yPos);
      yPos += 5;
      if (agreementData?.tujuan === 'disewakan') {
        const hargaSewaPdf = formData.harga_sewa ? parseInt(formData.harga_sewa).toLocaleString('id-ID') : '.................................';
        pdf.text(`Harga Sewa : Rp ${hargaSewaPdf} / (${formData.periode_harga_sewa || 'tahun'})`, margin + 2, yPos);
      } else {
        const pricePdf = formData.harga_properti ? `Rp ${parseInt(formData.harga_properti).toLocaleString('id-ID')}` : '-';
        pdf.text(`Harga Penawaran : ${pricePdf} ${formData.harga_nego ? 'Nego' : ''} ${formData.harga_nett ? 'Nett' : ''}`, margin + 2, yPos);
      }
      yPos += 15;

      // Pasal 2
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PASAL 2 - JENIS LISTING DAN MASA KONTRAK', margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const listingPdf = agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE LISTING' : 'OPEN LISTING';
      pdf.text(`Jenis listing yang disepakati adalah ${listingPdf}.`, margin, yPos);
      yPos += 5;

      if (agreementData?.agreement_type === 'exclusive_booster') {
        pdf.text(`Masa kontrak berlaku selama ${agreementData?.exclusive_booster_duration_months || 6} bulan.`, margin, yPos);
        yPos += 5;
        pdf.text('Selama masa kontrak, PIHAK KEDUA tidak diperkenankan menunjuk agen lain.', margin, yPos);
        yPos += 5;
      } else {
        pdf.text('PIHAK KEDUA boleh dan bebas memasarkan propertinya sendiri.', margin, yPos);
        yPos += 5;
        if (agreementData?.tujuan === 'disewakan') {
          pdf.text('Apabila properti tersewa oleh PIHAK PERTAMA, fee 10% wajib dibayarkan.', margin, yPos);
        } else {
          pdf.text('Apabila properti terjual oleh PIHAK PERTAMA, fee 3% wajib dibayarkan.', margin, yPos);
        }
        yPos += 5;
      }
      yPos += 5;

      // Pasal 3
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PASAL 3 - KETENTUAN FEE / KOMISI', margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      if (agreementData?.tujuan === 'disewakan') {
        pdf.text('PIHAK KEDUA menyetujui membayar fee 10% dari harga deal SEWA.', margin, yPos);
        yPos += 5;
        pdf.text('Pembayaran fee dilakukan selambat-lambatnya 3 hari setelah:', margin, yPos);
        yPos += 5;
        pdf.text('  - Perjanjian Sewa ditandatangani, atau', margin, yPos);
        yPos += 5;
        pdf.text('  - Pembayaran sewa pertama diterima.', margin, yPos);
      } else {
        pdf.text('PIHAK KEDUA menyetujui membayar fee 3% dari harga deal PENJUALAN.', margin, yPos);
        yPos += 5;
        pdf.text('Pembayaran fee dilakukan selambat-lambatnya 3 hari setelah:', margin, yPos);
        yPos += 5;
        pdf.text('  - Akta Jual Beli (AJB) ditandatangani, atau', margin, yPos);
        yPos += 5;
        pdf.text('  - Pembayaran mencapai minimal 30% (Down Payment).', margin, yPos);
      }
      yPos += 10;

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      // Pasal KEWAJIBAN
      const PasalNumPdf = agreementData?.agreement_type === 'exclusive_booster' ? '5' : '4';
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`PASAL ${PasalNumPdf} - KEWAJIBAN PIHAK PERTAMA`, margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('  - Melakukan pemasaran properti secara profesional', margin, yPos);
      yPos += 5;
      pdf.text('  - Menyusun strategi pemasaran sesuai standar Salam Bumi Property', margin, yPos);
      yPos += 5;
      pdf.text('  - Memberikan laporan pemasaran secara berkala', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`PASAL ${parseInt(PasalNumPdf) + 1} - KEWAJIBAN PIHAK KEDUA`, margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('  - Menyediakan data dan dokumen legalitas properti yang benar', margin, yPos);
      yPos += 5;
      pdf.text('  - Memberikan akses yang diperlukan untuk pemasaran', margin, yPos);
      yPos += 5;
      pdf.text('  - Membayar fee sesuai ketentuan perjanjian', margin, yPos);
      yPos += 10;

      // Pasal PENYELESAIAN SENGKETA
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`PASAL ${parseInt(PasalNumPdf) + 2} - PENYELESAIAN SENGKETA`, margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Apabila terjadi perselisihan, diselesaikan secara musyawarah.', margin, yPos);
      yPos += 5;
      pdf.text('Apabila tidak tercapai, diselesaikan melalui jalur hukum.', margin, yPos);
      yPos += 10;

      // Date and Signature
      pdf.setFontSize(10);
      pdf.text(`Yogyakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Signature Section - Two columns
      const sigColWidth = contentWidth / 2 - 5;
      const sigCenterLeft = margin + sigColWidth / 2;
      const sigCenterRight = margin + sigColWidth + 10 + sigColWidth / 2;

      // Owner section (left)
      pdf.setFontSize(9);
      pdf.text('Yang Memberi Persetujuan', sigCenterLeft, yPos, { align: 'center' });
      yPos += 8;

      // Add materai image - SYNC WITH HTML PREVIEW
      // HTML preview: left: 110px in 250px container, width: 140px, height: 100px
      // PDF scale: container ≈ 85mm wide (sigColWidth), so 110px ≈ 37mm from left of container
      try {
        const materaiImg = new window.Image();
        materaiImg.crossOrigin = 'anonymous';
        materaiImg.src = 'https://images.salambumi.xyz/materai/hg.png';
        await new Promise((resolve, reject) => {
          materaiImg.onload = resolve;
          materaiImg.onerror = reject;
        });
        
        // Create canvas to convert image to data URL
        const canvas = document.createElement('canvas');
        canvas.width = materaiImg.width;
        canvas.height = materaiImg.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(materaiImg, 0, 0);
          const materaiDataUrl = canvas.toDataURL('image/png');
          // Position materai: offset from center to match HTML left: 110px
          // sigCenterLeft - 15mm ≈ left: 110px equivalent
          pdf.addImage(materaiDataUrl, 'PNG', sigCenterLeft - 15, yPos, 30, 22);
        }
      } catch (e) {
        console.log('Materai image load failed for PDF:', e);
      }
      yPos += 28;

      // Add owner signature - SYNC WITH HTML PREVIEW
      // HTML preview: left: 35px, width: 170px, height: 80px
      // PDF equivalent: sigCenterLeft - 25mm, width 35mm, height 16mm
      if (ownerSignature) {
        pdf.addImage(ownerSignature, 'PNG', sigCenterLeft - 25, yPos - 18, 35, 16);
      }

      pdf.setFontSize(8);
      pdf.text(`(${ownerData?.nama_lengkap || '[Nama Pemilik]'})`, sigCenterLeft, yPos + 5, { align: 'center' });

      // Agent section (right)
      pdf.setFontSize(9);
      pdf.text('Agent Pemasaran', sigCenterRight, yPos - 35, { align: 'center' });

      // Add agent signature
      try {
        const agentImg = new window.Image();
        agentImg.crossOrigin = 'anonymous';
        agentImg.src = 'https://images.salambumi.xyz/materai/gsd-removebg-preview%20-%20Copy.png';
        await new Promise((resolve, reject) => {
          agentImg.onload = resolve;
          agentImg.onerror = reject;
        });
        
        // Create canvas to convert image to data URL
        const canvas = document.createElement('canvas');
        canvas.width = agentImg.width;
        canvas.height = agentImg.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(agentImg, 0, 0);
          const agentDataUrl = canvas.toDataURL('image/png');
          pdf.addImage(agentDataUrl, 'PNG', sigCenterRight - 25, yPos - 28, 50, 20);
        }
      } catch (e) {
        console.log('Agent signature image load failed for PDF:', e);
      }

      pdf.setFontSize(8);
      pdf.text('(ARDY SALAM)', sigCenterRight, yPos + 5, { align: 'center' });
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Salam Bumi Property', sigCenterRight, yPos + 10, { align: 'center' });
      pdf.setTextColor(0, 0, 0);

      // Add note at bottom
      yPos += 25;
      pdf.setFillColor(255, 253, 231);
      pdf.rect(margin, yPos, contentWidth, 15, 'F');
      yPos += 5;
      pdf.setFontSize(7);
      pdf.text('Catatan:', margin + 2, yPos);
      yPos += 4;
      pdf.text('  - Tanda tangan ini sah secara hukum', margin + 2, yPos);
      yPos += 3;
      pdf.text('  - Pembayaran fee dilakukan setelah AJB ditandatangani', margin + 2, yPos);

      // Generate PDF as base64
      const pdfBase64 = pdf.output('datauristring');

      // Convert base64 to blob for upload
      const base64Data = pdfBase64.split(',')[1];
      if (!base64Data) throw new Error('Failed to convert PDF');
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Upload to Cloudflare Worker
      const fileName = `agreement_${formData.kode_listing || 'preview'}_${Date.now()}.pdf`;
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });

      const publicUrl = await uploadFileToWorker(pdfFile, formData.kode_listing || 'agreement');
      console.log('Agreement uploaded successfully:', publicUrl);
      
      setSavedAgreementUrl(publicUrl);

      toast({
        title: "Berhasil",
        description: "Preview perjanjian berhasil disimpan sebagai PDF",
        duration: 3000
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error capturing agreement:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan preview perjanjian",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };
  // Save agreement to database - BOTH to marketing_agreements AND properties table for redundancy
  // FIXED: Added proper fallback for propertyId (race condition fix)
  const saveAgreementToDatabase = async (savedUrl: string, propertyId?: string) => {
    const now = new Date().toISOString();
    
    // 1. Save to marketing_agreements table (if agreementId exists)
    if (agreementId) {
      const { error: agreementError } = await supabase
        .from('marketing_agreements')
        .update({ 
          agreement_preview_url: savedUrl,
          agreement_status: 'signed',
          signed_at: now
        })
        .eq('id', agreementId);
      
      if (agreementError) {
        console.error('[Agreement] Error saving to marketing_agreements:', agreementError);
      } else {
        console.log('[Agreement] Saved to marketing_agreements:', savedUrl.substring(0, 50) + '...');
      }
    }
    
    // 2. Save to properties table as fallback (new columns: agreement_preview_url, signed_at)
    // FIXED: Use propertyId parameter OR fall back to property?.id OR last submitted property
    const targetPropertyId = propertyId || (property?.id) || (submittedProperties.length > 0 ? submittedProperties[submittedProperties.length - 1] : null);
    
    if (targetPropertyId) {
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ 
          agreement_preview_url: savedUrl,
          signed_at: now,
          agreement_status: 'signed'
        })
        .eq('id', targetPropertyId);
      
      if (propertyError) {
        console.error('[Agreement] Error saving to properties table:', propertyError);
      } else {
        console.log('[Agreement] Saved to properties table for property:', targetPropertyId);
      }
    } else {
      console.log('[Agreement] No property ID available to save agreement URL');
    }
  };

  // Download agreement image - AUTO-SAVE version with RETRY logic
  // FIXED: Added retry mechanism for upload failures
  const downloadAgreementImage = async (format: 'webp' | 'png' = 'webp') => {
    if (!agreementPreviewRef.current) {
      toast({
        title: "Error",
        description: "Preview reference not found",
        variant: "destructive"
      });
      return;
    }

    setIsCapturing(true);
    
    // Retry configuration
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    let lastError: Error | null = null;
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Agreement] Upload attempt ${attempt} of ${MAX_RETRIES}`);
        
        // Wait for images to be preloaded before capturing
        if (!imagesPreloaded) {
          console.log('[Agreement] Waiting for images to preload...');
          await preloadAgreementImages();
        }
        
        const canvas = await html2canvas(agreementPreviewRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        
        // Convert base64 to blob for upload
        const base64Data = dataUrl.split(',')[1];
        if (!base64Data) throw new Error('Failed to convert image');
        
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        // Upload to Cloudflare Worker
        const fileName = `agreement_${formData.kode_listing || 'preview'}_${Date.now()}.${format}`;
        const imageFile = new File([blob], fileName, { type: mimeType });
        const publicUrl = await uploadFileToWorker(imageFile, formData.kode_listing || 'agreement');
        
        console.log('[Agreement] Auto-uploaded agreement image:', publicUrl);
        
        // Auto-save to database
        await saveAgreementToDatabase(publicUrl);
        
        // Also trigger browser download for user convenience
        const link = document.createElement('a');
        link.download = `perjanjian_${formData.kode_listing || 'preview'}.${format}`;
        link.href = dataUrl;
        link.click();

        toast({
          title: "Berhasil",
          description: `Preview berhasil diupload dan diunduh sebagai ${format.toUpperCase()}`,
          duration: 3000
        });
        
        // Success - exit retry loop
        return;
        
      } catch (error: any) {
        console.error(`[Agreement] Upload attempt ${attempt} failed:`, error);
        lastError = error;
        
        // If this is the last attempt, show error
        if (attempt === MAX_RETRIES) {
          toast({
            title: "Error",
            description: error?.message || `Gagal mengupload preview setelah ${MAX_RETRIES} percobaan`,
            variant: "destructive"
          });
        } else {
          // Wait before retrying
          console.log(`[Agreement] Retrying in ${RETRY_DELAY}ms...`);
          await delay(RETRY_DELAY * attempt); // Exponential backoff
        }
      }
    }
    
    setIsCapturing(false);
  };

  // Auto-generate kode listing on mount if not editing
  useEffect(() => {
    if (!property?.id && !formData.kode_listing) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const uniqueCode = `SBP-${timestamp}-${randomPart}`;
      handleChange("kode_listing", uniqueCode);
    }
  }, []);

  // Reset form for adding another property (keeps agreement/owner info)
  const handleAddAnotherProperty = () => {
    // Generate new kode listing for new property
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKode = `SBP-${timestamp}-${randomPart}`;
    
    setFormData(prev => ({
      ...prev,
      kode_listing: newKode,
      judul_properti: "",
      deskripsi: "",
      harga_properti: "",
      luas_tanah: "",
      luas_bangunan: "",
      kamar_tidur: "",
      kamar_mandi: "",
      jenis_properti: "",
      legalitas: "",
      shgb_expired_at: "",
      provinsi: prev.provinsi, // Keep owner location
      kabupaten: prev.kabupaten,
      kecamatan: prev.kecamatan,
      kelurahan: prev.kelurahan,
      alamat_lengkap: "",
      image_url: "",
      image_url1: "",
      image_url2: "",
      image_url3: "",
      image_url4: "",
      image_url5: "",
      image_url6: "",
      image_url7: "",
      image_url8: "",
      image_url9: "",
      youtube_url: "",
      status_dijual: false,
      status_disewakan: false,
      harga_sewa_tahunan: "",
      harga_nego: true,
      harga_nett: false,
      harga_sewa: "",
      periode_harga_sewa: "tahun",
      is_hot: false,
      is_sold: false,
      is_property_pilihan: false,
      is_premium: false,
      is_featured: false,
      lebar_depan: "",
      jumlah_lantai: "",
      jenis_kost: "",
      jenis_hotel: "",
      ruang_penjaga: false,
      token_listrik_perkamar: false,
      no_unit: "",
      kelengkapan: "",
      status_legalitas: "On Hand",
      bank_terkait: "",
      outstanding_bank: "",
      dekat_sungai: false,
      jarak_sungai: "",
      dekat_makam: false,
      jarak_makam: "",
      dekat_sutet: false,
      jarak_sutet: "",
      lebar_jalan: "",
      alasan_dijual: "",
      income_per_bulan: "",
      biaya_pengeluaran_per_bulan: "",
      harga_sewa_kamar: "",
      google_maps_link: "",
    }));
    
    setShowAddAnother(false);
    setSubmittedProperties([]);
    
    toast({
      title: "Form Properti Baru",
      description: `Properti ke-${submittedProperties.length + 2} - Isi data properti baru`,
      duration: 3000
    });
  };

  // Parse currency to number
  const parseCurrency = (value: string): string => {
    return String(value).replace(/[^\d]/g, '');
  };

  // Reset form completely
  const handleResetForm = () => {
    setFormData({
      kode_listing: "",
      judul_properti: "",
      deskripsi: "",
      harga_properti: "",
      harga_per_meter: false,
      price_old: "",
      luas_tanah: "",
      luas_bangunan: "",
      kamar_tidur: "",
      kamar_mandi: "",
      jenis_properti: "",
      legalitas: "",
      shgb_expired_at: "",
      provinsi: "",
      kabupaten: "",
      kecamatan: "",
      kelurahan: "",
      alamat_lengkap: "",
      image_url: "",
      image_url1: "",
      image_url2: "",
      image_url3: "",
      image_url4: "",
      image_url5: "",
      image_url6: "",
      image_url7: "",
      image_url8: "",
      image_url9: "",
      youtube_url: "",
      status_dijual: false,
      status_disewakan: false,
      owner_contact: "",
      is_hot: false,
      is_sold: false,
      is_property_pilihan: false,
      is_premium: false,
      is_featured: false,
      meta_title: "",
      meta_description: "",
      lebar_depan: "",
      jumlah_lantai: "",
      jenis_kost: "",
      jenis_hotel: "",
      ruang_penjaga: false,
      token_listrik_perkamar: false,
      no_unit: "",
      kelengkapan: "",
      status_legalitas: "On Hand",
      bank_terkait: "",
      outstanding_bank: "",
      dekat_sungai: false,
      jarak_sungai: "",
      dekat_makam: false,
      jarak_makam: "",
      dekat_sutet: false,
      jarak_sutet: "",
      lebar_jalan: "",
      alasan_dijual: "",
      harga_sewa_tahunan: "",
      harga_nego: true,
      harga_nett: false,
      harga_sewa: "",
      periode_harga_sewa: "tahun",
      income_per_bulan: "",
      biaya_pengeluaran_per_bulan: "",
      harga_sewa_kamar: "",
      google_maps_link: "",
      source_input: sourceInput,
      publish_status: sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED',
      agreement_status: "none",
    });
    setShowAddAnother(false);
    setSubmittedProperties([]);
  };

  // Auto-generate unique random listing code
  const generateRandomKode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueCode = `SBP-${timestamp}-${randomPart}`;
    handleChange("kode_listing", uniqueCode);
  };

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePriceChange = (field: string, value: string) => {
    handleChange(field, parseCurrency(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jenis_properti) {
      toast({ title: "Validasi Gagal", description: "Pilih jenis properti", variant: "destructive" });
      return;
    }

    // Validate required location fields
    if (!formData.provinsi || formData.provinsi.trim() === "") {
      toast({ title: "Validasi Gagal", description: "Provinsi wajib diisi", variant: "destructive" });
      return;
    }

    if (!formData.kabupaten || formData.kabupaten.trim() === "") {
      toast({ title: "Validasi Gagal", description: "Kabupaten/Kota wajib diisi", variant: "destructive" });
      return;
    }

    // Validate price based on tujuan
    if (formData.status_dijual && !formData.harga_properti) {
      toast({ title: "Validasi Gagal", description: "Harga jual wajib diisi", variant: "destructive" });
      return;
    }

    if (formData.status_disewakan && !formData.harga_sewa_tahunan) {
      toast({ title: "Validasi Gagal", description: "Harga sewa per tahun wajib diisi", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine status based on checkboxes
      let status = "dijual";
      if (formData.status_dijual && formData.status_disewakan) {
        status = "dijual_disewakan";
      } else if (formData.status_disewakan) {
        status = "disewakan";
      }

      const payload: any = {
        kode_listing: formData.kode_listing || null,
        judul_properti: formData.judul_properti || null,
        deskripsi: formData.deskripsi || null,
        // Harga - untuk sewa, gunakan harga_sewa_tahunan jika harga_properti kosong
        harga_properti: formData.harga_properti
          ? parseCurrency(formData.harga_properti)
          : formData.harga_sewa_tahunan
            ? parseCurrency(formData.harga_sewa_tahunan)
            : null,
        harga_per_meter: formData.harga_per_meter || false,
        price_old: formData.price_old ? parseCurrency(formData.price_old) : null,
        luas_tanah: formData.luas_tanah ? parseFloat(formData.luas_tanah) : null,
        luas_bangunan: formData.luas_bangunan ? parseFloat(formData.luas_bangunan) : null,
        kamar_tidur: formData.kamar_tidur ? parseInt(formData.kamar_tidur) : null,
        kamar_mandi: formData.kamar_mandi ? parseInt(formData.kamar_mandi) : null,
        jenis_properti: formData.jenis_properti,
        legalitas: formData.legalitas || null,
        // Note: shgb_expired_at removed - column doesn't exist in database
        provinsi: formData.provinsi || null,
        kabupaten: formData.kabupaten || null,
        kecamatan: formData.kecamatan || null,
        kelurahan: formData.kelurahan || null,
        alamat_lengkap: formData.alamat_lengkap || null,
        
        // Images
        image_url: formData.image_url || null,
        image_url1: formData.image_url1 || null,
        image_url2: formData.image_url2 || null,
        image_url3: formData.image_url3 || null,
        image_url4: formData.image_url4 || null,
        image_url5: formData.image_url5 || null,
        image_url6: formData.image_url6 || null,
        image_url7: formData.image_url7 || null,
        image_url8: formData.image_url8 || null,
        image_url9: formData.image_url9 || null,
        youtube_url: formData.youtube_url || null,
        
        // Status
        status: status,
        
        // Labels
        is_hot: formData.is_hot,
        is_sold: formData.is_sold,
        is_property_pilihan: formData.is_property_pilihan,
        is_premium: formData.is_premium,
        is_featured: formData.is_featured,
        
        owner_contact: formData.owner_contact || null,
        
        // Extension fields
        kelengkapan: formData.kelengkapan || null,
        status_legalitas: formData.status_legalitas || 'On Hand',
        jenis_kost: formData.jenis_kost || null,
        jumlah_lantai: formData.jumlah_lantai ? parseInt(formData.jumlah_lantai) : null,
        lebar_depan: formData.lebar_depan ? parseFloat(formData.lebar_depan) : null,
        no_unit: formData.no_unit || null,
        bank_terkait: formData.bank_terkait || null,
        outstanding_bank: formData.outstanding_bank ? parseCurrency(formData.outstanding_bank) : null,
        google_maps_link: formData.google_maps_link || null,
        harga_sewa_tahunan: formData.harga_sewa_tahunan ? parseCurrency(formData.harga_sewa_tahunan) : null,
        harga_sewa_kamar: formData.harga_sewa_kamar ? parseCurrency(formData.harga_sewa_kamar) : null,
        harga_sewa: formData.harga_sewa ? parseCurrency(formData.harga_sewa) : null,
        periode_harga_sewa: formData.periode_harga_sewa || null,
        income_per_bulan: formData.income_per_bulan ? parseCurrency(formData.income_per_bulan) : null,
        biaya_pengeluaran_per_bulan: formData.biaya_pengeluaran_per_bulan ? parseCurrency(formData.biaya_pengeluaran_per_bulan) : null,
        alasan_dijual: formData.alasan_dijual || null,
        
        // Meta fields
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
      };

      let result;
      
      if (property?.id) {
        result = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('properties')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Track submitted property
      const newPropertyId = result.data?.id;
      if (newPropertyId) {
        setSubmittedProperties(prev => [...prev, newPropertyId]);
      }

      toast({ 
        title: "Berhasil", 
        description: sourceInput === 'OWNER' 
          ? "Properti berhasil diajukan, tunggu persetujuan admin" 
          : "Properti berhasil disimpan",
        duration: 5000
      });

      // Show "Tambah Properti Lain" button after successful submit
      setShowAddAnother(true);

      // For ADMIN mode, call onSuccess immediately with skipComplete=true. 
      // For OWNER mode, onSuccess will be called after agreement is signed (in the modal)
      if (onSuccess && sourceInput === 'ADMIN') {
        onSuccess(result.data?.id, true);
      }
    } catch (error: any) {
      console.error('Error saving property:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: error?.message || error?.details || error?.hint || "Gagal menyimpan properti",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render dynamic fields based on property type
  const renderDynamicFields = () => {
    switch (formData.jenis_properti) {
      case "rumah":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} placeholder="150" />
            </div>
            <div>
              <Label>Luas Bangunan (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} placeholder="100" />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} placeholder="8" />
            </div>
            <div>
              <Label>Jumlah Lantai</Label>
              <Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} placeholder="2" />
            </div>
            <div>
              <Label>Jumlah Kamar Tidur</Label>
              <Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} placeholder="3" />
            </div>
            <div>
              <Label>Jumlah Kamar Mandi</Label>
              <Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} placeholder="2" />
            </div>
          </div>
        );

      case "tanah":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} placeholder="500" />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} placeholder="20" />
            </div>
          </div>
        );

      case "kost":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Jenis Kost <span className="text-red-500">*</span></Label>
                <Select value={formData.jenis_kost} onValueChange={(v) => handleChange("jenis_kost", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis Kost" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Putra">Putra</SelectItem>
                    <SelectItem value="Putri">Putri</SelectItem>
                    <SelectItem value="Campur">Campur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Lebar Depan (m)</Label><Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} /></div>
              <div><Label>Jumlah Lantai</Label><Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} placeholder="Jumlah kamar" /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} placeholder="Jumlah kamar mandi" /></div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="ruang_penjaga" checked={formData.ruang_penjaga} onCheckedChange={(c) => handleChange("ruang_penjaga", c)} />
                <Label htmlFor="ruang_penjaga">Ruang Penjaga</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="token_listrik_perkamar" checked={formData.token_listrik_perkamar} onCheckedChange={(c) => handleChange("token_listrik_perkamar", c)} />
                <Label htmlFor="token_listrik_perkamar">Token Listrik Sudah perkamar?</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} placeholder="500000" />
              </div>
              <div>
                <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
                <Input value={formData.biaya_pengeluaran_per_bulan} onChange={(e) => handlePriceChange("biaya_pengeluaran_per_bulan", e.target.value)} placeholder="1000000" />
              </div>
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "hotel":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Jenis Hotel <span className="text-red-500">*</span></Label>
                <Select value={formData.jenis_hotel} onValueChange={(v) => handleChange("jenis_hotel", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis Hotel" /></SelectTrigger>
                  <SelectContent>
                    {JENIS_HOTEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Lebar Depan (m)</Label><Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} /></div>
              <div><Label>Jumlah Lantai</Label><Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} placeholder="Jumlah kamar" /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} placeholder="Jumlah kamar mandi" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} />
              </div>
              <div>
                <Label>Income Rata-Rata Per Bulan (Rp)</Label>
                <Input value={formData.income_per_bulan} onChange={(e) => handlePriceChange("income_per_bulan", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
              <Input value={formData.biaya_pengeluaran_per_bulan} onChange={(e) => handlePriceChange("biaya_pengeluaran_per_bulan", e.target.value)} />
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "homestay":
      case "villa":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Lebar Depan (m)</Label><Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} /></div>
              <div><Label>Jumlah Lantai</Label><Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} />
              </div>
              <div>
                <Label>Income Rata-Rata Per Bulan (Rp)</Label>
                <Input value={formData.income_per_bulan} onChange={(e) => handlePriceChange("income_per_bulan", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
              <Input value={formData.biaya_pengeluaran_per_bulan} onChange={(e) => handlePriceChange("biaya_pengeluaran_per_bulan", e.target.value)} />
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "apartment":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Luas Bangunan (m²) <span className="text-red-500">*</span></Label>
                <Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} />
              </div>
              <div>
                <Label>Lantai</Label>
                <Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} />
              </div>
              <div>
                <Label>No. Unit</Label>
                <Input value={formData.no_unit} onChange={(e) => handleChange("no_unit", e.target.value)} placeholder="Unit 101" />
              </div>
              <div>
                <Label>Jumlah Kamar Tidur</Label>
                <Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} />
              </div>
              <div>
                <Label>Jumlah Kamar Mandi</Label>
                <Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Kelengkapan</Label>
              <Select value={formData.kelengkapan} onValueChange={(v) => handleChange("kelengkapan", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih Kelengkapan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                  <SelectItem value="Semi Furnished">Semi Furnished</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "gudang":
      case "komersial":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} />
            </div>
            <div>
              <Label>Luas Bangunan (m²)</Label>
              <Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* KODE LISTING - Auto Generate */}
      <div className="space-y-2">
        <Label>Kode Listing</Label>
        <div className="flex gap-2">
          <Input
            value={formData.kode_listing}
            onChange={(e) => handleChange("kode_listing", e.target.value)}
            placeholder="SBP-XXXXXX-XXXX"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={generateRandomKode}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* JENIS PROPERTI */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Jenis Properti <span className="text-red-500">*</span></Label>
        <div className="flex flex-wrap gap-3">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all select-none ${
                formData.jenis_properti === type.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="jenis_properti"
                value={type.value}
                checked={formData.jenis_properti === type.value}
                onChange={(e) => {
                  handleChange("jenis_properti", e.target.value);
                }}
                className="h-5 w-5 text-primary accent-primary cursor-pointer relative z-10"
              />
              <span className="text-sm font-medium cursor-pointer">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* JUDUL PROPERTI */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Judul Properti</Label>
        <Input
          value={formData.judul_properti}
          onChange={(e) => handleChange("judul_properti", e.target.value)}
          placeholder="Contoh: Rumah Mewah Full Furnished di Jl. Kaliurang"
        />
        <p className="text-xs text-gray-500">Judul akan ditampilkan di listing dan membantu user menemukan properti Anda</p>
      </div>

      {/* TUJUAN TRANSAKSI - Updated: Checkbox for multiple selection */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Tujuan Transaksi</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="status_dijual" 
              checked={formData.status_dijual} 
              onCheckedChange={(c) => handleChange("status_dijual", c)} 
            />
            <Label htmlFor="status_dijual" className="cursor-pointer font-medium">Dijual</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="status_disewakan" 
              checked={formData.status_disewakan} 
              onCheckedChange={(c) => handleChange("status_disewakan", c)} 
            />
            <Label htmlFor="status_disewakan" className="cursor-pointer font-medium">Disewakan</Label>
          </div>
        </div>
      </div>

      {/* HARGA - Updated: Show both prices if both selected */}
      <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold">Harga</h3>
        
        {formData.status_dijual && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Harga Penawaran (Rp)</Label>
              <Input
                value={formData.harga_properti}
                onChange={(e) => handlePriceChange("harga_properti", e.target.value)}
                placeholder="500000000"
              />
            </div>
            <div>
              <Label>Harga Lama / Coret (Rp) - Optional</Label>
              <Input
                value={formData.price_old}
                onChange={(e) => handlePriceChange("price_old", e.target.value)}
                placeholder="Contoh: 650000000"
              />
              <p className="text-xs text-gray-500 mt-1">Harga lama akan ditampilkan dengan coretan di homepage</p>
            </div>
            <div className="flex flex-col gap-2 pt-6">
              <div className="flex items-center gap-2">
                <Checkbox id="harga_nego" checked={formData.harga_nego} onCheckedChange={(c) => handleChange("harga_nego", c)} />
                <Label htmlFor="harga_nego">Nego</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="harga_nett" checked={formData.harga_nett} onCheckedChange={(c) => handleChange("harga_nett", c)} />
                <Label htmlFor="harga_nett">Nett</Label>
              </div>
            </div>
          </div>
        )}
        
        {formData.status_disewakan && (
          <div className="space-y-4">
            <div>
              <Label>Harga Sewa / Tahun (Rp)</Label>
              <Input
                value={formData.harga_sewa_tahunan}
                onChange={(e) => handlePriceChange("harga_sewa_tahunan", e.target.value)}
                placeholder="60000000"
              />
            </div>
            
            {/* Harga Sewa untuk Perjanjian - dengan pilihan bulan/tahun */}
            <div className="border p-4 rounded-lg bg-blue-50">
              <Label className="font-semibold text-blue-800">Harga Sewa untuk Perjanjian</Label>
              <p className="text-xs text-blue-600 mb-3">Data ini akan ditampilkan di dokumen perjanjian sewa</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nominal Harga Sewa (Rp)</Label>
                  <Input
                    value={formData.harga_sewa}
                    onChange={(e) => handlePriceChange("harga_sewa", e.target.value)}
                    placeholder="5000000"
                  />
                </div>
                
                <div>
                  <Label className="block mb-2">Periode Sewa</Label>
                  <RadioGroup
                    value={formData.periode_harga_sewa}
                    onValueChange={(v) => handleChange("periode_harga_sewa", v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bulan" id="bulan" />
                      <Label htmlFor="bulan" className="cursor-pointer">/ Bulan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tahun" id="tahun" />
                      <Label htmlFor="tahun" className="cursor-pointer">/ Tahun</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-white rounded border text-sm">
                <span className="text-gray-600">Preview di perjanjian:</span>
                <p className="font-mono mt-1">
                  Harga Sewa : Rp {formData.harga_sewa ? parseInt(formData.harga_sewa).toLocaleString('id-ID') : '.................................'} / ({formData.periode_harga_sewa})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC FIELDS BASED ON PROPERTY TYPE */}
      {formData.jenis_properti && (
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold">Detail Properti</h3>
          {renderDynamicFields()}
        </div>
      )}

      {/* ALAMAT */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Lokasi Properti</h3>
        
        {/* Provinsi & Kabupaten - Required (Dropdown Cascading) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Provinsi <span className="text-red-500">*</span></Label>
            <Select value={selectedProvince} onValueChange={handleProvinceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Provinsi" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.provinsi && (
              <p className="text-xs text-gray-500 mt-1">Terpilih: {formData.provinsi}</p>
            )}
          </div>
          
          <div>
            <Label>Kabupaten/Kota <span className="text-red-500">*</span></Label>
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={!selectedProvince || availableCities.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedProvince ? "Pilih Kabupaten/Kota" : "Pilih Provinsi Dulu"} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.kabupaten && (
              <p className="text-xs text-gray-500 mt-1">Terpilih: {formData.kabupaten}</p>
            )}
          </div>
        </div>
        
        {/* Kecamatan & Kelurahan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Kecamatan</Label>
            <Select
              value={selectedDistrict}
              onValueChange={handleDistrictChange}
              disabled={!selectedCity || availableDistricts.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedCity ? "Pilih Kecamatan" : "Pilih Kabupaten Dulu"} />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.kecamatan && (
              <p className="text-xs text-gray-500 mt-1">Terpilih: {formData.kecamatan}</p>
            )}
          </div>
          
          <div>
            <Label>Kelurahan / Desa</Label>
            <Input
              value={formData.kelurahan || ""}
              onChange={(e) => handleVillageChange(e.target.value)}
              placeholder="Masukkan nama kelurahan/desa"
            />
            <p className="text-xs text-gray-500 mt-1">Isi manual kelurahan/desa</p>
          </div>
        </div>
        
        {/* Alamat Lengkap */}
        <div>
          <Label>Alamat Lengkap</Label>
          <Textarea 
            value={formData.alamat_lengkap} 
            onChange={(e) => handleChange("alamat_lengkap", e.target.value)} 
            rows={3} 
            placeholder="Jl. Nama Jalan, Nomor Rumah" 
          />
        </div>
        
        {/* Google Maps - Admin Only */}
        {sourceInput === 'ADMIN' && (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowGoogleMaps(!showGoogleMaps)}>
              {showGoogleMaps ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showGoogleMaps ? 'Sembunyikan' : 'Tampilkan'} Google Maps
            </Button>
            <span className="text-xs text-gray-500">(Admin only - tidak tampil di homepage)</span>
          </div>
        )}
        {showGoogleMaps && (
          <div>
            <Label>Link Google Maps</Label>
            <Input 
              value={formData.google_maps_link} 
              onChange={(e) => handleChange("google_maps_link", e.target.value)} 
              placeholder="https://maps.google.com/..." 
            />
          </div>
        )}
      </div>

      {/* LEGALITAS */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Legalitas</h3>
        <div>
          <Label>Status Legalitas</Label>
          <Select value={formData.legalitas} onValueChange={(v) => handleChange("legalitas", v)}>
            <SelectTrigger><SelectValue placeholder="Pilih Legalitas" /></SelectTrigger>
            <SelectContent>
              {LEGALITAS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* SHGB Expiry Date */}
        {formData.legalitas?.includes('SHGB') && (
          <div>
            <Label>SHGB Berlaku Sampai</Label>
            <Input 
              type="date" 
              value={formData.shgb_expired_at} 
              onChange={(e) => handleChange("shgb_expired_at", e.target.value)} 
            />
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="status_legalitas_hand" checked={formData.status_legalitas === "On Hand"} onCheckedChange={() => handleChange("status_legalitas", "On Hand")} />
            <Label htmlFor="status_legalitas_hand">On Hand</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="status_legalitas_bank" checked={formData.status_legalitas === "On Bank"} onCheckedChange={() => handleChange("status_legalitas", "On Bank")} />
            <Label htmlFor="status_legalitas_bank">On Bank</Label>
          </div>
        </div>
        {formData.status_legalitas === "On Bank" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Diagunkan di Bank?</Label>
              <Input value={formData.bank_terkait} onChange={(e) => handleChange("bank_terkait", e.target.value)} placeholder="Nama Bank" />
            </div>
            <div>
              <Label>Berapa Outstanding Properti Di Bank? (Rp)</Label>
              <Input value={formData.outstanding_bank} onChange={(e) => handlePriceChange("outstanding_bank", e.target.value)} placeholder="500000000" />
            </div>
          </div>
        )}
      </div>

      {/* KONDISI LINGKUNGAN */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Apakah Properti Jauh Makam / Sungai / Sutet?</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox id="dekat_sungai" checked={formData.dekat_sungai} onCheckedChange={(c) => handleChange("dekat_sungai", c)} />
            <Label htmlFor="dekat_sungai" className="cursor-pointer">Dekat Sungai</Label>
            {formData.dekat_sungai && (
              <div className="flex items-center gap-2 ml-4">
                <Label>Jarak:</Label>
                <Input 
                  type="number" 
                  className="w-24" 
                  value={formData.jarak_sungai} 
                  onChange={(e) => handleChange("jarak_sungai", e.target.value)} 
                  placeholder="m" 
                />
                <Label>m</Label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="dekat_makam" checked={formData.dekat_makam} onCheckedChange={(c) => handleChange("dekat_makam", c)} />
            <Label htmlFor="dekat_makam" className="cursor-pointer">Dekat Makam</Label>
            {formData.dekat_makam && (
              <div className="flex items-center gap-2 ml-4">
                <Label>Jarak:</Label>
                <Input 
                  type="number" 
                  className="w-24" 
                  value={formData.jarak_makam} 
                  onChange={(e) => handleChange("jarak_makam", e.target.value)} 
                  placeholder="m" 
                />
                <Label>m</Label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="dekat_sutet" checked={formData.dekat_sutet} onCheckedChange={(c) => handleChange("dekat_sutet", c)} />
            <Label htmlFor="dekat_sutet" className="cursor-pointer">Dekat Sutet</Label>
            {formData.dekat_sutet && (
              <div className="flex items-center gap-2 ml-4">
                <Label>Jarak:</Label>
                <Input 
                  type="number" 
                  className="w-24" 
                  value={formData.jarak_sutet} 
                  onChange={(e) => handleChange("jarak_sutet", e.target.value)} 
                  placeholder="m" 
                />
                <Label>m</Label>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-32">Lebar Jalan:</Label>
            <Input 
              type="number" 
              className="w-24" 
              value={formData.lebar_jalan} 
              onChange={(e) => handleChange("lebar_jalan", e.target.value)} 
              placeholder="meter" 
            />
            <Label>meter</Label>
          </div>
        </div>
      </div>

      {/* INFORMASI TAMBAHAN */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">Informasi Tambahan Terkait Detail Properti & Fasilitas</h3>
        
        <div>
          <Label>Jelaskan Secara Lengkap Dan Detail Perihal Properti</Label>
          <Textarea 
            value={formData.deskripsi} 
            onChange={(e) => handleChange("deskripsi", e.target.value)} 
            rows={4} 
            placeholder="Jelaskan secara lengkap tentang properti..." 
          />
        </div>
        
        <div>
          <Label>Alasan Dijual Kenapa?</Label>
          <Textarea 
            value={formData.alasan_dijual} 
            onChange={(e) => handleChange("alasan_dijual", e.target.value)} 
            rows={2} 
            placeholder="Mengapa properti ini dijual..." 
          />
        </div>
        
        {/* LABELS - Checkbox options - ADMIN ONLY */}
        {sourceInput === 'ADMIN' && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Label Properti</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_premium" 
                  checked={formData.is_premium} 
                  onCheckedChange={(c) => handleChange("is_premium", c)} 
                />
                <Label htmlFor="is_premium" className="cursor-pointer font-medium">Premium</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_featured" 
                  checked={formData.is_featured} 
                  onCheckedChange={(c) => handleChange("is_featured", c)} 
                />
                <Label htmlFor="is_featured" className="cursor-pointer font-medium">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_hot" 
                  checked={formData.is_hot} 
                  onCheckedChange={(c) => handleChange("is_hot", c)} 
                />
                <Label htmlFor="is_hot" className="cursor-pointer font-medium">Hot</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_sold" 
                  checked={formData.is_sold} 
                  onCheckedChange={(c) => handleChange("is_sold", c)} 
                />
                <Label htmlFor="is_sold" className="cursor-pointer font-medium text-red-600">SOLD</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="is_property_pilihan" 
                  checked={formData.is_property_pilihan} 
                  onCheckedChange={(c) => handleChange("is_property_pilihan", c)} 
                />
                <Label htmlFor="is_property_pilihan" className="cursor-pointer font-medium">Properti Pilihan</Label>
              </div>
            </div>
          </div>
        )}
        
        {/* Image Upload with Auto WebP Conversion */}
        <div>
          <Label>Upload Foto Properti</Label>
          <MultiImageDropzone
            initialImages={[
              formData.image_url,
              formData.image_url1,
              formData.image_url2,
              formData.image_url3,
              formData.image_url4,
              formData.image_url5,
              formData.image_url6,
              formData.image_url7,
              formData.image_url8,
              formData.image_url9,
            ].filter(Boolean)}
            onImagesChange={(urls: string[]) => {
              // Update form data with image URLs
              handleChange('image_url', urls[0] || '');
              handleChange('image_url1', urls[1] || '');
              handleChange('image_url2', urls[2] || '');
              handleChange('image_url3', urls[3] || '');
              handleChange('image_url4', urls[4] || '');
              handleChange('image_url5', urls[5] || '');
              handleChange('image_url6', urls[6] || '');
              handleChange('image_url7', urls[7] || '');
              handleChange('image_url8', urls[8] || '');
              handleChange('image_url9', urls[9] || '');
            }}
            propertyId={property?.id}
            maxImages={10}
          />
          <p className="text-xs text-gray-500 mt-1">Auto konversi ke WebP saat upload</p>
        </div>
      </div>

      {/* Submit section - Show after property is saved */}
      <div className="flex flex-wrap justify-end pt-4 border-t gap-3">
        <Button type="button" variant="outline" onClick={handleResetForm}>
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Form
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Batal
        </Button>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="w-full text-xs text-gray-500 p-2 bg-gray-100 rounded">
            Debug: showAddAnother={String(showAddAnother)} | submittedProperties={submittedProperties.length} | ownerSignature={ownerSignature ? 'exists' : 'empty'}
            <button 
              type="button" 
              className="ml-2 text-blue-600 underline"
              onClick={() => {
                console.log('[Debug] Force opening agreement preview');
                setShowAgreementPreview(true);
              }}
            >
              [Force Open Dialog]
            </button>
          </div>
        )}
        
        {/* Show after successful submit - Option to add another property */}
        {showAddAnother ? (
          <>
            <Button 
              type="button" 
              variant="default"
              onClick={handleAddAnotherProperty}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Properti Lain
            </Button>
            <Button 
              type="button" 
              variant="default"
              onClick={() => {
                console.log('[Agreement] Opening agreement preview dialog');
                setShowAgreementPreview(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Preview & Tanda Tangan Perjanjian
            </Button>
          </>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="min-w-40">
            {isSubmitting ? "Menyimpan..." : "Simpan Properti"}
          </Button>
        )}
        
        {/* Show after submitting multiple properties */}
        {submittedProperties.length > 0 && !showAddAnother && (
          <div className="w-full mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✓ {submittedProperties.length} properti telah disimpan dalam perjanjian ini
            </p>
          </div>
        )}
      </div>

      {/* Agreement Preview Modal */}
      <Dialog 
        open={showAgreementPreview} 
        onOpenChange={(open) => {
          console.log('[Agreement] Dialog onOpenChange:', open);
          setShowAgreementPreview(open);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              {agreementData?.tujuan === 'disewakan' 
                ? 'PERJANJIAN JASA PEMASARAN PROPERTI UNTUK SEWA'
                : 'PERJANJIAN JASA PEMASARAN'}
              <br />
              SALAM BUMI PROPERTY
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-sm" ref={agreementPreviewRef}>
            {/* Agreement Type */}
            <div className="text-center font-semibold mb-4">
              {agreementData?.agreement_type === 'exclusive_booster' 
                ? `( EXCLUSIVE BOOSTER – KONTRAK ${agreementData?.exclusive_booster_duration_months || 6} BULAN )`
                : '( OPEN LISTING – PEMASARAN BEBAS )'}
            </div>

            {/* Agreement Number */}
            <div className="text-center mb-4">
              <p>Nomor: {formData.kode_listing || 'AUTO-GENERATE'}</p>
            </div>

            {/* Date */}
            <div className="text-center mb-4">
              <p>Pada hari ini, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, telah dibuat dan disepakati Perjanjian Jasa Pemasaran Properti antara:</p>
            </div>

            {/* First Party - Salam Bumi Property */}
            <div className="border p-3 rounded">
              <p className="font-semibold">PIHAK PERTAMA</p>
              <div className="mt-2 text-xs space-y-1">
                <p><strong>Nama Perusahaan :</strong> CV Salam Bumi Property</p>
                <p><strong>Alamat Kantor :</strong> Jl Pajajaran, Catur Tunggal, Depok, Sleman (Sekarang Menggunakan Virtual Office)</p>
                <p><strong>Telp / WhatsApp :</strong> 0813-9127-8889</p>
                <p><strong>Email :</strong> salambumiproperty@gmail.com</p>
                <p><strong>Website :</strong> salambumi.xyz</p>
              </div>
              <p className="mt-2 text-xs">Dalam hal ini bertindak sebagai Penyedia Jasa Pemasaran Properti, selanjutnya disebut PIHAK PERTAMA.</p>
            </div>

            {/* Second Party - Owner */}
            <div className="border p-3 rounded">
              <p className="font-semibold">PIHAK KEDUA</p>
              <div className="mt-2 text-xs space-y-1">
                <p><strong>Nama :</strong> {ownerData?.nama_lengkap || '[Nama Pemilik]'}</p>
                <p><strong>No. KTP :</strong> {ownerData?.no_ktp || '[No. KTP]'}</p>
                <p><strong>Alamat KTP :</strong> {ownerData?.alamat_ktp || '[Alamat KTP]'}</p>
              </div>
              <p className="mt-2 text-xs">Dalam hal ini bertindak sebagai Pemilik Properti, selanjutnya disebut PIHAK KEDUA.</p>
              <p className="mt-1 text-xs">PIHAK PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut para Pihak.</p>
            </div>

            {/* Pasal 1 - Object Agreement */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 1</p>
              <p className="font-semibold">OBJEK PERJANJIAN</p>
              <p className="mt-1 text-xs">PIHAK KEDUA memberikan hak pemasaran secara {agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE' : 'BEBAS / TIDAK TERIKAT'} kepada PIHAK PERTAMA untuk memasarkan properti milik PIHAK KEDUA dengan data sebagai berikut:</p>
              
              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                <p className="font-semibold">Objek Properti</p>
                <p><strong>Jenis Properti :</strong> {formData.jenis_properti || '-'}</p>
                <p><strong>Legalitas :</strong> {formData.legalitas || '-'}</p>
                <p><strong>Alamat :</strong> {formData.alamat_lengkap || `${formData.kelurahan || ''}, ${formData.kecamatan || ''}, ${formData.kabupaten || ''}, ${formData.provinsi || ''}`}</p>
                {agreementData?.tujuan === 'disewakan' ? (
                  <p><strong>Harga Sewa :</strong> Rp {formData.harga_sewa ? parseInt(formData.harga_sewa).toLocaleString('id-ID') : '.................................'} / ({formData.periode_harga_sewa || 'tahun'})</p>
                ) : (
                  <p><strong>Harga Penawaran :</strong> {formData.harga_properti ? `Rp ${parseInt(formData.harga_properti).toLocaleString('id-ID')}` : '-'} {formData.harga_nego ? 'Nego' : ''} {formData.harga_nett ? 'Nett' : ''}</p>
                )}
              </div>
            </div>

            {/* Pasal 2 - Listing Type and Contract Duration */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 2</p>
              <p className="font-semibold">JENIS LISTING DAN MASA KONTRAK</p>
              <div className="mt-1 text-xs space-y-1">
                <p>Jenis listing yang disepakati adalah {agreementData?.agreement_type === 'exclusive_booster' ? 'EXCLUSIVE LISTING' : 'OPEN LISTING'}.</p>
                {agreementData?.agreement_type === 'exclusive_booster' && (
                  <p>Masa kontrak berlaku selama {agreementData?.exclusive_booster_duration_months || 6} ({agreementData?.exclusive_booster_duration_months || 6}) bulan, terhitung sejak tanggal ditandatanganinya perjanjian ini.</p>
                )}
                {agreementData?.agreement_type === 'exclusive_booster' && (
                  <p>Selama masa kontrak berlangsung, PIHAK KEDUA tidak diperkenankan menunjuk agen properti lain untuk memasarkan objek properti sebagaimana dimaksud dalam Pasal 1.</p>
                )}
                {agreementData?.agreement_type !== 'exclusive_booster' && (
                  <p>PIHAK KEDUA boleh dan bebas memasarkan propertinya sendiri atau melalui Agent / Perantara Lain selain kepada PIHAK PERTAMA.</p>
                )}
                {agreementData?.agreement_type !== 'exclusive_booster' && (
                  <p>
                    {agreementData?.tujuan === 'disewakan'
                      ? 'Apabila properti tersewa oleh calon penyewa dari PIHAK PERTAMA, maka PIHAK KEDUA wajib membayarkan fee sewa 10% dari harga deal sewa properti kepada pihak pertama.'
                      : 'Apabila properti terjual oleh calon pembeli dari PIHAK PERTAMA, maka PIHAK KEDUA wajib membayarkan fee 3% dari harga deal penjualan kepada pihak pertama.'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Pasal 3 - Fee/Commission (Conditional) */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL 3</p>
              <p className="font-semibold">KETENTUAN FEE / KOMISI</p>
              <div className="mt-1 text-xs space-y-1">
                {agreementData?.tujuan === 'disewakan' ? (
                  <>
                    <p>PIHAK KEDUA menyetujui membayarkan fee jasa pemasaran sebesar 10% (sepuluh persen) dari harga deal sewa properti kepada PIHAK PERTAMA apabila berhasil mendapatkan penyewa melalui jasa pemasaran PIHAK PERTAMA.</p>
                    <p>Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:</p>
                    <ul className="list-disc pl-4">
                      <li>Perjanjian Sewa ditandatangani, atau</li>
                      <li>Pembayaran sewa pertama (minimal 1 tahun) diterima oleh PIHAK KEDUA.</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p>PIHAK KEDUA menyetujui membayar fee atau komisi sebesar 3% (tiga persen) dari harga deal PENJUALAN kepada PIHAK PERTAMA jika PIHAK PERTAMA berhasil menjualkan properti milik PIHAK KEDUA.</p>
                    <p>Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:</p>
                    <ul className="list-disc pl-4">
                      <li>Akta Jual Beli (AJB) ditandatangani, atau</li>
                      <li>Apabila transaksi dilakukan secara tunai bertahap, maka pembayaran fee dilakukan setelah pembayaran mencapai minimal 30% (Down Payment) dari total harga.</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Pasal 4 - Marketing and Costs (Only for Exclusive Booster) */}
            {agreementData?.agreement_type === 'exclusive_booster' && (
              <div className="border-t pt-3">
                <p className="font-semibold">4. JENIS PEMASARAN</p>
                <ul className="text-xs list-disc pl-4 mt-1">
                  {agreementData?.meta_ads_enabled && <li>Meta Ads (Instagram & Facebook)</li>}
                  {agreementData?.tiktok_ads_enabled && <li>TikTok Ads</li>}
                  <li>Penargetan berdasarkan usia, buying power, lokasi, demografi, minat, dan perilaku</li>
                </ul>
                
                <p className="font-semibold mt-2">5. BIAYA PEMASARAN</p>
                <ul className="text-xs list-disc pl-4 mt-1">
                  <li>Biaya Admin: Rp 1.500.000 (dibayar di awal/fixed)</li>
                  <li>Biaya Ads: Dimulai dari Rp 50.000/hari</li>
                </ul>
              </div>
            )}

            {/* Pasal 4 - Cancellation (for Open Listing - Dijual) / Jangka Waktu Sewa (for Disewakan) */}
            {agreementData?.agreement_type !== 'exclusive_booster' && (
              <div className="border-t pt-3">
                {agreementData?.tujuan === 'disewakan' ? (
                  <>
                    <p className="font-semibold">PASAL 4</p>
                    <p className="font-semibold">JANGKA WAKTU SEWA DAN PERPANJANGAN</p>
                    <div className="mt-1 text-xs space-y-1">
                      <p>Jangka waktu sewa properti adalah minimal 1 (satu) tahun, terhitung sejak tanggal Perjanjian Sewa ditandatangani.</p>
                      <p>Penyewa dapat memperpanjang masa sewa dengan memberitahukan kepada PIHAK KEDUA selambat-lambatnya 1 (satu) bulan sebelum masa sewa berakhir.</p>
                    </div>

                    <p className="font-semibold mt-3">PASAL 5</p>
                    <p className="font-semibold">PERPANJANGAN SEWA DAN KOMISI AGEN</p>
                    <div className="mt-1 text-xs space-y-1">
                      <p>Apabila terjadi perpanjangan sewa oleh penyewa yang didapatkan dari hasil pemasaran PIHAK PERTAMA, maka PIHAK KEDUA wajib membayarkan fee komisi tambahan sebesar 10% (sepuluh persen) dari nilai perpanjangan sewa tahunan kepada PIHAK PERTAMA.</p>
                      <p>Pembayaran fee komisi perpanjangan dilakukan selambat-lambatnya 3 (tiga) hari setelah pembayaran perpanjangan sewa diterima oleh PIHAK KEDUA.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">PASAL 4</p>
                    <p className="font-semibold">PEMBATALAN TRANSAKSI</p>
                    <div className="mt-1 text-xs">
                      <p>Apabila terjadi pembatalan sepihak oleh calon pembeli, maka PIHAK KEDUA menyetujui memberikan 50% (lima puluh persen) dari booking fee / tanda jadi kepada PIHAK PERTAMA.</p>
                      <p>Ketentuan ini berlaku sepanjang pembatalan bukan disebabkan oleh kesalahan PIHAK PERTAMA.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Pasal 5/6 - Obligations */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL {agreementData?.tujuan === 'disewakan' ? '6' : '5'}</p>
              <p className="font-semibold">KEWAJIBAN PIHAK PERTAMA</p>
              <ul className="text-xs list-disc pl-4 mt-1">
                <li>Melakukan pemasaran properti secara profesional dan maksimal</li>
                <li>Menyusun strategi pemasaran sesuai standar Salam Bumi Property</li>
                <li>Memberikan laporan pemasaran secara berkala kepada PIHAK KEDUA</li>
                {agreementData?.tujuan === 'disewakan' && (
                  <>
                    <li>Menjaga kualitas penyewa yang direkomendasikan</li>
                    <li>Memastikan penyewa membayar biaya pemeliharaan tepat waktu melalui sistem yang disepakati</li>
                  </>
                )}
              </ul>
              
              <p className="font-semibold mt-2">KEWAJIBAN PIHAK KEDUA</p>
              <ul className="text-xs list-disc pl-4 mt-1">
                <li>Menyediakan data dan dokumen legalitas properti yang benar dan sah</li>
                <li>Memberikan akses yang diperlukan untuk kepentingan pemasaran</li>
                <li>Membayar fee sesuai ketentuan perjanjian ini</li>
                {agreementData?.tujuan === 'disewakan' && (
                  <>
                    <li>Menyediakan fasilitas yang layak, aman, dan sesuai dengan kondisi yang diiklankan pada saat serah terima properti</li>
                    <li>Melunasi seluruh biaya listrik, air, PAM, dan pajak properti sebelum disewakan</li>
                    <li>Bersedia berkonsultasi dengan PIHAK PERTAMA sebelum menentukan harga sewa, agar sesuai dengan harga pasar real-time</li>
                    <li>Melakukan pemeriksaan berkala minimal 3 (tiga) bulan sekali untuk memastikan properti dalam kondisi baik</li>
                    <li>Menjaga komunikasi aktif dengan PIHAK PERTAMA selama masa pemasaran, sewa, dan perpanjangan sewa</li>
                  </>
                )}
              </ul>
            </div>

            {/* Pasal 6/7 - Dispute Resolution */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL {agreementData?.tujuan === 'disewakan' ? '7' : '6'}</p>
              <p className="font-semibold">PENYELESAIAN SENGKETA</p>
              <div className="mt-1 text-xs">
                <p>Apabila terjadi perselisihan, para Pihak sepakat menyelesaikannya terlebih dahulu secara musyawarah untuk mufakat.</p>
                <p>Apabila tidak tercapai, diselesaikan melalui jalur hukum di wilayah hukum setempat.</p>
              </div>
            </div>

            {/* Pasal 7/8 - Miscellaneous */}
            <div className="border-t pt-3">
              <p className="font-semibold">PASAL {agreementData?.tujuan === 'disewakan' ? '8' : '7'}</p>
              <p className="font-semibold">LAIN-LAIN</p>
              <div className="mt-1 text-xs space-y-1">
                <li>Perjanjian ini mulai berlaku sejak ditandatangani oleh Para Pihak</li>
                <li>Perubahan atau penambahan hanya sah apabila dibuat secara tertulis dan disepakati oleh Para Pihak</li>
                <li>Perjanjian ini dibuat dalam 2 (dua) rangkap, masing-masing mempunyai kekuatan hukum yang sama</li>
              </div>
            </div>

            {/* Signature Area */}
            <div className="border-t pt-4 mt-4">
              <p className="text-center mb-4">
                Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              {/* Loading indicator for preloading images */}
              {!imagesPreloaded && (
                <div style={{ textAlign: 'center', padding: '20px', marginBottom: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <p className="text-sm text-gray-600">Memuat gambar materai dan tanda tangan...</p>
                </div>
              )}
              
              {/* ROW ATAS - FINAL LEGAL VIEW */}
              <div className="final-signature-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                {/* OWNER SECTION */}
                <div className="owner-section" style={{ width: '45%', textAlign: 'center', margin: 0, padding: 0 }}>
                  <h3 className="font-medium" style={{ margin: 0, padding: 0, lineHeight: 1.2, height: '24px' }}>Yang Memberi Persetujuan</h3>
                  
                  <div className="owner-stamp-wrapper" style={{ position: 'relative', width: '250px', height: '160px', margin: '8px auto 0 auto' }}>
                    {/* Fallback Placeholder - Shows when materai fails to load */}
                    <div
                      className="materai-fallback"
                      style={{
                        position: 'absolute',
                        width: '140px',
                        height: '100px',
                        bottom: '10px',
                        left: '110px',
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                        border: '2px dashed #0284c7',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: '#0369a1',
                        zIndex: 1,
                        fontWeight: 500
                      }}
                    >
                      Materai 10.000
                    </div>

                    {/* Materai - Positioned at left - Use preloaded data URL */}
                    <img
                      src={materaiDataUrl || 'https://images.salambumi.xyz/materai/hg.png'}
                      alt="Materai"
                      crossOrigin="anonymous"
                      className="materai"
                      onError={(e) => {
                        // Hide the broken image, fallback will show
                        (e.target as HTMLImageElement).style.display = 'none';
                        console.log('[Materai] Failed to load, showing fallback');
                      }}
                      style={{
                        position: 'absolute',
                        width: '140px',
                        height: '100px',
                        bottom: '10px',
                        left: '110px',
                        objectFit: 'contain',
                        zIndex: 2
                      }}
                    />
                    
                    {/* Owner Final Signature - Overlapping materai from right */}
                    {ownerSignature && (
                      <img
                        id="ownerFinalTtd"
                        src={ownerSignature}
                        alt="Tanda Tangan"
                        className="owner-overlay"
                        style={{
                          position: 'absolute',
                          width: '170px',
                          height: '80px',
                          bottom: '15px',
                          left: '35px',
                          zIndex: 10,
                          mixBlendMode: 'multiply',
                          pointerEvents: 'none',
                          objectFit: 'contain'
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="owner-name" style={{ marginTop: '8px', height: '24px' }}>
                    <p style={{
                      borderTop: '4px solid #1F2937',
                      paddingTop: '8px',
                      margin: '0 20px',
                      display: 'inline-block',
                      lineHeight: 1.2
                    }}>
                      <span className="font-semibold">( {ownerData?.nama_lengkap || '[Nama Pemilik]'} )</span>
                    </p>
                  </div>
                </div>
                
                {/* AGENT SECTION */}
                <div className="agent-section" style={{ width: '45%', textAlign: 'center', margin: 0, padding: 0 }}>
                  <h3 className="font-medium" style={{ margin: 0, padding: 0, lineHeight: 1.2, height: '24px' }}>Agent Pemasaran</h3>
                  
                  {/* Agent TTD Container - Same dimensions as owner-stamp-wrapper */}
                  <div style={{ position: 'relative', width: '250px', height: '160px', margin: '8px auto 0 auto' }}>
                    {/* Fallback for agent signature */}
                    <div 
                      style={{
                        position: 'absolute',
                        width: '200px',
                        height: '60px',
                        bottom: '20px',
                        left: '25px',
                        background: '#f3f4f6',
                        border: '1px dashed #9ca3af',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#6b7280',
                        zIndex: 1
                      }}
                    >
                      TTD Agent
                    </div>

                    <img
                      src={agentSignatureDataUrl || 'https://images.salambumi.xyz/materai/gsd-removebg-preview%20-%20Copy.png'}
                      alt="Tanda Tangan Agent"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        console.log('[Agent TTD] Failed to load, showing fallback');
                      }}
                      style={{
                        width: '200px',
                        height: '60px',
                        position: 'absolute',
                        bottom: '20px',
                        left: '25px',
                        objectFit: 'contain',
                        zIndex: 2
                      }}
                    />
                  </div>
                  
                  <div className="agent-name" style={{ marginTop: '8px', height: '24px' }}>
                    <p style={{
                      borderTop: '4px solid #1F2937',
                      paddingTop: '8px',
                      margin: '0 20px',
                      display: 'inline-block',
                      lineHeight: 1.2
                    }}>
                      <span className="font-semibold">( ARDY SALAM )</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">Salam Bumi Property</p>
                  </div>
                </div>
              </div>
              
              {/* ROW BAWAH - INPUT ONLY */}
              <div className="signature-input-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 className="text-lg font-medium mb-2 mt-0" style={{ marginTop: 0 }}>Tanda Tangan Digital</h2>
                
                {/* Canvas for drawing - NOT inside owner-section */}
                <canvas 
                  ref={signatureCanvasRef}
                  id="ownerCanvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair"
                  style={{ 
                    width: '600px',
                    height: '250px',
                    border: '5px solid black',
                    touchAction: 'none'
                  }}
                />
                
                {!ownerSignature && (
                  <p className="text-gray-400 text-sm mt-2">Gambar tanda tangan di atas</p>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-3 mt-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    ✕ Hapus
                  </Button>
                  <Button 
                    type="button" 
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (signatureCanvasRef.current) {
                        const dataURL = signatureCanvasRef.current.toDataURL('image/png');
                        setOwnerSignature(dataURL);
                        toast({
                          title: "Tanda Tangan Disimpan",
                          description: "Tanda tangan berhasil disimpan!",
                          duration: 3000
                        });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    💾 Simpan Tanda Tangan
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-yellow-50 p-3 rounded text-xs mt-4">
              <p className="font-semibold">Catatan:</p>
              <ul className="list-disc pl-4 mt-1">
                <li>Tanda tangan ini sah secara hukum</li>
                {agreementData?.tujuan === 'disewakan' ? (
                  <li>Pembayaran fee dilakukan setelah Perjanjian Sewa ditandatangani atau pembayaran sewa pertama diterima</li>
                ) : (
                  <li>Pembayaran fee dilakukan setelah AJB ditandatangani</li>
                )}
                {agreementData?.tujuan === 'disewakan' ? (
                  <li>Komisi perpanjangan sewa 10% berlaku untuk penyewa yang didapatkan dari pemasaran PIHAK PERTAMA</li>
                ) : (
                  <li>50% dari booking fee akan diberikan ke agen jika pembatalan bukan caused by agent</li>
                )}
              </ul>
            </div>

            {/* Digital Signature Section */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-2">Tanda Tangan Digital</h4>
              <p className="text-xs text-gray-500 mb-2">
                Gambar tanda tangan Anda di atas, lalu klik "Simpan Tanda Tangan" untuk menyimpan
              </p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (signatureCanvasRef.current) {
                      // Convert canvas to PNG base64
                      const dataURL = signatureCanvasRef.current.toDataURL("image/png");
                      setOwnerSignature(dataURL);
                      setAgreementAccepted(true);
                      toast({
                        title: "Tanda Tangan Disimpan",
                        description: "Tanda tangan berhasil disimpan dalam format PNG",
                        duration: 3000
                      });
                    }
                  }}
                >
                  Simpan Tanda Tangan
                </Button>
                {ownerSignature && (
                  <p className="text-green-600 text-sm flex items-center">
                    ✓ Tanda tangan tersimpan
                  </p>
                )}
              </div>
            </div>

            {/* Agreement Checkbox - Requires signature first */}
            <div className="flex items-start gap-2 mt-4">
              <Checkbox 
                id="agreement_accepted" 
                checked={agreementAccepted} 
                onCheckedChange={(checked) => {
                  // Only allow checking if signature exists
                  if (checked && !ownerSignature) {
                    toast({
                      title: "Tanda Tangan Diperlukan",
                      description: "Silakan gambar dan simpan tanda tangan terlebih dahulu",
                      variant: "destructive",
                      duration: 3000
                    });
                    return;
                  }
                  setAgreementAccepted(checked as boolean);
                }}
              />
              <Label htmlFor="agreement_accepted" className="text-sm cursor-pointer">
                Saya setuju dengan syarat dan ketentuan yang berlaku. Dengan mencentang ini, Anda menyatakan bahwa semua informasi yang diberikan adalah benar dan menyetujui perjanjian marketing dengan Salam Bumi Property.
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowAgreementPreview(false)}>
              Tutup
            </Button>
            {/* Download PDF button removed - moved to success page */}
            <Button 
              variant="default"
              disabled={!agreementAccepted || !ownerSignature || isCapturing}
              onClick={async () => {
                // Capture and save agreement preview to Supabase
                try {
                  const savedUrl = await captureAgreementPreview();
                  
                  // Save agreement URL to database - uses new robust function
                  if (savedUrl) {
                    await saveAgreementToDatabase(savedUrl);
                  } else {
                    console.log('[Agreement] No saved URL to store');
                  }
                  
                  // Call onSuccess with goToComplete=true to proceed to complete step
                  if (onSuccess) {
                    const lastPropertyId = submittedProperties.length > 0 
                      ? submittedProperties[submittedProperties.length - 1] 
                      : '';
                    onSuccess(lastPropertyId || '', true);
                  }
                  
                  toast({
                    title: "Perjanjian Disetujui",
                    description: savedUrl ? "Perjanjian marketing telah disimpan dengan preview gambar" : "Perjanjian marketing telah disetujui",
                    duration: 5000
                  });
                  setShowAgreementPreview(false);
                  // Reset form after agreement
                  handleResetForm();
                } catch (error) {
                  console.error('Error saving agreement:', error);
                  toast({
                    title: "Error",
                    description: "Gagal menyimpan preview perjanjian, tetapi perjanjian tetap disimpan",
                    variant: "destructive",
                    duration: 5000
                  });
                  // Still proceed even if capture fails
                  if (onSuccess) {
                    const lastPropertyId = submittedProperties.length > 0 
                      ? submittedProperties[submittedProperties.length - 1] 
                      : '';
                    onSuccess(lastPropertyId || '', true);
                  }
                  setShowAgreementPreview(false);
                  handleResetForm();
                }
              }}
            >
              {isCapturing ? "Menyimpan..." : "Setuju & Selesai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

export default ProductionPropertyForm;


