import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { PropertyCard } from "@/components/PropertyCard";
import { propertiesApi } from "@/lib/api-client";
import { Property } from "@/data/properties";
import { apiToCardProperty } from "@/utils/propertyAdapter";
import {
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Home,
  Building,
  Map,
  Palmtree,
  Store,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROPERTY_TYPES = [
  { value: "", label: "Semua Tipe", icon: Grid },
  { value: "rumah", label: "Rumah", icon: Home },
  { value: "kost", label: "Kost", icon: Building },
  { value: "tanah", label: "Tanah", icon: Map },
  { value: "villa", label: "Villa", icon: Palmtree },
  { value: "ruko", label: "Ruko", icon: Store },
  { value: "apartment", label: "Apartment", icon: Building },
  { value: "hotel", label: "Hotel", icon: Building },
  { value: "homestay", label: "Homestay", icon: Home },
  { value: "gudang", label: "Gudang", icon: Store },
];

const PURPOSE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "Dijual", label: "Dijual" },
  { value: "Disewa", label: "Disewa" },
];

export default function Properties() {
  const [location] = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [apiPage, setApiPage] = useState(1);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get filters from URL path AND query parameters
  useEffect(() => {
    // Parse URL path: /properti/{purpose}/{type}
    const path = window.location.pathname;
    const parts = path.split("/").filter((p) => p);
    const pathParams = parts.slice(1); // Skip 'properti'

    // Parse query parameters: /properti?purpose=dijual&type=kost&city=Sleman
    const searchParams = new URLSearchParams(window.location.search);

    // Priority: Query params > Path params

    // Handle purpose
    const queryPurpose = searchParams.get("purpose");
    if (queryPurpose) {
      const purposeMap: Record<string, string> = {
        dijual: "Dijual",
        disewa: "Disewa",
        semua: "",
      };
      setSelectedPurpose(purposeMap[queryPurpose.toLowerCase()] || "");
    } else if (pathParams.length >= 1) {
      const param = pathParams[0].toLowerCase();
      const purposes = ["dijual", "disewa"];
      if (purposes.includes(param)) {
        setSelectedPurpose(param === "dijual" ? "Dijual" : "Disewa");
      } else {
        setSelectedType(param);
      }
    }

    // Handle type from query params
    const queryType = searchParams.get("type");
    if (queryType) {
      setSelectedType(queryType.toLowerCase());
    } else if (pathParams.length === 2) {
      setSelectedType(pathParams[1].toLowerCase());
    }

    // Handle location filters from query params
    const queryProvince = searchParams.get("province");
    if (queryProvince) {
      setSelectedProvince(queryProvince);
    }

    const queryCity = searchParams.get("city");
    if (queryCity) {
      setSelectedCity(queryCity);
    }

    const queryDistrict = searchParams.get("district");
    if (queryDistrict) {
      setSelectedDistrict(queryDistrict);
    }

    const queryVillage = searchParams.get("village");
    if (queryVillage) {
      setSelectedVillage(queryVillage);
    }

    // Handle price filter from query params
    const queryPrice = searchParams.get("price");
    if (queryPrice) {
      setSelectedPrice(queryPrice);
    }
  }, [location]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setApiPage(1);
    setProperties([]);
    setVisibleCount(12);
  }, [
    search,
    selectedType,
    selectedPurpose,
    selectedProvince,
    selectedCity,
    selectedDistrict,
    selectedVillage,
    selectedPrice,
  ]);

  // Fetch properties dari API dengan server-side filtering
  useEffect(() => {
    const fetchProperties = async () => {
      if (apiPage === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const params: Record<string, string | number> = {
          limit: 100,
          page: apiPage,
        };

        if (search) params.search = search;
        if (selectedType) params.type = selectedType;
        if (selectedPurpose) params.purpose = selectedPurpose;
        if (selectedProvince) params.province = selectedProvince;
        if (selectedCity) params.city = selectedCity;
        params.is_sold = "false";
        // is_sold is stored as integer 0/1 in SQLite, not string "false"

        const result = await propertiesApi.getAll(params as any);
        if (result.success && result.data) {
          const mapped = result.data.map(apiToCardProperty);
          setProperties((prev) =>
            apiPage === 1 ? mapped : [...prev, ...mapped],
          );
          setApiTotal(result.pagination?.total || mapped.length);
          setApiTotalPages(result.pagination?.total_pages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        if (apiPage === 1) setProperties([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    const timer = setTimeout(fetchProperties, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [
    search,
    selectedType,
    selectedPurpose,
    selectedProvince,
    selectedCity,
    apiPage,
  ]);

  // Client-side filter HANYA untuk field yang belum support di API (district, village, price)
  const filtered = properties.filter((p) => {
    const matchDistrict =
      !selectedDistrict ||
      (p.district &&
        p.district.toLowerCase().includes(selectedDistrict.toLowerCase()));

    const matchVillage =
      !selectedVillage ||
      (p.village &&
        p.village.toLowerCase().includes(selectedVillage.toLowerCase()));

    let matchPrice = true;
    if (selectedPrice) {
      const [minPriceStr, maxPriceStr] = selectedPrice.split("-");
      const minPrice = parseInt(minPriceStr) || 0;
      const maxPrice = parseInt(maxPriceStr) || Infinity;
      if (minPrice > 0 || maxPrice < Infinity) {
        matchPrice = (p.price || 0) >= minPrice && (p.price || 0) <= maxPrice;
      }
    }

    return matchDistrict && matchVillage && matchPrice;
  });

  const displayedProperties = filtered.slice(0, visibleCount);
  const hasMoreClient = visibleCount < filtered.length;
  const hasMoreApi = apiPage < apiTotalPages;

  const handleLoadMore = () => {
    if (hasMoreClient) {
      setVisibleCount((v) => v + 12);
    } else if (hasMoreApi) {
      setApiPage((p) => p + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Header */}
        <div className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">
              {selectedType
                ? `Properti ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`
                : "Semua Properti"}
            </h1>
            <p className="text-white/80">
              Temukan properti impian Anda di Salam Bumi Property
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Cari properti..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Purpose Filter */}
              <div className="relative">
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PURPOSE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Type Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive =
                  selectedType.toLowerCase() === type.value.toLowerCase();
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-500">
              Menampilkan {displayedProperties.length} dari {apiTotal} properti
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="ml-3 text-gray-500">Memuat properti...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tidak Ada Properti Ditemukan
              </h3>
              <p className="text-gray-500 mb-4">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setSelectedType("");
                  setSelectedPurpose("");
                }}
                variant="outline"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Load More Button */}
              {(hasMoreClient || hasMoreApi) && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="px-8"
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memuat...
                      </>
                    ) : (
                      `Muat Lebih Banyak (${apiTotal - displayedProperties.length} lagi)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; 2026 Salam Bumi Property. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
