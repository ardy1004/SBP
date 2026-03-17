import { useState, useCallback } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadFeaturedImage, validateImage } from '@/services/admin/imageService';

interface FeaturedImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  articleId?: string;
  disabled?: boolean;
}

export default function FeaturedImageUploader({
  value,
  onChange,
  articleId,
  disabled = false
}: FeaturedImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  // Validate image file (using imageService)
  const validateImageFile = useCallback((file: File): string | null => {
    const result = validateImage(file);
    return result.isValid ? null : result.error || 'File tidak valid';
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    // Validate
    const validationError = validateImageFile(file);
    if (validationError) {
      toast({
        title: 'File tidak valid',
        description: validationError,
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    try {
      // Upload using imageService
      const result = await uploadFeaturedImage(file, articleId);

      setUploadProgress(100);

      if (result.success && result.url) {
        // Update parent component
        onChange(result.url);

        toast({
          title: 'Upload berhasil',
          description: 'Gambar featured berhasil diupload',
        });
      } else {
        throw new Error(result.error || 'Upload gagal');
      }

    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload gagal',
        description: error.message || 'Terjadi kesalahan saat upload',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [validateImageFile, uploadFeaturedImage, articleId, onChange, toast]);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    handleFileUpload(files[0]);
  }, [handleFileUpload]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Remove image
  const handleRemove = useCallback(() => {
    onChange('');
    toast({
      title: 'Gambar dihapus',
      description: 'Gambar featured telah dihapus',
    });
  }, [onChange, toast]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Featured Image
      </label>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onClick={() => !disabled && !isUploading && document.getElementById('featured-image-input')?.click()}
      >
        <input
          id="featured-image-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader className="animate-spin h-8 w-8 text-primary" />
            <div className="w-full max-w-xs">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Mengupload... {uploadProgress}%
              </p>
            </div>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={value}
                alt="Featured"
                className="w-32 h-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop';
                }}
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Klik untuk mengganti gambar</p>
              <p className="text-xs">atau seret & jatuhkan gambar baru</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-50 rounded-full">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Upload Featured Image
              </p>
              <p className="text-sm text-muted-foreground">
                {dragActive ? 'Jatuhkan gambar di sini' : 'Klik untuk memilih atau seret & jatuhkan'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP, GIF • Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Debug info - only show in development and for non-data URLs */}
      {value && !value.startsWith('data:') && import.meta.env.DEV && (
        <div className="text-xs text-muted-foreground break-all">
          Debug: Image uploaded successfully
        </div>
      )}
    </div>
  );
}