import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { trackWhatsAppConversion } from '@/utils/tracking';
import AnimatedCounters from './AnimatedCounters';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function Hero() {
  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      offset: 120,
      once: true,
    });
  }, []);

  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('hero_section');
    window.open('https://wa.me/6281391278889', '_blank');
  };

  const handlePrimaryCTA = () => {
    // Scroll to featured properties section
    const featuredSection = document.querySelector('#featured-properties-section');
    if (featuredSection) {
      featuredSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleScrollDown = () => {
    const nextSection = document.querySelector('#value-props-section');
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-20 pb-16">
      {/* Background Container - Full Coverage */}
      <div
        className="absolute -inset-20 md:-inset-16 z-0"
        style={{
          backgroundImage: `
            url("/images/hero-1.webp"),
            url("/images/hero-1.jpg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/[0.2] via-slate-900/[0.25] to-slate-900/[0.3]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-6xl mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 mb-8">
            <h1
              className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight"
              data-aos="fade-right"
            >
              Properti Premium Yogyakarta
            </h1>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 mb-12">
            <p
              className="text-xl md:text-2xl text-blue-100 leading-relaxed"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              Rumah, Tanah, Kost, Hotel, Homestay & Bangunan Komersial Lainnya.
            </p>
          </div>

          {/* Animated Counters */}
          <div className="mb-12">
            <ErrorBoundary>
              <AnimatedCounters />
            </ErrorBoundary>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <button
              onClick={handlePrimaryCTA}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Lihat Properti
            </button>
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Chat WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on Mobile */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
        <button
          onClick={handleScrollDown}
          className="animate-bounce hover:animate-none transition-all duration-300 hover:scale-110 cursor-pointer p-2 rounded-full hover:bg-white/10"
          aria-label="Scroll to next section"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
}