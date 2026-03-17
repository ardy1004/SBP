import { useState, useCallback, useEffect, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { logger } from "@/lib/logger";
import { useLocation } from "wouter";

interface SearchBarProps {
  onSearch?: (filters: {
    type: 'jual' | 'sewa';
    keyword: string;
    propertyType: string;
    province?: string;
    city?: string;
    district?: string;
  }) => void;
  className?: string;
  debounceMs?: number;
}

// Data lokasi Indonesia (Provinsi, Kabupaten, Kecamatan)
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

export function SearchBar({
  onSearch,
  className = "",
  debounceMs = 300
}: SearchBarProps) {
  const [type, setType] = useState<'jual' | 'sewa'>('jual');
  const [keyword, setKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('');
  
  // State untuk lokasi
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  
  const [, navigate] = useLocation();

  // Reset city dan district saat province berubah
  useEffect(() => {
    setCity('');
    setDistrict('');
  }, [province]);

  // Reset district saat city berubah
  useEffect(() => {
    setDistrict('');
  }, [city]);

  // Generate SEO-friendly URL
  const generateSeoUrl = useCallback((): string => {
    const parts: string[] = [];
    
    // Status (dijual/disewa)
    parts.push(type === 'jual' ? 'dijual' : 'disewa');
    
    // Jenis properti
    if (propertyType) {
      parts.push(propertyType.toLowerCase());
    }
    
    // Lokasi (provinsi -> kota -> kecamatan)
    if (province) {
      parts.push(province.toLowerCase());
    }
    if (city) {
      parts.push(city.toLowerCase());
    }
    if (district) {
      parts.push(district.toLowerCase());
    }
    
    return '/' + parts.join('/');
  }, [type, propertyType, province, city, district]);

  // Debounced search function untuk mengurangi frekuensi pencarian
  const debouncedSearch = useDebouncedCallback(
    (searchKeyword: string) => {
      logger.debug('Debounced search executed:', { 
        type, 
        keyword: searchKeyword, 
        propertyType,
        province,
        city,
        district
      });
      if (onSearch) {
        onSearch({ type, keyword: searchKeyword, propertyType, province, city, district });
      }
    },
    debounceMs
  );

  // Handle immediate search (saat tombol Cari ditekan)
  const handleSearch = useCallback(() => {
    logger.debug('Search submitted:', { 
      type, 
      keyword, 
      propertyType,
      province,
      city,
      district
    });
    
    // Navigate ke URL SEO-friendly
    const seoUrl = generateSeoUrl();
    navigate(seoUrl);
    
    // Panggil onSearch jika ada (backward compatibility)
    if (onSearch) {
      onSearch({ type, keyword, propertyType, province, city, district });
    }
  }, [type, keyword, propertyType, province, city, district, onSearch, navigate, generateSeoUrl]);

  // Handle keyword change dengan debouncing
  const handleKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);
    
    // Trigger debounced search untuk live search
    if (newKeyword.length >= 2 || newKeyword.length === 0) {
      debouncedSearch(newKeyword);
    }
  }, [debouncedSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setKeyword('');
    // Trigger search dengan keyword kosong
    debouncedSearch('');
  }, [debouncedSearch]);

  // Get list cities berdasarkan province yang dipilih
  const availableCities = useMemo(() => {
    if (!province) return [];
    return Object.keys(indonesiaLocations[province] || {});
  }, [province]);

  // Get list districts berdasarkan city yang dipilih
  const availableDistricts = useMemo(() => {
    if (!province || !city) return [];
    return indonesiaLocations[province]?.[city] || [];
  }, [province, city]);

  // Get list provinces
  const provinces = useMemo(() => Object.keys(indonesiaLocations), []);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Toggle Jual/Sewa */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Tipe:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setType('jual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              type === 'jual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Jual
          </button>
          <button
            onClick={() => setType('sewa')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              type === 'sewa'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sewa
          </button>
        </div>
      </div>

      {/* Dropdowns Baris Pertama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* Dropdown Jenis Properti */}
        <div className="min-w-0">
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors duration-200">
              <SelectValue placeholder="Jenis Properti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rumah">Rumah</SelectItem>
              <SelectItem value="apartemen">Apartemen</SelectItem>
              <SelectItem value="tanah">Tanah</SelectItem>
              <SelectItem value="ruko">Ruko</SelectItem>
              <SelectItem value="kantor">Kantor</SelectItem>
              <SelectItem value="gudang">Gudang</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="rukan">Rukan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown Provinsi */}
        <div className="min-w-0">
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors duration-200">
              <SelectValue placeholder="Provinsi" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="">{'{Semua Provinsi}'}</SelectItem>
              {provinces.map((prov) => (
                <SelectItem key={prov} value={prov}>
                  {prov.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown Kabupaten/Kota */}
        <div className="min-w-0">
          <Select value={city} onValueChange={setCity} disabled={!province}>
            <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder={province ? "Kabupaten/Kota" : "Pilih Provinsi dulu"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="">{'{Semua Kab./Kota}'}</SelectItem>
              {availableCities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown Kecamatan */}
        <div className="min-w-0">
          <Select value={district} onValueChange={setDistrict} disabled={!city}>
            <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder={city ? "Kecamatan" : "Pilih Kabupaten dulu"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="">{'{Semua Kec.}'}</SelectItem>
              {availableDistricts.map((districtName) => (
                <SelectItem key={districtName} value={districtName}>
                  {districtName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Layout Horizontal untuk Search dan Tombol */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Input Keyword */}
        <div className="flex-1 min-w-0 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Cari lokasi, nama properti..."
              value={keyword}
              onChange={handleKeywordChange}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-12 h-12 text-base border-2 focus:border-blue-500 transition-colors duration-200"
              autoComplete="off"
              spellCheck="false"
            />
            {keyword && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tombol Filter Lanjutan */}
        <Button
          variant="outline"
          className="h-12 px-4 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>

        {/* Tombol Cari */}
        <Button
          onClick={handleSearch}
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
        >
          Cari
        </Button>
      </div>
    </div>
  );
}
