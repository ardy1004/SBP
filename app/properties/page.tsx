"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { getPropertiesClientPaginated } from "@/lib/supabase/properties"
import { filterProperties, getCities } from "@/lib/utils/property-filters"
import type { SearchFilters, Property } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, LayoutList } from "@/components/icons"
import { Button } from "@/components/ui/button"

function PropertiesContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sortBy, setSortBy] = useState("latest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await getPropertiesClientPaginated(20, 0)
        setProperties(data)
        setHasMore(data.length === 20)
        setOffset(20)
      } catch (error) {
        console.error("[v0] Error fetching properties:", error)
        setProperties([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const data = await getPropertiesClientPaginated(20, offset)
      if (data.length > 0) {
        setProperties(prev => [...prev, ...data])
        setOffset(prev => prev + 20)
        setHasMore(data.length === 20)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("[v0] Error loading more properties:", error)
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const initialFilters: SearchFilters = {}

    const query = searchParams.get("query")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const city = searchParams.get("city")

    if (query) initialFilters.query = query
    if (type && type !== "all") initialFilters.type = type as any
    if (status && status !== "all") initialFilters.status = status as any
    if (city) initialFilters.city = city

    setFilters(initialFilters)
  }, [searchParams])

  const filteredProperties = filterProperties(properties, filters)

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "popular":
        return b.views - a.views
      case "latest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const cities = getCities(properties)

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 animate-pulse">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Memuat properti...</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Cari Properti</h1>
          <p className="text-muted-foreground">
            Temukan properti impian Anda dari {properties.length} listing yang tersedia
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <PropertyFilters onFiltersChange={setFilters} cities={cities} />
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="text-sm text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{sortedProperties.length}</span> properti
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Terbaru</SelectItem>
                <SelectItem value="price-asc">Harga Terendah</SelectItem>
                <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
                <SelectItem value="popular">Paling Populer</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Grid/List */}
        {sortedProperties.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
              }
            >
              {sortedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  size="lg"
                  className="px-8"
                >
                  {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tidak ada properti ditemukan</h3>
            <p className="text-muted-foreground mb-6">
              Coba sesuaikan filter pencarian Anda atau hapus beberapa filter
            </p>
            <Button onClick={() => setFilters({})}>Hapus Semua Filter</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <PropertiesContent />
    </Suspense>
  )
}
