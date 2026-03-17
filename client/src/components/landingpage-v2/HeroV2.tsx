import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackWhatsAppConversion } from '@/utils/tracking';
import { ChevronDown, Star, Award, Shield } from 'lucide-react';

// OPTIMIZED: Premium hero background images dengan WebP format eksplisit
const heroBackgrounds = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    webpImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    fallback: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&fm=jpg&fit=crop&w=1600&q=75',
    title: 'Luxury Villa Collection',
    subtitle: 'Exclusive properties for discerning buyers',
    priority: true
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    webpImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    fallback: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&fm=jpg&fit=crop&w=1600&q=75',
    title: 'Premium Urban Living',
    subtitle: 'Modern apartments in prime locations'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    webpImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c25118c?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    fallback: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&fm=jpg&fit=crop&w=1600&q=75',
    title: 'Commercial Excellence',
    subtitle: 'Strategic investment opportunities'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    webpImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&fm=webp&fit=crop&w=1600&q=75',
    fallback: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&fm=jpg&fit=crop&w=1600&q=75',
    title: 'Heritage Properties',
    subtitle: 'Timeless architecture meets modern luxury'
  }
];

export default function HeroV2() {
  const [currentBg, setCurrentBg] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-sliding background with smooth crossfade timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroBackgrounds.length);
    }, 8000); // 8 seconds - allows smooth crossfade

    return () => clearInterval(interval);
  }, []);

  // Preload images for smooth transitions
  useEffect(() => {
    const preloadImages = heroBackgrounds.map(bg => {
      const img = new Image();
      img.src = bg.image;
      return img;
    });

    Promise.all(preloadImages.map(img =>
      new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      })
    )).then(() => setIsLoaded(true));
  }, []);

  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('hero_v2_section');
    window.open('https://wa.me/6281391278889?text=Halo,%20saya%20ingin%20konsultasi%20properti%20premium%20di%20Yogyakarta', '_blank');
  };

  const handleExploreClick = () => {
    const portfolioSection = document.querySelector('#portfolio-gallery-v2');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleScrollDown = () => {
    const nextSection = document.querySelector('#trust-badges-v2');
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Optimized Background Effects - Reduced complexity */}
      <div className="absolute inset-0 z-0">
        {/* Simplified Floating Orbs - Reduced count and blur */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-amber-400/5 rounded-full blur-xl animate-bounce opacity-30" style={{animationDuration: '6s', willChange: 'transform'}}></div>
        <div className="absolute bottom-32 right-20 w-20 h-20 bg-blue-400/5 rounded-full blur-lg animate-bounce opacity-20" style={{animationDuration: '8s', animationDelay: '2s', willChange: 'transform'}}></div>
      </div>
      
      {/* Premium Background Slider - Pure Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {/* Current Background Layer */}
        <motion.div
          key={`current-${currentBg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 4,
            ease: [0.25, 0.46, 0.45, 0.94],
            exit: { duration: 4, ease: [0.25, 0.46, 0.45, 0.94] }
          }}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url("${heroBackgrounds[currentBg]?.image || ''}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // Removed expensive CSS filters - using overlay instead
          }}
        />

        {/* Next Background Layer (Preloaded) */}
        <motion.div
          key={`next-${(currentBg + 1) % heroBackgrounds.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url("${heroBackgrounds[(currentBg + 1) % heroBackgrounds.length]?.image || ''}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            // Removed expensive CSS filters
          }}
        />

        {/* Enhanced Gradient Overlay - Replaces expensive CSS filters */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/40"
        />
      </div>

      {/* Floating Premium Elements */}
      <div className="absolute top-8 left-8 z-10 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
        >
          <div className="flex items-center gap-2 text-white">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium">Premium Certified</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-8 right-8 z-10 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
        >
          <div className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">100% Verified</span>
          </div>
        </motion.div>
      </div>

      {/* Background Indicators */}
      <div className="absolute bottom-8 left-8 z-10 hidden lg:flex gap-2">
        {heroBackgrounds.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBg(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentBg
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`View slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-2xl"
          >
            <Star className="w-4 h-4 fill-current text-yellow-500" />
            PREMIUM PROPERTIES YOGYAKARTA
            <Star className="w-4 h-4 fill-current text-yellow-500" />
          </motion.div>

          {/* Dynamic Headline */}
          <motion.h1
            key={currentBg}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-white leading-tight mb-6 tracking-tight hero-text-glow"
          >
            {heroBackgrounds[currentBg]?.title || 'Luxury Properties'}
          </motion.h1>

          {/* Dynamic Subtitle */}
          <motion.p
            key={currentBg}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 leading-relaxed mb-12 max-w-3xl mx-auto"
          >
            {heroBackgrounds[currentBg]?.subtitle || 'Discover your dream property'}
          </motion.p>

          {/* Premium CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppClick}
              className="group btn-premium-ripple bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/50 flex items-center justify-center gap-3 border-2 border-white/20 animate-glow"
            >
              <svg className="w-7 h-7 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <div className="text-left">
                <div>Hubungi Kami</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExploreClick}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-white/20 border-2 border-white/30"
            >
              <span className="group-hover:text-amber-400 transition-colors">Lihat Properti</span>
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">500+</div>
              <div className="text-white/80 text-sm">Premium Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">98%</div>
              <div className="text-white/80 text-sm">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">8+</div>
              <div className="text-white/80 text-sm">Years Experience</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Premium Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <button
          onClick={handleScrollDown}
          className="group p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20"
          aria-label="Scroll to next section"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-white group-hover:text-amber-400 transition-colors" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}