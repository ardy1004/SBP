// Owner Identity Form Component
// Form for capturing owner identity information for property submissions

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, Phone, MapPin, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface OwnerIdentityFormProps {
  propertyId?: string;
  ownerIdentityId?: string;
  onSuccess?: (ownerId: string) => void;
  isReadOnly?: boolean;
}

export function OwnerIdentityForm({ propertyId, ownerIdentityId, onSuccess, isReadOnly = false }: OwnerIdentityFormProps) {
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    no_ktp: "",
    alamat_ktp: "",
    rt_rw: "",
    kelurahan: "",
    kecamatan: "",
    bertindak_sebagai: "owner",
    whatsapp_1: "",
    whatsapp_2: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!ownerIdentityId);
  const { toast } = useToast();

  // Load existing data if ownerIdentityId is provided
  useState(() => {
    if (ownerIdentityId) {
      loadOwnerData();
    }
  });

  const loadOwnerData = async () => {
    if (!ownerIdentityId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('owner_identities')
        .select('*')
        .eq('id', ownerIdentityId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          nama_lengkap: data.nama_langelog || "",
          no_ktp: data.no_ktp || "",
          alamat_ktp: data.alamat_ktp || "",
          rt_rw: data.rt_rw || "",
          kelurahan: data.kelurahan || "",
          kecamatan: data.kecamatan || "",
          bertindak_sebagai: data.bertindak_sebagai || "owner",
          whatsapp_1: data.whatsapp_1 || "",
          whatsapp_2: data.whatsapp_2 || "",
        });
      }
    } catch (error) {
      console.error('Error loading owner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/[^\d+]/g, '');
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    
    const cleaned = cleanPhoneNumber(phone);
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

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.nama_lengkap.trim()) {
      errors.push("Nama lengkap wajib diisi");
    }
    if (!formData.no_ktp.trim()) {
      errors.push("Nomor KTP wajib diisi");
    }
    if (!formData.alamat_ktp.trim()) {
      errors.push("Alamat KTP wajib diisi");
    }
    if (!formData.whatsapp_1.trim()) {
      errors.push("WhatsApp utama wajib diisi");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(err => {
        toast({
          title: "Validasi Gagal",
          description: err,
          variant: "destructive",
        });
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let ownerId = ownerIdentityId;

      if (ownerIdentityId) {
        // Update existing
        const { error } = await supabase
          .from('owner_identities')
          .update({
            nama_lengkap: formData.nama_lengkap,
            no_ktp: formData.no_ktp,
            alamat_ktp: formData.alamat_ktp,
            rt_rw: formData.rt_rw || null,
            kelurahan: formData.kelurahan || null,
            kecamatan: formData.kecamatan || null,
            bertindak_sebagai: formData.bertindak_sebagai,
            whatsapp_1: formData.whatsapp_1,
            whatsapp_2: formData.whatsapp_2 || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ownerIdentityId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('owner_identities')
          .insert({
            property_id: propertyId || null,
            nama_lengkap: formData.nama_lengkap,
            no_ktp: formData.no_ktp,
            alamat_ktp: formData.alamat_ktp,
            rt_rw: formData.rt_rw || null,
            kelurahan: formData.kelurahan || null,
            kecamatan: formData.kecamatan || null,
            bertindak_sebagai: formData.bertindak_sebagai,
            whatsapp_1: formData.whatsapp_1,
            whatsapp_2: formData.whatsapp_2 || null,
          })
          .select()
          .single();

        if (error) throw error;
        ownerId = data?.id;
      }

      toast({
        title: "Berhasil",
        description: "Data pemilik berhasil disimpan",
      });

      if (onSuccess && ownerId) {
        onSuccess(ownerId);
      }
    } catch (error: any) {
      console.error('Error saving owner identity:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan data pemilik",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Identitas Pemilik Properti
        </CardTitle>
        <CardDescription>
          Mohon lengkapi data diri Anda sebagai pemilik properti
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="nama_lengkap"
                placeholder="Masukkan nama lengkap sesuai KTP"
                value={formData.nama_lengkap}
                onChange={(e) => handleChange("nama_lengkap", e.target.value)}
                disabled={isReadOnly}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Nomor KTP */}
          <div className="space-y-2">
            <Label htmlFor="no_ktp">
              Nomor KTP <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="no_ktp"
                placeholder="Masukkan nomor KTP (16 digit)"
                value={formData.no_ktp}
                onChange={(e) => handleChange("no_ktp", e.target.value)}
                disabled={isReadOnly}
                className="pl-10"
                required
                maxLength={16}
              />
            </div>
          </div>

          {/* Alamat KTP */}
          <div className="space-y-2">
            <Label htmlFor="alamat_ktp">
              Alamat KTP <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="alamat_ktp"
                placeholder="Masukkan alamat sesuai KTP"
                value={formData.alamat_ktp}
                onChange={(e) => handleChange("alamat_ktp", e.target.value)}
                disabled={isReadOnly}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* RT/RW */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rt_rw">RT/RW</Label>
              <Input
                id="rt_rw"
                placeholder="Contoh: 001/002"
                value={formData.rt_rw}
                onChange={(e) => handleChange("rt_rw", e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="kelurahan">Kelurahan</Label>
              <Input
                id="kelurahan"
                placeholder="Nama kelurahan"
                value={formData.kelurahan}
                onChange={(e) => handleChange("kelurahan", e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Kecamatan */}
          <div className="space-y-2">
            <Label htmlFor="kecamatan">Kecamatan</Label>
            <Input
              id="kecamatan"
              placeholder="Nama kecamatan"
              value={formData.kecamatan}
              onChange={(e) => handleChange("kecamatan", e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          {/* Bertindak Sebagai */}
          <div className="space-y-2">
            <Label htmlFor="bertindak_sebagai">Bertindak Sebagai</Label>
            <select
              id="bertindak_sebagai"
              value={formData.bertindak_sebagai}
              onChange={(e) => handleChange("bertindak_sebagai", e.target.value)}
              disabled={isReadOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="owner">Pemilik Sah Properti Sesuai A/n Sertifikat</option>
              <option value="pasangan">Pasangan (Suami/Istri) Bukan A/n Sertifikat</option>
              <option value="broker">Broker/Perantara</option>
              <option value="saudara">Saudara</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          {/* WhatsApp */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Informasi WhatsApp
            </h3>
            
            <div className="space-y-4">
              {/* WhatsApp 1 */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp_1">
                  WhatsApp Utama <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp_1"
                      placeholder="Contoh: 081234567890"
                      value={formData.whatsapp_1}
                      onChange={(e) => handleChange("whatsapp_1", e.target.value)}
                      disabled={isReadOnly}
                      className="pl-10"
                      required
                    />
                  </div>
                  {formData.whatsapp_1 && !isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openWhatsApp(formData.whatsapp_1)}
                      className="flex items-center gap-1 bg-green-50 hover:bg-green-100 border-green-200"
                    >
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">WA</span>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  WhatsApp utama akan digunakan untuk komunikasi dengan calon pembeli/penyewa
                </p>
              </div>

              {/* WhatsApp 2 */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp_2">WhatsApp Alternatif (Opsional)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp_2"
                      placeholder="Contoh: 081234567891"
                      value={formData.whatsapp_2}
                      onChange={(e) => handleChange("whatsapp_2", e.target.value)}
                      disabled={isReadOnly}
                      className="pl-10"
                    />
                  </div>
                  {formData.whatsapp_2 && !isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openWhatsApp(formData.whatsapp_2)}
                      className="flex items-center gap-1 bg-green-50 hover:bg-green-100 border-green-200"
                    >
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">WA</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!isReadOnly && (
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Simpan Data Pemilik
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
