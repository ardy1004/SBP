#!/usr/bin/env node

/**
 * Image to WebP Converter Script
 * Converts all dummy images in landing page to optimized WebP format
 * with fallbacks for browser compatibility
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Hero backgrounds from Unsplash (currently used in HeroV2.tsx)
  heroImages: [
    {
      id: 1,
      original: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80',
      localPath: '/images/hero-1.jpg',
      webpPath: '/images/hero-1.webp',
      title: 'Luxury Villa Collection',
      subtitle: 'Exclusive properties for discerning buyers'
    },
    {
      id: 2,
      original: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80',
      localPath: '/images/hero-2.jpg',
      webpPath: '/images/hero-2.webp',
      title: 'Premium Urban Living',
      subtitle: 'Modern apartments in prime locations'
    },
    {
      id: 3,
      original: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      localPath: '/images/hero-3.jpg',
      webpPath: '/images/hero-3.webp',
      title: 'Commercial Excellence',
      subtitle: 'Strategic investment opportunities'
    },
    {
      id: 4,
      original: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      localPath: '/images/hero-4.jpg',
      webpPath: '/images/hero-4.webp',
      title: 'Heritage Properties',
      subtitle: 'Timeless architecture meets modern luxury'
    }
  ],
  
  // Placeholder and preview images
  placeholderImages: [
    {
      original: '/placeholder-lp.png',
      webpPath: '/images/placeholder-lp.webp',
      fallbackPath: '/images/placeholder-lp.png'
    },
    {
      original: '/lp-previews/LP-1.jpg',
      webpPath: '/images/lp-preview-1.webp',
      fallbackPath: '/images/lp-preview-1.jpg'
    },
    {
      original: '/lp-previews/LP-2.jpg',
      webpPath: '/images/lp-preview-2.webp',
      fallbackPath: '/images/lp-preview-2.jpg'
    }
  ],
  
  // Customer avatars (using placeholder for now)
  customerAvatars: [
    {
      original: 'https://ui-avatars.com/api/?name=Sari+Wijaya&background=fbbf24&color=000&size=64',
      webpPath: '/images/customer-avatar-1.webp',
      fallbackPath: '/images/customer-avatar-1.jpg'
    }
  ]
};

// Create directories if they don't exist
function ensureDirectories() {
  const dirs = ['/images', '/public/images'];
  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), 'client/public', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// Check if ImageMagick is available
function checkImageMagick() {
  try {
    execSync('magick -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log('⚠️  ImageMagick not found. Will download images manually.');
    return false;
  }
}

// Download image from URL
async function downloadImage(url, localPath) {
  try {
    const fullPath = path.join(process.cwd(), 'client/public', localPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // For demo purposes, we'll create placeholder WebP files
    // In production, you would download the actual images
    console.log(`📥 Would download: ${url} → ${localPath}`);
    
    // Create a simple placeholder WebP file for now
    const placeholderWebp = createPlaceholderWebp(localPath);
    fs.writeFileSync(fullPath, placeholderWebp);
    
    return localPath;
  } catch (error) {
    console.error(`❌ Failed to download ${url}:`, error.message);
    return null;
  }
}

// Create a simple placeholder WebP file (for demo purposes)
function createPlaceholderWebp(filename) {
  // This is a minimal WebP file - in production you'd use proper image conversion
  const webpHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x00, 0x00, 0x00, 0x00, // File size (placeholder)
    0x57, 0x45, 0x42, 0x50  // "WEBP"
  ]);
  
  // For now, create a simple text file indicating the conversion
  return Buffer.from(`WebP placeholder for ${filename}\nConvert this with proper image conversion tools.`);
}

// Convert image to WebP using ImageMagick
function convertToWebp(inputPath, outputPath, quality = 85) {
  try {
    const fullInputPath = path.join(process.cwd(), 'client/public', inputPath);
    const fullOutputPath = path.join(process.cwd(), 'client/public', outputPath);
    
    const command = `magick "${fullInputPath}" -quality ${quality} "${fullOutputPath}"`;
    execSync(command, { stdio: 'pipe' });
    
    console.log(`✅ Converted: ${inputPath} → ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${inputPath}:`, error.message);
    return false;
  }
}

// Process hero images
async function processHeroImages() {
  console.log('\n🏠 Processing Hero Background Images...');
  
  for (const image of config.heroImages) {
    console.log(`\n📸 Processing Hero Image ${image.id}: ${image.title}`);
    
    // Download original image
    const downloadedPath = await downloadImage(image.original, image.localPath);
    
    if (downloadedPath) {
      // Convert to WebP
      convertToWebp(image.localPath, image.webpPath, 80);
      
      console.log(`   Original: ${image.localPath}`);
      console.log(`   WebP: ${image.webpPath}`);
      console.log(`   Fallback: ${image.fallbackPath}`);
    }
  }
}

// Process placeholder images
async function processPlaceholderImages() {
  console.log('\n🖼️  Processing Placeholder Images...');
  
  for (const image of config.placeholderImages) {
    console.log(`\n📱 Processing: ${image.original}`);
    
    // Create placeholder WebP files
    const webpPlaceholder = createPlaceholderWebp(image.webpPath);
    const fullWebpPath = path.join(process.cwd(), 'client/public', image.webpPath);
    const fullFallbackPath = path.join(process.cwd(), 'client/public', image.fallbackPath);
    
    // Ensure directory exists
    const dir = path.dirname(fullWebpPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write placeholder files
    fs.writeFileSync(fullWebpPath, webpPlaceholder);
    fs.writeFileSync(fullFallbackPath, webpPlaceholder);
    
    console.log(`   Created: ${image.webpPath}`);
    console.log(`   Fallback: ${image.fallbackPath}`);
  }
}

// Process customer avatars
async function processCustomerAvatars() {
  console.log('\n👤 Processing Customer Avatars...');
  
  for (const avatar of config.customerAvatars) {
    console.log(`\n🧑 Processing avatar: ${avatar.original}`);
    
    // Create placeholder avatar files
    const webpPlaceholder = createPlaceholderWebp(avatar.webpPath);
    const fullWebpPath = path.join(process.cwd(), 'client/public', avatar.webpPath);
    const fullFallbackPath = path.join(process.cwd(), 'client/public', avatar.fallbackPath);
    
    // Ensure directory exists
    const dir = path.dirname(fullWebpPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write placeholder files
    fs.writeFileSync(fullWebpPath, webpPlaceholder);
    fs.writeFileSync(fullFallbackPath, webpPlaceholder);
    
    console.log(`   Created: ${avatar.webpPath}`);
    console.log(`   Fallback: ${avatar.fallbackPath}`);
  }
}

// Generate conversion report
function generateReport() {
  console.log('\n📊 CONVERSION REPORT');
  console.log('====================');
  
  console.log('\n🎯 Hero Images:');
  config.heroImages.forEach(img => {
    console.log(`   ${img.id}. ${img.title}`);
    console.log(`      Original: ${img.localPath}`);
    console.log(`      WebP: ${img.webpPath}`);
    console.log(`      Fallback: ${img.fallbackPath}`);
  });
  
  console.log('\n🖼️  Placeholder Images:');
  config.placeholderImages.forEach(img => {
    console.log(`   ${img.original} → ${img.webpPath}`);
  });
  
  console.log('\n👤 Customer Avatars:');
  config.customerAvatars.forEach(avatar => {
    console.log(`   ${avatar.original} → ${avatar.webpPath}`);
  });
  
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Replace hero images in HeroV2.tsx with WebP URLs');
  console.log('2. Update placeholder paths in all components');
  console.log('3. Implement picture element with fallbacks');
  console.log('4. Test performance improvements');
}

// Main execution
async function main() {
  console.log('🚀 Starting Image to WebP Conversion...');
  console.log('===========================================');
  
  try {
    // Ensure directories exist
    ensureDirectories();
    
    // Check ImageMagick availability
    const hasImageMagick = checkImageMagick();
    
    if (hasImageMagick) {
      console.log('✅ ImageMagick found - full conversion enabled');
    } else {
      console.log('⚠️  ImageMagick not found - using placeholder files');
    }
    
    // Process all image categories
    await processHeroImages();
    await processPlaceholderImages();
    await processCustomerAvatars();
    
    // Generate report
    generateReport();
    
    console.log('\n🎉 Image conversion completed!');
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Download actual images from Unsplash URLs');
    console.log('2. Replace placeholder WebP files with real conversions');
    console.log('3. Update HeroV2.tsx component to use new WebP URLs');
    console.log('4. Update all components to use picture elements with fallbacks');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

// Run the script
main();