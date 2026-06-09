import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { PropertyCard } from "@/components/PropertyCard";
import { propertiesApi } from "@/lib/api-client";
import { Property } from "@/data/properties";
import { apiToCardProperty } from "@/utils/propertyAdapter";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PAGE_SIZE = 20;
const PLACEHOLDER_IMAGE = "https://images.salambumi.xyz/kost%20dijual%20jogja.webp";

export default function Home() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [choiceProperties, setChoiceProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch choice properties terpisah (hanya 1x saat mount)
  useEffect(() => {
    const fetchChoice = async () => {
      try {
        const result = await propertiesApi.getAll({
          limit: 10,
          page: 1,
          is_sold: "false",
          is_choice: "true",
        });
        if (result.success && result.data) {
          setChoiceProperties(result.data.map(apiToCardProperty));
        }
      } catch {
        // Biarkan kosong — carousel akan fallback ke allProperties
      }
    };
    fetchChoice();
  }, []);

  const fetchPage = useCallback(async (pageNum: number, append = false) => {
    try {
      const result = await propertiesApi.getAll({
        limit: PAGE_SIZE,
        page: pageNum,
        is_sold: "false",
      });
      if (result.success) {
        const mapped = result.data.map(apiToCardProperty);
        setAllProperties(prev => append ? [...prev, ...mapped] : mapped);
        setTotalPages(result.pagination.total_pages);
      }
    } catch (err) {
      console.error("[Home] Gagal fetch properti:", err);
      setError("Gagal memuat data properti. Periksa koneksi Anda.");
    }
  }, []);

  // Fetch halaman pertama saat mount — tidak menggunakan mock data
  useEffect(() => {
    setLoading(true);
    fetchPage(1, false).finally(() => setLoading(false));
  }, [fetchPage]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    await fetchPage(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  // Ambil properti pilihan dari API terpisah, fallback ke 6 properti pertama
  const displayChoice = choiceProperties.length > 0
    ? choiceProperties
    : allProperties.slice(0, 6); // fallback: tampilkan 6 properti pertama dari list utama
  const hasMore = page < totalPages;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">

        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 min-h-[85vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              src={PLACEHOLDER_IMAGE}
              alt="Real Estate Jogja"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/60" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 text-center text-white mt-10">
            <span className="inline-block py-1.5 px-4 rounded-full bg-secondary/20 text-secondary border border-secondary/30 text-sm font-bold tracking-wider mb-6 uppercase">
              #1 Agen Properti Yogyakarta
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-tight">
              Finding The Best Properties, <br className="hidden md:block" /> Will Be Easier And More Precise
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 font-light">
              "Don't Wait To Buy Real Estate, Buy Real Estate And Wait"
            </p>
          </div>

          {/* Floating Search Form */}
          <div className="absolute left-0 right-0 -bottom-16 md:-bottom-24 z-20 px-4">
            <SearchForm />
          </div>
        </section>

        {/* Spacer for floating card */}
        <div className="h-24 md:h-32"></div>

        {/* FEATURED PROPERTIES CAROUSEL */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">Properti Pilihan</h2>
                <p className="text-gray-500 max-w-2xl">
                  Kurasi properti premium terbaik dengan nilai investasi tinggi dan lokasi paling strategis.
                </p>
              </div>
              <Link to="/properties">
                <Button variant="outline" className="shrink-0 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white">
                  Lihat Semua Pilihan
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="w-full h-80 md:h-[500px] bg-gray-100 rounded-2xl animate-pulse" />
            ) : displayChoice.length > 0 ? (
              <div className="relative w-full overflow-hidden rounded-2xl">
                <Swiper
                  modules={[Autoplay, Navigation, Pagination]}
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  navigation
                  pagination={{ clickable: true, dynamicBullets: true }}
                  className="w-full pb-10"
                >
                  {displayChoice.map(property => {
                    const mainImage = property.images?.[0] || PLACEHOLDER_IMAGE;
                    return (
                      <SwiperSlide key={property.id}>
                        <Link href={`/property/${property.slug}`}>
                          <div className="relative h-80 md:h-[500px] w-full rounded-2xl overflow-hidden cursor-pointer group">
                            <img
                              src={mainImage}
                              alt={property.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                              <h3 className="text-2xl md:text-4xl font-bold mb-2 line-clamp-2">
                                {property.title}
                              </h3>
                              <p className="text-lg text-gray-200 mb-3">
                                {property.city} · {property.type}
                              </p>
                              <p className="text-2xl md:text-3xl font-bold text-secondary">
                                {formatCurrency(property.price)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-12">Belum ada properti pilihan saat ini.</p>
            )}
          </div>
        </section>

        {/* LATEST PROPERTIES GRID */}
        <section className="py-16 md:py-24 bg-gray-50/50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Properti Terbaru</h2>
              <p className="text-gray-500">
                Temukan listing terbaru kami yang baru saja masuk pasar. Dari rumah subsidi hingga ruko komersial.
              </p>
            </div>

            {error && (
              <div className="text-center py-12 text-red-500 font-medium">{error}</div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {allProperties.length === 0 && !error ? (
                  <p className="text-gray-400 text-center py-12">Belum ada properti tersedia.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
                    {allProperties.map(property => (
                      <PropertyCard key={property.id} property={property as any} />
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 disabled:opacity-60"
                    >
                      {loadingMore ? "Memuat..." : "Muat Lebih Banyak Properti"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0"></div>
          <div className="absolute inset-0 bg-[url('https://images.salambumi.xyz/kost%20dijual%20jogja.webp')] opacity-10 mix-blend-overlay object-cover z-0"></div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Punya Properti Untuk Dijual/Disewakan?</h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Titipkan properti Anda pada kami. Tim marketing profesional kami siap membantu menjualkan atau menyewakan properti Anda dengan cepat.
            </p>
            <Button className="bg-secondary hover:bg-secondary/90 text-primary font-bold rounded-full px-8 py-6 text-lg shadow-xl shadow-secondary/20 transition-all hover:scale-105">
              Titip Jual Properti
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
