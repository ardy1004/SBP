import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useLocation, Link } from "wouter";
import { AdminLayout } from "../components/AdminLayout";
import { SlugPreview } from "@/components/admin/SlugPreview";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { propertiesApi } from "@/lib/api-client";
import { convertToWebp } from "@/lib/image-utils";
import {
  ChevronRight, Upload, X, Eye, Save, Send,
  ImagePlus, ExternalLink, AlertCircle, CheckCircle2, Search, ChevronDown
} from "lucide-react";
import {
  getCities,
  getDistricts,
  searchLocations,
} from "../data/locations";

type PropertyType = "Rumah" | "Tanah" | "Kost" | "Hotel" | "Homestay" | "Villa" | "Apartment" | "Gudang" | "Komersial Lainnya";
type Purpose = "Dijual" | "Disewakan" | "Dijual & Disewakan";
type LegalStatus = "SHM & IMB/PBG Lengkap" | "SHGB & IMB/PBG Lengkap" | "SHM Pekarangan Tanpa IMB/PBG" | "SHM Sawah/Tegalan" | "SHGB Tanpa IMB/PBG" | "Girik/Letter C/PPJB/dll" | "Izin Usaha";

function SectionCard({ title, children, step }: { title: string; children: React.ReactNode; step: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{step}</div>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FieldGroup({ label, required, children, note }: { label: string; required?: boolean; children: React.ReactNode; note?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {note && <p className="text-xs text-gray-400">{note}</p>}
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <label key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${value === opt ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-gray-700 hover:border-primary/50"}`}>
          <input type="radio" className="hidden" checked={value === opt} onChange={() => onChange(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({ options, values, onChange }: { options: { label: string; value: string }[]; values: string[]; onChange: (vals: string[]) => void }) {
  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter(x => x !== v));
    else onChange([...values, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <label key={opt.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${values.includes(opt.value) ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-gray-700 hover:border-primary/50"}`}>
          <input type="checkbox" className="hidden" checked={values.includes(opt.value)} onChange={() => toggle(opt.value)} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function NumberInput({ value, onChange, placeholder, unit }: { value: string; onChange: (v: string) => void; placeholder?: string; unit?: string }) {
  return (
    <div className="relative">
      <Input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={unit ? "pr-10" : ""} />
      {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">{unit}</span>}
    </div>
  );
}

function PriceInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const preview = value ? formatCurrency(Number(value)) : "";
  return (
    <div className="space-y-1">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">Rp</span>
        <Input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pl-8" />
      </div>
      {preview && <div className="text-xs text-primary font-semibold">{preview}</div>}
    </div>
  );
}

// Searchable Dropdown Component
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "border-gray-200 hover:border-primary/50 cursor-pointer"
        }`}
        disabled={disabled}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Cari ${label}...`}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange(""); setSearch(""); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50"
            >
              -- Pilih {label} --
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setSearch(""); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 ${
                    value === opt ? "bg-primary/10 text-primary font-semibold" : "text-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Location Search Component
function LocationSearch({ onSelect }: { onSelect: (city: string, district: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ city: string; district: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      const found = searchLocations(query);
      setResults(found);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari kecamatan atau desa (contoh: Caturtunggal, Depok, Sleman...)"
            className="pl-9"
          />
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(r.city, r.district);
                setQuery("");
                setShowResults(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-primary/5 border-b border-gray-50 last:border-b-0"
            >
              <div className="font-medium text-sm text-gray-900">{r.district}</div>
              <div className="text-xs text-gray-500">{r.city}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SEOPreview({ title, description, slug, price, bedrooms, bathrooms, landArea, type, purpose, district, city, legal }: {
  title: string; description: string; slug: string; price: string; bedrooms: string; bathrooms: string;
  landArea: string; type: string; purpose: string; district: string; city: string; legal: string;
}) {
  const seoTitle = `${title || "Judul Properti"} - ${price ? formatCurrency(Number(price)) : "Harga"} | ${city || "Kota"} | Salam Bumi Property`;
  const seoDesc = `${bedrooms ? bedrooms + " KT, " : ""}${bathrooms ? bathrooms + " KM, " : ""}${landArea ? landArea + "m². " : ""}${type} ${purpose} di ${district || "Kecamatan"}, ${city || "Kota"}. Legal: ${legal || "Status Legalitas"}. Hubungi: 0813-9127-8889`;
  const seoUrl = `https://salambumi.xyz/properti/${slug || "url-properti"}`;

  const titleLen = seoTitle.length;
  const descLen = seoDesc.length;

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-1">
      <div className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Preview Google Search</div>
      <div className="text-green-700 text-sm font-medium truncate">{seoUrl}</div>
      <div className={`font-bold leading-snug ${titleLen > 60 ? "text-red-600" : "text-blue-700"} line-clamp-2`}>{seoTitle}</div>
      <div className={`text-sm leading-snug ${descLen > 160 ? "text-red-600" : "text-gray-600"} line-clamp-2`}>{seoDesc}</div>
      <div className="flex gap-4 text-xs mt-2">
        <span className={`flex items-center gap-1 ${titleLen > 60 ? "text-red-500" : "text-green-600"}`}>
          {titleLen > 60 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Title: {titleLen}/60
        </span>
        <span className={`flex items-center gap-1 ${descLen > 160 ? "text-red-500" : "text-green-600"}`}>
          {descLen > 160 ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Description: {descLen}/160
        </span>
      </div>
    </div>
  );
}

function generateListingCode() {
  const prefix = ["R", "K", "T", "V", "H", "G"][Math.floor(Math.random() * 6)];
  const num = Math.floor(Math.random() * 9) + 1;
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${prefix}${num}.${suffix}`;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminPropertyForm() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = !!id;

  // Fetch existing property when in edit mode
  const [existing, setExisting] = useState<any>(null);
  const [loadingProperty, setLoadingProperty] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchProperty = async () => {
      try {
        const result = await propertiesApi.getById(id);
        if (result.success && result.data) {
          setExisting(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch property for edit:", err);
        toast({ title: "Gagal memuat data properti", variant: "destructive" });
      } finally {
        setLoadingProperty(false);
      }
    };
    fetchProperty();
  }, [id, isEdit]);

  const [listingCode, setListingCode] = useState(generateListingCode());
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("Dijual");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [priceRent, setPriceRent] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [priceType, setPriceType] = useState<string[]>([]);

  const [province, setProvince] = useState("DI. Yogyakarta");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  const [propertyType, setPropertyType] = useState<PropertyType>("Rumah");
  const [landArea, setLandArea] = useState("");
  const [buildingArea, setBuildingArea] = useState("");
  const [frontWidth, setFrontWidth] = useState("");
  const [floors, setFloors] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [kostType, setKostType] = useState<string[]>([]);
  const [furnishing, setFurnishing] = useState("");
  const [hotelType, setHotelType] = useState("");

  const [legalStatus, setLegalStatus] = useState<LegalStatus>("SHM & IMB/PBG Lengkap");
  const [ownership, setOwnership] = useState<"On Hand" | "On Bank">("On Hand");
  const [bankName, setBankName] = useState("");
  const [outstanding, setOutstanding] = useState("");
  const [shgbExpiry, setShgbExpiry] = useState("");

  const [envStatus, setEnvStatus] = useState("Ya Jauh");
  const [distRiver, setDistRiver] = useState("");
  const [distGrave, setDistGrave] = useState("");
  const [distPower, setDistPower] = useState("");
  const [roadWidth, setRoadWidth] = useState("");

  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState("");
  const [sellingReason, setSellingReason] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const [ownerName, setOwnerName] = useState("");
  const [ownerWa1, setOwnerWa1] = useState("");
  const [ownerWa2, setOwnerWa2] = useState("");

  // Lokasi cascading
  const cities = useMemo(() => getCities(), []);
  const districts = useMemo(() => getDistricts(city), [city]);

  // Handle location search selection
  const handleLocationSearchSelect = (selectedCity: string, selectedDistrict: string) => {
    setCity(selectedCity);
    setDistrict(selectedDistrict);
    setVillage("");
  };

  // Populate form fields when existing property data is loaded (edit mode)
  useEffect(() => {
    if (!existing) return;
    const d = existing;

    setListingCode(d.listing_code || generateListingCode());
    setTitle(d.title || "");
    setSlug(d.slug || "");
    setPurpose(d.purpose || "Dijual");
    setPrice(d.price?.toString() || d.price_offer?.toString() || "");
    setOldPrice(d.old_price?.toString() || "");
    setPriceRent(d.price_rent?.toString() || "");

    const lbl: string[] = [];
    if (d.is_premium) lbl.push("is_premium");
    if (d.is_featured) lbl.push("is_featured");
    if (d.is_hot) lbl.push("is_hot");
    if (d.is_sold) lbl.push("is_sold");
    if (d.is_choice) lbl.push("is_choice");
    setLabels(lbl);

    setProvince(d.province || "DI. Yogyakarta");
    setCity(d.city || "");
    setDistrict(d.district || "");
    setVillage(d.village || "");
    setAddress(d.address || "");
    setGoogleMapsUrl(d.google_maps_url || "");

    setPropertyType(d.property_type || d.type || "Rumah");
    setLandArea(d.land_area?.toString() || "");
    setBuildingArea(d.building_area?.toString() || "");
    setFrontWidth(d.front_width?.toString() || "");
    setFloors(d.floors?.toString() || "");
    setBedrooms(d.bedrooms?.toString() || "");
    setBathrooms(d.bathrooms?.toString() || "");

    setLegalStatus(d.legal_status || "SHM & IMB/PBG Lengkap");
    setOwnership(d.bank_name ? "On Bank" : (d.ownership_status || "On Hand"));
    setBankName(d.bank_name || "");
    setOutstanding(d.outstanding_amount?.toString() || "");

    if (d.distance_to_river) { setEnvStatus("Dekat Sungai"); setDistRiver(d.distance_to_river.toString()); }
    else if (d.distance_to_grave) { setEnvStatus("Dekat Makam"); setDistGrave(d.distance_to_grave.toString()); }
    else if (d.distance_to_powerline) { setEnvStatus("Dekat Sutet"); setDistPower(d.distance_to_powerline.toString()); }
    setRoadWidth(d.road_width?.toString() || "");

    setDescription(d.description || "");
    setFacilities(Array.isArray(d.facilities) ? d.facilities.join(", ") : (d.facilities || ""));
    setSellingReason(d.selling_reason || "");
    setVideoUrl(d.video_url || "");

    setOwnerName(d.owner_name || "");
    setOwnerWa1(d.owner_whatsapp_1 || "");
    setOwnerWa2(d.owner_whatsapp_2 || "");

    // Images
    if (d.images?.length) {
      setImageUrls(d.images.map((i: any) => i.url || i));
    } else if (d.image) {
      setImageUrls([d.image]);
    }
  }, [existing]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit) setSlug(slugify(v) + "-" + listingCode.toLowerCase());
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (imageUrls.length + files.length > 10) {
      alert("Maksimal 10 foto");
      return;
    }
    
    // Convert ke WebP lalu upload
    for (const file of files) {
      try {
        const webpFile = await convertToWebp(file);
        const result = await propertiesApi.uploadImage(webpFile);
        if (result.success && result.url) {
          setImageUrls(prev => [...prev, result.url]);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({ title: "Gagal mengupload gambar", variant: "destructive" });
      }
    }
  }, [imageUrls, toast]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageUrls.length + files.length > 10) { 
      alert("Maksimal 10 foto"); 
      return; 
    }
    
    // Convert ke WebP lalu upload
    for (const file of files) {
      try {
        const webpFile = await convertToWebp(file);
        const result = await propertiesApi.uploadImage(webpFile);
        if (result.success && result.url) {
          setImageUrls(prev => [...prev, result.url]);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({ title: "Gagal mengupload gambar", variant: "destructive" });
      }
    }
  }, [imageUrls, toast]);

  const removeImage = useCallback((idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  }, []);

   const handleSave = async (mode: "draft" | "publish") => {
     if (!title) { 
       toast({ title: "Judul wajib diisi", variant: "destructive" }); 
       return; 
     }

     // Prepare the property data
     const propertyData: any = {
       title,
       listing_code: listingCode,
       slug: slug || `${slugify(title)}-${listingCode.toLowerCase()}`,
       purpose,
       property_type: propertyType,
       price_offer: price ? parseInt(price, 10) : undefined,
       price_rent: priceRent ? parseInt(priceRent, 10) : undefined,
       old_price: oldPrice ? parseInt(oldPrice, 10) : undefined,
       price_type: priceType.length > 0 ? priceType.join(",") : undefined,
       province,
       city,
       district,
       village,
       address,
       google_maps_url: googleMapsUrl,
       land_area: landArea ? parseInt(landArea, 10) : undefined,
       building_area: buildingArea ? parseInt(buildingArea, 10) : undefined,
       front_width: frontWidth ? parseInt(frontWidth, 10) : undefined,
       floors: floors ? parseInt(floors, 10) : undefined,
       bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
       bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
       legal_status: legalStatus,
       ownership_status: ownership,
       bank_name: bankName || undefined,
       outstanding_amount: outstanding ? parseInt(outstanding, 10) : undefined,
       environmental_status: envStatus,
       distance_to_river: distRiver ? parseInt(distRiver, 10) : undefined,
       distance_to_grave: distGrave ? parseInt(distGrave, 10) : undefined,
       distance_to_powerline: distPower ? parseInt(distPower, 10) : undefined,
       road_width: roadWidth ? parseInt(roadWidth, 10) : undefined,
       description,
       facilities: facilities ? facilities : undefined,
       selling_reason: sellingReason,
       owner_name: ownerName,
       owner_whatsapp_1: ownerWa1,
       owner_whatsapp_2: ownerWa2,
       is_premium: labels.includes("is_premium") ? 1 : 0,
       is_featured: labels.includes("is_featured") ? 1 : 0,
       is_hot: labels.includes("is_hot") ? 1 : 0,
       is_choice: labels.includes("is_choice") ? 1 : 0,
       is_sold: labels.includes("is_sold") ? 1 : 0,
       status: mode === "publish" ? "active" : "draft",
     };

     // Remove undefined fields
     Object.keys(propertyData).forEach(key => 
       propertyData[key] === undefined && delete propertyData[key]
     );

     // Tambahkan images jika ada
     if (imageUrls.length > 0) {
       propertyData.images = imageUrls;
     }

     try {
        const result = isEdit && id
          ? await propertiesApi.update(id, propertyData)
          : await propertiesApi.create(propertyData);

        const propertyId = isEdit
          ? id
          : ("id" in result ? result.id : undefined);

        // Simpan gambar ke property_images table jika ada
        // Hanya simpan gambar yang BELUM ada di database (cek duplikat)
        if (imageUrls.length > 0 && propertyId) {
          for (let i = 0; i < imageUrls.length; i++) {
            try {
               await fetch("/api/properties/save-image", {
                 method: "POST",
                 headers: {
                   "Content-Type": "application/json",
                   "Authorization": `Bearer ${localStorage.getItem("sbp_admin_token") || ""}`,
                 },
                body: JSON.stringify({
                  property_id: propertyId,
                  image_url: imageUrls[i],
                  is_primary: i === 0,
                  sort_order: i,
                }),
              });
            } catch (imgErr) {
              console.error("Failed to save image:", imgErr);
            }
          }
        }
        
        toast({
          title: mode === "draft" ? "Draft tersimpan!" : (isEdit ? "Properti diupdate!" : "Properti dipublish!"),
          description: isEdit
            ? `"${title}" berhasil diupdate.`
            : (mode === "draft" ? `"${title}" disimpan sebagai draft.` : `"${title}" berhasil dipublish ke website.`),
        });
       setLocation("/admin/properties");
     } catch (err) {
       console.error("Failed to create property:", err);
       toast({ title: "Gagal menyimpan properti", variant: "destructive" });
     }
   };

  const PROVINCES = ["DI. Yogyakarta", "Jawa Tengah", "Jawa Timur", "DKI Jakarta"];

  const showRumahFields = ["Rumah", "Villa", "Homestay", "Hotel"].includes(propertyType);
  const showKostFields = propertyType === "Kost";
  const showTanahOnly = propertyType === "Tanah";
  const showApartment = propertyType === "Apartment";
  const showGudang = propertyType === "Gudang" || propertyType === "Komersial Lainnya";

  return (
    <AdminLayout title={isEdit ? "Edit Properti" : "Tambah Properti Baru"}>
      {loadingProperty ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Memuat data properti...</p>
          </div>
        </div>
      ) : (<>
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-5 gap-2">
        <Link href="/admin/properties" className="hover:text-primary">Kelola Properti</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-semibold">{isEdit ? "Edit Properti" : "Tambah Properti Baru"}</span>
      </div>

      <div className="space-y-5">
        {/* 1. Informasi Dasar */}
        <SectionCard title="Informasi Dasar" step={1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Kode Listing" required>
              <Input value={listingCode} readOnly className="bg-gray-50 font-bold tracking-wider" />
            </FieldGroup>
            <FieldGroup label="Tujuan" required>
              <RadioGroup options={["Dijual", "Disewakan", "Dijual & Disewakan"]} value={purpose} onChange={v => setPurpose(v as Purpose)} />
            </FieldGroup>
          </div>
          <FieldGroup label="Judul Properti" required note="Maksimal 100 karakter. Gunakan kata kunci yang jelas.">
            <Input
              placeholder="Rumah Mewah 2 Lantai Sleman Dekat UGM"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              maxLength={100}
            />
            <div className="text-xs text-right text-gray-400 mt-0.5">{title.length}/100</div>
          </FieldGroup>
          <SlugPreview
            title={title}
            propertyType={propertyType}
            location={district || city || ""}
            listingCode={listingCode}
            value={slug}
            onChange={setSlug}
          />
        </SectionCard>

        {/* 2. Harga & Label */}
        <SectionCard title="Harga & Label" step={2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(purpose === "Dijual" || purpose === "Dijual & Disewakan") && (
              <FieldGroup label="Harga Penawaran" required note="Jika ada harga lama, akan otomatis muncul badge HOT">
                <PriceInput value={price} onChange={setPrice} placeholder="2500000000" />
              </FieldGroup>
            )}
            {(purpose === "Disewakan" || purpose === "Dijual & Disewakan") && (
              <FieldGroup label="Harga Sewa / Tahun">
                <PriceInput value={priceRent} onChange={setPriceRent} placeholder="50000000" />
              </FieldGroup>
            )}
            <FieldGroup label="Harga Lama (Opsional)" note="Jika diisi, tampil strikethrough + badge HOT">
              <PriceInput value={oldPrice} onChange={setOldPrice} placeholder="2700000000" />
            </FieldGroup>
            <FieldGroup label="Tipe Harga">
              <CheckboxGroup options={[{ label: "Nego", value: "nego" }, { label: "Nett", value: "nett" }]} values={priceType} onChange={setPriceType} />
            </FieldGroup>
          </div>
          <FieldGroup label="Label Properti">
            <CheckboxGroup
              options={[
                { label: "PREMIUM", value: "is_premium" }, { label: "FEATURED", value: "is_featured" },
                { label: "HOT", value: "is_hot" }, { label: "SOLD", value: "is_sold" },
                { label: "Properti Pilihan", value: "is_choice" },
              ]}
              values={labels}
              onChange={setLabels}
            />
          </FieldGroup>
        </SectionCard>

        {/* 3. Lokasi */}
        <SectionCard title="Lokasi Properti" step={3}>
          {/* Location Search */}
          <FieldGroup label="Cari Lokasi" note="Ketik nama desa, kecamatan, atau kabupaten untuk pencarian cepat">
            <LocationSearch onSelect={handleLocationSearchSelect} />
          </FieldGroup>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500 mb-3">Atau pilih manual:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Provinsi" required>
                <SearchableSelect
                  value={province}
                  onChange={v => { setProvince(v); setCity(""); setDistrict(""); setVillage(""); }}
                  options={PROVINCES}
                  placeholder="-- Pilih Provinsi --"
                  label="Provinsi"
                />
              </FieldGroup>
              <FieldGroup label="Kabupaten / Kota" required>
                <SearchableSelect
                  value={city}
                  onChange={v => { setCity(v); setDistrict(""); setVillage(""); }}
                  options={cities}
                  placeholder="-- Pilih Kab/Kota --"
                  disabled={!province}
                  label="Kab/Kota"
                />
              </FieldGroup>
              <FieldGroup label="Kecamatan" required>
                <SearchableSelect
                  value={district}
                  onChange={v => { setDistrict(v); setVillage(""); }}
                  options={districts}
                  placeholder="-- Pilih Kecamatan --"
                  disabled={!city}
                  label="Kecamatan"
                />
              </FieldGroup>
              <FieldGroup label="Kelurahan / Desa" required>
                <Input
                  placeholder="Nama Kelurahan/Desa"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  disabled={!district}
                />
              </FieldGroup>
            </div>
          </div>
          <FieldGroup label="Alamat Lengkap" required>
            <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Jl. Pajajaran No. 123, Catur Tunggal, Depok, Sleman" />
          </FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Link Google Maps">
              <div className="flex gap-2">
                <Input value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." className="flex-1" />
                {googleMapsUrl && <a href={googleMapsUrl} target="_blank" rel="noreferrer"><Button type="button" variant="outline" size="icon"><ExternalLink className="w-4 h-4" /></Button></a>}
              </div>
            </FieldGroup>
          </div>
        </SectionCard>

        {/* 4. Jenis & Spesifikasi */}
        <SectionCard title="Jenis Properti & Spesifikasi" step={4}>
          <FieldGroup label="Jenis Properti" required>
            <RadioGroup
              options={["Rumah", "Tanah", "Kost", "Hotel", "Homestay", "Villa", "Apartment", "Gudang", "Komersial Lainnya"]}
              value={propertyType}
              onChange={v => setPropertyType(v as PropertyType)}
            />
          </FieldGroup>

          {/* Conditional fields */}
          {(showRumahFields || showKostFields || showGudang) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FieldGroup label="Luas Tanah (m²)" required><NumberInput value={landArea} onChange={setLandArea} placeholder="200" unit="m²" /></FieldGroup>
              {!showTanahOnly && <FieldGroup label="Luas Bangunan (m²)" required><NumberInput value={buildingArea} onChange={setBuildingArea} placeholder="150" unit="m²" /></FieldGroup>}
              <FieldGroup label="Lebar Depan (m)"><NumberInput value={frontWidth} onChange={setFrontWidth} placeholder="10" unit="m" /></FieldGroup>
              {(showRumahFields || showKostFields) && <FieldGroup label="Jumlah Lantai" required><NumberInput value={floors} onChange={setFloors} placeholder="2" /></FieldGroup>}
              {(showRumahFields || showKostFields) && <FieldGroup label={propertyType === "Kost" ? "Jumlah Kamar" : "Kamar Tidur"} required><NumberInput value={bedrooms} onChange={setBedrooms} placeholder="4" /></FieldGroup>}
              {(showRumahFields || showKostFields) && <FieldGroup label="Kamar Mandi" required><NumberInput value={bathrooms} onChange={setBathrooms} placeholder="3" /></FieldGroup>}
            </div>
          )}
          {showTanahOnly && (
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Luas Tanah (m²)" required><NumberInput value={landArea} onChange={setLandArea} placeholder="500" unit="m²" /></FieldGroup>
              <FieldGroup label="Lebar Depan (m)"><NumberInput value={frontWidth} onChange={setFrontWidth} placeholder="15" unit="m" /></FieldGroup>
            </div>
          )}
          {showApartment && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FieldGroup label="Luas Bangunan (m²)" required><NumberInput value={buildingArea} onChange={setBuildingArea} placeholder="36" unit="m²" /></FieldGroup>
              <FieldGroup label="Lantai Unit"><NumberInput value={floors} onChange={setFloors} placeholder="5" /></FieldGroup>
              <FieldGroup label="Kamar Tidur" required><NumberInput value={bedrooms} onChange={setBedrooms} placeholder="2" /></FieldGroup>
              <FieldGroup label="Kamar Mandi" required><NumberInput value={bathrooms} onChange={setBathrooms} placeholder="1" /></FieldGroup>
            </div>
          )}
          {showKostFields && (
            <FieldGroup label="Jenis Kost" required>
              <CheckboxGroup options={[{ label: "Putra", value: "Putra" }, { label: "Putri", value: "Putri" }, { label: "Campur", value: "Campur" }]} values={kostType} onChange={setKostType} />
            </FieldGroup>
          )}
          {(showRumahFields || showKostFields) && (
            <FieldGroup label="Kelengkapan Furnitur">
              <RadioGroup options={["Fully Furnished", "Semi Furnished", "UnFurnished"]} value={furnishing} onChange={setFurnishing} />
            </FieldGroup>
          )}
          {propertyType === "Hotel" && (
            <FieldGroup label="Jenis Hotel" required>
              <select value={hotelType} onChange={e => setHotelType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                {["Budget/Melati", "Bintang 1", "Bintang 2", "Bintang 3", "Bintang 4", "Bintang 5", "Boutique"].map(h => <option key={h}>{h}</option>)}
              </select>
            </FieldGroup>
          )}
        </SectionCard>

        {/* 5. Legalitas */}
        <SectionCard title="Legalitas" step={5}>
          <FieldGroup label="Status Legalitas" required>
            <RadioGroup
              options={["SHM & IMB/PBG Lengkap", "SHGB & IMB/PBG Lengkap", "SHM Pekarangan Tanpa IMB/PBG", "SHM Sawah/Tegalan", "SHGB Tanpa IMB/PBG", "Girik/Letter C/PPJB/dll", "Izin Usaha"]}
              value={legalStatus}
              onChange={v => setLegalStatus(v as LegalStatus)}
            />
          </FieldGroup>
          {legalStatus.includes("SHGB") && (
            <FieldGroup label="SHGB Berlaku Sampai">
              <Input type="date" value={shgbExpiry} onChange={e => setShgbExpiry(e.target.value)} />
            </FieldGroup>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Kepemilikan" required>
              <RadioGroup options={["On Hand", "On Bank"]} value={ownership} onChange={v => setOwnership(v as "On Hand" | "On Bank")} />
            </FieldGroup>
            {ownership === "On Bank" && (
              <>
                <FieldGroup label="Nama Bank" required>
                  <Input placeholder="Bank BCA, BNI, BTN..." value={bankName} onChange={e => setBankName(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Outstanding di Bank">
                  <PriceInput value={outstanding} onChange={setOutstanding} placeholder="300000000" />
                </FieldGroup>
              </>
            )}
          </div>
        </SectionCard>

        {/* 6. Lingkungan */}
        <SectionCard title="Lingkungan Sekitar" step={6}>
          <FieldGroup label="Jarak dari Makam/Sungai/Sutet" required>
            <RadioGroup
              options={["Ya Jauh", "Dekat Sungai", "Dekat Makam", "Dekat Sutet"]}
              value={envStatus}
              onChange={setEnvStatus}
            />
          </FieldGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {envStatus === "Dekat Sungai" && <FieldGroup label="Jarak ke Sungai" required><NumberInput value={distRiver} onChange={setDistRiver} placeholder="50" unit="m" /></FieldGroup>}
            {envStatus === "Dekat Makam" && <FieldGroup label="Jarak ke Makam" required><NumberInput value={distGrave} onChange={setDistGrave} placeholder="100" unit="m" /></FieldGroup>}
            {envStatus === "Dekat Sutet" && <FieldGroup label="Jarak ke Sutet" required><NumberInput value={distPower} onChange={setDistPower} placeholder="200" unit="m" /></FieldGroup>}
            <FieldGroup label="Lebar Jalan" required><NumberInput value={roadWidth} onChange={setRoadWidth} placeholder="6" unit="m" /></FieldGroup>
          </div>
        </SectionCard>

        {/* 7. Deskripsi */}
        <SectionCard title="Deskripsi & Fasilitas" step={7}>
          <FieldGroup label="Deskripsi Detail" required note={`${description.length}/2000 karakter`}>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 2000))}
              rows={7}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Jelaskan secara lengkap dan detail perihal properti ini..."
            />
          </FieldGroup>
          <FieldGroup label="Fasilitas" note="Pisahkan dengan koma. Contoh: AC, Water Heater, Kitchen Set, Pool">
            <textarea
              value={facilities}
              onChange={e => setFacilities(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="AC, Water Heater, Kitchen Set, Garasi, Security 24 Jam..."
            />
          </FieldGroup>
          <FieldGroup label="Alasan Dijual (Admin Only)" note="Tidak ditampilkan ke publik">
            <textarea
              value={sellingReason}
              onChange={e => setSellingReason(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-yellow-50 border-yellow-200"
              placeholder="Pemilik pindah kota, butuh dana, dll..."
            />
          </FieldGroup>
          <FieldGroup label="Link Video YouTube (Opsional)">
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/embed/..." />
          </FieldGroup>
        </SectionCard>

        {/* 8. Upload Foto */}
        <SectionCard title="Upload Foto" step={8}>
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50 hover:border-primary/50"}`}
            >
              <ImagePlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 mb-1">Drag & drop foto di sini</p>
              <p className="text-sm text-gray-400 mb-3">atau klik untuk pilih file (JPG, PNG, WebP · max 5MB per foto · max 10 foto)</p>
              <label className="cursor-pointer">
                <span className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Pilih Foto
                </span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={imageUrls.length >= 10} />
              </label>
              <p className="text-xs text-gray-400 mt-2">{imageUrls.length}/10 foto</p>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {imageUrls.map((img, idx) => (
                  <div key={idx} className={`relative rounded-lg overflow-hidden aspect-square border-2 ${idx === 0 ? "border-primary" : "border-gray-100"}`}>
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-xs font-bold px-1 py-0.5 rounded">Cover</span>}
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {imageUrls.length < 1 && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Minimal 1 foto diperlukan untuk publish.
            </div>
          )}
        </SectionCard>

        {/* 9. Data Pemilik */}
        <SectionCard title="Data Pemilik (Admin Only)" step={9}>
          <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg text-sm mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Informasi ini tidak ditampilkan di website publik.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Nama Pemilik" required>
              <Input placeholder="Nama lengkap pemilik" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
            </FieldGroup>
            <FieldGroup label="No. WhatsApp 1" required>
              <div className="flex gap-2">
                <Input placeholder="+6281391278889" value={ownerWa1} onChange={e => setOwnerWa1(e.target.value)} className="flex-1" />
                {ownerWa1 && <a href={`https://wa.me/${ownerWa1.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"><Button type="button" variant="outline" size="icon" className="text-[#25D366] border-[#25D366]"><MessageCircleIcon /></Button></a>}
              </div>
            </FieldGroup>
            <FieldGroup label="No. WhatsApp 2 (Opsional)">
              <div className="flex gap-2">
                <Input placeholder="+62..." value={ownerWa2} onChange={e => setOwnerWa2(e.target.value)} className="flex-1" />
                {ownerWa2 && <a href={`https://wa.me/${ownerWa2.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"><Button type="button" variant="outline" size="icon" className="text-[#25D366] border-[#25D366]"><MessageCircleIcon /></Button></a>}
              </div>
            </FieldGroup>
          </div>
        </SectionCard>

        {/* 10. SEO Preview */}
        <SectionCard title="SEO Preview" step={10}>
          <SEOPreview
            title={title} description={description} slug={slug} price={price}
            bedrooms={bedrooms} bathrooms={bathrooms} landArea={landArea}
            type={propertyType} purpose={purpose} district={district}
            city={city} legal={legalStatus}
          />
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-lg border border-gray-100">
          <Button variant="outline" onClick={() => handleSave("draft")} className="flex-1 gap-2">
            <Save className="w-4 h-4" /> Simpan Draft
          </Button>
          <Link href={`/property/${slug}`} target="_blank" rel="noreferrer" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Eye className="w-4 h-4" /> Preview
            </Button>
          </Link>
          <Button onClick={() => handleSave("publish")} className="flex-1 gap-2 bg-primary hover:bg-primary/90" disabled={imageUrls.length < 1 || !title}>
            <Send className="w-4 h-4" /> Publish
          </Button>
        </div>
      </div>
      </>)}
    </AdminLayout>
  );
}

function MessageCircleIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}