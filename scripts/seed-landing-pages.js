import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Landing pages data
const LANDING_PAGES_DATA = [
  {
    lp_id: 'LP-1',
    name: 'Landing Page 1',
    description: 'Template klasik dengan fokus pada properti premium',
    preview_url: '/Landing Page/LP-1/Bumi-Properties/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-1',
    is_active: true,
  },
  {
    lp_id: 'LP-2',
    name: 'Landing Page 2',
    description: 'Template modern dengan desain minimalis',
    preview_url: '/Landing Page/LP-2/Salam-Bumi-Property/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-2',
    is_active: true,
  },
  {
    lp_id: 'LP-3',
    name: 'Landing Page 3',
    description: 'Template elegan dengan fokus visual',
    preview_url: '/Landing Page/LP-3/Vite-Landingpage/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-3',
    is_active: true,
  },
  {
    lp_id: 'LP-4',
    name: 'Landing Page 4',
    description: 'Template dinamis dengan animasi smooth',
    preview_url: '/Landing Page/LP-4/Salam-Bumi-Property/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-4',
    is_active: true,
  },
  {
    lp_id: 'LP-5',
    name: 'Landing Page 5',
    description: 'Template profesional untuk bisnis properti',
    preview_url: '/Landing Page/LP-5/Landing-Page/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-5',
    is_active: true,
  },
  {
    lp_id: 'LP-6',
    name: 'Landing Page 6',
    description: 'Template kreatif dengan layout unik',
    preview_url: '/Landing Page/LP-6/Salam-Bumi-Property-2/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-6',
    is_active: true,
  },
  {
    lp_id: 'LP-7',
    name: 'Landing Page 7',
    description: 'Template responsif dengan performa tinggi',
    preview_url: '/Landing Page/LP-7/Salam-Bumi-Property/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-7',
    is_active: true,
  },
  {
    lp_id: 'LP-8',
    name: 'Landing Page 8',
    description: 'Template interaktif dengan fitur advanced',
    preview_url: '/Landing Page/LP-8/Salam-Bumi-Property-1/client/public/opengraph.jpg',
    folder_path: '/Landing Page/LP-8',
    is_active: true,
  },
  {
    lp_id: 'LP-9',
    name: 'Landing Page 9',
    description: 'Template premium dengan desain eksklusif',
    preview_url: '/Landing Page/LP-9/public/luxury-modern-house-yogyakarta-indonesia-aerial-vi.jpg',
    folder_path: '/Landing Page/LP-9',
    is_active: true,
  },
];

async function seedLandingPages() {
  console.log('🌱 Seeding landing pages data...');

  try {
    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from('landing_pages_master')
      .select('lp_id')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing data:', checkError);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log('ℹ️  Landing pages data already exists, skipping seed');
      return;
    }

    // Insert landing pages data
    const { data, error } = await supabase
      .from('landing_pages_master')
      .insert(LANDING_PAGES_DATA)
      .select();

    if (error) {
      console.error('❌ Error seeding landing pages:', error);
      return;
    }

    console.log(`✅ Successfully seeded ${data.length} landing pages`);

    // Also seed default config
    const { error: configError } = await supabase
      .from('landing_page_configs')
      .upsert({
        active_lp: 'LP-1',
        updated_at: new Date().toISOString(),
      });

    if (configError) {
      console.error('❌ Error seeding config:', configError);
    } else {
      console.log('✅ Successfully seeded default config');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the seed
seedLandingPages();