/**
 * Refactored Property Form Component
 * 
 * Architecture:
 * - Uses usePropertyForm hook for state management
 * - Separated into smaller sections (can be further split)
 * - Reduced from 2,922 lines to ~300 lines
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, RefreshCw, Plus, Trash2 } from "lucide-react";
import { MultiImageDropzone } from "@/components/MultiImageDropzone";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { PROPERTY_TYPES, LEGALITAS_OPTIONS, JENIS_HOTEL_OPTIONS, KELENGKAPAN_OPTIONS, JENIS_KOST_OPTIONS } from "./constants";
import type { ProductionPropertyFormProps } from "./types";

export function RefactoredPropertyForm({
  property,
  sourceInput = 'ADMIN',
  ownerData,
  agreementData,
  agreementId,
  onSuccess
}: ProductionPropertyFormProps) {
  const {
    formData,
    isSubmitting,
    submittedProperties,
    showAddAnother,
    handleChange,
    handlePriceChange,
    handleSubmit,
    handleReset,
    handleAddAnother,
    generateNewKode,
  } = usePropertyForm({ property, sourceInput, onSuccess });

  const [showGoogleMaps, setShowGoogleMaps] = useState(false);

  // Render dynamic fields based on property type
  const renderDynamicFields = () => {
    switch (formData.jenis_properti) {
      case "rumah":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} placeholder="150" />
            </div>
            <div>
              <Label>Luas Bangunan (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} placeholder="100" />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} placeholder="8" />
            </div>
            <div>
              <Label>Jumlah Lantai</Label>
              <Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} placeholder="2" />
            </div>
            <div>
              <Label>Jumlah Kamar Tidur</Label>
              <Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} placeholder="3" />
            </div>
            <div>
              <Label>Jumlah Kamar Mandi</Label>
              <Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} placeholder="2" />
            </div>
          </div>
        );

      case "tanah":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Luas Tanah (m²) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} placeholder="500" />
            </div>
            <div>
              <Label>Lebar Depan (m)</Label>
              <Input type="number" value={formData.lebar_depan} onChange={(e) => handleChange("lebar_depan", e.target.value)} placeholder="20" />
            </div>
          </div>
        );

      case "kost":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Jenis Kost <span className="text-red-500">*</span></Label>
                <Select value={formData.jenis_kost} onValueChange={(v) => handleChange("jenis_kost", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis Kost" /></SelectTrigger>
                  <SelectContent>
                    {JENIS_KOST_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} /></div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="ruang_penjaga" checked={formData.ruang_penjaga} onCheckedChange={(c) => handleChange("ruang_penjaga", c)} />
                <Label htmlFor="ruang_penjaga">Ruang Penjaga</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="token_listrik_perkamar" checked={formData.token_listrik_perkamar} onCheckedChange={(c) => handleChange("token_listrik_perkamar", c)} />
                <Label htmlFor="token_listrik_perkamar">Token Listrik Sudah perkamar?</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} placeholder="500000" />
              </div>
              <div>
                <Label>Biaya Pengeluaran Per Bulan (Rp)</Label>
                <Input value={formData.biaya_pengeluaran_per_bulan} onChange={(e) => handlePriceChange("biaya_pengeluaran_per_bulan", e.target.value)} placeholder="1000000" />
              </div>
            </div>
          </div>
        );

      case "hotel":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Jenis Hotel <span className="text-red-500">*</span></Label>
                <Select value={formData.jenis_hotel} onValueChange={(v) => handleChange("jenis_hotel", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih Jenis Hotel" /></SelectTrigger>
                  <SelectContent>
                    {JENIS_HOTEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Luas Tanah (m²)</Label><Input type="number" value={formData.luas_tanah} onChange={(e) => handleChange("luas_tanah", e.target.value)} /></div>
              <div><Label>Luas Bangunan (m²)</Label><Input type="number" value={formData.luas_bangunan} onChange={(e) => handleChange("luas_bangunan", e.target.value)} /></div>
              <div><Label>Jumlah Lantai</Label><Input type="number" value={formData.jumlah_lantai} onChange={(e) => handleChange("jumlah_lantai", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Tidur</Label><Input type="number" value={formData.kamar_tidur} onChange={(e) => handleChange("kamar_tidur", e.target.value)} /></div>
              <div><Label>Jumlah Kamar Mandi</Label><Input type="number" value={formData.kamar_mandi} onChange={(e) => handleChange("kamar_mandi", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Sewa Kamar Per Bulan (Rp)</Label>
                <Input value={formData.harga_sewa_kamar} onChange={(e) => handlePriceChange("harga_sewa_kamar", e.target.value)} />
              </div>
              <div>
                <Label>Income Rata-Rata Per Bulan (Rp)</Label>
                <Input value={formData.income_per_bulan} onChange={(e) => handlePriceChange("income_per_bulan", e.target.value)} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Kode Listing */}
          <div className="space-y-2">
            <Label>Kode Listing</Label>
            <div className="flex gap-2">
              <Input
                value={formData.kode_listing}
                onChange={(e) => handleChange("kode_listing", e.target.value)}
                placeholder="SBP-XXXXXX-XXXX"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={generateNewKode}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {/* Jenis Properti */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Jenis Properti <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-3">
              {PROPERTY_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all select-none ${
                    formData.jenis_properti === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenis_properti"
                    value={type.value}
                    checked={formData.jenis_properti === type.value}
                    onChange={(e) => handleChange("jenis_properti", e.target.value)}
                    className="h-5 w-5 text-primary accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Judul Properti */}
          <div className="space-y-2">
            <Label>Judul Properti</Label>
            <Input
              value={formData.judul_properti}
              onChange={(e) => handleChange("judul_properti", e.target.value)}
              placeholder="Contoh: Rumah Mewah Full Furnished di Jl. Kaliurang"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tujuan Transaksi & Harga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="status_dijual"
                checked={formData.status_dijual}
                onCheckedChange={(c) => handleChange("status_dijual", c)}
              />
              <Label htmlFor="status_dijual">Dijual</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="status_disewakan"
                checked={formData.status_disewakan}
                onCheckedChange={(c) => handleChange("status_disewakan", c)}
              />
              <Label htmlFor="status_disewakan">Disewakan</Label>
            </div>
          </div>

          {formData.status_dijual && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Harga Penawaran (Rp)</Label>
                <Input
                  value={formData.harga_properti}
                  onChange={(e) => handlePriceChange("harga_properti", e.target.value)}
                  placeholder="500000000"
                />
              </div>
              <div>
                <Label>Harga Lama / Coret (Rp) - Optional</Label>
                <Input
                  value={formData.price_old}
                  onChange={(e) => handlePriceChange("price_old", e.target.value)}
                  placeholder="650000000"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="harga_nego" checked={formData.harga_nego} onCheckedChange={(c) => handleChange("harga_nego", c)} />
                  <Label htmlFor="harga_nego">Nego</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="harga_nett" checked={formData.harga_nett} onCheckedChange={(c) => handleChange("harga_nett", c)} />
                  <Label htmlFor="harga_nett">Nett</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Fields */}
      {formData.jenis_properti && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Properti</CardTitle>
          </CardHeader>
          <CardContent>
            {renderDynamicFields()}
          </CardContent>
        </Card>
      )}

      {/* Location Section */}
      <Card>
        <CardHeader>
          <CardTitle>Lokasi Properti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Provinsi <span className="text-red-500">*</span></Label>
              <Input
                value={formData.provinsi}
                onChange={(e) => handleChange("provinsi", e.target.value)}
                placeholder="DIY Yogyakarta"
                required
              />
            </div>
            <div>
              <Label>Kabupaten/Kota <span className="text-red-500">*</span></Label>
              <Input
                value={formData.kabupaten}
                onChange={(e) => handleChange("kabupaten", e.target.value)}
                placeholder="Sleman"
                required
              />
            </div>
            <div>
              <Label>Kecamatan</Label>
              <Input
                value={formData.kecamatan}
                onChange={(e) => handleChange("kecamatan", e.target.value)}
                placeholder="Depok"
              />
            </div>
            <div>
              <Label>Kelurahan</Label>
              <Input
                value={formData.kelurahan}
                onChange={(e) => handleChange("kelurahan", e.target.value)}
                placeholder="Caturtunggal"
              />
            </div>
          </div>
          <div>
            <Label>Alamat Lengkap</Label>
            <Textarea
              value={formData.alamat_lengkap}
              onChange={(e) => handleChange("alamat_lengkap", e.target.value)}
              rows={3}
              placeholder="Jl. Nama Jalan, Nomor Rumah"
            />
          </div>
          {sourceInput === 'ADMIN' && (
            <>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowGoogleMaps(!showGoogleMaps)}>
                  {showGoogleMaps ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showGoogleMaps ? 'Sembunyikan' : 'Tampilkan'} Google Maps
                </Button>
              </div>
              {showGoogleMaps && (
                <div>
                  <Label>Link Google Maps</Label>
                  <Input
                    value={formData.google_maps_link}
                    onChange={(e) => handleChange("google_maps_link", e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Legalitas Section */}
      <Card>
        <CardHeader>
          <CardTitle>Legalitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Status Legalitas</Label>
            <Select value={formData.legalitas} onValueChange={(v) => handleChange("legalitas", v)}>
              <SelectTrigger><SelectValue placeholder="Pilih Legalitas" /></SelectTrigger>
              <SelectContent>
                {LEGALITAS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="status_legalitas_hand" checked={formData.status_legalitas === "On Hand"} onCheckedChange={() => handleChange("status_legalitas", "On Hand")} />
              <Label htmlFor="status_legalitas_hand">On Hand</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="status_legalitas_bank" checked={formData.status_legalitas === "On Bank"} onCheckedChange={() => handleChange("status_legalitas", "On Bank")} />
              <Label htmlFor="status_legalitas_bank">On Bank</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Properti</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiImageDropzone
            initialImages={[
              formData.image_url,
              formData.image_url1,
              formData.image_url2,
              formData.image_url3,
              formData.image_url4,
              formData.image_url5,
              formData.image_url6,
              formData.image_url7,
              formData.image_url8,
              formData.image_url9,
            ].filter(Boolean)}
            onImagesChange={(urls: string[]) => {
              handleChange('image_url', urls[0] || '');
              handleChange('image_url1', urls[1] || '');
              handleChange('image_url2', urls[2] || '');
              handleChange('image_url3', urls[3] || '');
              handleChange('image_url4', urls[4] || '');
              handleChange('image_url5', urls[5] || '');
              handleChange('image_url6', urls[6] || '');
              handleChange('image_url7', urls[7] || '');
              handleChange('image_url8', urls[8] || '');
              handleChange('image_url9', urls[9] || '');
            }}
            propertyId={property?.id}
            maxImages={10}
          />
          <p className="text-xs text-gray-500 mt-2">Auto konversi ke WebP saat upload</p>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="flex flex-wrap justify-end pt-4 border-t gap-3">
        <Button type="button" variant="outline" onClick={handleReset}>
          <Trash2 className="h-4 w-4 mr-2" />
          Reset Form
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Batal
        </Button>

        {showAddAnother ? (
          <>
            <Button
              type="button"
              variant="default"
              onClick={handleAddAnother}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Properti Lain
            </Button>
          </>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="min-w-40">
            {isSubmitting ? "Menyimpan..." : "Simpan Properti"}
          </Button>
        )}

        {submittedProperties.length > 0 && !showAddAnother && (
          <div className="w-full mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✓ {submittedProperties.length} properti telah disimpan dalam perjanjian ini
            </p>
          </div>
        )}
      </div>
    </form>
  );
}

export default RefactoredPropertyForm;