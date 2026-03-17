import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { MultiImageDropzone } from "@/components/MultiImageDropzone";

interface FormMediaUploadProps {
  formData: {
    imageUrl: string;
    imageUrl1: string;
    imageUrl2: string;
    imageUrl3: string;
    imageUrl4: string;
  };
  setFormData: (updater: (prev: any) => any) => void;
  propertyId?: string;
}

export function FormMediaUpload({
  formData,
  setFormData,
  propertyId
}: FormMediaUploadProps) {
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
  }, [setFormData]);

  return (
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
          ].filter(url => url && typeof url === 'string' && url.trim())}
          maxImages={5}
          propertyId={propertyId}
        />
      </div>
    </div>
  );
}