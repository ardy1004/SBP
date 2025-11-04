import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PROPERTY_TYPES, PROPERTY_STATUSES, LEGAL_STATUSES, type Property } from "@shared/schema";

interface PropertyFormProps {
  property: Property | null;
  onSuccess: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    kodeListing: "",
    jenisProperti: "",
    luasTanah: "",
    luasBangunan: "",
    kamarTidur: "",
    kamarMandi: "",
    legalitas: "",
    hargaProperti: "",
    provinsi: "",
    kabupaten: "",
    alamatLengkap: "",
    deskripsi: "",
    imageUrl: "",
    imageUrl1: "",
    imageUrl2: "",
    imageUrl3: "",
    imageUrl4: "",
    status: "dijual",
    ownerContact: "",
    isPremium: false,
    isFeatured: false,
    isHot: false,
    isSold: false,
    priceOld: "",
    isPropertyPilihan: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (property) {
      setFormData({
        kodeListing: property.kodeListing,
        jenisProperti: property.jenisProperti,
        luasTanah: property.luasTanah || "",
        luasBangunan: property.luasBangunan || "",
        kamarTidur: property.kamarTidur?.toString() || "",
        kamarMandi: property.kamarMandi?.toString() || "",
        legalitas: property.legalitas || "",
        hargaProperti: property.hargaProperti,
        provinsi: property.provinsi,
        kabupaten: property.kabupaten,
        alamatLengkap: property.alamatLengkap || "",
        deskripsi: property.deskripsi || "",
        imageUrl: property.imageUrl,
        imageUrl1: property.imageUrl1 || "",
        imageUrl2: property.imageUrl2 || "",
        imageUrl3: property.imageUrl3 || "",
        imageUrl4: property.imageUrl4 || "",
        status: property.status,
        ownerContact: property.ownerContact || "",
        isPremium: property.isPremium,
        isFeatured: property.isFeatured,
        isHot: property.isHot,
        isSold: property.isSold,
        priceOld: property.priceOld || "",
        isPropertyPilihan: property.isPropertyPilihan,
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        luasTanah: formData.luasTanah || null,
        luasBangunan: formData.luasBangunan || null,
        kamarTidur: formData.kamarTidur ? parseInt(formData.kamarTidur) : null,
        kamarMandi: formData.kamarMandi ? parseInt(formData.kamarMandi) : null,
        priceOld: formData.priceOld || null,
      };

      if (property) {
        await apiRequest('PUT', `/api/admin/properties/${property.id}`, payload);
        toast({ title: "Properti berhasil diupdate" });
      } else {
        await apiRequest('POST', '/api/admin/properties', payload);
        toast({ title: "Properti berhasil ditambahkan" });
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan properti",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="kodeListing">Kode Listing *</Label>
          <Input
            id="kodeListing"
            value={formData.kodeListing}
            onChange={(e) => setFormData({ ...formData, kodeListing: e.target.value })}
            required
            data-testid="input-kode-listing"
          />
        </div>

        <div>
          <Label htmlFor="jenisProperti">Jenis Properti *</Label>
          <Select value={formData.jenisProperti} onValueChange={(value) => setFormData({ ...formData, jenisProperti: value })}>
            <SelectTrigger id="jenisProperti" data-testid="select-jenis-properti">
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger id="status" data-testid="select-status-property">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="hargaProperti">Harga Properti *</Label>
          <Input
            id="hargaProperti"
            type="number"
            value={formData.hargaProperti}
            onChange={(e) => setFormData({ ...formData, hargaProperti: e.target.value })}
            required
            data-testid="input-harga"
          />
        </div>

        <div>
          <Label htmlFor="luasTanah">Luas Tanah (m²)</Label>
          <Input
            id="luasTanah"
            type="number"
            value={formData.luasTanah}
            onChange={(e) => setFormData({ ...formData, luasTanah: e.target.value })}
            data-testid="input-luas-tanah"
          />
        </div>

        <div>
          <Label htmlFor="luasBangunan">Luas Bangunan (m²)</Label>
          <Input
            id="luasBangunan"
            type="number"
            value={formData.luasBangunan}
            onChange={(e) => setFormData({ ...formData, luasBangunan: e.target.value })}
            data-testid="input-luas-bangunan"
          />
        </div>

        <div>
          <Label htmlFor="kamarTidur">Kamar Tidur</Label>
          <Input
            id="kamarTidur"
            type="number"
            value={formData.kamarTidur}
            onChange={(e) => setFormData({ ...formData, kamarTidur: e.target.value })}
            data-testid="input-kamar-tidur"
          />
        </div>

        <div>
          <Label htmlFor="kamarMandi">Kamar Mandi</Label>
          <Input
            id="kamarMandi"
            type="number"
            value={formData.kamarMandi}
            onChange={(e) => setFormData({ ...formData, kamarMandi: e.target.value })}
            data-testid="input-kamar-mandi"
          />
        </div>

        <div>
          <Label htmlFor="legalitas">Status Legal</Label>
          <Select value={formData.legalitas} onValueChange={(value) => setFormData({ ...formData, legalitas: value })}>
            <SelectTrigger id="legalitas" data-testid="select-legalitas">
              <SelectValue placeholder="Pilih status legal" />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="provinsi">Provinsi *</Label>
          <Input
            id="provinsi"
            value={formData.provinsi}
            onChange={(e) => setFormData({ ...formData, provinsi: e.target.value.toLowerCase() })}
            required
            data-testid="input-provinsi"
          />
        </div>

        <div>
          <Label htmlFor="kabupaten">Kabupaten/Kota *</Label>
          <Input
            id="kabupaten"
            value={formData.kabupaten}
            onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value.toLowerCase() })}
            required
            data-testid="input-kabupaten"
          />
        </div>

        <div>
          <Label htmlFor="ownerContact">Kontak Pemilik</Label>
          <Input
            id="ownerContact"
            value={formData.ownerContact}
            onChange={(e) => setFormData({ ...formData, ownerContact: e.target.value })}
            data-testid="input-owner-contact"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="alamatLengkap">Alamat Lengkap</Label>
        <Textarea
          id="alamatLengkap"
          value={formData.alamatLengkap}
          onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })}
          data-testid="textarea-alamat"
        />
      </div>

      <div>
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
          data-testid="textarea-deskripsi"
        />
      </div>

      <div className="space-y-3">
        <Label>Gambar (URL)</Label>
        <Input
          placeholder="Image URL (Utama) *"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          required
          data-testid="input-image-url"
        />
        <Input
          placeholder="Image URL 1"
          value={formData.imageUrl1}
          onChange={(e) => setFormData({ ...formData, imageUrl1: e.target.value })}
          data-testid="input-image-url1"
        />
        <Input
          placeholder="Image URL 2"
          value={formData.imageUrl2}
          onChange={(e) => setFormData({ ...formData, imageUrl2: e.target.value })}
          data-testid="input-image-url2"
        />
        <Input
          placeholder="Image URL 3"
          value={formData.imageUrl3}
          onChange={(e) => setFormData({ ...formData, imageUrl3: e.target.value })}
          data-testid="input-image-url3"
        />
        <Input
          placeholder="Image URL 4"
          value={formData.imageUrl4}
          onChange={(e) => setFormData({ ...formData, imageUrl4: e.target.value })}
          data-testid="input-image-url4"
        />
      </div>

      <div className="space-y-3 border-t pt-4">
        <Label className="text-base font-semibold">Label Properti</Label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPremium"
              checked={formData.isPremium}
              onCheckedChange={(checked) => setFormData({ ...formData, isPremium: !!checked, isFeatured: false, isHot: false, isSold: false })}
              data-testid="checkbox-premium"
            />
            <label htmlFor="isPremium" className="text-sm font-medium">Premium</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: !!checked, isPremium: false, isHot: false, isSold: false })}
              data-testid="checkbox-featured"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium">Featured</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isHot"
              checked={formData.isHot}
              onCheckedChange={(checked) => setFormData({ ...formData, isHot: !!checked, isPremium: false, isFeatured: false, isSold: false })}
              data-testid="checkbox-hot"
            />
            <label htmlFor="isHot" className="text-sm font-medium">Hot Listing</label>
          </div>
          {formData.isHot && (
            <div className="ml-6">
              <Label htmlFor="priceOld">Harga Lama (untuk Hot Listing)</Label>
              <Input
                id="priceOld"
                type="number"
                value={formData.priceOld}
                onChange={(e) => setFormData({ ...formData, priceOld: e.target.value })}
                data-testid="input-price-old"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isSold"
              checked={formData.isSold}
              onCheckedChange={(checked) => setFormData({ ...formData, isSold: !!checked, isPremium: false, isFeatured: false, isHot: false })}
              data-testid="checkbox-sold"
            />
            <label htmlFor="isSold" className="text-sm font-medium">SOLD</label>
          </div>
          <div className="flex items-center gap-2 border-t pt-3 mt-3">
            <Checkbox
              id="isPropertyPilihan"
              checked={formData.isPropertyPilihan}
              onCheckedChange={(checked) => setFormData({ ...formData, isPropertyPilihan: !!checked })}
              data-testid="checkbox-property-pilihan"
            />
            <label htmlFor="isPropertyPilihan" className="text-sm font-medium">Properti Pilihan (Banner)</label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="flex-1" data-testid="button-submit-property">
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
