import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { metaPixel, ga4 } from '@/utils/tracking';
import type { Property } from '@shared/types';

export default function FeaturedProperties() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);
  const slideTimeoutRef = useRef<NodeJS.Timeout>();
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();
  const [rowOffset, setRowOffset] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });
  const rowRef = useRef<HTMLDivElement>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Animation timing constants
  const TIMING = {
    slide: 700,    // 700ms slide duration
    pause: 4500,   // 4500ms pause duration
  };

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fetch specific properties by kode_listing for landing page
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['landing-page-properties-specific'],
    queryFn: async () => {
      const specificKodeListings = ['R8.01', 'K8.05', 'R3.27', 'K10.24', 'K10.19', 'K9.02', 'H19', 'K3.32', 'H16', 'T53', 'T48'];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('kode_listing', specificKodeListings)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data
      return data.map(property => ({
        id: property.id,
        kodeListing: property.kode_listing,
        judulProperti: property.judul_properti,
        deskripsi: property.deskripsi,
        jenisProperti: property.jenis_properti,
        luasTanah: property.luas_tanah,
        luasBangunan: property.luas_bangunan,
        kamarTidur: property.kamar_tidur,
        kamarMandi: property.kamar_mandi,
        legalitas: property.legalitas,
        hargaProperti: property.harga_properti,
        hargaPerMeter: Boolean(property.harga_per_meter || false),
        provinsi: property.provinsi,
        kabupaten: property.kabupaten,
        alamatLengkap: property.alamat_lengkap,
        imageUrl: property.image_url,
        imageUrl1: property.image_url1,
        imageUrl2: property.image_url2,
        imageUrl3: property.image_url3,
        imageUrl4: property.image_url4,
        imageUrl5: property.image_url5,
        imageUrl6: property.image_url6,
        imageUrl7: property.image_url7,
        imageUrl8: property.image_url8,
        imageUrl9: property.image_url9,
        isPremium: property.is_premium,
        isFeatured: property.is_featured,
        isHot: property.is_hot,
        isSold: property.is_sold,
        priceOld: property.price_old,
        isPropertyPilihan: property.is_property_pilihan,
        ownerContact: property.owner_contact,
        status: property.status,
        createdAt: new Date(property.created_at),
        updatedAt: new Date(property.updated_at),
      }));
    },
  });

  // Memoize shuffled properties to prevent unnecessary re-shuffling
  const shuffledProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    return [...properties].sort(() => Math.random() - 0.5);
  }, [properties]);

  // Use all properties for single row
  const rowProperties = useMemo(() => {
    return shuffledProperties || [];
  }, [shuffledProperties]);

  // Interval-based slide function
  const performSlide = useCallback(() => {
    if (!isVisible || isDragging || !isAutoSliding || rowProperties.length === 0 || prefersReducedMotion || !isTabActive) {
      return;
    }

    // Perform slide with CSS transition
    setRowOffset(prev => {
      const cardWidth = 320;
      const newOffset = prev + cardWidth;
      return newOffset > cardWidth * 2 ? 0 : newOffset;
    });
  }, [isVisible, isDragging, isAutoSliding, rowProperties.length, prefersReducedMotion, isTabActive]);

  // Schedule next slide with setTimeout chain for no CPU activity during pause
  const scheduleNextSlide = useCallback(() => {
    slideTimeoutRef.current = setTimeout(() => {
      performSlide();
      pauseTimeoutRef.current = setTimeout(scheduleNextSlide, TIMING.pause);
    }, TIMING.slide);
  }, [performSlide, TIMING.pause, TIMING.slide]);

  // Start timeout-based animation
  useEffect(() => {
    if (isVisible && !isDragging && isAutoSliding && rowProperties.length > 0 && !prefersReducedMotion && isTabActive) {
      scheduleNextSlide();
    } else {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
        slideTimeoutRef.current = undefined;
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = undefined;
      }
    }

    return () => {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [isVisible, isDragging, isAutoSliding, rowProperties.length, prefersReducedMotion, isTabActive, scheduleNextSlide]);

  // Intersection Observer for pause when offscreen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (entry.isIntersecting && !hasTrackedView.current) {
            metaPixel.trackFeaturedPropertiesView();
            hasTrackedView.current = true;
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoSliding(false);
    setDragStart({ x: e.clientX, offset: rowOffset });
  }, [rowOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    setRowOffset(dragStart.offset + deltaX);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    handleMouseUp();
    setIsAutoSliding(true);
  }, [handleMouseUp]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setIsAutoSliding(false);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, offset: rowOffset });
  }, [rowOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    setRowOffset(dragStart.offset + deltaX);
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Manual navigation with tracking - disables auto-slide
  const slideLeft = () => {
    ga4.event('featured_slider_arrow_click', { direction: 'left' });
    setIsAutoSliding(false);
    setRowOffset(prev => prev - 320); // Card width + gap
  };

  const slideRight = () => {
    ga4.event('featured_slider_arrow_click', { direction: 'right' });
    setIsAutoSliding(false);
    setRowOffset(prev => prev + 320);
  };

  // Card click tracking
  const handleCardClick = useCallback((property: Property) => {
    // Parse price to number for Meta Pixel
    const priceValue = parseFloat(property.hargaProperti) || 0;

    // Track ViewContent with proper Meta Pixel format
    metaPixel.track('ViewContent', {
      content_ids: [property.kodeListing || property.id],
      content_type: 'product',
      content_name: property.judulProperti || `${property.jenisProperti} di ${property.kabupaten}`,
      value: priceValue,
      currency: 'IDR'
    });

    // GA4 tracking
    ga4.event('featured_property_click', {
      property_id: property.id,
      property_title: property.judulProperti,
      property_location: property.kabupaten,
      property_price: priceValue
    });
  }, []);

  // Tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            metaPixel.trackFeaturedPropertiesView();
            hasTrackedView.current = true;
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(1)}M`;
    } else if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)}M`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded animate-pulse mx-auto mb-4 w-96"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-64"></div>
          </div>
          <div className="flex space-x-6 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-video bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-properties-section" ref={sectionRef} className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div
          className="text-center mb-16"
          data-aos="fade-up"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Properti Unggulan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan properti terbaik di Yogyakarta dengan lokasi strategis dan harga kompetitif
          </p>
        </div>

        {/* Single Row - Auto slide to the right */}
        <div className="mb-8">
          <div
            ref={rowRef}
            className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsAutoSliding(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Arrow - More Prominent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                slideLeft();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white rounded-full p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-blue-500"
              aria-label="Slide left"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow - More Prominent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                slideRight();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white rounded-full p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-blue-500"
              aria-label="Slide right"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div
              className="flex space-x-6 will-change-transform"
              style={{
                transform: `translate3d(-${rowOffset}px, 0, 0)`,
                transition: isDragging ? 'none' : `transform ${TIMING.slide}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              {[...rowProperties, ...rowProperties, ...rowProperties].map((property, index) => (
                <div
                  key={`${property.id}-${index}`}
                  className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group"
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay={index * 150}
                  data-aos-once="true"
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <picture>
                      <source 
                        srcSet={property.imageUrl ? property.imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp') : '/placeholder-lp.webp'} 
                        type="image/webp" 
                      />
                      <img
                        src={property.imageUrl || '/placeholder-lp.png'}
                        alt={property.judulProperti || 'Property Image'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.endsWith('.webp')) {
                            target.src = property.imageUrl || '/placeholder-lp.png';
                          } else {
                            target.src = '/placeholder-lp.png';
                          }
                        }}
                      />
                    </picture>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {property.jenisProperti?.charAt(0).toUpperCase() + property.jenisProperti?.slice(1).replace(/_/g, ' ') || 'Properti'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {property.kabupaten}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {property.judulProperti || `${property.jenisProperti} di ${property.kabupaten}`}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 mb-4">
                      {formatPrice(property.hargaProperti)}
                    </p>
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors duration-300"
                      onClick={() => {
                        handleCardClick(property);
                        // Navigate using direct property route
                        if (property.kodeListing) {
                          window.location.href = `/properti/${property.kodeListing}`;
                        } else if (property.id) {
                          window.location.href = `/properti/${property.id}`;
                        } else {
                          window.location.href = `/properti/${property.kodeListing}`;
                        }
                      }}
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        <div
          className="text-center mt-12"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
            onClick={() => {
              // Navigate to main properties/search page
              window.location.href = '/search';
            }}
          >
            Lihat Semua Properti
          </button>
        </div>
      </div>
    </section>
  );
}