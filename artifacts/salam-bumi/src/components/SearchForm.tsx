import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Button } from "./ui/button";
import { getCities, getDistricts } from "@/admin/data/locations";

/** Searchable Dropdown Component */
function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  disabled = false,
  defaultOption,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  defaultOption?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayValue = defaultOption && !value ? defaultOption : value;

  return (
    <div className="space-y-1.5 relative" ref={ref}>
      <label className="text-xs font-semibold text-gray-500 px-1">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full bg-gray-50 border border-gray-200 text-left text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className={displayValue ? "text-gray-800" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
      {open && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {defaultOption && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors ${
                  !value ? "bg-primary/10 text-primary font-semibold" : "text-gray-600"
                }`}
              >
                {defaultOption}
              </button>
            )}
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors ${
                    value === opt ? "bg-primary/10 text-primary font-semibold" : "text-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-400 text-center">
                Tidak ditemukan
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchForm() {
  const [, setLocation] = useLocation();
  const [purpose, setPurpose] = useState<string>("Dijual");
  const [propertyType, setPropertyType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [province, setProvince] = useState<string>("DI Yogyakarta");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [village, setVillage] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const provinces = ["DI Yogyakarta"];

  // Gunakan data dari locations.ts yang sama dengan dashboard
  const cities = getCities();
  const currentDistricts = city ? getDistricts(city) : [];

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (purpose) {
      if (purpose === "Dijual") params.set("purpose", "dijual");
      else if (purpose === "Disewa") params.set("purpose", "disewa");
      else if (purpose === "Dijual & Disewa") params.set("purpose", "semua");
    }
    
    if (propertyType) params.set("type", propertyType.toLowerCase());
    if (priceRange) params.set("price", priceRange);
    if (province) params.set("province", province);
    if (city) params.set("city", city);
    if (district) params.set("district", district);
    if (village) params.set("village", village);
    
    const queryString = params.toString();
    setLocation(`/properti${queryString ? `?${queryString}` : ""}`);
  };

  // Reset filters
  const handleReset = () => {
    setPurpose("Dijual");
    setPropertyType("");
    setPriceRange("");
    setProvince("DI Yogyakarta");
    setCity("");
    setDistrict("");
    setVillage("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-6xl mx-auto border border-gray-100">
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
        {(["Dijual", "Disewa", "Dijual & Disewa"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setPurpose(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              purpose === tab
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Filters Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SearchableSelect
          label="Jenis Properti"
          value={propertyType}
          onChange={setPropertyType}
          options={["Rumah", "Kost", "Tanah", "Villa", "Ruko", "Apartment", "Hotel", "Homestay", "Gudang", "Komersial Lainnya"]}
          placeholder="Semua Tipe"
          defaultOption="Semua Tipe"
        />
        <SearchableSelect
          label="Provinsi"
          value={province}
          onChange={setProvince}
          options={provinces}
          placeholder="Pilih Provinsi"
        />
        <SearchableSelect
          label="Kab. / Kota"
          value={city}
          onChange={(v) => {
            setCity(v);
            setDistrict("");
            setVillage("");
          }}
          options={cities}
          placeholder="Semua Kota"
          defaultOption="Semua Kota"
        />
        <SearchableSelect
          label="Kecamatan"
          value={district}
          onChange={(v) => {
            setDistrict(v);
            setVillage("");
          }}
          options={currentDistricts}
          placeholder={city ? "Semua Kecamatan" : "Pilih Kota Dulu"}
          disabled={!city}
          defaultOption="Semua Kecamatan"
        />
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 px-1">Kelurahan / Desa</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder={district ? "Ketik nama kelurahan/desa" : "Pilih Kecamatan Dulu"}
              disabled={!district}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 px-1">Rentang Harga</label>
            <select 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
            >
              <option value="">Semua Harga</option>
              <option value="0-1000000000">Dibawah 1M</option>
              <option value="1000000000-2000000000">1M - 2M</option>
              <option value="2000000000-3000000000">2M - 3M</option>
              <option value="3000000000-4000000000">3M - 4M</option>
              <option value="4000000000-5000000000">4M - 5M</option>
              <option value="5000000000-6000000000">5M - 6M</option>
              <option value="6000000000-7000000000">6M - 7M</option>
              <option value="7000000000-8000000000">7M - 8M</option>
              <option value="8000000000-9000000000">8M - 9M</option>
              <option value="9000000000-10000000000">9M - 10M</option>
              <option value="10000000000-99999999999">Diatas 10M</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-primary font-semibold flex items-center gap-2 hover:text-secondary transition-colors py-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? "Sembunyikan Filter" : "Filter Lanjutan"}
        </button>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleReset}
            variant="outline"
            className="w-full sm:w-auto h-12 rounded-xl"
          >
            Reset
          </Button>
          <Button 
            onClick={handleSearch}
            className="w-full sm:w-auto min-w-[200px] h-12 bg-secondary hover:bg-secondary/90 text-primary font-bold text-base rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Search className="w-5 h-5 mr-2" />
            Cari Properti
          </Button>
        </div>
      </div>
    </div>
  );
}
