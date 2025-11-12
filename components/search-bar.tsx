"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (type) params.set("type", type)
    if (status) params.set("status", status)
    if (province) params.set("province", province)
    if (city) params.set("city", city)

    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl shadow-xl p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">Cari Properti Impian Anda</h2>
        <p className="text-muted-foreground">Temukan properti terbaik dengan mudah dan cepat</p>
      </div>

      {/* Search Form */}
      <div className="space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Cari lokasi, nama properti..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-12 text-base border-2 border-primary/20 focus:border-primary"
            />
          </div>

          {/* Search Button */}
          <Button onClick={handleSearch} size="lg" className="h-12 px-8 whitespace-nowrap">
            <Search className="h-5 w-5 mr-2" />
            Cari Properti
          </Button>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Jenis Properti</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Semua Jenis" />
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
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Tujuan</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tujuan</SelectItem>
                <SelectItem value="sale">Dijual</SelectItem>
                <SelectItem value="rent">Disewa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Province */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Semua Provinsi" />
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
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Kota</label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Semua Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
                <SelectItem value="medan">Medan</SelectItem>
                <SelectItem value="others">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground opacity-0">Filter</label>
            <Button variant="outline" className="h-10 w-full border-dashed">
              Filter Lanjutan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
