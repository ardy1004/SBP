"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { SearchFilters } from "@/lib/types"

interface PropertyFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  cities: string[]
}

export function PropertyFilters({ onFiltersChange, cities }: PropertyFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>({})
  const [isOpen, setIsOpen] = useState(false)

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    const resetFilters: SearchFilters = {}
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const handleQuickFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value === "all" ? undefined : value }
    setLocalFilters(newFilters)
  }

  const activeFiltersCount = Object.values(localFilters).filter((v) => v !== undefined && v !== "").length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari properti berdasarkan lokasi, nama..."
            value={localFilters.query || ""}
            onChange={(e) => setLocalFilters({ ...localFilters, query: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleApplyFilters}>Cari</Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={localFilters.type || "all"} onValueChange={(value) => handleQuickFilterChange("type", value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Jenis Properti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis Properti</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="gudang">Gudang</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="homestay/guesthouse">Homestay/Guesthouse</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="kost">Kost</SelectItem>
            <SelectItem value="rumah">Rumah</SelectItem>
            <SelectItem value="ruko">Ruko</SelectItem>
            <SelectItem value="tanah">Tanah</SelectItem>
            <SelectItem value="bangunan_komersial">Bangunan Komersial</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={localFilters.status || "all"}
          onValueChange={(value) => handleQuickFilterChange("status", value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tujuan</SelectItem>
            <SelectItem value="sale">Dijual</SelectItem>
            <SelectItem value="rent">Disewa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={localFilters.province || "all"} onValueChange={(value) => handleQuickFilterChange("province", value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Provinsi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Provinsi</SelectItem>
            <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
            <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
            <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
            <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
            <SelectItem value="Banten">Banten</SelectItem>
            <SelectItem value="DI Yogyakarta">DI Yogyakarta</SelectItem>
          </SelectContent>
        </Select>

        <Select value={localFilters.city || "all"} onValueChange={(value) => handleQuickFilterChange("city", value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kota</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Apply Quick Filters Button */}
        <Button onClick={handleApplyFilters} variant="secondary" size="sm">
          Terapkan
        </Button>

        {/* Advanced Filters Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <SlidersHorizontal className="h-4 w-4" />
              Filter Lanjutan
              {activeFiltersCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Lanjutan</SheetTitle>
              <SheetDescription>Sesuaikan pencarian Anda dengan filter detail</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label>Rentang Harga</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder="Harga Min"
                      value={localFilters.minPrice || ""}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          minPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Harga Max"
                      value={localFilters.maxPrice || ""}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3">
                <Label>Kamar Tidur (Min)</Label>
                <Select
                  value={localFilters.minBedrooms?.toString() || "none"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      minBedrooms: value !== "none" ? Number(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jumlah kamar tidur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada minimal</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-3">
                <Label>Kamar Mandi (Min)</Label>
                <Select
                  value={localFilters.minBathrooms?.toString() || "none"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      minBathrooms: value !== "none" ? Number(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jumlah kamar mandi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada minimal</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Land Area */}
              <div className="space-y-3">
                <Label>Luas Tanah (Min m²)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 100"
                  value={localFilters.minLandArea || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minLandArea: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              {/* Building Area */}
              <div className="space-y-3">
                <Label>Luas Bangunan (Min m²)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 80"
                  value={localFilters.minBuildingArea || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minBuildingArea: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleResetFilters} variant="outline" className="flex-1 bg-transparent">
                  Reset
                </Button>
                <Button onClick={handleApplyFilters} className="flex-1">
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="gap-2">
            <X className="h-4 w-4" />
            Hapus Filter
          </Button>
        )}
      </div>
    </div>
  )
}
