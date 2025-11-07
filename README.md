# Express.js Image Upload with WebP Conversion

Fitur upload gambar Express.js/TypeScript yang secara otomatis mengkonversi semua gambar yang diupload ke format WebP dengan optimasi menggunakan Sharp library.

## Fitur

- Upload gambar dengan validasi
- Konversi otomatis ke format WebP
- Optimasi gambar menggunakan Sharp
- Mendukung format JPEG, PNG, dan GIF
- Upload multiple images (maksimal 5 gambar)
- File WebP disimpan di direktori `uploads/`
- API endpoint dengan authentication
- Static file serving untuk gambar

## Instalasi

1. Tambahkan dependencies ke package.json:
```json
"dependencies": {
    "sharp": "^0.33.5"
},
"devDependencies": {
    "@types/sharp": "^0.31.0"
}
```

2. Install dependencies:
```bash
npm install
```

## Konfigurasi

Konfigurasi Sharp sudah diatur dalam `server/imageUtils.ts`:

- **Max Width/Height**: 1920x1080px (dengan aspect ratio preservation)
- **Quality**: 80%
- **Format**: WebP dengan effort level 6
- **Max File Size**: 5MB per file

## Penggunaan

### 1. Image Processor Utility

```typescript
import { ImageProcessor } from './server/imageUtils';

// Process single image
const processedImage = await ImageProcessor.processImage(
  buffer,
  originalName,
  mimeType
);

// Process multiple images
const processedImages = await ImageProcessor.processMultipleImages(files);

// Delete image
await ImageProcessor.deleteImage(filename);
```

### 2. API Endpoints

#### Upload Multiple Images
```http
POST /api/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: images[] (up to 5 files)
```

#### Upload Single Image
```http
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: image (single file)
```

#### Delete Image
```http
DELETE /api/upload/images/:filename
Authorization: Bearer <token>
```

#### Access Images
```http
GET /uploads/:filename
```

### 3. Response Format

#### Success Response (Multiple Images)
```json
{
  "success": true,
  "message": "Successfully processed 3 image(s)",
  "images": [
    {
      "originalName": "house.jpg",
      "webpPath": "uploads/uuid.webp",
      "webpUrl": "/uploads/uuid.webp",
      "filename": "uuid.webp",
      "size": 245760
    }
  ]
}
```

#### Success Response (Single Image)
```json
{
  "success": true,
  "message": "Image uploaded and converted to WebP successfully",
  "image": {
    "originalName": "house.jpg",
    "webpPath": "uploads/uuid.webp",
    "webpUrl": "/uploads/uuid.webp",
    "filename": "uuid.webp",
    "size": 245760
  }
}
```

### 4. Frontend Usage Example

```javascript
// Upload multiple images
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const response = await fetch('/api/upload/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('Images uploaded:', result.images);
}
```

```javascript
// Upload single image
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('Image uploaded:', result.image);
}
```

## Database Schema

Schema database sudah diperbarui untuk mendukung lebih banyak gambar:

```typescript
// Properties table now supports up to 10 images
imageUrl: text("image_url").notNull(),
imageUrl1: text("image_url1"),
imageUrl2: text("image_url2"),
// ... up to imageUrl9
imageUrl9: text("image_url9"),
```

## File Structure

```
server/
├── imageUtils.ts      # Image processing utility
├── routes.ts          # API routes with image endpoints
└── ...

uploads/               # Generated upload directory
├── uuid1.webp
├── uuid2.webp
└── ...
```

## Persyaratan Sistem

- Node.js 18+
- Sharp library (sudah included)
- File system permissions untuk direktori `uploads/`

## Keamanan

- Semua endpoint image upload memerlukan authentication (Bearer token)
- Validasi MIME type (hanya JPEG, PNG, GIF)
- Validasi ukuran file (maksimal 5MB)
- File naming menggunakan UUID untuk menghindari konflik

## Optimasi

- **Resize**: Gambar di-resize ke maksimal 1920x1080px
- **Compression**: WebP dengan quality 80%
- **Format**: Konversi ke WebP untuk ukuran file lebih kecil
- **Cleanup**: File temporary otomatis dihapus

## Migrasi dari Laravel

Implementasi ini menggantikan implementasi Laravel sebelumnya dengan:

1. ❌ Menghapus semua file Laravel (`app/`, `config/`, `routes/`, dll.)
2. ✅ Menggunakan Sharp sebagai pengganti spatie/laravel-image-optimizer
3. ✅ Express.js routes sebagai pengganti Laravel routes
4. ✅ TypeScript sebagai pengganti PHP
5. ✅ Drizzle ORM sebagai pengganti Eloquent

## Testing

Untuk test upload gambar:

1. Pastikan server berjalan: `npm run dev`
2. Gunakan admin token untuk authentication
3. Upload via endpoint `/api/upload/images` atau `/api/upload/image`
4. Gambar akan tersimpan di direktori `uploads/` sebagai WebP
5. Akses gambar via `/uploads/:filename`