"use client"

import { useState, useEffect } from "react"
import { getPropertiesClient } from "@/lib/supabase/properties"
import { formatPrice, getPropertyTypeLabel, getPropertyStatusLabel } from "@/lib/data"
import type { Property } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Search, Star } from "@/components/icons"
import Link from "next/link"

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true)
      const data = await getPropertiesClient()
      setProperties(data)
      setLoading(false)
    }
    fetchProperties()
  }, [])

  // Filter properties
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    const matchesType = typeFilter === "all" || property.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Kelola Properti</h1>
            <p className="text-muted-foreground">Tambah, edit, atau hapus properti</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Properti
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari properti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="sale">Dijual</SelectItem>
                <SelectItem value="rent">Disewa</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Jenis Properti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis Properti</SelectItem>
                <SelectItem value="house">Rumah</SelectItem>
                <SelectItem value="apartment">Apartemen</SelectItem>
                <SelectItem value="land">Tanah</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="commercial">Komersial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredProperties.length} dari {properties.length} properti
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Memuat data properti...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Kode Listing</TableHead>
                    <TableHead>Properti</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>LT/LB</TableHead>
                    <TableHead>KT/KM</TableHead>
                    <TableHead>Jenis Properti</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          {property.images[0] ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[100px]">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              {property.kodeListing || "-"}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[200px]">
                            {property.featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                            <Link
                              href={`/properties/${property.id}`}
                              className="font-medium hover:text-primary transition-colors line-clamp-2"
                            >
                              {property.title}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[120px]">
                            {property.location.province && property.location.city
                              ? `${property.location.city}, ${property.location.province}`
                              : property.location.city || property.location.province || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[80px]">
                            {property.specifications.landArea || 0} / {property.specifications.buildingArea || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[60px]">
                            {property.specifications.bedrooms || 0} / {property.specifications.bathrooms || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getPropertyTypeLabel(property.type)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              property.status === "sale" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                            }
                          >
                            {getPropertyStatusLabel(property.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold min-w-[120px]">{formatPrice(property.price)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Link href={`/admin/properties/${property.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        Tidak ada properti yang sesuai dengan filter
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
