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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ImageDropzone } from "@/components/ImageDropzone";
import { MultiImageDropzone } from "@/components/MultiImageDropzone";
import { AIDescriptionGenerator } from "@/components/admin/AIDescriptionGenerator";
import { SEOOptimizer } from "@/components/admin/SEOOptimizer";
import { useAIContent } from "@/hooks/use-ai-content";
import { Sparkles, Wand2, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROPERTY_TYPES, PROPERTY_STATUSES, LEGAL_STATUSES, type Property } from "@shared/types";
import { MessageCircle } from "lucide-react";

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
    hargaPerMeter: false,
    provinsi: "",
    kabupaten: "",
    alamatLengkap: "",
    deskripsi: "",
    metaTitle: "",
    metaDescription: "",
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
    youtubeUrl: "",
    status: "dijual",
    ownerContact1: "",
    ownerContact2: "",
    ownerContact3: "",
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

  // AI Content Generation
  const { generateDescription, isGeneratingDescription, optimizeSEO, isOptimizingSEO } = useAIContent();

  // Handle AI Description Generation
  const handleAIGenerateDescription = async () => {
    if (!formData.jenisProperti || !formData.kabupaten || !formData.provinsi) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon lengkapi jenis properti, kabupaten, dan provinsi terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateDescription.mutateAsync({
        kodeListing: formData.kodeListing,
        judulProperti: formData.judulProperti,
        jenisProperti: formData.jenisProperti,
        kabupaten: formData.kabupaten,
        provinsi: formData.provinsi,
        hargaProperti: formData.hargaProperti,
        kamarTidur: formData.kamarTidur ? parseInt(formData.kamarTidur) : undefined,
        kamarMandi: formData.kamarMandi ? parseInt(formData.kamarMandi) : undefined,
        luasTanah: formData.luasTanah ? parseFloat(formData.luasTanah) : undefined,
        luasBangunan: formData.luasBangunan ? parseFloat(formData.luasBangunan) : undefined,
        legalitas: formData.legalitas,
      });

      if (result.success && result.content) {
        setFormData(prev => ({ ...prev, deskripsi: result.content! }));
        toast({
          title: "AI Description Generated",
          description: `Generated using ${result.source === 'local-ai' ? 'Local AI (Free)' : 'Cloud AI'}`,
        });
      }
    } catch (error) {
      // Error sudah di-handle oleh hook
    }
  };

  // Handle AI SEO Optimization
  const handleAISEOOptimization = async () => {
    if (!formData.judulProperti && !formData.deskripsi) {
      toast({
        title: "Konten Diperlukan",
        description: "Masukkan minimal judul atau deskripsi untuk dioptimasi",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await optimizeSEO.mutateAsync({
        title: formData.judulProperti || undefined,
        description: formData.deskripsi || undefined,
      });

      if (result.success) {
        // Update main title and description (for backward compatibility)
        if (result.optimizedTitle && result.optimizedTitle !== formData.judulProperti) {
          setFormData(prev => ({ ...prev, judulProperti: result.optimizedTitle! }));
        }
        if (result.optimizedDescription && result.optimizedDescription !== formData.deskripsi) {
          setFormData(prev => ({ ...prev, deskripsi: result.optimizedDescription! }));
        }

        // Update meta title and description
        if (result.optimizedTitle) {
          setFormData(prev => ({ ...prev, metaTitle: result.optimizedTitle! }));
        }
        if (result.optimizedDescription) {
          setFormData(prev => ({ ...prev, metaDescription: result.optimizedDescription! }));
        }

        toast({
          title: "SEO Dioptimasi",
          description: `Konten berhasil dioptimasi untuk mesin pencari`,
        });
      }
    } catch (error) {
      // Error sudah di-handle oleh hook
    }
  };




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
        hargaPerMeter: false,
        provinsi: "",
        kabupaten: "",
        alamatLengkap: "",
        deskripsi: "",
        metaTitle: "",
        metaDescription: "",
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
        youtubeUrl: "",
        status: "dijual",
        ownerContact1: "",
        ownerContact2: "",
        ownerContact3: "",
        isPremium: false,
        isFeatured: false,
        isHot: false,
        isSold: false,
        priceOld: "",
        isPropertyPilihan: false,
      });

      // Then set with property data - use camelCase properties from transformed data
      setTimeout(() => {
        let ownerContact1 = "";
        let ownerContact2 = "";
        let ownerContact3 = "";
        if (property.ownerContact) {
          try {
            const parsed = JSON.parse(property.ownerContact);
            ownerContact1 = parsed.contact1 || "";
            ownerContact2 = parsed.contact2 || "";
            ownerContact3 = parsed.contact3 || "";
          } catch {
            // If not JSON, treat as single contact
            ownerContact1 = property.ownerContact;
          }
        }

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
          hargaPerMeter: Boolean((property as any).hargaPerMeter || false),
          provinsi: property.provinsi || "",
          kabupaten: property.kabupaten || "",
          alamatLengkap: property.alamatLengkap || "",
          deskripsi: property.deskripsi || "",
          metaTitle: (property as any).metaTitle || "",
          metaDescription: (property as any).metaDescription || "",
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
          youtubeUrl: property.youtubeUrl || "",
          status: property.status || "dijual",
          ownerContact1,
          ownerContact2,
          ownerContact3,
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
        metaTitle: "",
        metaDescription: "",
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
        youtubeUrl: "",
        status: "dijual",
        ownerContact1: "",
        ownerContact2: "",
        ownerContact3: "",
        isPremium: false,
        isFeatured: false,
        isHot: false,
        isSold: false,
        priceOld: "",
        isPropertyPilihan: false,
        hargaPerMeter: formData.jenisProperti === 'tanah',
      });
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PropertyForm: handleSubmit called');
    setIsSubmitting(true);

    try {
      // Clean the data and ensure proper types
      const payload = {
        kode_listing: formData.kodeListing,
        judul_properti: formData.judulProperti || null,
        deskripsi: formData.deskripsi || null,
        meta_title: formData.metaTitle || null,
        meta_description: formData.metaDescription || null,
        jenis_properti: formData.jenisProperti,
        luas_tanah: formData.luasTanah ? parseFloat(formData.luasTanah) : null,
        luas_bangunan: formData.luasBangunan ? parseFloat(formData.luasBangunan) : null,
        kamar_tidur: formData.kamarTidur ? parseInt(formData.kamarTidur) : null,
        kamar_mandi: formData.kamarMandi ? parseInt(formData.kamarMandi) : null,
        legalitas: formData.legalitas || null,
        harga_properti: formData.hargaProperti,
        ...(formData.hargaPerMeter !== undefined && { harga_per_meter: formData.hargaPerMeter }),
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
        youtube_url: formData.youtubeUrl || null,
        is_premium: formData.isPremium,
        is_featured: formData.isFeatured,
        is_hot: formData.isHot,
        is_sold: formData.isSold,
        price_old: formData.priceOld ? formData.priceOld : null,
        is_property_pilihan: formData.isPropertyPilihan,
        owner_contact: (formData.ownerContact1 || formData.ownerContact2 || formData.ownerContact3) ? JSON.stringify({
          contact1: formData.ownerContact1 || null,
          contact2: formData.ownerContact2 || null,
          contact3: formData.ownerContact3 || null,
        }) : null,
        status: formData.status,
      };

      console.log('PropertyForm: Submitting payload:', payload);
      console.log('PropertyForm: Image URLs in payload:', {
        image_url: payload.image_url,
        image_url1: payload.image_url1,
        image_url2: payload.image_url2,
        image_url3: payload.image_url3,
        image_url4: payload.image_url4,
      });
      console.log('PropertyForm: Form data image URLs:', {
        imageUrl: formData.imageUrl,
        imageUrl1: formData.imageUrl1,
        imageUrl2: formData.imageUrl2,
        imageUrl3: formData.imageUrl3,
        imageUrl4: formData.imageUrl4,
      });

      if (property) {
        console.log('PropertyForm: Updating existing property');
        const { error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', property.id);

        if (error) {
          console.error('PropertyForm: Update error:', error);
          throw error;
        }
        console.log('PropertyForm: Property updated successfully');
        toast({ title: "Properti berhasil diupdate" });
      } else {
        console.log('PropertyForm: Inserting new property');
        const { error } = await supabase
          .from('properties')
          .insert(payload);

        if (error) {
          console.error('PropertyForm: Insert error:', error);
          throw error;
        }
        console.log('PropertyForm: Property inserted successfully');
        toast({ title: "Properti berhasil ditambahkan" });
      }

      console.log('PropertyForm: Calling onSuccess callback');
      onSuccess();
    } catch (error: any) {
      console.error('PropertyForm: Submit error:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan properti",
        variant: "destructive",
      });
    } finally {
      console.log('PropertyForm: Clearing submitting state');
      setIsSubmitting(false);
    }
  };

  const handleImageUploadSuccess = (fieldName: keyof typeof formData, url: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: url }));
  };

  const handleImagesChange = useCallback((imageUrls: string[]) => {
    console.log('handleImagesChange called with URLs:', imageUrls);

    // Only update if all URLs are valid (no blob URLs) or empty array
    const hasBlobUrls = imageUrls.some(url => url && url.startsWith('blob:'));
    const hasValidUrls = imageUrls.some(url => url && !url.startsWith('blob:'));

    console.log('hasBlobUrls:', hasBlobUrls, 'hasValidUrls:', hasValidUrls);

    if (!hasBlobUrls && (hasValidUrls || imageUrls.length === 0)) {
      const newFormData = {
        imageUrl: imageUrls[0] || '',
        imageUrl1: imageUrls[1] || '',
        imageUrl2: imageUrls[2] || '',
        imageUrl3: imageUrls[3] || '',
        imageUrl4: imageUrls[4] || '',
      };

      console.log('Updating formData with image URLs:', newFormData);

      setFormData(prev => {
        // Only update if URLs actually changed
        const currentUrls = [prev.imageUrl, prev.imageUrl1, prev.imageUrl2, prev.imageUrl3, prev.imageUrl4];
        const urlsChanged = JSON.stringify(currentUrls) !== JSON.stringify(Object.values(newFormData));

        if (urlsChanged) {
          console.log('URLs changed, updating formData');
          return {
            ...prev,
            ...newFormData
          };
        } else {
          console.log('URLs unchanged, skipping update');
          return prev;
        }
      });
    }
  }, []);

  const cleanPhoneNumber = (phone: string) => {
    // Remove spaces, dashes, and other non-numeric characters except +
    return phone.replace(/[^\d+]/g, '');
  };


  const openWhatsApp = (phone: string) => {
    const cleaned = cleanPhoneNumber(phone);
    // Ensure it starts with +62 for Indonesian numbers
    let whatsappNumber = cleaned;
    if (cleaned.startsWith('0')) {
      whatsappNumber = '+62' + cleaned.substring(1);
    } else if (cleaned.startsWith('62')) {
      whatsappNumber = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      whatsappNumber = '+62' + cleaned;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPropertyType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Guesthouse', '& Guesthouse');
  };

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
                  {formatPropertyType(type)}
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
          {formData.jenisProperti === 'tanah' && (
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="hargaPerMeter"
                checked={formData.hargaPerMeter}
                onCheckedChange={(checked) => setFormData({ ...formData, hargaPerMeter: !!checked })}
                data-testid="checkbox-harga-per-meter"
              />
              <label htmlFor="hargaPerMeter" className="text-sm font-medium">Harga per meter persegi</label>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="priceOld">Harga Lama</Label>
          <Input
            id="priceOld"
            type="text"
            value={formData.priceOld}
            onChange={(e) => setFormData({ ...formData, priceOld: e.target.value })}
            data-testid="input-price-old"
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
      </div>

      <div>
        <Label className="text-base font-semibold">Kontak Pemilik</Label>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <div>
            <Label htmlFor="ownerContact1">Nama Pemilik</Label>
            <Input
              id="ownerContact1"
              value={formData.ownerContact1}
              onChange={(e) => setFormData({ ...formData, ownerContact1: e.target.value })}
              data-testid="input-owner-contact-1"
            />
          </div>
          <div>
            <Label htmlFor="ownerContact2">Kontak 1</Label>
            <div className="flex gap-2">
              <Input
                id="ownerContact2"
                value={formData.ownerContact2}
                onChange={(e) => setFormData({ ...formData, ownerContact2: e.target.value })}
                data-testid="input-owner-contact-2"
              />
              {formData.ownerContact2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openWhatsApp(formData.ownerContact2)}
                  className="flex items-center gap-1"
                  title="Chat WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                  WA
                </Button>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="ownerContact3">Kontak 2</Label>
            <div className="flex gap-2">
              <Input
                id="ownerContact3"
                value={formData.ownerContact3}
                onChange={(e) => setFormData({ ...formData, ownerContact3: e.target.value })}
                data-testid="input-owner-contact-3"
              />
              {formData.ownerContact3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openWhatsApp(formData.ownerContact3)}
                  className="flex items-center gap-1"
                  title="Chat WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                  WA
                </Button>
              )}
            </div>
          </div>
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
        <Label htmlFor="youtubeUrl">URL Video YouTube</Label>
        <Input
          id="youtubeUrl"
          type="url"
          value={formData.youtubeUrl}
          onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          data-testid="input-youtube-url"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Masukkan URL lengkap video YouTube untuk ditampilkan di halaman detail properti
        </p>
      </div>

      {/* Content Management with AI Tools */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Description
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="deskripsi">Deskripsi Properti</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              data-testid="textarea-deskripsi"
              rows={6}
              placeholder="Jelaskan detail properti ini..."
            />
          </div>

          {/* AI Description Generator */}
          <AIDescriptionGenerator
            propertyData={{
              jenis_properti: formData.jenisProperti,
              kabupaten: formData.kabupaten,
              provinsi: formData.provinsi,
              harga_properti: formData.hargaProperti,
              kamar_tidur: formData.kamarTidur ? parseInt(formData.kamarTidur) : undefined,
              kamar_mandi: formData.kamarMandi ? parseInt(formData.kamarMandi) : undefined,
              luas_tanah: formData.luasTanah ? parseFloat(formData.luasTanah) : undefined,
              luas_bangunan: formData.luasBangunan ? parseFloat(formData.luasBangunan) : undefined,
              kode_listing: formData.kodeListing,
              judul_properti: formData.judulProperti,
              legalitas: formData.legalitas,
            }}
            currentDescription={formData.deskripsi}
            onDescriptionChange={(description) => setFormData({ ...formData, deskripsi: description })}
            onTitleChange={(title) => setFormData({ ...formData, judulProperti: title })}
          />

          {/* New AI Button - Local AI (Free) */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAIGenerateDescription}
              disabled={isGeneratingDescription || !formData.jenisProperti || !formData.kabupaten || !formData.provinsi}
              className="flex items-center gap-2"
            >
              {isGeneratingDescription ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Generate (Free)
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground self-center">
              Generate deskripsi dengan AI lokal (gratis, tanpa batas)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4">
          {/* Meta Title Field */}
          <div>
            <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              placeholder="Judul untuk SEO (50-60 karakter)"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.metaTitle.length}/60 karakter - Ditampilkan di hasil pencarian Google
            </p>
          </div>

          {/* Meta Description Field */}
          <div>
            <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="Deskripsi untuk SEO (150-160 karakter)"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.metaDescription.length}/160 karakter - Ringkasan yang muncul di hasil pencarian
            </p>
          </div>

          {/* SEO Optimizer */}
          <SEOOptimizer
            title={formData.judulProperti}
            description={formData.deskripsi}
            onTitleChange={(title) => {
              console.log('PropertyForm: Updating judulProperti:', title);
              setFormData(prev => ({ ...prev, judulProperti: title }));
            }}
            onDescriptionChange={(description) => {
              console.log('PropertyForm: Updating deskripsi:', description);
              setFormData(prev => ({ ...prev, deskripsi: description }));
            }}
            onMetaTitleChange={(metaTitle) => {
              console.log('PropertyForm: Updating metaTitle:', metaTitle);
              setFormData(prev => ({ ...prev, metaTitle: metaTitle }));
            }}
            onMetaDescriptionChange={(metaDescription) => {
              console.log('PropertyForm: Updating metaDescription:', metaDescription);
              setFormData(prev => ({ ...prev, metaDescription: metaDescription }));
            }}
          />
        </TabsContent>
      </Tabs>

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
            propertyId={formData.kodeListing || undefined}
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
