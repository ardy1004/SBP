import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface ProcessedImage {
  originalName: string;
  webpPath: string;
  webpUrl: string;
  filename: string;
  size: number;
}

export class ImageProcessor {
  private static readonly UPLOAD_DIR = 'uploads';
  private static readonly MAX_WIDTH = 1920;
  private static readonly MAX_HEIGHT = 1080;
  private static readonly QUALITY = 80;

  /**
   * Process uploaded image: convert to WebP and optimize
   */
  static async processImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<ProcessedImage> {
    try {
      // Validate image type
      if (!this.isValidImageType(mimeType)) {
        throw new Error('Invalid image type. Only JPEG, PNG, and GIF are supported.');
      }

      // Generate unique filename
      const filename = `${randomUUID()}.webp`;
      const webpPath = path.join(this.UPLOAD_DIR, filename);

      // Ensure upload directory exists
      await this.ensureUploadDir();

      // Process image with Sharp
      await sharp(buffer)
        .resize(this.MAX_WIDTH, this.MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: this.QUALITY,
          effort: 6 // Higher effort for better compression
        })
        .toFile(webpPath);

      // Get file stats
      const stats = await fs.stat(webpPath);

      return {
        originalName,
        webpPath,
        webpUrl: `/uploads/${filename}`,
        filename,
        size: stats.size
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Process multiple images
   */
  static async processMultipleImages(
    files: Express.Multer.File[]
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];

    for (const file of files) {
      try {
        const processed = await this.processImage(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        results.push(processed);
      } catch (error) {
        console.error(`Failed to process ${file.originalname}:`, error);
        // Continue processing other images
      }
    }

    return results;
  }

  /**
   * Delete image file
   */
  static async deleteImage(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.UPLOAD_DIR, filename);
      console.log('Attempting to delete file:', filePath);

      // Check if file exists before attempting to delete
      try {
        await fs.access(filePath);
        console.log('File exists, proceeding with deletion');
      } catch {
        console.log('File does not exist, skipping deletion');
        return; // File doesn't exist, nothing to delete
      }

      await fs.unlink(filePath);
      console.log('File deleted successfully:', filePath);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for cleanup operations
    }
  }

  /**
   * Validate image MIME type
   */
  private static isValidImageType(mimeType: string): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(mimeType);
  }

  /**
   * Ensure upload directory exists
   */
  private static async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Get image metadata
   */
  static async getImageMetadata(filepath: string): Promise<sharp.Metadata> {
    return await sharp(filepath).metadata();
  }

  /**
   * Validate file size (max 5MB)
   */
  static validateFileSize(size: number): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return size <= maxSize;
  }
}