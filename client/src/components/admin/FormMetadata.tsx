import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROPERTY_TYPES, PROPERTY_STATUSES } from "@shared/types";

interface FormMetadataProps {
  formData: {
    kodeListing: string;
    judulProperti: string;
    jenisProperti: string;
    status: string;
    provinsi: string;
    kabupaten: string;
    alamatLengkap: string;
    deskripsi: string;
    metaTitle: string;
    metaDescription: string;
  };
  setFormData: (updater: (prev: any) => any) => void;
  errors?: Record<string, string>;
}

export function FormMetadata({
  formData,
  setFormData,
  errors
}: FormMetadataProps) {
  const formatPropertyType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Guesthouse', '& Guesthouse');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="kodeListing">Kode Listing *</Label>
        <Input
          id="kodeListing"
          value={formData.kodeListing}
          onChange={(e) => setFormData(prev => ({ ...prev, kodeListing: e.target.value }))}
          required
          data-testid="input-kode-listing"
        />
        {errors?.kodeListing && <p className="text-sm text-destructive">{errors.kodeListing}</p>}
      </div>

      <div>
        <Label htmlFor="judulProperti">Judul Properti</Label>
        <Input
          id="judulProperti"
          value={formData.judulProperti}
          onChange={(e) => setFormData(prev => ({ ...prev, judulProperti: e.target.value }))}
          data-testid="input-judul-properti"
        />
      </div>

      <div>
        <Label htmlFor="jenisProperti">Jenis Properti *</Label>
        <Select value={formData.jenisProperti} onValueChange={(value) => setFormData(prev => ({ ...prev, jenisProperti: value }))}>
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
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
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
        <Label htmlFor="provinsi">Provinsi *</Label>
        <Input
          id="provinsi"
          value={formData.provinsi}
          onChange={(e) => setFormData(prev => ({ ...prev, provinsi: e.target.value.toLowerCase() }))}
          required
          data-testid="input-provinsi"
        />
      </div>

      <div>
        <Label htmlFor="kabupaten">Kabupaten/Kota *</Label>
        <Input
          id="kabupaten"
          value={formData.kabupaten}
          onChange={(e) => setFormData(prev => ({ ...prev, kabupaten: e.target.value.toLowerCase() }))}
          required
          data-testid="input-kabupaten"
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="alamatLengkap">Alamat Lengkap</Label>
        <Textarea
          id="alamatLengkap"
          value={formData.alamatLengkap}
          onChange={(e) => setFormData(prev => ({ ...prev, alamatLengkap: e.target.value }))}
          data-testid="textarea-alamat"
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="deskripsi">Deskripsi Properti</Label>
        <Textarea
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
          data-testid="textarea-deskripsi"
          rows={6}
          placeholder="Jelaskan detail properti ini..."
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
        <Input
          id="metaTitle"
          value={formData.metaTitle}
          onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
          placeholder="Judul untuk SEO (50-60 karakter)"
          maxLength={60}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.metaTitle.length}/60 karakter
        </p>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
          placeholder="Deskripsi untuk SEO (150-160 karakter)"
          maxLength={160}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.metaDescription.length}/160 karakter
        </p>
      </div>
    </div>
  );
}