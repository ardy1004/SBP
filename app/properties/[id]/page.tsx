import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Zap,
  Droplet,
  FileText,
  Home,
  Calendar,
  Eye,
  ArrowLeft,
} from "@/components/icons"
import { getPropertyById, getProperties } from "@/lib/supabase/properties-server"
import { formatPriceDetailed, getPropertyTypeLabel, getPropertyStatusLabel } from "@/lib/data"
import { ImageGallery } from "@/components/image-gallery"
import { ContactAgentCard } from "@/components/contact-agent-card"
import { PropertyCard } from "@/components/property-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params

  const property = await getPropertyById(id)

  if (!property) {
    notFound()
  }

  const allProperties = await getProperties()
  const relatedProperties = allProperties
    .filter((p) => p.id !== property.id && (p.type === property.type || p.location.city === property.location.city))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Properti
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery images={property.images} title={property.title} />

            {/* Property Info */}
            <div className="bg-card rounded-xl p-6 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {getPropertyStatusLabel(property.status)}
                  </Badge>
                  <Badge variant="secondary">{getPropertyTypeLabel(property.type)}</Badge>
                  {property.featured && <Badge variant="outline">Unggulan</Badge>}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-balance">{property.title}</h1>

                {property.kodeListing && (
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-3 py-1 rounded-md text-sm font-mono text-muted-foreground">
                      Kode: {property.kodeListing}
                    </code>
                  </div>
                )}

                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">
                    {[property.location.city, property.location.province].filter(Boolean).join(", ")}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{property.views} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(property.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                <div className="text-4xl font-bold text-primary">{formatPriceDetailed(property.price)}</div>
              </div>

              <Separator />

              {/* Specifications */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Spesifikasi</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.specifications.landArea > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Maximize className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Luas Tanah</p>
                        <p className="font-semibold">{property.specifications.landArea} m²</p>
                      </div>
                    </div>
                  )}
                  {property.specifications.buildingArea > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Home className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Luas Bangunan</p>
                        <p className="font-semibold">{property.specifications.buildingArea} m²</p>
                      </div>
                    </div>
                  )}
                  {property.specifications.bedrooms > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Bed className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Kamar Tidur</p>
                        <p className="font-semibold">{property.specifications.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.specifications.bathrooms > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Bath className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Kamar Mandi</p>
                        <p className="font-semibold">{property.specifications.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.specifications.carports > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Car className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Carport</p>
                        <p className="font-semibold">{property.specifications.carports}</p>
                      </div>
                    </div>
                  )}
                  {property.specifications.floors > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Home className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Lantai</p>
                        <p className="font-semibold">{property.specifications.floors}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Listrik</p>
                      <p className="font-semibold">{property.specifications.electricity} W</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Droplet className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Air</p>
                      <p className="font-semibold">{property.specifications.waterSource}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sertifikat</p>
                      <p className="font-semibold">{property.specifications.certificate}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Kondisi</p>
                    <p className="font-semibold capitalize">{property.specifications.condition}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Furnishing</p>
                    <p className="font-semibold capitalize">{property.specifications.furnishing.replace("-", " ")}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Deskripsi</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              <Separator />

              {/* Facilities */}
              {property.facilities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Fasilitas</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1.5">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ContactAgentCard agent={property.agent} propertyTitle={property.title} />
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Properti Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProperties.map((relatedProperty) => (
                <PropertyCard key={relatedProperty.id} property={relatedProperty} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
