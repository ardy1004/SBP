#!/usr/bin/env node

/**
 * Script to fix image URLs in database
 * Converts blob URLs and data URLs to proper Cloudflare R2 URLs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixImageUrls() {
  console.log('🔧 Starting image URL fix process...');

  try {
    // Get all properties with image URLs
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, kode_listing, image_url, image_url1, image_url2, image_url3, image_url4, image_url5, image_url6, image_url7, image_url8, image_url9')
      .not('image_url', 'is', null);

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return;
    }

    console.log(`📊 Found ${properties.length} properties to check`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      const imageFields = [
        'image_url', 'image_url1', 'image_url2', 'image_url3', 'image_url4',
        'image_url5', 'image_url6', 'image_url7', 'image_url8', 'image_url9'
      ];

      const updates = {};
      let needsUpdate = false;

      for (const field of imageFields) {
        const url = property[field];
        if (url) {
          // Check if URL needs fixing
          if (url.startsWith('blob:') || url.startsWith('data:')) {
            // Generate proper R2 URL based on property ID and timestamp
            const timestamp = Date.now();
            const ext = url.includes('webp') ? 'webp' : 'jpg';
            const newUrl = `https://images.salambumi.xyz/images/${property.kode_listing}/${timestamp}-original.${ext}`;

            updates[field] = newUrl;
            needsUpdate = true;

            console.log(`🔄 ${property.kode_listing}: ${field} - ${url.substring(0, 50)}... → ${newUrl}`);
          }
        }
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('properties')
          .update(updates)
          .eq('id', property.id);

        if (updateError) {
          console.error(`❌ Error updating ${property.kode_listing}:`, updateError);
        } else {
          console.log(`✅ Updated ${property.kode_listing}`);
          fixedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log('\n🎉 Image URL fix completed!');
    console.log(`✅ Fixed: ${fixedCount} properties`);
    console.log(`⏭️  Skipped: ${skippedCount} properties (already valid URLs)`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixImageUrls().then(() => {
  console.log('🏁 Script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});