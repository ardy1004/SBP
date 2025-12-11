const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testImageUpload() {
  console.log('🖼️ Testing image upload functionality...');

  try {
    // Test 1: Check if blog-images bucket exists
    console.log('📦 Checking blog-images bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'blog-images');
    console.log(bucketExists ? '✅ blog-images bucket exists' : '❌ blog-images bucket missing');

    if (!bucketExists) {
      console.log('💡 Please create the bucket manually in Supabase Dashboard');
      return;
    }

    // Test 2: Create a simple test image (1x1 pixel PNG)
    console.log('🎨 Creating test image...');
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    // Fill with a color
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(0, 0, 100, 100);

    // Convert to blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      console.error('❌ Failed to create test image blob');
      return;
    }

    const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
    console.log('✅ Test image created, size:', testFile.size, 'bytes');

    // Test 3: Upload the image
    console.log('📤 Uploading test image...');
    const fileName = `test/test-image-${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('❌ Upload failed:', error);
      return;
    }

    console.log('✅ Upload successful:', data);

    // Test 4: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    console.log('🌐 Public URL:', publicUrl);

    // Test 5: Verify the URL works (basic check)
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      console.log(response.ok ? '✅ Public URL accessible' : '❌ Public URL not accessible');
    } catch (fetchError) {
      console.warn('⚠️ Could not verify public URL:', fetchError.message);
    }

    // Cleanup: Delete test file
    console.log('🧹 Cleaning up test file...');
    await supabase.storage
      .from('blog-images')
      .remove([fileName]);

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('🎯 Test failed:', error);
  }
}

// Note: This needs to run in a browser environment for canvas operations
console.log('⚠️ This test needs to run in a browser environment for canvas operations');
console.log('💡 Copy this function to browser console or create a test page');

if (typeof window !== 'undefined') {
  testImageUpload();
} else {
  console.log('❌ Not running in browser environment');
}