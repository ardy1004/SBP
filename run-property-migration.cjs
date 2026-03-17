const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing - use service role key for admin operations
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🛠️ Running migration: Adding property extension columns');

  // Columns that exist in the base properties table
  const baseColumns = [
    'id', 'kode_listing', 'judul_properti', 'deskripsi', 'jenis_properti',
    'luas_tanah', 'luas_bangunan', 'kamar_tidur', 'kamar_mandi', 'legalitas',
    'harga_properti', 'provinsi', 'kabupaten', 'alamat_lengkaps', 'image_url',
    'image_url1', 'image_url2', 'image_url3', 'image_url4', 'is_premium',
    'is_featured', 'is_hot', 'is_sold', 'price_old', 'is_property_pilihan',
    'owner_contact', 'status', 'created_at', 'updated_at'
  ];

  // Additional columns from migrations
  const alterStatements = [
    // From property_submission_extension.sql
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS source_input TEXT DEFAULT \'ADMIN\'',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT \'APPROVED\'',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS agreement_status TEXT DEFAULT \'none\'',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS lebar_depan NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS jumlah_lantai INTEGER',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS jenis_kost TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS jenis_hotel TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS no_unit TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS ruang_penjaga BOOLEAN DEFAULT false',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS token_listrik_perkamar BOOLEAN DEFAULT false',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS kelengkapan TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS status_legalitas TEXT DEFAULT \'On Hand\'',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS bank_terkait TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS outstanding_bank NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS dekat_sungai BOOLEAN DEFAULT false',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS jarak_sungai NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS dekat_makam BOOLEAN DEFAULT false',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS jarak_makam NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS dekat_sutet BOOLEAN DEFAULT false',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS jarak_sutet NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS lebar_jalan NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS alasan_dijual TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS harga_sewa_tahunan NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS harga_nego BOOLEAN DEFAULT true',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS harga_nett BOOLEAN DEFAULT false',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS income_per_bulan NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS biaya_pengeluaran_per_bulan NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS harga_sewa_kamar NUMERIC',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS google_maps_link TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS shgb_expired_at DATE',
    // From 0002_add_seo_fields.sql
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS meta_title TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS meta_description TEXT',
    // From 0001_majestic_fat_cobra.sql
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url5 TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url6 TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url7 TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url8 TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url9 TEXT',
    // From dashboard_property_submission_system.sql
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS submission_source TEXT DEFAULT \'admin\'',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS sharelink_token_id TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_identity_id TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS marketing_agreement_id TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_pending_approval BOOLEAN DEFAULT false',
    // Additional
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS harga_per_meter BOOLEAN DEFAULT false',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS contract_expired_at TIMESTAMPTZ',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_details_json JSONB DEFAULT \'{}\'::jsonb',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS reject_reason TEXT',
    'ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.owner_profiles(id)'
  ];

  for (const sql of alterStatements) {
    console.log('📄 Executing:', sql);
    try {
      const { error } = await supabase.rpc('exec', { query: sql });

      if (error) {
        console.error('❌ Error executing:', sql, error.message);
      } else {
        console.log('✅ Success:', sql);
      }
    } catch (error) {
      console.error('🎯 Exception executing:', sql, error.message);
    }
  }

  console.log('🏁 Migration process completed');
}

runMigration();
