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
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationStatus, setVideoGenerationStatus] = useState<string>('');
  const [videoProgress, setVideoProgress] = useState<{ current: number; total: number; status: string } | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);
  const [previewVideoBlob, setPreviewVideoBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  // Debug effect for preview dialog
  useEffect(() => {
    console.log('🎬 showPreviewDialog changed:', showPreviewDialog);
    if (showPreviewDialog) {
      console.log('🎬 Preview dialog is now VISIBLE');
    }
  }, [showPreviewDialog]);

  // Computed values for video generation
  const validImages = [formData.imageUrl, formData.imageUrl1, formData.imageUrl2, formData.imageUrl3, formData.imageUrl4]
    .filter(url => url && url.trim() && !url.includes('unsplash.com'));
  const hasValidImages = validImages.length > 0;
  const validImageCount = validImages.length;

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

      console.log('Submitting payload:', payload);
      console.log('Image URLs in payload:', {
        image_url: payload.image_url,
        image_url1: payload.image_url1,
        image_url2: payload.image_url2,
        image_url3: payload.image_url3,
        image_url4: payload.image_url4,
      });
      console.log('Form data image URLs:', {
        imageUrl: formData.imageUrl,
        imageUrl1: formData.imageUrl1,
        imageUrl2: formData.imageUrl2,
        imageUrl3: formData.imageUrl3,
        imageUrl4: formData.imageUrl4,
      });

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

  const handleGenerateVideo = async () => {
    if (!hasValidImages) {
      toast({
        title: "Tidak ada gambar valid",
        description: "Minimal 1 gambar properti diperlukan untuk generate video",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress({ current: 0, total: validImageCount, status: 'Memulai generate video...' });

    try {
      const { generatePropertyVideo } = await import('@/lib/utils');

      const videoBlob = await generatePropertyVideo({
        images: validImages,
        title: formData.judulProperti || `${formData.jenisProperti} di ${formData.kabupaten}`,
        description: formData.deskripsi,
        kodeListing: formData.kodeListing,
        onProgress: (progress) => {
          setVideoProgress(progress);
        },
        onFirstSegmentComplete: async (segmentBlob: Blob) => {
          console.log('🎬 onFirstSegmentComplete called with blob:', segmentBlob);
          // Show preview dialog and wait for user confirmation
          return new Promise<boolean>((resolve) => {
            console.log('Setting preview dialog state...');

            // Use browser alert for now to ensure it works
            const userChoice = window.confirm(
              `🎬 Preview Video - Gambar Pertama Selesai!\n\n` +
              `Video dari gambar pertama properti ${formData.kodeListing} telah berhasil dibuat.\n\n` +
              `Apakah Anda ingin melanjutkan generate video dengan gambar berikutnya?\n\n` +
              `✅ OK = Lanjut Generate Video Lengkap\n` +
              `❌ Cancel = Batal`
            );

            console.log('User choice from alert:', userChoice ? 'Continue' : 'Cancel');
            resolve(userChoice);
          });
        }
      });

      setVideoProgress(null);
      setGeneratedVideoBlob(videoBlob);
      console.log('🎬 Video generation completed, showing final dialog with blob:', videoBlob);
      setShowVideoDialog(true);

    } catch (error: any) {
      console.error('Video generation failed:', error);
      setVideoProgress(null);

      // Don't show error toast if user cancelled
      if (error.message !== 'Video generation cancelled by user') {
        toast({
          title: "Gagal Generate Video",
          description: error.message || "Terjadi kesalahan saat generate video",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDownloadToPC = async () => {
    if (!generatedVideoBlob) return;

    const { downloadBlob } = await import('@/lib/utils');
    const filename = `Property-${formData.kodeListing}-Video-${new Date().toISOString().split('T')[0]}.webm`;
    downloadBlob(generatedVideoBlob, filename);

    setShowVideoDialog(false);
    setGeneratedVideoBlob(null);

    toast({
      title: "Video Berhasil Didownload!",
      description: `Video properti ${formData.kodeListing} telah didownload ke PC Anda.`,
    });
  };

  const handleSaveToStorage = async () => {
    if (!generatedVideoBlob) return;

    try {
      // TODO: Implement upload to Supabase storage
      // For now, just show a message
      toast({
        title: "Fitur Storage",
        description: "Upload ke storage akan diimplementasikan selanjutnya.",
      });

      setShowVideoDialog(false);
      setGeneratedVideoBlob(null);
    } catch (error) {
      toast({
        title: "Gagal Upload",
        description: "Terjadi kesalahan saat upload ke storage",
        variant: "destructive",
      });
    }
  };

  const handlePreviewConfirm = () => {
    setShowPreviewDialog(false);
    setPreviewVideoBlob(null);
    // Continue with video generation
    if ((window as any).resolvePreviewConfirmation) {
      (window as any).resolvePreviewConfirmation(true);
    }
  };

  const handlePreviewCancel = () => {
    setShowPreviewDialog(false);
    setPreviewVideoBlob(null);
    // Cancel video generation
    if ((window as any).resolvePreviewConfirmation) {
      (window as any).resolvePreviewConfirmation(false);
    }
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

      <div className="space-y-4">
        <div>
          <Label htmlFor="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            data-testid="textarea-deskripsi"
            rows={6}
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
          }}
          currentDescription={formData.deskripsi}
          onDescriptionChange={(description) => setFormData({ ...formData, deskripsi: description })}
        />

        {/* AI Video Generator */}
        <div className="border-t pt-4">
          <Label className="text-base font-semibold mb-3 block">AI Video Generator</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Generate video showcase dari foto properti menggunakan AI ByteDance Seedream.
            Video akan otomatis didownload ke PC Anda untuk diupload ke YouTube.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !hasValidImages}
              className="flex items-center gap-2"
            >
              🎬 {isGeneratingVideo ? 'Generating Video...' : 'Generate Property Video'}
            </Button>

            {hasValidImages && (
              <div className="text-sm text-muted-foreground flex items-center">
                {validImageCount} gambar siap untuk video generation
              </div>
            )}
          </div>

          {videoProgress && (
            <div className="mt-3 p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{videoProgress.status}</p>
                <span className="text-xs text-muted-foreground">
                  {videoProgress.current}/{videoProgress.total}
                </span>
              </div>
              <Progress
                value={(videoProgress.current / videoProgress.total) * 100}
                className="h-2"
              />
            </div>
          )}
        </div>
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

      {/* Video Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>🎬 Preview Video - Gambar Pertama Selesai!</DialogTitle>
            <DialogDescription>
              Video dari gambar pertama properti {formData.kodeListing} telah berhasil dibuat.
              Apakah Anda ingin melanjutkan generate video dengan gambar berikutnya?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Video Segment Berhasil Dibuat!</h4>
                <p className="text-sm text-muted-foreground">
                  File video sementara dengan ukuran 2.00 MB telah dibuat dari gambar pertama.
                  Video lengkap akan dibuat setelah Anda konfirmasi untuk melanjutkan.
                </p>
              </div>
              {validImages[0] && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Gambar yang diproses:</p>
                  <img
                    src={validImages[0]}
                    alt="Gambar pertama"
                    className="max-w-full max-h-48 mx-auto rounded border"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handlePreviewCancel}>
              ❌ Batal - Jangan lanjut
            </Button>
            <Button onClick={handlePreviewConfirm}>
              ✅ Lanjut Generate Video Lengkap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Generation Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Berhasil Digenerate! 🎬</DialogTitle>
            <DialogDescription>
              Video properti {formData.kodeListing} telah berhasil dibuat. Pilih cara menyimpan video:
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={handleDownloadToPC}>
                <div>
                  <h4 className="font-medium">💾 Download ke PC</h4>
                  <p className="text-sm text-muted-foreground">Video akan langsung didownload ke folder Downloads PC Anda</p>
                </div>
                <Button variant="outline" size="sm">Download</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={handleSaveToStorage}>
                <div>
                  <h4 className="font-medium">☁️ Simpan ke Storage</h4>
                  <p className="text-sm text-muted-foreground">Video disimpan sementara untuk upload ke YouTube (akan dihapus otomatis)</p>
                </div>
                <Button variant="outline" size="sm" disabled>Coming Soon</Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
