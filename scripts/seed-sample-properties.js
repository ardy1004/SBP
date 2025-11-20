#!/usr/bin/env node

/**
 * Seed Sample Properties for Salam Bumi Property Demo
 * Adds sample properties for demonstration purposes
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class PropertySeeder {
  constructor() {
    this.supabase = null
    this.init()
  }

  init() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  async seedProperties() {
    console.log('🌱 Seeding sample properties...')

    const sampleProperties = [
      {
        kodeListing: 'K9.01',
        judulProperti: 'Kost Modern 2 Lantai Dekat UGM - Fasilitas Lengkap',
        deskripsi: '🏢 Kost eksklusif 2 lantai strategis dekat UGM dengan fasilitas lengkap. Cocok untuk mahasiswa dan pekerja profesional yang mencari hunian nyaman dan aman.\n\nFasilitas:\n• Kamar mandi dalam\n• AC\n• WiFi cepat\n• Dapur bersama\n• Laundry\n• Parkir motor\n• 24 jam security\n\nLokasi sangat strategis, hanya 5 menit ke UGM dan 10 menit ke pusat kota Yogyakarta.',
        jenisProperti: 'kost',
        luasTanah: 200,
        luasBangunan: 150,
        kamarTidur: 1,
        kamarMandi: 1,
        legalitas: 'SHM',
        hargaProperti: 800000,
        provinsi: 'Daerah Istimewa Yogyakarta',
        kabupaten: 'Sleman',
        alamatLengkap: 'Jl. Kaliurang KM 5, Caturtunggal, Kec. Depok, Kabupaten Sleman, Yogyakarta',
        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
        imageUrl1: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        imageUrl2: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        isPremium: true,
        isFeatured: true,
        isHot: true,
        status: 'disewakan',
        ownerContact: '+6281234567890'
      },
      {
        kodeListing: 'R1.01',
        judulProperti: 'Rumah Minimalis 2 Lantai di Perumahan Elite',
        deskripsi: '🏠 Rumah minimalis modern 2 lantai di perumahan elite dengan konsep open space. Desain interior yang fungsional dan estetik tinggi.\n\nSpesifikasi:\n• LT: 120m² LB: 180m²\n• 3 kamar tidur\n• 2 kamar mandi\n• Ruang tamu\n• Dapur modern\n• Carport\n• Taman kecil\n\nLingkungan aman, bersih, dan tenang. Cocok untuk keluarga muda yang menginginkan hunian nyaman.',
        jenisProperti: 'rumah',
        luasTanah: 120,
        luasBangunan: 180,
        kamarTidur: 3,
        kamarMandi: 2,
        legalitas: 'SHM',
        hargaProperti: 450000000,
        provinsi: 'Daerah Istimewa Yogyakarta',
        kabupaten: 'Sleman',
        alamatLengkap: 'Perumahan Graha Asri, Jl. Affandi, Gejayan, Yogyakarta',
        imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        imageUrl1: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
        imageUrl2: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
        isPremium: true,
        isFeatured: false,
        isHot: false,
        status: 'dijual',
        ownerContact: '+6281987654321'
      },
      {
        kodeListing: 'A1.01',
        judulProperti: 'Apartemen Mewah City View - Fully Furnished',
        deskripsi: '🏙️ Apartemen mewah dengan city view spektakuler di pusat kota Yogyakarta. Fully furnished dengan furniture premium dan fasilitas bintang 5.\n\nFasilitas Apartemen:\n• Kolam renang\n• Gym & fitness center\n• 24 jam security\n• Laundry service\n• Concierge\n• Underground parking\n\nUnit 2BR + 1BR dengan balkon pribadi. Interior modern dengan finishing tinggi. Cocok untuk ekspatriat atau executive yang menginginkan hunian prestisius.',
        jenisProperti: 'apartment',
        luasTanah: 85,
        luasBangunan: 85,
        kamarTidur: 2,
        kamarMandi: 2,
        legalitas: 'SHM',
        hargaProperti: 1200000,
        provinsi: 'Daerah Istimewa Yogyakarta',
        kabupaten: 'Yogyakarta',
        alamatLengkap: 'Jl. Malioboro, Yogyakarta City Center, Yogyakarta',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        imageUrl1: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        imageUrl2: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        isPremium: true,
        isFeatured: true,
        isHot: false,
        status: 'disewakan',
        ownerContact: '+6281122334455'
      },
      {
        kodeListing: 'V1.01',
        judulProperti: 'Villa Tropis Private Pool - View Gunung Merapi',
        deskripsi: '🏝️ Villa tropis mewah dengan private pool dan view Gunung Merapi yang menakjubkan. Hunian impian untuk liburan atau sebagai second home.\n\nFasilitas Villa:\n• Private infinity pool\n• 4 kamar tidur master\n• Spa room\n• Gym pribadi\n• Kitchen modern\n• Taman tropis\n• BBQ area\n• 24 jam security\n\nInterior mewah dengan furniture antik dan seni modern. Cocok untuk gathering keluarga besar atau acara spesial.',
        jenisProperti: 'villa',
        luasTanah: 500,
        luasBangunan: 400,
        kamarTidur: 4,
        kamarMandi: 4,
        legalitas: 'SHM',
        hargaProperti: 2500000000,
        provinsi: 'Daerah Istimewa Yogyakarta',
        kabupaten: 'Sleman',
        alamatLengkap: 'Cangkringan, Desa Glagah, Cangkringan, Sleman, Yogyakarta',
        imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop',
        imageUrl1: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
        imageUrl2: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop',
        isPremium: true,
        isFeatured: true,
        isHot: true,
        status: 'dijual',
        ownerContact: '+6281555666777'
      },
      {
        kodeListing: 'RK1.01',
        judulProperti: 'Ruko Strategis di Jalan Utama - Cocok Bisnis',
        deskripsi: '🏪 Ruko 2 lantai strategis di jalan utama dengan traffic tinggi. Lokasi prime untuk berbagai jenis bisnis retail atau jasa.\n\nKeunggulan Lokasi:\n• Jalan utama dengan traffic padat\n• Dekat mall dan pusat perbelanjaan\n• Mudah diakses angkutan umum\n• Parkir luas untuk customer\n\nSpesifikasi:\n• LT: 100m² LB: 150m²\n• 2 lantai\n• Toilet\n• Area display luas\n• Loading dock\n\nSudah termasuk PPN, siap pakai dengan renovasi minimal.',
        jenisProperti: 'ruko',
        luasTanah: 100,
        luasBangunan: 150,
        kamarTidur: 0,
        kamarMandi: 1,
        legalitas: 'SHM',
        hargaProperti: 1200000000,
        provinsi: 'Daerah Istimewa Yogyakarta',
        kabupaten: 'Yogyakarta',
        alamatLengkap: 'Jl. Malioboro, Pusat Kota Yogyakarta',
        imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
        imageUrl1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        imageUrl2: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        isPremium: false,
        isFeatured: true,
        isHot: false,
        status: 'dijual',
        ownerContact: '+6281444555666'
      }
    ]

    let successCount = 0
    let errorCount = 0

    for (const property of sampleProperties) {
      try {
        console.log(`📝 Seeding property: ${property.kodeListing}`)

        const { data, error } = await this.supabase
          .from('properties')
          .insert(property)
          .select()

        if (error) {
          console.error(`❌ Error seeding ${property.kodeListing}:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Successfully seeded: ${property.kodeListing}`)
          successCount++
        }
      } catch (error) {
        console.error(`❌ Failed to seed ${property.kodeListing}:`, error.message)
        errorCount++
      }
    }

    console.log(`\n🎉 Seeding completed!`)
    console.log(`✅ Successful: ${successCount} properties`)
    console.log(`❌ Errors: ${errorCount} properties`)

    return { successCount, errorCount }
  }

  async run() {
    try {
      console.log('🌱 Salam Bumi Property - Sample Data Seeder')
      console.log('==========================================')

      const result = await this.seedProperties()

      console.log('\n🎊 Sample data seeding completed!')
      console.log(`📊 Summary: ${result.successCount} properties added, ${result.errorCount} errors`)

      if (result.successCount > 0) {
        console.log('\n📋 Sample Properties Added:')
        console.log('• K9.01 - Kost Modern Dekat UGM')
        console.log('• R1.01 - Rumah Minimalis 2 Lantai')
        console.log('• A1.01 - Apartemen City View')
        console.log('• V1.01 - Villa Private Pool')
        console.log('• RK1.01 - Ruko Strategis')
      }

      return result

    } catch (error) {
      console.error('💥 Seeding failed:', error.message)
      throw error
    }
  }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new PropertySeeder()

  seeder.run()
    .then((result) => {
      console.log('\n✅ Seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error.message)
      process.exit(1)
    })
}

export default PropertySeeder