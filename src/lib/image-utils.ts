/**
 * Image Utilities
 * Konversi gambar ke WebP di sisi client sebelum upload
 */

/**
 * Konversi File gambar ke WebP format
 * @param file - File gambar (JPEG, PNG, WebP)
 * @param quality - Kualitas kompresi (0-1), default 0.85
 * @returns Promise<File> - File dalam format WebP
 */
export async function convertToWebp(file: File, quality: number = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    // Jika sudah webp, return langsung
    if (file.type === "image/webp") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Buat canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw image ke canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal membuat canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);

        // Convert ke WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal mengkonversi ke WebP"));
              return;
            }

            // Buat nama file baru dengan ekstensi .webp
            const originalName = file.name.replace(/\.[^.]+$/, "");
            const webpFile = new File([blob], `${originalName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert multiple files to WebP
 * @param files - Array of File objects
 * @param quality - Quality (0-1), default 0.85
 * @returns Promise<File[]> - Array of WebP files
 */
export async function convertMultipleToWebp(
  files: File[],
  quality: number = 0.85
): Promise<File[]> {
  const results: File[] = [];
  for (const file of files) {
    try {
      const webpFile = await convertToWebp(file, quality);
      results.push(webpFile);
    } catch (err) {
      console.warn(`Gagal konversi ${file.name} ke WebP, gunakan asli:`, err);
      results.push(file); // Fallback ke file asli
    }
  }
  return results;
}
