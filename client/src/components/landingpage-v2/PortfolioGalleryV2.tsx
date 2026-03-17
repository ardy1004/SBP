import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Heart, Share2, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatPriceNew } from '@/lib/utils';
import { useLocation } from 'wouter';
import { trackWhatsAppConversion } from '@/utils/tracking';
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from '@shared/types';

// Portfolio data for survey & AJB documentation - All 14 projects from Portfolio Gallery
const portfolioProjects = [
  {
    id: "nego-kost-exclusive",
    title: "Dampingi Klien Negosiasi Kost Exclusive",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/da94e869-53dc-447c-be01-94b6a31cdbae_imgupscaler.ai_V2(Pro)_2K.webp",
    description: "Dokumentasi survey lokasi lengkap dengan analisis lingkungan",
  },
  {
    id: "ajb-notaris-delivery",
    title: "Penyerahan dokumen AJB Notaris",
    location: "Sleman",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/e29ea026-1025-4590-97d8-bb6e5fe18713_imgupscaler.ai_V2(Pro)_2K.webp",
    description: "Survey detail dengan pemetaan aksesibilitas dan fasilitas umum",
  },
  {
    id: "ajb-kost-upn",
    title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UPN",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/6e28aee2-087e-4051-99d6-5eead23d2698_imgupscaler.ai_V2(Pro)_2K.webp",
    description: "Proses dokumentasi Akta Jual Beli dengan verifikasi legalitas",
  },
  {
    id: "ajb-kost-uii",
    title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UII",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/957b50e0-5769-481b-9de6-11c02b0822d8_imgupscaler.ai_V2(Pro)_2K.webp",
    description: "Dokumentasi lengkap survey lokasi dan proses AJB",
  },
  {
    id: "ajb-kost-ugm-1",
    title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UGM",
    location: "Sleman",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/8800b8fc-fc97-46a0-b7d8-f91cd64027f8_imgupscaler.ai_V2(Pro)_2K.webp",
    description: "Verifikasi menyeluruh lokasi dengan dokumentasi foto profesional",
  },
  {
    id: "ajb-kost-ugm-2",
    title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UGM",
    location: "Sleman",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/23854ae2-be1f-416f-85ed-15e6d694a66a_imgupscaler.ai_V2(Pro)_2K.webp",
    description: "Dokumentasi lengkap untuk keperluan legal dan AJB",
  },
  {
    id: "survey-rumah-elite",
    title: "Dampingi Klien Survey Lokasi Rumah Perum Elite",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/41.webp",
    description: "Dokumentasi survey lokasi rumah perumahan elite dengan analisis lingkungan",
  },
  {
    id: "survey-villa-mewah",
    title: "Dampingi Klien Survey Lokasi Rumah Villa Mewah",
    location: "Sleman",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/60.webp",
    description: "Survey detail villa mewah dengan pemetaan aksesibilitas premium",
  },
  {
    id: "survey-hotel-bintang",
    title: "Dampingi Klien Survey Lokasi Hotel Bintang",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/65.webp",
    description: "Dokumentasi lengkap survey lokasi hotel bintang dengan verifikasi legalitas",
  },
  {
    id: "survey-kost-exclusive-1",
    title: "Dampingi Klien Survey Lokasi Kost Exclusive",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(11).webp",
    description: "Survey kost exclusive dengan analisis fasilitas dan lingkungan",
  },
  {
    id: "survey-hotel-budget",
    title: "Dampingi Klien Survey Lokasi Hotel Budget",
    location: "Sleman",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(14).webp",
    description: "Dokumentasi survey hotel budget dengan pemetaan aksesibilitas strategis",
  },
  {
    id: "survey-kost-exclusive-2",
    title: "Dampingi Klien Survey Lokasi Kost Exclusive",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(19).webp",
    description: "Survey detail kost exclusive dengan verifikasi kualitas dan fasilitas",
  },
  {
    id: "survey-kost-exclusive-3",
    title: "Dampingi Klien Survey Lokasi Kost Exclusive",
    location: "Yogyakarta",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(20).webp",
    description: "Dokumentasi lengkap survey kost exclusive dengan analisis lingkungan",
  },
  {
    id: "survey-rumah-private-pool",
    title: "Dampingi Klien Survey Lokasi Rumah Mewah Private Pool",
    location: "Sleman",
    year: "2024",
    image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(25).webp",
    description: "Survey rumah mewah dengan private pool dan pemetaan premium amenities",
  },
];

// Transform function to convert Supabase snake_case to camelCase
const transformSupabaseProperty = (supabaseProperty: any): Property => {
  return {
    id: supabaseProperty.id,
    kodeListing: supabaseProperty.kode_listing,
    judulProperti: supabaseProperty.judul_properti,
    deskripsi: supabaseProperty.deskripsi,
    jenisProperti: supabaseProperty.jenis_properti,
    luasTanah: supabaseProperty.luas_tanah,
    luasBangunan: supabaseProperty.luas_bangunan,
    kamarTidur: supabaseProperty.kamar_tidur,
    kamarMandi: supabaseProperty.kamar_mandi,
    legalitas: supabaseProperty.legalitas,
    hargaProperti: supabaseProperty.harga_properti,
    hargaPerMeter: Boolean(supabaseProperty.harga_per_meter || false),
    provinsi: supabaseProperty.provinsi,
    kabupaten: supabaseProperty.kabupaten,
    alamatLengkap: supabaseProperty.alamat_lengkap,
    imageUrl: supabaseProperty.image_url,
    imageUrl1: supabaseProperty.image_url1,
    imageUrl2: supabaseProperty.image_url2,
    imageUrl3: supabaseProperty.image_url3,
    imageUrl4: supabaseProperty.image_url4,
    imageUrl5: supabaseProperty.image_url5,
    imageUrl6: supabaseProperty.image_url6,
    imageUrl7: supabaseProperty.image_url7,
    imageUrl8: supabaseProperty.image_url8,
    imageUrl9: supabaseProperty.image_url9,
    isPremium: supabaseProperty.is_premium,
    isFeatured: supabaseProperty.is_featured,
    isHot: supabaseProperty.is_hot,
    isSold: supabaseProperty.is_sold,
    priceOld: supabaseProperty.price_old,
    isPropertyPilihan: supabaseProperty.is_property_pilihan,
    ownerContact: supabaseProperty.owner_contact,
    status: supabaseProperty.status,
    createdAt: new Date(supabaseProperty.created_at),
    updatedAt: new Date(supabaseProperty.updated_at),
  };
};

// Transform Property to PortfolioGallery format
const transformPropertyToPortfolio = (property: Property) => {
  // Get all available images
  const images = [
    property.imageUrl,
    property.imageUrl1,
    property.imageUrl2,
    property.imageUrl3,
    property.imageUrl4,
    property.imageUrl5,
    property.imageUrl6,
    property.imageUrl7,
    property.imageUrl8,
    property.imageUrl9
  ].filter(Boolean);

  // If no images, use placeholder
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=75');
  }

  return {
    id: property.id,
    title: property.judulProperti || `${property.jenisProperti} di ${property.kabupaten}`,
    location: `${property.kabupaten}, ${property.provinsi}`,
    price: property.hargaProperti,
    pricePerMeter: property.hargaPerMeter,
    images: images,
    specs: {
      beds: property.kamarTidur || 0,
      baths: property.kamarMandi || 0,
      area: property.luasBangunan ? parseInt(property.luasBangunan) : (property.luasTanah ? parseInt(property.luasTanah) : 0)
    },
    type: property.jenisProperti?.charAt(0).toUpperCase() + property.jenisProperti?.slice(1).replace(/_/g, ' ') || 'Properti',
    isPremium: property.isPremium || false,
    isHot: property.isHot || false,
    kodeListing: property.kodeListing
  };
};

export default function PortfolioGalleryV2() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState(0);
  const [isPortfolioAutoPlaying, setIsPortfolioAutoPlaying] = useState(true);

  const autoPlayRef = useRef<NodeJS.Timeout>();
  const imageAutoPlayRef = useRef<NodeJS.Timeout>();

  // Fetch premium properties data from Supabase
  const { data: rawProperties = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['portfolio-gallery-properties'],
    queryFn: async () => {
      console.log('🏠 PortfolioGallery: Fetching premium properties from Supabase...');

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_property_pilihan', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ PortfolioGallery: Supabase query error:', error);
        throw error;
      }

      console.log(`✅ PortfolioGallery: Fetched ${data?.length || 0} premium properties from Supabase`);
      return data || [];
    },
  });

  // Transform the raw Supabase data to portfolio format
  const premiumProperties = rawProperties
    .map(transformSupabaseProperty)
    .map(transformPropertyToPortfolio);

  // Auto-play property carousel
  useEffect(() => {
    if (isAutoPlaying && premiumProperties.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % premiumProperties.length);
        setCurrentImageIndex(0); // Reset image index when changing property
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, premiumProperties.length]);

  // Auto-play images within current property
  useEffect(() => {
    if (isAutoPlaying && premiumProperties.length > 0 && premiumProperties[currentIndex]) {
      imageAutoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) =>
          (prev + 1) % premiumProperties[currentIndex].images.length
        );
      }, 3000);
    }

    return () => {
      if (imageAutoPlayRef.current) {
        clearInterval(imageAutoPlayRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, premiumProperties]);

  // Auto-play portfolio carousel
  useEffect(() => {
    if (isPortfolioAutoPlaying) {
      const portfolioAutoPlayRef = setInterval(() => {
        setCurrentPortfolioIndex((prev) => (prev + 1) % portfolioProjects.length);
      }, 5000);
      return () => clearInterval(portfolioAutoPlayRef);
    }
  }, [isPortfolioAutoPlaying]);

  const currentProperty = premiumProperties[currentIndex];

  const nextProperty = () => {
    if (premiumProperties.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % premiumProperties.length);
      setCurrentImageIndex(0);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
    }
  };

  const prevProperty = () => {
    if (premiumProperties.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + premiumProperties.length) % premiumProperties.length);
      setCurrentImageIndex(0);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  const goToProperty = (index: number) => {
    if (index >= 0 && index < premiumProperties.length) {
      setCurrentIndex(index);
      setCurrentImageIndex(0);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('portfolio_gallery_cta');
    window.open('https://wa.me/6281391278889?text=Halo,%20saya%20ingin%20konsultasi%20gratis%20tentang%20properti%20premium%20di%20Yogyakarta.%20Mohon%20info%20properti%20terbaru.', '_blank');
  };

  const nextPortfolio = () => {
    setCurrentPortfolioIndex((prev) => (prev + 1) % portfolioProjects.length);
    setIsPortfolioAutoPlaying(false);
    setTimeout(() => setIsPortfolioAutoPlaying(true), 10000);
  };

  const prevPortfolio = () => {
    setCurrentPortfolioIndex((prev) => (prev - 1 + portfolioProjects.length) % portfolioProjects.length);
    setIsPortfolioAutoPlaying(false);
    setTimeout(() => setIsPortfolioAutoPlaying(true), 10000);
  };

  const goToPortfolio = (index: number) => {
    setCurrentPortfolioIndex(index);
    setIsPortfolioAutoPlaying(false);
    setTimeout(() => setIsPortfolioAutoPlaying(true), 10000);
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="portfolio-gallery-v2" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto mb-4 w-96"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-64"></div>
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="h-[600px] bg-gray-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="portfolio-gallery-v2" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Koleksi Properti Eksklusif
            </h2>
            <p className="text-xl text-gray-600">
              Terjadi kesalahan saat memuat data properti. Silakan coba lagi nanti.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!currentProperty) {
    return (
      <section id="portfolio-gallery-v2" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Koleksi Properti Eksklusif
            </h2>
            <p className="text-xl text-gray-600">
              Belum ada properti pilihan yang tersedia saat ini.
            </p>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section id="portfolio-gallery-v2" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-100 to-yellow-100 px-6 py-3 rounded-full mb-6">
            <Eye className="w-5 h-5 text-gold-600" />
            <span className="text-gold-800 font-semibold text-sm">PROPERTI PILIHAN</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Koleksi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Properti Eksklusif</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Temukan properti premium terkurasi dengan lokasi strategis, desain modern,
            dan investasi terbaik di pasar properti Indonesia.
          </p>
        </motion.div>

        {/* Main Gallery */}
        <div className="relative max-w-7xl mx-auto">
          {/* Property Display */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentIndex}-${currentImageIndex}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="relative h-[600px] md:h-[700px]"
              >
                <img
                  src={(currentProperty?.images?.[currentImageIndex] || currentProperty?.images?.[0]) || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=75'}
                  alt={currentProperty?.title || 'Property'}
                  className="w-full h-full object-cover"
                />

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {currentProperty?.images?.map((_, imgIndex) => (
                    <button
                      key={imgIndex}
                      onClick={() => setCurrentImageIndex(imgIndex)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        imgIndex === currentImageIndex
                          ? 'bg-white scale-125'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                {/* Property overlay info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-end justify-between">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {currentProperty?.type || 'Property'}
                          </span>
                          {currentProperty?.isHot && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                              HOT
                            </span>
                          )}
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold mb-2">
                          {currentProperty?.title || 'Property Title'}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-5 h-5 text-blue-400" />
                          <span className="text-lg">{currentProperty?.location || 'Location'}</span>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                          {currentProperty?.specs?.beds > 0 && (
                            <div className="flex items-center gap-2">
                              <Bed className="w-5 h-5" />
                              <span>{currentProperty.specs.beds} Beds</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Bath className="w-5 h-5" />
                            <span>{currentProperty?.specs?.baths || 0} Baths</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Square className="w-5 h-5" />
                            <span>{currentProperty?.specs?.area || 0} m²</span>
                          </div>
                        </div>

                        <div className="text-4xl font-bold text-amber-400 mb-6">
                          {currentProperty ? formatPriceNew(currentProperty.price, { isPerMeter: currentProperty.pricePerMeter || false }) : 'Price'}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => currentProperty?.id && toggleFavorite(currentProperty.id)}
                          className={`p-3 rounded-full backdrop-blur-md border-2 transition-all duration-300 ${
                            currentProperty?.id && favorites.has(currentProperty.id)
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                          }`}
                        >
                          <Heart className={`w-6 h-6 ${currentProperty?.id && favorites.has(currentProperty.id) ? 'fill-current' : ''}`} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                        >
                          <Share2 className="w-6 h-6" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <button
              onClick={prevProperty}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextProperty}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Property thumbnails */}
          <div className="flex justify-center gap-4 mt-8 overflow-x-auto pb-4">
            {premiumProperties.map((property, index) => (
              <motion.button
                key={property?.id || `property-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToProperty(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-4 transition-all duration-300 ${
                  index === currentIndex
                    ? 'border-blue-500 shadow-lg scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={property?.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=75'}
                  alt={property?.title || 'Property'}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>

          {/* Property counter */}
          <div className="text-center mt-6">
            <span className="text-gray-500">
              {currentIndex + 1} of {premiumProperties.length || 0} Premium Properties
            </span>
          </div>
        </div>

        {/* Lihat Semua Properti Button */}
        <div className="text-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-5 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25"
          >
            LIHAT SEMUA PROPERTI
          </motion.button>
        </div>

        {/* Portfolio Survey & AJB Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Portfolio Survey Lokasi & AJB
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dokumentasi lengkap proses survey lokasi dan Akta Jual Beli (AJB) yang telah kami dampingi untuk klien-klien kami.
            </p>
          </div>

          {/* Portfolio Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPortfolioIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="relative h-[500px] md:h-[600px]"
                >
                  <img
                    src={portfolioProjects[currentPortfolioIndex].image}
                    alt={portfolioProjects[currentPortfolioIndex].title}
                    className="w-full h-full object-cover"
                  />

                  {/* Portfolio overlay info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <div className="max-w-2xl">
                        <h4 className="text-2xl md:text-3xl font-bold mb-2">
                          {portfolioProjects[currentPortfolioIndex].title}
                        </h4>
                        <p className="text-lg text-white/90 mb-3">
                          {portfolioProjects[currentPortfolioIndex].location} • {portfolioProjects[currentPortfolioIndex].year}
                        </p>
                        <p className="text-base text-white/80">
                          {portfolioProjects[currentPortfolioIndex].description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <button
                onClick={prevPortfolio}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextPortfolio}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Portfolio thumbnails */}
            <div className="flex justify-center gap-4 mt-8 overflow-x-auto pb-4">
              {portfolioProjects.map((project, index) => (
                <motion.button
                  key={project.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPortfolio(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-4 transition-all duration-300 ${
                    index === currentPortfolioIndex
                      ? 'border-blue-500 shadow-lg scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>

            {/* Portfolio counter */}
            <div className="text-center mt-6">
              <span className="text-gray-500">
                {currentPortfolioIndex + 1} of {portfolioProjects.length} Portfolio Projects
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}