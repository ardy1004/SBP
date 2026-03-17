"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getPropertyByIdClient } from "@/lib/supabase/properties"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Property } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Upload, X } from "@/components/icons"
import Link from "next/link"
import { toast } from "sonner"

type FormData = {
  judul_properti: string;
  deskripsi: string;
  jenis_properti: string;
  status: string;
  harga_properti: number;
  price_old: number;
  provinsi: string;
  kabupaten: string;
  luas_tanah: number;
  luas_bangunan: number;
  kamar_tidur: number;
  kamar_mandi: number;
  legalitas: string;
  image_url: string;
  image_url1: string;
  image_url2: string;
  image_url3: string;
  image_url4: string;
  is_featured: boolean;
  is_premium: boolean;
  is_hot: boolean;
  is_sold: boolean;
  is_property_pilihan: boolean;
}

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    judul_properti: "",
    deskripsi: "",
    jenis_properti: "",
    status: "",
    harga_properti: 0,
    price_old: 0,
    provinsi: "",
    kabupaten: "",
    luas_tanah: 0,
    luas_bangunan: 0,
    kamar_tidur: 0,
    kamar_mandi: 0,
    legalitas: "",
    image_url: "",
    image_url1: "",
    image_url2: "",
    image_url3: "",
    image_url4: "",
    is_featured: false,
    is_premium: false,
    is_hot: false,
    is_sold: false,
    is_property_pilihan: false,
  })

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true)
      const data = await getPropertyByIdClient(propertyId)
      if (data) {
        setProperty(data)
        const priceOld = data.priceOld || 0
        setFormData({
          judul_properti: data.title,
          deskripsi: data.description,
          jenis_properti: data.type,
          status: data.status === "sale" ? "dijual" : "disewakan",
          harga_properti: data.price,
          price_old: priceOld,
          provinsi: data.location.province,
          kabupaten: data.location.city,
          luas_tanah: data.specifications.landArea,
          luas_bangunan: data.specifications.buildingArea,
          kamar_tidur: data.specifications.bedrooms,
          kamar_mandi: data.specifications.bathrooms,
          legalitas: data.specifications.certificate,
          image_url: "",
          image_url1: "",
          image_url2: "",
          image_url3: "",
          image_url4: "",
          is_featured: data.featured,
          is_premium: data.isPremium,
          is_hot: data.isHot || priceOld > 0, // Auto-activate if price_old exists
          is_sold: data.isSold,
          is_property_pilihan: data.isPropertyPilihan,
        })
        setImages(data.images)
      } else {
        toast.error("Properti tidak ditemukan")
        router.push("/admin/properties")
      }
      setLoading(false)
    }
    fetchProperty()
  }, [propertyId, router])

  // Auto-activate "Properti Hot" when price_old is filled
  useEffect(() => {
    if (formData.price_old > 0) {
      setFormData(prev => ({ ...prev, is_hot: true }))
    }
  }, [formData.price_old])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // Update formData with images
      const updatedFormData = {
        ...formData,
        image_url: images[0] || "",
        image_url1: images[1] || "",
        image_url2: images[2] || "",
        image_url3: images[3] || "",
        image_url4: images[4] || "",
      }

      const updateData = {
        judul_properti: updatedFormData.judul_properti,
        deskripsi: updatedFormData.deskripsi,
        jenis_properti: updatedFormData.jenis_properti,
        status: updatedFormData.status,
        harga_properti: Number(updatedFormData.harga_properti),
        price_old: updatedFormData.price_old ? Number(updatedFormData.price_old) : null,
        provinsi: updatedFormData.provinsi,
        kabupaten: updatedFormData.kabupaten,
        luas_tanah: Number(updatedFormData.luas_tanah),
        luas_bangunan: Number(updatedFormData.luas_bangunan),
        kamar_tidur: Number(updatedFormData.kamar_tidur),
        kamar_mandi: Number(updatedFormData.kamar_mandi),
        legalitas: updatedFormData.legalitas,
        image_url: updatedFormData.image_url,
        image_url1: updatedFormData.image_url1,
        image_url2: updatedFormData.image_url2,
        image_url3: updatedFormData.image_url3,
        image_url4: updatedFormData.image_url4,
        is_featured: updatedFormData.is_featured,
        is_premium: updatedFormData.is_premium,
        is_hot: updatedFormData.is_hot,
        is_sold: updatedFormData.is_sold,
        is_property_pilihan: updatedFormData.is_property_pilihan,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Property ID:", propertyId)
      console.log("[v0] Update Data to send:", updateData)
      console.log("[v0] Harga value:", formData.harga_properti, "Type:", typeof formData.harga_properti)

      const { error } = await supabase.from("properties").update(updateData).eq("id", propertyId)

      console.log("[v0] Update Response Error:", error)

      if (error) {
        console.error("[v0] Error details:", error)
        throw error
      }

      console.log("[v0] Property updated successfully")

      toast.success("Properti berhasil diperbarui")
      window.location.href = "/admin/properties"
    } catch (error) {
      console.error("[v0] Error updating property:", error)
      toast.error("Gagal memperbarui properti. Silakan coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  const uploadFile = async (file: File) => {
    console.log('Uploading file:', file.name, 'to Worker...')
    const formDataUpload = new FormData()
    formDataUpload.append('image', file)
    formDataUpload.append('propertyId', propertyId)

    const response = await fetch('https://sbp-upload-worker.salambumiproperty-f1b.workers.dev', {
      method: 'POST',
      body: formDataUpload,
    })
    console.log('Worker response status:', response.status)
    const result = await response.json() as { url?: string; error?: string }
    console.log('Worker result:', result)
    if (result.error) throw new Error(result.error)
    return result.url!
  }

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      // Create local preview URLs
      const localUrls = Array.from(files).map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...localUrls])

      // Upload files
      const remoteUrls = await Promise.all(Array.from(files).map(uploadFile))

      // Replace local URLs with remote URLs
      setImages(prev => {
        const newImages = [...prev]
        for (let i = 0; i < remoteUrls.length; i++) {
          newImages[prev.length - remoteUrls.length + i] = remoteUrls[i]
        }
        return newImages
      })

      toast.success(`${files.length} gambar berhasil diupload`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Gagal upload gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOverItem = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropItem = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex !== dropIndex) {
      setImages(prev => {
        const newImages = [...prev]
        const [dragged] = newImages.splice(dragIndex, 1)
        newImages.splice(dropIndex, 0, dragged)
        return newImages
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!property) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/properties">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Edit Properti</h1>
            <p className="text-muted-foreground mt-1">Perbarui informasi properti</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judul_properti">Judul Properti</Label>
                <Input
                  id="judul_properti"
                  value={formData.judul_properti}
                  onChange={(e) => setFormData({ ...formData, judul_properti: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jenis_properti">Jenis Properti</Label>
                  <Select
                    value={formData.jenis_properti}
                    onValueChange={(value) => setFormData({ ...formData, jenis_properti: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dijual">Dijual</SelectItem>
                      <SelectItem value="disewakan">Disewakan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harga_properti">Harga (Rp)</Label>
                  <Input
                    id="harga_properti"
                    type="number"
                    value={formData.harga_properti}
                    onChange={(e) => setFormData({ ...formData, harga_properti: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_old">Harga Lama (Opsional)</Label>
                <Input
                  id="price_old"
                  type="number"
                  value={formData.price_old}
                  onChange={(e) => setFormData({ ...formData, price_old: Number(e.target.value) })}
                  placeholder="Untuk menampilkan harga coret"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Gambar Properti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drop gambar di sini atau klik untuk upload</p>
                <p className="text-sm text-muted-foreground mb-4">PNG, JPG, WebP (max 10MB)</p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild disabled={uploading}>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Mengupload...
                      </>
                    ) : (
                      "Pilih File"
                    )}
                  </label>
                </Button>
              </div>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOverItem}
                      onDrop={(e) => handleDropItem(e, index)}
                    >
                      <img
                        src={url}
                        alt={`Gambar ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-1 right-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Belum ada gambar</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lokasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provinsi">Provinsi</Label>
                  <Input
                    id="provinsi"
                    value={formData.provinsi}
                    onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                    placeholder="Contoh: jawa-barat"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Format: huruf kecil dengan tanda hubung</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kabupaten">Kabupaten/Kota</Label>
                  <Input
                    id="kabupaten"
                    value={formData.kabupaten}
                    onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                    placeholder="Contoh: bandung"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Format: huruf kecil dengan tanda hubung</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spesifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="luas_tanah">Luas Tanah (m²)</Label>
                  <Input
                    id="luas_tanah"
                    type="number"
                    value={formData.luas_tanah}
                    onChange={(e) => setFormData({ ...formData, luas_tanah: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="luas_bangunan">Luas Bangunan (m²)</Label>
                  <Input
                    id="luas_bangunan"
                    type="number"
                    value={formData.luas_bangunan}
                    onChange={(e) => setFormData({ ...formData, luas_bangunan: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kamar_tidur">Kamar Tidur</Label>
                  <Input
                    id="kamar_tidur"
                    type="number"
                    value={formData.kamar_tidur}
                    onChange={(e) => setFormData({ ...formData, kamar_tidur: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kamar_mandi">Kamar Mandi</Label>
                  <Input
                    id="kamar_mandi"
                    type="number"
                    value={formData.kamar_mandi}
                    onChange={(e) => setFormData({ ...formData, kamar_mandi: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalitas">Legalitas/Sertifikat</Label>
                <Input
                  id="legalitas"
                  value={formData.legalitas}
                  onChange={(e) => setFormData({ ...formData, legalitas: e.target.value })}
                  placeholder="Contoh: SHM, HGB, SHGB"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Label Properti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    Properti Unggulan
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_premium" className="cursor-pointer">
                    Properti Premium
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_hot"
                    checked={formData.is_hot}
                    onChange={(e) => setFormData({ ...formData, is_hot: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_hot" className="cursor-pointer">
                    Properti Hot
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_sold"
                    checked={formData.is_sold}
                    onChange={(e) => setFormData({ ...formData, is_sold: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_sold" className="cursor-pointer">
                    Properti Terjual
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_property_pilihan"
                    checked={formData.is_property_pilihan}
                    onChange={(e) => setFormData({ ...formData, is_property_pilihan: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_property_pilihan" className="cursor-pointer">
                    Properti Pilihan
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/properties">Batal</Link>
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
