import { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, XCircle, CheckCircle, Loader, Trash2, GripVertical, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

interface ImageItem {
  id: string;
  url: string;
  isUploading?: boolean;
  isMain?: boolean;
}

interface MultiImageDropzoneProps {
  onImagesChange: (images: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
  propertyId?: string; // kodeListing or temporary ID
}

function SortableImageItem({
  image,
  onDelete,
  isMain
}: {
  image: ImageItem;
  onDelete: (id: string) => void;
  isMain: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border rounded-lg overflow-hidden ${
        isDragging ? 'opacity-50' : ''
      } ${isMain ? 'ring-2 ring-yellow-400' : ''}`}
    >
      <div className="aspect-video relative">
        {image.isUploading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Loader className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={image.url}
            alt="Property"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop';
            }}
          />
        )}

        {/* Main image indicator */}
        {isMain && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Utama
          </div>
        )}

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(image.id);
          }}
          className="absolute top-2 right-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Hapus gambar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function MultiImageDropzone({
  onImagesChange,
  initialImages = [],
  maxImages = 5,
  propertyId
}: MultiImageDropzoneProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Initialize images from initialImages prop
    const initialImageItems: ImageItem[] = initialImages
      .filter(url => url && url.trim())
      .map((url, index) => ({
        id: `initial-${index}`,
        url,
        isMain: index === 0,
      }));
    setImages(initialImageItems);
  }, [initialImages]);

  // Notify parent only when all uploads are complete and we have final URLs
  useEffect(() => {
    if (uploadingCount === 0 && images.length > 0 && !isDragging) {
      const hasBlobUrls = images.some(img => img.url.startsWith('blob:'));
      const hasValidUrls = images.some(img => img.url && !img.url.startsWith('blob:'));

      if (!hasBlobUrls && hasValidUrls) {
        const urls = images.map(img => img.url);
        onImagesChange(urls);
      }
    }
  }, [images, uploadingCount, isDragging, onImagesChange]);
  const handleDeleteImage = useCallback(async (imageId: string) => {
    // Remove from local state only (Cloudflare R2 handles storage)
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== imageId);
      // Update main image status
      if (newImages.length > 0) {
        newImages[0].isMain = true;
      }
      return newImages;
    });

    // Notify parent component about image changes
    const remainingUrls = images
      .filter(img => img.id !== imageId)
      .map(img => img.url);
    onImagesChange(remainingUrls);

    toast({ title: 'Gambar berhasil dihapus dari form' });
  }, [images, toast, onImagesChange]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file); // Worker expects 'image' (singular)
    formData.append('propertyId', propertyId || 'temp'); // Use propertyId or temp

    console.log('Uploading file:', file.name, 'to Cloudflare Worker');

    // Upload directly to Cloudflare Worker
    const workerUrl = 'https://sbp-upload-worker.ardy1004.workers.dev';
    const response = await fetch(workerUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('Worker response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Worker error response:', errorText);
      throw new Error(`Upload gagal: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Worker result:', result);

    if (!result.success || !result.url) {
      throw new Error(result.error || 'No image URL returned from worker');
    }

    // Return the full URL from worker (already includes domain)
    const imageUrl = result.url;
    console.log('Image URL from worker:', imageUrl);

    return imageUrl;
  }, [propertyId]);

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    console.log('onDrop called:', { acceptedFiles: acceptedFiles.length, fileRejections: fileRejections.length });

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Bukan file gambar`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        errors.push(`${file.name}: Ukuran file maksimal 10MB`);
        continue;
      }
      validFiles.push(file);
    }

    // Check total images limit
    const currentImageCount = images.length;
    const availableSlots = maxImages - currentImageCount;
    if (validFiles.length > availableSlots) {
      errors.push(`Maksimal ${maxImages} gambar. Anda mencoba menambah ${validFiles.length} gambar, tetapi hanya ${availableSlots} slot tersedia.`);
      validFiles.splice(availableSlots);
    }

    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: 'Beberapa file ditolak',
        description: errors.join('\n'),
        variant: 'destructive',
      });
    }

    if (validFiles.length === 0) return;

    // Add uploading placeholders
    const uploadingItems: ImageItem[] = validFiles.map((file, index) => ({
      id: `uploading-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isUploading: true,
    }));

    setImages(prev => [...prev, ...uploadingItems]);
    setUploadingCount(prev => prev + validFiles.length);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        const url = await uploadFile(file);
        return { success: true, url, index };
      } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error, index };
      }
    });

    const results = await Promise.all(uploadPromises);

    // Update images with results
    setImages(prev => {
      const newImages = [...prev];
      let successCount = 0;

      results.forEach((result, uploadIndex) => {
        // Find the uploading item by checking if it's still uploading and has a blob URL
        const uploadingItemIndex = newImages.findIndex(img =>
          img.isUploading && img.url.startsWith('blob:')
        );

        if (uploadingItemIndex !== -1) {
          if (result.success && result.url) {
            // Clean up blob URL before replacing
            URL.revokeObjectURL(newImages[uploadingItemIndex].url);

            newImages[uploadingItemIndex] = {
              ...newImages[uploadingItemIndex],
              url: result.url,
              isUploading: false,
            };
            successCount++;
          } else {
            // Clean up blob URL and remove failed upload
            URL.revokeObjectURL(newImages[uploadingItemIndex].url);
            newImages.splice(uploadingItemIndex, 1);
          }
        }
      });

      // Update main image status
      if (newImages.length > 0 && !newImages[0].isMain) {
        newImages[0].isMain = true;
      }

      return newImages;
    });

    setUploadingCount(prev => prev - validFiles.length);

    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      toast({
        title: 'Upload Berhasil!',
        description: `${successCount} gambar berhasil diupload dan dikonversi ke WebP.`,
      });
    }

    if (successCount < validFiles.length) {
      toast({
        title: 'Beberapa upload gagal',
        description: `${validFiles.length - successCount} gambar gagal diupload.`,
        variant: 'destructive',
      });
    }
  }, [images.length, maxImages, uploadFile, toast]);

  const handleDragStart = useCallback((event: any) => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update main image status - first image is always main
        newItems.forEach((item, index) => {
          item.isMain = index === 0;
        });

        return newItems;
      });
    }

    // Set dragging to false immediately
    setIsDragging(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: undefined, // Accept all files, we'll validate manually
    multiple: true,
    noClick: false,
    noKeyboard: false,
    maxSize: 10 * 1024 * 1024, // 10MB per file
  });

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer transition-colors group
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-center text-sm">
              {isDragActive
                ? 'Jatuhkan gambar di sini...'
                : `Seret & jatuhkan gambar, atau klik untuk memilih (max ${maxImages} gambar)`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length}/{maxImages} gambar • Format: JPEG, PNG, GIF • Max: 10MB per gambar
            </p>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  onDelete={handleDeleteImage}
                  isMain={index === 0}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Status */}
      {uploadingCount > 0 && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader className="animate-spin h-4 w-4" />
          Mengupload {uploadingCount} gambar...
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Belum ada gambar. Upload gambar untuk memulai.
        </p>
      )}
    </div>
  );
}
