// client/src/components/HeroSection.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sliders } from "lucide-react";

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
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<"sell" | "rent">("sell");
  const [type, setType] = useState<string>("all");
  const [keyword, setKeyword] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Example advanced filters (extend as needed)
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minArea, setMinArea] = useState<number | "">("");
  const [bedrooms, setBedrooms] = useState<number | "">("");

  function buildQueryParams() {
    const params: Record<string, string> = {};
    params["transaction"] = transaction;
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
    if (onSearch) {
      // optional callback for parent
      onSearch(Object.fromEntries(new URLSearchParams(qs)));
    }
    navigate(path);
  }

  return (
    <section className="relative w-full">
      {/* Hero background handled by page; this is overlay container */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-white text-center">Salam Bumi Property</h1>
        <p className="mt-2 text-center text-white/90">Finding the Best Properties Will Be Easier and More Precise</p>

        {/* FILTER CARD: three stacked rows */}
        <form onSubmit={handleSubmit} className="mt-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-3xl mx-auto">
          {/* ROW 1: Transaction toggle */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-md bg-gray-100 p-1">
              <button
                type="button"
                aria-pressed={transaction === "sell"}
                onClick={() => setTransaction("sell")}
                className={`px-4 py-2 rounded-md focus:outline-none ${transaction === "sell" ? "bg-blue-600 text-white" : "bg-transparent text-gray-700"}`}
              >
                Jual
              </button>
              <button
                type="button"
                aria-pressed={transaction === "rent"}
                onClick={() => setTransaction("rent")}
                className={`px-4 py-2 rounded-md focus:outline-none ${transaction === "rent" ? "bg-blue-600 text-white" : "bg-transparent text-gray-700"}`}
              >
                Sewa
              </button>
            </div>
          </div>

          {/* ROW 2: Type dropdown + Keyword search */}
          <div className="flex gap-3 items-center justify-center mb-3 flex-wrap">
            {/* Type dropdown */}
            <div className="w-48">
              <Select onValueChange={(v) => setType(v)} defaultValue="all">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Jenis Properti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {PROPERTY_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Keyword input */}
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="hero-keyword" className="sr-only">Cari keyword</label>
              <div className="relative">
                <Input
                  id="hero-keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Cari: lokasi, nama kompleks, kode listing..."
                  className="pr-12"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Search size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Filter Lanjutan + Submit */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                aria-expanded={showFilters}
                aria-controls="advanced-filters"
              >
                <Sliders size={16} />
                Filter Lanjutan
              </button>
            </div>

            <div className="ml-auto">
              <Button type="submit" className="px-6">
                Cari Properti
              </Button>
            </div>
          </div>
        </form>
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
