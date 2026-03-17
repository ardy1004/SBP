import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Pembeli Rumah",
    message: "Pelayanan cepat dan sangat profesional. Tim sangat membantu dalam proses pencarian rumah impian saya.",
    photo: "https://images.salambumi.xyz/customer/Rizky%20Pratama.webp"
  },
  {
    name: "Ayu Lestari",
    role: "Investor Properti",
    message: "Rekomendasi listingnya akurat dan terpercaya. Akhirnya dapat villa yang sesuai budget dan lokasi.",
    photo: "https://images.salambumi.xyz/customer/Ayu%20Lestari.webp"
  },
  {
    name: "Budi Santoso",
    role: "Pengusaha",
    message: "Transaksi aman, legalitas dibantu penuh. Sangat recommended untuk yang cari properti di Jogja.",
    photo: "https://images.salambumi.xyz/customer/Budi%20Santoso.webp"
  }
];

export default function TestimonialSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isTabActive, setIsTabActive] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isAutoSliding, setIsAutoSliding] = useState(true);
    const sectionRef = useRef<HTMLElement>(null);
    const slideTimeoutRef = useRef<NodeJS.Timeout>();
    const pauseTimeoutRef = useRef<NodeJS.Timeout>();

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

   // Intersection Observer for pause when offscreen
   useEffect(() => {
     const observer = new IntersectionObserver(
       (entries) => {
         entries.forEach((entry) => {
           setIsVisible(entry.isIntersecting);
         });
       },
       { threshold: 0.1 }
     );

     if (sectionRef.current) {
       observer.observe(sectionRef.current);
     }

     return () => observer.disconnect();
   }, []);

   // Interval-based slide function
   const performSlide = () => {
     if (!isVisible || prefersReducedMotion || !isTabActive || !isAutoSliding) {
       return;
     }

     setCurrentIndex((prevIndex) =>
       prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
     );
   };

   // Schedule next slide with setTimeout chain for no CPU activity during pause
   const scheduleNextSlide = useCallback(() => {
     slideTimeoutRef.current = setTimeout(() => {
       performSlide();
       pauseTimeoutRef.current = setTimeout(scheduleNextSlide, TIMING.pause);
     }, TIMING.slide);
   }, [performSlide, TIMING.pause, TIMING.slide]);

   // Start timeout-based animation
   useEffect(() => {
     if (isVisible && !prefersReducedMotion && isTabActive && isAutoSliding) {
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
   }, [isVisible, prefersReducedMotion, isTabActive, isAutoSliding, scheduleNextSlide]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoSliding(false);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    setIsAutoSliding(false);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    setIsAutoSliding(false);
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white" onMouseEnter={() => setIsAutoSliding(false)} onMouseLeave={() => setIsAutoSliding(true)}>
      <div className="container mx-auto px-4">
        <div
          className="text-center mb-16"
          data-aos="fade-up"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Apa Kata Customer Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pengalaman positif dari klien yang telah menggunakan jasa kami
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Main Slider */}
          <div
            className="relative min-h-[400px] md:min-h-[450px] overflow-hidden rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-white flex items-center justify-center"
          >
            <div
              key={currentIndex}
              className="flex items-center justify-center transition-all duration-700 ease-out opacity-100 scale-100"
              style={{
                transition: `all ${TIMING.slide}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              <div className="text-center max-w-2xl mx-auto px-8 py-8">
                 {/* Quote Icon */}
                 <div className="mb-6">
                   <Quote className="w-12 h-12 text-blue-600 mx-auto" />
                 </div>

                 {/* Testimonial Text */}
                 <div className="mb-8">
                   <blockquote className="text-xl md:text-2xl text-gray-700 italic leading-relaxed font-light">
                     "{testimonials[currentIndex]?.message}"
                   </blockquote>
                 </div>

                 {/* Customer Info */}
                 <div className="flex flex-col items-center space-y-4">
                   <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100">
                     <img
                       src={testimonials[currentIndex]?.photo}
                       alt={testimonials[currentIndex]?.name}
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         e.currentTarget.src = '/placeholder-lp.png';
                       }}
                     />
                   </div>
                   <div className="text-center">
                     <h4 className="text-xl font-semibold text-gray-900 mb-1">
                       {testimonials[currentIndex]?.name}
                     </h4>
                     <p className="text-sm text-gray-600 font-medium">
                       {testimonials[currentIndex]?.role}
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}