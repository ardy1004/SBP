// client/src/components/HeroSection.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PROPERTY_TYPES } from "@shared/types";

interface HeroSectionProps {
  // optional callback if parent wants to receive search params
  onSearch?: (params: Record<string, string | number | undefined>) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [, setLocation] = useLocation();

  const [transaction, setTransaction] = useState<"sell" | "rent">("sell");
  const [type, setType] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Example advanced filters (extend as needed)
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minArea, setMinArea] = useState<number | "">("");
  const [bedrooms, setBedrooms] = useState<number | "">("");

  // --- Start of Animated Placeholder Logic ---
  const keywords = [
    "Kost Dekat UGM",
    "Rumah Dekat UGM",
    "Rumah Kolam Renang",
    "Hotel Dekat Malioboro",
    "Tanah Dekat UGM",
    "Tanah Pogung",
    "Tanah Seturan Dekat UPN",
    "Rumah Condongcatur",
    "Tanah Condongcatur",
    "Kost Dekat Pakuwon Mall",
    "Rumah Jl Kaliurang",
    "Rumah Dekat UII",
    "Hotel Dijual Jogja",
    "Homestay Dijual Jogja",
    "SPBU Dijual Jogja",
    "Villa Dijual Jogja",
    "Rumah Villa Jogja",
    "Tanah Jl Kaliurang"
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    // Stop animation if user is typing
    if (keyword !== "") {
      return;
    }

    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => {
        let nextIndex;
        // Ensure the next keyword is different from the current one
        do {
          nextIndex = Math.floor(Math.random() * keywords.length);
        } while (keywords.length > 1 && nextIndex === prevIndex);
        return nextIndex;
      });
    }, 2500); // Change keyword every 2.5 seconds

    return () => clearInterval(interval);
  }, [keyword, keywords.length]);
  // --- End of Animated Placeholder Logic ---

  function buildQueryParams() {
    const params: Record<string, string> = {};
    // Map transaction to status for database query
    params["status"] = transaction === "sell" ? "dijual" : "disewakan";
    if (type && type !== "all") params["type"] = type;
    if (keyword.trim()) params["q"] = keyword.trim();
    if (minPrice !== "") params["minPrice"] = String(minPrice);
    if (maxPrice !== "") params["maxPrice"] = String(maxPrice);
    if (minArea !== "") params["minArea"] = String(minArea);
    if (bedrooms !== "") params["bedrooms"] = String(bedrooms);
    return new URLSearchParams(params).toString();
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const qs = buildQueryParams();
    const path = `/search?${qs}`;

    // Log for debugging
    console.log('HeroSection: Search submitted with params:', Object.fromEntries(new URLSearchParams(qs)));

    if (onSearch) {
      // optional callback for parent
      onSearch(Object.fromEntries(new URLSearchParams(qs)));
    }
    // Don't navigate to /search, stay on homepage and apply filters
    // setLocation(path);
    console.log('HeroSection: Applying filters to current page instead of navigating');
  }

  return (
    <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.salambumi.xyz/kost%20dijual%20jogja.webp')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-white text-center">Salam Bumi Property</h1>
        <p className="mt-2 text-center text-white/90">Finding the Best Properties Will Be Easier and More Precise</p>

        {/* MODERN MARKETPLACE SEARCH BAR - EXTRA WIDE LAYOUT */}
        <div className="mt-8 w-[98%] max-w-[1800px] mx-auto">
          {/* Transaction Toggle - TOP LEFT POSITION */}
          <div className="mb-3">
            <div className="inline-flex rounded-lg bg-white border-2 border-gray-200 p-1 shadow-sm">
              <button
                type="button"
                aria-pressed={transaction === "sell"}
                onClick={() => setTransaction("sell")}
                className={`px-6 py-2 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${
                  transaction === "sell"
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Dijual
              </button>
              <button
                type="button"
                aria-pressed={transaction === "rent"}
                onClick={() => setTransaction("rent")}
                className={`px-6 py-2 text-sm font-medium rounded-md focus:outline-none transition-all duration-200 ${
                  transaction === "rent"
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Disewa
              </button>
            </div>
          </div>

          {/* Main Search Bar - EXTRA WIDE (Desktop) / VERTICAL (Mobile) */}
          <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-500 rounded-lg shadow-xl p-2">
            {/* MOBILE LAYOUT - VERTICAL STACK */}
            <div className="md:hidden space-y-3">
              {/* Property Type Dropdown - FULL WIDTH */}
              <div className="w-full">
                <Select onValueChange={(v) => setType(v)} defaultValue="all">
                  <SelectTrigger className="h-14 border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base px-4">
                    <SelectValue placeholder="Jenis Properti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input - SUPER WIDE (100% width) */}
              <div className="w-full relative h-14">
                <label htmlFor="hero-keyword-mobile" className="sr-only">Cari properti</label>
                
                {/* Placeholder Wrapper with overflow:hidden */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  <AnimatePresence>
                    {keyword === "" && (
                      <motion.div
                        key={placeholderIndex}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute w-full h-full"
                      >
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 px-4 w-full">
                           <span className="text-gray-500 text-base whitespace-nowrap text-ellipsis overflow-hidden block">
                              {keywords[placeholderIndex]}
                           </span>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Input
                  id="hero-keyword-mobile"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={keyword === "" ? "" : "Cari lokasi, nama, atau kode listing..."}
                  className="h-14 w-full border border-gray-300 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base placeholder:text-gray-500 px-4 pr-14 transition-all duration-300 relative z-10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-20">
                  <Search size={24} />
                </div>
              </div>

              {/* Search Button - FULL WIDTH */}
              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-lg"
              >
                <Search size={20} className="mr-2" />
                Cari Properti
              </Button>

              {/* Advanced Filters - Small link */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                aria-label="Filter lanjutan"
              >
                <Sliders size={16} className="inline-block mr-1" />
                Filter Lanjutan
              </button>
            </div>

            {/* DESKTOP LAYOUT - HORIZONTAL */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {/* Property Type Dropdown - COMPACT (10-12% width) */}
              <div className="w-[120px] shrink-0">
                <Select onValueChange={(v) => setType(v)} defaultValue="all">
                  <SelectTrigger className="h-12 border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs px-3">
                    <SelectValue placeholder="Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input - SUPER DOMINANT WIDTH (75-80%) */}
              <div className="flex-[9] min-w-0 relative h-12">
                <label htmlFor="hero-keyword-desktop" className="sr-only">Cari properti</label>
                
                {/* Placeholder Wrapper with overflow:hidden */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                  <AnimatePresence>
                    {keyword === "" && (
                       <motion.div
                         key={placeholderIndex}
                         initial={{ y: "100%" }}
                         animate={{ y: "0%" }}
                         exit={{ y: "-100%" }}
                         transition={{ duration: 0.7, ease: "easeInOut" }}
                         className="absolute w-full h-full"
                       >
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 px-4 w-full">
                           <span className="text-gray-500 text-base whitespace-nowrap text-ellipsis overflow-hidden block">
                             {keywords[placeholderIndex]}
                           </span>
                         </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <Input
                  id="hero-keyword-desktop"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={keyword === "" ? "" : "Cari lokasi, nama kompleks, atau kode listing..."}
                  className="h-12 w-full border border-gray-300 bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base placeholder:text-gray-500 px-4 pr-12 transition-all duration-300 relative z-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-20">
                  <Search size={20} />
                </div>
              </div>

              {/* Advanced Filters Icon - COMPACT */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="w-10 h-10 border border-gray-300 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors shrink-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-center"
                aria-label="Filter lanjutan"
                title="Filter lanjutan"
              >
                <Sliders size={16} />
              </button>

              {/* Search Button - FIXED WIDTH */}
              <Button
                type="submit"
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shrink-0"
              >
                <Search size={18} className="mr-2" />
                Cari
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* SIMPLE MODAL / DRAWER FOR ADVANCED FILTERS */}
      {showFilters && (
        <div
          id="advanced-filters"
          role="dialog"
          aria-modal="true"
          aria-labelledby="advancedFiltersTitle"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="relative w-full md:w-3/4 lg:w-1/2 bg-white rounded-t-lg md:rounded-lg shadow-lg p-6 z-60">
            <div className="flex items-center justify-between mb-4">
              <h3 id="advancedFiltersTitle" className="text-lg font-semibold">Filter Lanjutan</h3>
              <button onClick={() => setShowFilters(false)} aria-label="Tutup">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Harga Min</label>
                <Input value={minPrice} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm mb-1">Harga Max</label>
                <Input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" />
              </div>

              <div>
                <label className="block text-sm mb-1">Luas Min (m²)</label>
                <Input value={minArea} onChange={(e) => setMinArea(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" />
              </div>

              <div>
                <label className="block text-sm mb-1">Kamar Tidur</label>
                <Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => {
                setMinPrice(""); setMaxPrice(""); setMinArea(""); setBedrooms(""); 
              }}>Reset</Button>
              <Button onClick={() => { setShowFilters(false); handleSubmit(); }}>Terapkan & Cari</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
