import { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/lib/supabase";
import { ImageDropzone } from "@/components/ImageDropzone";
import { MultiImageDropzone } from "@/components/MultiImageDropzone";
import { PROPERTY_TYPES, PROPERTY_STATUSES, LEGAL_STATUSES, type Property } from "@shared/schema";

interface PropertyFormProps {
  property: Property | null;
  onSuccess: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    kodeListing: "",
    judulProperti: "",
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
    imageUrl5: "",
    imageUrl6: "",
    imageUrl7: "",
    imageUrl8: "",
    imageUrl9: "",
    status: "dijual",
    ownerContact: "",
    isPremium: false,
    isFeatured: false,
    isHot: false,
    isSold: false,
    priceOld: "",
    isPropertyPilihan: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (property) {
      setIsLoading(true);
      console.log('Loading property data:', property);
      console.log('Property keys:', Object.keys(property));
      console.log('Property kodeListing:', property.kodeListing);
      console.log('Property judulProperti:', property.judulProperti);

      // Reset form first
      setFormData({
        kodeListing: "",
        judulProperti: "",
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
        imageUrl5: "",
        imageUrl6: "",
        imageUrl7: "",
        imageUrl8: "",
        imageUrl9: "",
        status: "dijual",
        ownerContact: "",
        isPremium: false,
        isFeatured: false,
        isHot: false,
        isSold: false,
        priceOld: "",
        isPropertyPilihan: false,
      });

      // Then set with property data - use camelCase properties from transformed data
      setTimeout(() => {
        const newFormData = {
          kodeListing: property.kodeListing || "",
          judulProperti: property.judulProperti || "",
          jenisProperti: property.jenisProperti || "",
          luasTanah: property.luasTanah || "",
          luasBangunan: property.luasBangunan || "",
          kamarTidur: property.kamarTidur ? property.kamarTidur.toString() : "",
          kamarMandi: property.kamarMandi ? property.kamarMandi.toString() : "",
          legalitas: property.legalitas || "",
          hargaProperti: property.hargaProperti || "",
          provinsi: property.provinsi || "",
          kabupaten: property.kabupaten || "",
          alamatLengkap: property.alamatLengkap || "",
          deskripsi: property.deskripsi || "",
          imageUrl: property.imageUrl || "",
          imageUrl1: property.imageUrl1 || "",
          imageUrl2: property.imageUrl2 || "",
          imageUrl3: property.imageUrl3 || "",
          imageUrl4: property.imageUrl4 || "",
          imageUrl5: property.imageUrl5 || "",
          imageUrl6: property.imageUrl6 || "",
          imageUrl7: property.imageUrl7 || "",
          imageUrl8: property.imageUrl8 || "",
          imageUrl9: property.imageUrl9 || "",
          status: property.status || "dijual",
          ownerContact: property.ownerContact || "",
          isPremium: Boolean(property.isPremium),
          isFeatured: Boolean(property.isFeatured),
          isHot: Boolean(property.isHot),
          isSold: Boolean(property.isSold),
          priceOld: property.priceOld || "",
          isPropertyPilihan: Boolean(property.isPropertyPilihan),
        };

        console.log('Setting form data to:', newFormData);
        setFormData(newFormData);
        setIsLoading(false);
      }, 50);
    } else {
      // Reset form for new property
      setFormData({
        kodeListing: "",
        judulProperti: "",
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
        imageUrl5: "",
        imageUrl6: "",
        imageUrl7: "",
        imageUrl8: "",
        imageUrl9: "",
        status: "dijual",
        ownerContact: "",
        isPremium: false,
        isFeatured: false,
        isHot: false,
        isSold: false,
        priceOld: "",
        isPropertyPilihan: false,
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Clean the data and ensure proper types
      const payload = {
        kode_listing: formData.kodeListing,
        judul_properti: formData.judulProperti || null,
        deskripsi: formData.deskripsi || null,
        jenis_properti: formData.jenisProperti,
        luas_tanah: formData.luasTanah ? parseFloat(formData.luasTanah) : null,
        luas_bangunan: formData.luasBangunan ? parseFloat(formData.luasBangunan) : null,
        kamar_tidur: formData.kamarTidur ? parseInt(formData.kamarTidur) : null,
        kamar_mandi: formData.kamarMandi ? parseInt(formData.kamarMandi) : null,
        legalitas: formData.legalitas || null,
        harga_properti: formData.hargaProperti,
        provinsi: formData.provinsi,
        kabupaten: formData.kabupaten,
        alamat_lengkap: formData.alamatLengkap || null,
        image_url: formData.imageUrl || null,
        image_url1: formData.imageUrl1 || null,
        image_url2: formData.imageUrl2 || null,
        image_url3: formData.imageUrl3 || null,
        image_url4: formData.imageUrl4 || null,
        image_url5: formData.imageUrl5 || null,
        image_url6: formData.imageUrl6 || null,
        image_url7: formData.imageUrl7 || null,
        image_url8: formData.imageUrl8 || null,
        image_url9: formData.imageUrl9 || null,
        is_premium: formData.isPremium,
        is_featured: formData.isFeatured,
        is_hot: formData.isHot,
        is_sold: formData.isSold,
        price_old: formData.priceOld ? formData.priceOld : null,
        is_property_pilihan: formData.isPropertyPilihan,
        owner_contact: formData.ownerContact || null,
        status: formData.status,
      };

      console.log('Submitting payload:', payload);

      if (property) {
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast({ title: "Properti berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('properties')
          .insert(payload);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast({ title: "Properti berhasil ditambahkan" });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan properti",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploadSuccess = (fieldName: keyof typeof formData, url: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: url }));
  };

  const handleImagesChange = useCallback((imageUrls: string[]) => {
    // Only update if all URLs are valid (no blob URLs) or empty array
    const hasBlobUrls = imageUrls.some(url => url && url.startsWith('blob:'));
    const hasValidUrls = imageUrls.some(url => url && !url.startsWith('blob:'));

    if (!hasBlobUrls && (hasValidUrls || imageUrls.length === 0)) {
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrls[0] || '',
        imageUrl1: imageUrls[1] || '',
        imageUrl2: imageUrls[2] || '',
        imageUrl3: imageUrls[3] || '',
        imageUrl4: imageUrls[4] || '',
      }));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data properti...</p>
        </div>
      </div>
    );
  }

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
          <Label htmlFor="judulProperti">Judul Properti</Label>
          <Input
            id="judulProperti"
            value={formData.judulProperti}
            onChange={(e) => setFormData({ ...formData, judulProperti: e.target.value })}
            data-testid="input-judul-properti"
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
            type="text"
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
            type="text"
            value={formData.luasTanah}
            onChange={(e) => setFormData({ ...formData, luasTanah: e.target.value })}
            data-testid="input-luas-tanah"
          />
        </div>

        <div>
          <Label htmlFor="luasBangunan">Luas Bangunan (m²)</Label>
          <Input
            id="luasBangunan"
            type="text"
            value={formData.luasBangunan}
            onChange={(e) => setFormData({ ...formData, luasBangunan: e.target.value })}
            data-testid="input-luas-bangunan"
          />
        </div>

        <div>
          <Label htmlFor="kamarTidur">Kamar Tidur</Label>
          <Input
            id="kamarTidur"
            type="text"
            value={formData.kamarTidur}
            onChange={(e) => setFormData({ ...formData, kamarTidur: e.target.value })}
            data-testid="input-kamar-tidur"
          />
        </div>

        <div>
          <Label htmlFor="kamarMandi">Kamar Mandi</Label>
          <Input
            id="kamarMandi"
            type="text"
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

      <div className="space-y-4">
        <div>
          <Label>Gambar Properti *</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Gambar akan dikonversi otomatis ke format .webp. Gambar pertama akan menjadi gambar utama.
            Seret gambar untuk mengatur urutan dan menentukan gambar utama.
          </p>
          <MultiImageDropzone
            onImagesChange={handleImagesChange}
            initialImages={[
              formData.imageUrl,
              formData.imageUrl1,
              formData.imageUrl2,
              formData.imageUrl3,
              formData.imageUrl4,
            ].filter(url => url && url.trim())}
            maxImages={5}
          />
        </div>
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
                type="text"
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
