import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedLPContent() {
  console.log('🌱 Seeding LP Content...');

  const lpContent = [
    // Hero Section for LP-1
    {
      lp_template: 'LP-1',
      content_type: 'hero',
      content_data: {
        title: 'Temukan Properti Impian Anda di Yogyakarta',
        subtitle: 'Perfect Property',
        backgroundImage: 'https://images.salambumi.xyz/luxury_modern_villa_exterior_in_yogyakarta_at_twilight.png',
        ctaText: 'Jelajahi Properti',
        ctaLink: '/properties'
      },
      is_active: true
    },

    // Agent Section for LP-1
    {
      lp_template: 'LP-1',
      content_type: 'agent',
      content_data: {
        name: 'Ahmad Rahman',
        title: 'Senior Property Consultant',
        photo: 'https://images.salambumi.xyz/professional_male_agent_portrait.png',
        bio: 'Berpengalaman lebih dari 10 tahun dalam bidang properti Yogyakarta. Telah membantu ratusan klien menemukan properti impian mereka.',
        phone: '+62 812-3456-7890',
        email: 'ahmad@salambumi.com'
      },
      is_active: true
    },

    // Testimonials for LP-1
    {
      lp_template: 'LP-1',
      content_type: 'testimonials',
      content_data: [
        {
          name: 'Sari Wijaya',
          photo: 'https://images.salambumi.xyz/happy_real_estate_client_portrait.png',
          quote: 'Sangat puas dengan pelayanan dari Pak Ahmad. Berhasil menemukan rumah impian dengan harga yang kompetitif.',
          rating: 5
        },
        {
          name: 'Budi Santoso',
          photo: 'https://images.salambumi.xyz/professional_male_agent_smart_casual.png',
          quote: 'Proses jual beli berjalan lancar dan transparan. Recommended untuk yang mencari properti di Yogyakarta.',
          rating: 5
        },
        {
          name: 'Maya Sari',
          photo: 'https://images.salambumi.xyz/professional_female_agent_portrait.png',
          quote: 'Tim yang profesional dan responsif. Terima kasih atas bantuannya menemukan villa yang sempurna.',
          rating: 5
        }
      ],
      is_active: true
    },

    // Properties for LP-1
    {
      lp_template: 'LP-1',
      content_type: 'properties',
      content_data: [
        {
          title: 'Villa Mewah Condongcatur',
          image: 'https://images.salambumi.xyz/luxury_villa_with_pool.png',
          price: 'Rp 2.500.000.000',
          link: '/properti/villa-mewah-condongcatur',
          location: 'Condongcatur, Yogyakarta'
        },
        {
          title: 'Rumah Minimalis Modern',
          image: 'https://images.salambumi.xyz/modern_minimalist_house_exterior_with_garden.png',
          price: 'Rp 850.000.000',
          link: '/properti/rumah-minimalis-modern',
          location: 'Sleman, Yogyakarta'
        },
        {
          title: 'Apartemen Premium',
          image: 'https://images.salambumi.xyz/luxury_apartment_living_room_interior.png',
          price: 'Rp 1.200.000.000',
          link: '/properti/apartemen-premium',
          location: 'Jakarta Selatan'
        },
        {
          title: 'Ruko Strategis Malioboro',
          image: 'https://images.salambumi.xyz/modern_commercial_office_building.png',
          price: 'Rp 3.500.000.000',
          link: '/properti/ruko-strategis-malioboro',
          location: 'Malioboro, Yogyakarta'
        },
        {
          title: 'Tanah Kavling Siap Bangun',
          image: 'https://images.salambumi.xyz/modern_tropical_house_minimalist.png',
          price: 'Rp 450.000.000',
          link: '/properti/tanah-kavling-siap-bangun',
          location: 'Bantul, Yogyakarta'
        },
        {
          title: 'Rumah Cluster Elite',
          image: 'https://images.salambumi.xyz/luxury_modern_house_exterior.png',
          price: 'Rp 1.800.000.000',
          link: '/properti/rumah-cluster-elite',
          location: 'Depok, Yogyakarta'
        }
      ],
      is_active: true
    }
  ];

  try {
    // Clear existing content for LP-1
    await supabase
      .from('lp_content_configs')
      .delete()
      .eq('lp_template', 'LP-1');

    // Insert new content
    const { data, error } = await supabase
      .from('lp_content_configs')
      .insert(lpContent)
      .select();

    if (error) {
      console.error('❌ Error seeding LP content:', error);
      return;
    }

    console.log('✅ Successfully seeded LP content for LP-1');
    console.log(`📊 Inserted ${data.length} content records`);

    // Verify the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('lp_content_configs')
      .select('*')
      .eq('lp_template', 'LP-1');

    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
      return;
    }

    console.log('🔍 Verification:');
    verifyData.forEach(item => {
      console.log(`  - ${item.content_type}: ${JSON.stringify(item.content_data).substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the seeding
seedLPContent().then(() => {
  console.log('🎉 Seeding completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});