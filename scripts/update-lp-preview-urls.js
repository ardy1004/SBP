import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping of LP IDs to correct preview URLs based on folder structure
const PREVIEW_URL_MAPPING = {
  'LP-1': '/Landing Page/LP-1/Bumi-Properties/client/public/opengraph.jpg',
  'LP-2': '/Landing Page/LP-2/Salam-Bumi-Property/client/public/opengraph.jpg',
  'LP-3': '/Landing Page/LP-3/Vite-Landingpage/client/public/opengraph.jpg',
  'LP-4': '/Landing Page/LP-4/Salam-Bumi-Property/client/public/opengraph.jpg',
  'LP-5': '/Landing Page/LP-5/Landing-Page/client/public/opengraph.jpg',
  'LP-6': '/Landing Page/LP-6/Salam-Bumi-Property-2/client/public/opengraph.jpg',
  'LP-7': '/Landing Page/LP-7/Salam-Bumi-Property/client/public/opengraph.jpg',
  'LP-8': '/Landing Page/LP-8/Salam-Bumi-Property-1/client/public/opengraph.jpg',
  'LP-9': '/Landing Page/LP-9/public/luxury-modern-house-yogyakarta-indonesia-aerial-vi.jpg'
};

async function updatePreviewUrls() {
  console.log('🔄 Updating landing page preview URLs...');

  try {
    // Get all landing pages
    const { data: landingPages, error: fetchError } = await supabase
      .from('landing_pages_master')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching landing pages:', fetchError);
      return;
    }

    console.log(`📋 Found ${landingPages.length} landing pages`);

    // Update each landing page with correct preview URL
    for (const lp of landingPages) {
      const correctPreviewUrl = PREVIEW_URL_MAPPING[lp.lp_id];

      if (correctPreviewUrl && lp.preview_url !== correctPreviewUrl) {
        console.log(`🔧 Updating ${lp.lp_id}: ${lp.preview_url} → ${correctPreviewUrl}`);

        const { error: updateError } = await supabase
          .from('landing_pages_master')
          .update({
            preview_url: correctPreviewUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', lp.id);

        if (updateError) {
          console.error(`❌ Error updating ${lp.lp_id}:`, updateError);
        } else {
          console.log(`✅ Successfully updated ${lp.lp_id}`);
        }
      } else if (!correctPreviewUrl) {
        console.warn(`⚠️  No preview URL mapping found for ${lp.lp_id}`);
      } else {
        console.log(`⏭️  ${lp.lp_id} already has correct preview URL`);
      }
    }

    console.log('🎉 Preview URL update completed!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the update
updatePreviewUrls();