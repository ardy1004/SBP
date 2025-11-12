import { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, XCircle, CheckCircle, Loader, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ImageDropzoneProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string | null;
  onDeleteSuccess?: () => void;
}

export function ImageDropzone({ onUploadSuccess, initialImageUrl, onDeleteSuccess }: ImageDropzoneProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const { toast } = useToast();

  useEffect(() => {
    // Sync preview if initialImageUrl changes (e.g., when switching between editing different properties)
    setPreview(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleDeleteImage = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!preview) return;

    try {
      // Extract filename from URL - handle both full URLs and relative paths
      const urlParts = preview.split('/');
      const filename = urlParts[urlParts.length - 1];

      if (filename) {
        console.log('Deleting image:', filename);
        const response = await apiRequest('DELETE', `/api/upload/images/${filename}`, {});
        console.log('Delete response:', response);

        // Update local state
        setPreview(null);
        setStatus('idle');

        // Notify parent components
        onUploadSuccess('');
        onDeleteSuccess?.();

        toast({ title: 'Gambar berhasil dihapus' });
      }
    } catch (error) {
      console.error('Delete image error:', error);
      toast({
        title: 'Gagal menghapus gambar',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus gambar.',
        variant: 'destructive',
      });
    }
  }, [preview, onUploadSuccess, onDeleteSuccess, toast]);

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    console.log('onDrop called:', { acceptedFiles: acceptedFiles.length, fileRejections: fileRejections.length });

    // Since we accept all files, manually validate
    const allFiles = [...acceptedFiles, ...fileRejections.map(r => r.file)];

    if (allFiles.length === 0) {
      console.log('No files');
      return;
    }

    const file = allFiles[0];
    console.log('Processing file:', file.name, file.type, file.size);

    // Manual validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'File Ditolak',
        description: 'Hanya file gambar (jpeg, png, gif) yang diizinkan.',
        variant: 'destructive',
      });
      return;
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: 'File Terlalu Besar',
        description: 'Ukuran file maksimal 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('uploading');
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiRequest('POST', '/api/upload/image', formData);
      console.log('Upload response:', response);
      if (response.success && response.image.webpUrl) {
        onUploadSuccess(response.image.webpUrl);
        setPreview(response.image.webpUrl);
        setStatus('success');
        toast({ title: 'Upload Berhasil!', description: 'Gambar telah dikonversi ke WebP.' });
      } else {
        throw new Error(response.message || 'Upload gagal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
      setPreview(null);
      onUploadSuccess(''); // Reset URL jika gagal
      toast({
        title: 'Upload Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan di server.',
        variant: 'destructive',
      });
    }
  }, [onUploadSuccess, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: undefined, // Accept all files, we'll validate manually
    multiple: false,
    noClick: false,
    noKeyboard: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const renderContent = () => {
    if (status === 'uploading') {
      return <div className="flex flex-col items-center justify-center gap-2"><Loader className="animate-spin h-8 w-8 text-muted-foreground" /> <p>Uploading...</p></div>;
    }
    if (preview) {
      return <img src={preview} alt="Preview" className="w-full h-full object-cover" />;
    }
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Upload className="h-8 w-8" />
        <p className="text-center text-sm">{isDragActive ? 'Jatuhkan gambar di sini...' : 'Seret & jatuhkan gambar, atau klik untuk memilih'}</p>
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        {...getRootProps()}
        className={`relative aspect-video w-full rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors group
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50'}
          ${status === 'error' ? 'border-destructive' : ''}
          ${preview ? 'p-0 overflow-hidden' : 'p-4'}
        `}
      >
        <input {...getInputProps()} />
        {renderContent()}
        {status === 'error' && <XCircle className="absolute top-2 right-2 h-6 w-6 text-destructive" />}
        {status === 'success' && <CheckCircle className="absolute top-2 right-2 h-6 w-6 text-green-500" />}
      </div>
      {preview && (
        <button
          onClick={handleDeleteImage}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 transition-opacity z-10"
          title="Hapus gambar"
          style={{ pointerEvents: 'auto' }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
