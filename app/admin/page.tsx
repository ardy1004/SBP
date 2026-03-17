import { getProperties } from "@/lib/supabase/properties-server"
import { Home, Eye, TrendingUp, DollarSign } from "@/components/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const properties = await getProperties()

  // Calculate statistics
  const totalProperties = properties.length
  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0)
  const forSale = properties.filter((p) => p.status === "sale").length
  const forRent = properties.filter((p) => p.status === "rent").length
  const featured = properties.filter((p) => p.featured).length

  // Recent properties
  const recentProperties = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Top viewed properties
  const topViewed = [...properties].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Kelola properti dan pantau performa</p>
          </div>
          <Button asChild>
            <Link href="/admin/properties">Kelola Properti</Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properti</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProperties}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {forSale} dijual, {forRent} disewa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalProperties > 0 ? `Rata-rata ${Math.round(totalViews / totalProperties)} per properti` : "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properti Unggulan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featured}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalProperties > 0 ? `${Math.round((featured / totalProperties) * 100)}% dari total` : "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nilai Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {Math.round(properties.reduce((sum, p) => sum + p.price, 0) / 1000000000)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total nilai semua properti</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent & Top Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Properti Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProperties.length > 0 ? (
                  recentProperties.map((property) => (
                    <div key={property.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/properties/${property.id}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {property.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {[property.location.city, property.location.province].filter(Boolean).join(", ")} •{" "}
                          {new Date(property.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{property.views || 0}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Belum ada properti</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Viewed Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Paling Banyak Dilihat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topViewed.length > 0 ? (
                  topViewed.map((property, index) => (
                    <div key={property.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/properties/${property.id}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-1"
                        >
                          {property.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {[property.location.city, property.location.province].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <Eye className="h-4 w-4" />
                        <span>{property.views || 0}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Belum ada properti</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Type Distribution */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Distribusi Jenis Properti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {["apartment", "gudang", "villa", "homestay/guesthouse", "hotel", "kost", "rumah", "ruko", "tanah", "bangunan_komersial"].map((type) => {
                const count = properties.filter((p) => p.type === type).length
                const percentage = totalProperties > 0 ? Math.round((count / totalProperties) * 100) : 0
                const labels: Record<string, string> = {
                  apartment: "Apartment",
                  gudang: "Gudang",
                  villa: "Villa",
                  "homestay/guesthouse": "Homestay/Guesthouse",
                  hotel: "Hotel",
                  kost: "Kost",
                  rumah: "Rumah",
                  ruko: "Ruko",
                  tanah: "Tanah",
                  bangunan_komersial: "Bangunan Komersial",
                }

                return (
                  <div key={type} className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold mb-1">{count}</div>
                    <div className="text-sm text-muted-foreground mb-2">{labels[type]}</div>
                    <div className="text-xs font-medium text-primary">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
