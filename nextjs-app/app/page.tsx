'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PropertyCard } from '@/components/property/PropertyCard'
import { useFeaturedProperties } from '@/hooks/use-featured-properties'
import { Header } from '@/components/Header'
import {
  MapPin,
  Search,
  Star,
  Users,
  Award,
  Shield,
  TrendingUp,
  Home,
  Building2,
  Key,
  Phone,
  Loader2
} from 'lucide-react'

const testimonials = [
  {
    name: 'Ahmad Rahman',
    role: 'Pembeli Rumah',
    content: 'Sangat puas dengan pelayanan Salam Bumi Property. Proses jual beli berjalan lancar dan transparan.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Siti Nurhaliza',
    role: 'Investor Properti',
    content: 'Tim profesional dan knowledgeable. Berhasil menemukan properti investasi yang menguntungkan.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Budi Santoso',
    role: 'Pemilik Properti',
    content: 'Website mudah digunakan dan fitur pencarian sangat membantu. Terima kasih Salam Bumi!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  }
]

const stats = [
  { label: 'Properti Terjual', value: '500+', icon: Home },
  { label: 'Klien Puas', value: '1000+', icon: Users },
  { label: 'Tahun Pengalaman', value: '5+', icon: Award },
  { label: 'Area Coverage', value: 'DIY', icon: MapPin }
]

export default function HomePage() {
  const { data: featuredProperties, isLoading, error } = useFeaturedProperties(3)

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.salambumi.xyz/kost%20dijual%20jogja.webp"
            alt="Background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/80 to-blue-900/80"></div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Temukan <span className="text-yellow-400">Rumah Impian</span> Anda
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Platform properti terpercaya di Yogyakarta dengan koleksi properti premium dan layanan profesional
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-lg shadow-2xl p-2 flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari lokasi, tipe properti..."
                    className="flex-1 outline-none text-gray-700 placeholder-gray-500"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-md">
                  <Search className="w-5 h-5 mr-2" />
                  Cari Properti
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 md:h-20">
            <path fill="#ffffff" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Properti Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Koleksi properti premium terpilih dengan lokasi strategis dan harga kompetitif
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Memuat properti...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Gagal memuat properti. Menampilkan data contoh.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {/* Fallback to mock data if error */}
                {[
                  {
                    id: '1',
                    kodeListing: 'RUM-001',
                    judulProperti: 'Rumah Minimalis Modern Condongcatur',
                    jenisProperti: 'rumah' as const,
                    hargaProperti: 500000000,
                    provinsi: 'Daerah Istimewa Yogyakarta',
                    kabupaten: 'Sleman',
                    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
                    hargaPerMeter: false,
                    isPremium: true,
                    isFeatured: false,
                    isHot: true,
                    isSold: false,
                    isPropertyPilihan: true,
                    status: 'dijual' as const,
                    createdAt: new Date('2024-01-15'),
                    updatedAt: new Date('2024-01-15')
                  }
                ].map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {featuredProperties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/properties">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Lihat Semua Properti
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Komitmen kami untuk memberikan pengalaman terbaik dalam jual beli properti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Terpercaya</h3>
                <p className="text-gray-600">
                  Lisensi resmi dan pengalaman 5+ tahun melayani ribuan klien dengan integritas tinggi
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Key className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Proses Mudah</h3>
                <p className="text-gray-600">
                  Pendampingan penuh dari survei hingga akad, tanpa biaya tersembunyi
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Building2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Koleksi Lengkap</h3>
                <p className="text-gray-600">
                  Ribuan properti terverifikasi di seluruh Yogyakarta dengan berbagai tipe dan budget
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Klien Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Testimoni dari klien yang telah berhasil menemukan properti impian mereka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Temukan Properti Impian Anda?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Hubungi tim profesional kami untuk konsultasi gratis dan temukan properti yang sesuai dengan kebutuhan Anda
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                <Search className="w-5 h-5 mr-2" />
                Cari Properti Sekarang
              </Button>
            </Link>

            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
              <Phone className="w-5 h-5 mr-2" />
              Hubungi Kami
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}