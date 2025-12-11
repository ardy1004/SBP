const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing - use service role key for admin operations
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupBlogStorage() {
  console.log('🛠️ Setting up blog-images storage bucket...');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'blog-images');

    if (bucketExists) {
      console.log('✅ blog-images bucket already exists');
    } else {
      // Create bucket
      const { data, error: createError } = await supabase.storage.createBucket('blog-images', {
        public: true, // Allow public access to images
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }

      console.log('✅ blog-images bucket created successfully');
    }

    // Set up RLS policies for the bucket
    console.log('🔒 Setting up storage policies...');

    // Policy 1: Allow authenticated users to upload
    const { error: uploadPolicyError } = await supabase.rpc('exec', {
      query: `
        INSERT INTO storage.policies (name, bucket_id, definition)
        SELECT 'Allow authenticated uploads', id, 'bucket_id = ''blog-images'' AND auth.role() = ''authenticated'''
        FROM storage.buckets
        WHERE name = 'blog-images'
        ON CONFLICT (name, bucket_id) DO NOTHING;
      `
    });

    if (uploadPolicyError) {
      console.warn('⚠️ Upload policy setup failed (might already exist):', uploadPolicyError);
    } else {
      console.log('✅ Upload policy created');
    }

    // Policy 2: Allow public read access
    const { error: readPolicyError } = await supabase.rpc('exec', {
      query: `
        INSERT INTO storage.policies (name, bucket_id, definition)
        SELECT 'Allow public read access', id, 'bucket_id = ''blog-images'''
        FROM storage.buckets
        WHERE name = 'blog-images'
        ON CONFLICT (name, bucket_id) DO NOTHING;
      `
    });

    if (readPolicyError) {
      console.warn('⚠️ Read policy setup failed (might already exist):', readPolicyError);
    } else {
      console.log('✅ Read policy created');
    }

    // Test upload with a small test file
    console.log('🧪 Testing upload functionality...');

    // Create a small test canvas image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, 100, 100);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('❌ Failed to create test blob');
        return;
      }

      const testFile = new File([blob], 'test.png', { type: 'image/png' });

      try {
        const { data, error } = await supabase.storage
          .from('blog-images')
          .upload('test/test-image.png', testFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('❌ Test upload failed:', error);
        } else {
          console.log('✅ Test upload successful:', data);

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl('test/test-image.png');

          console.log('📸 Public URL:', publicUrl);

          // Clean up test file
          await supabase.storage
            .from('blog-images')
            .remove(['test/test-image.png']);
        }
      } catch (error) {
        console.error('❌ Test upload exception:', error);
      }

      console.log('🎉 Blog storage setup complete!');
    });

  } catch (error) {
    console.error('🎯 Setup failed:', error);
  }
}

// Note: This script needs to run in a browser environment for canvas operations
// For now, let's just set up the bucket and policies
async function setupBucketOnly() {
  console.log('🛠️ Setting up blog-images bucket (policies only)...');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      console.log('💡 You may need to create the bucket manually in Supabase Dashboard');
      console.log('   Go to: Storage → Create Bucket → Name: blog-images → Public: ON');
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'blog-images');

    if (!bucketExists) {
      console.log('⚠️ blog-images bucket does not exist');
      console.log('💡 Please create it manually in Supabase Dashboard:');
      console.log('   Storage → Create Bucket → Name: blog-images → Public: ON');
      return;
    }

    console.log('✅ blog-images bucket exists');

    // Try to upload a test file to verify permissions
    console.log('🧪 Testing storage permissions...');

    // Create a simple test blob
    const testData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    const testBlob = new Blob([testData], { type: 'image/png' });
    const testFile = new File([testBlob], 'test.png', { type: 'image/png' });

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload('test/permissions-test.png', testFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('❌ Storage permissions test failed:', error);
      console.log('💡 You may need to configure RLS policies manually in Supabase Dashboard');
      console.log('   Storage → blog-images → Policies → Add policy for authenticated users');
    } else {
      console.log('✅ Storage permissions working');

      // Clean up test file
      await supabase.storage
        .from('blog-images')
        .remove(['test/permissions-test.png']);
    }

  } catch (error) {
    console.error('🎯 Setup failed:', error);
  }
}

setupBucketOnly();