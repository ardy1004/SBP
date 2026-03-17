import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackWhatsAppConversion } from '@/utils/tracking';
import { WHATSAPP_CONFIG } from '@/lib/config';
import { ChevronDown, ChevronLeft, ChevronRight, Star, Award, Shield, MessageCircle } from 'lucide-react';

// OPTIMIZED: Using WebP format and responsive images
const heroBackgrounds = [
  {
    id: 1,
    // Optimized image with WebP format and proper sizing
    image: '/images/hero-1-optimized.webp',
    fallback: '/images/hero-1.jpg',
    title: 'Luxury Villa Collection',
    subtitle: 'Exclusive properties for discerning buyers',
    priority: true // Mark as priority for preload
  },
  {
    id: 2,
    image: '/images/hero-2-optimized.webp',
    fallback: '/images/hero-2.jpg',
    title: 'Premium Urban Living',
    subtitle: 'Modern apartments in prime locations'
  },
  {
    id: 3,
    image: '/images/hero-3-optimized.webp',
    fallback: '/images/hero-3.jpg',
    title: 'Commercial Excellence',
    subtitle: 'Strategic investment opportunities'
  },
  {
    id: 4,
    image: '/images/hero-4-optimized.webp',
    fallback: '/images/hero-4.jpg',
    title: 'Heritage Properties',
    subtitle: 'Timeless architecture meets modern luxury'
  }
];

// OPTIMIZED: Critical CSS for above-the-fold content
const criticalStyles = `
  .hero-critical {
    background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .hero-title {
    font-size: 3rem;
    font-weight: 900;
    color: white;
    text-align: center;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255,255,255,0.9);
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .hero-cta {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 1rem 2rem;
    border-radius: 0.75rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
  }
  
  .hero-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
  }
  
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 3rem;
  }
  
  .hero-stat {
    text-align: center;
    color: white;
  }
  
  .hero-stat-number {
    font-size: 2rem;
    font-weight: 900;
    color: #fbbf24;
    display: block;
  }
  
  .hero-stat-label {
    font-size: 0.875rem;
    color: rgba(255,255,255,0.8);
    margin-top: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }
    .hero-subtitle {
      font-size: 1rem;
    }
    .hero-stats {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
`;

export default function HeroV2Optimized() {
  const [currentBg, setCurrentBg] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // OPTIMIZED: Preload only critical images
  useEffect(() => {
    // Inject critical CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = criticalStyles;
    document.head.appendChild(styleElement);

    // Preload only the first (priority) image
    const priorityImg = new Image();
    priorityImg.src = heroBackgrounds[0].image;
    
    priorityImg.onload = () => {
      setIsLoaded(true);
      setImageLoaded(true);
    };
    
    priorityImg.onerror = () => {
      // Fallback to non-optimized version
      const fallbackImg = new Image();
      fallbackImg.src = heroBackgrounds[0].fallback;
      fallbackImg.onload = () => {
        setIsLoaded(true);
        setImageLoaded(true);
      };
    };

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // OPTIMIZED: Reduce animation complexity for better performance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroBackgrounds.length);
    }, 7000); // Increased interval to reduce CPU usage

    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('hero_optimized_section');
    window.open(WHATSAPP_CONFIG.getLink('Halo, saya ingin konsultasi properti premium di Yogyakarta'), '_blank');
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

  // Navigation functions for carousel arrows
  const goToPreviousSlide = () => {
    setCurrentBg((prev) => (prev - 1 + heroBackgrounds.length) % heroBackgrounds.length);
  };

  const goToNextSlide = () => {
    setCurrentBg((prev) => (prev + 1) % heroBackgrounds.length);
  };

  // Show critical content immediately
  if (!isLoaded) {
    return (
      <section className="hero-critical">
        <div className="text-center px-6">
          <h1 className="hero-title">Premium Properties Yogyakarta</h1>
          <p className="hero-subtitle">Exclusive properties for discerning buyers</p>
          <button 
            onClick={handleWhatsAppClick}
            className="hero-cta"
            aria-label="Chat WhatsApp untuk konsultasi premium"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Konsultasi Gratis Sekarang</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* OPTIMIZED: Simplified background with better performance */}
      <div className="absolute inset-0 z-0">
        <motion.div
            key={currentBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* OPTIMIZED: Use optimized images with proper fallbacks */}
            <picture>
              <source 
                srcSet={heroBackgrounds[currentBg].image} 
                type="image/webp"
                media="(min-width: 768px)"
              />
              <source 
                srcSet={heroBackgrounds[currentBg].fallback} 
                type="image/jpeg"
                media="(min-width: 768px)"
              />
              <img
                src={imageLoaded ? heroBackgrounds[currentBg].image : heroBackgrounds[currentBg].fallback}
                alt={heroBackgrounds[currentBg].title}
                className="absolute inset-0 w-full h-full object-cover"
                loading={heroBackgrounds[currentBg].priority ? "eager" : "lazy"}
                decoding="async"
              />
            </picture>
            
            {/* OPTIMIZED: Simplified gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
          </motion.div>
      </div>

      {/* OPTIMIZED: Reduced floating elements for better performance */}
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

      {/* Navigation Arrows - Left and Right */}
      <button
        onClick={goToPreviousSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white"
        aria-label="Previous slide"
        style={{ display: 'flex' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white"
        aria-label="Next slide"
        style={{ display: 'flex' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* OPTIMIZED: Simplified background indicators */}
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

      {/* OPTIMIZED: Simplified main content with critical CSS classes */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* OPTIMIZED: Premium badge with better performance */}
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

          {/* OPTIMIZED: Dynamic headline with reduced animations */}
          <motion.h1
              key={currentBg}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hero-title"
            >
              {heroBackgrounds[currentBg]?.title || 'Luxury Properties'}
            </motion.h1>

          {/* OPTIMIZED: Dynamic subtitle */}
          <motion.p
              key={currentBg}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hero-subtitle"
            >
              {heroBackgrounds[currentBg]?.subtitle || 'Discover your dream property'}
            </motion.p>

          {/* OPTIMIZED: Enhanced CTA with better conversion optimization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppClick}
              className="hero-cta text-lg px-8 py-4"
            >
              <MessageCircle className="w-6 h-6" />
              <div className="text-left">
                <div>Hubungi Kami</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExploreClick}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-white/20 border-2 border-white/30"
            >
              Lihat Portfolio Eksklusif
            </motion.button>
          </motion.div>

          {/* OPTIMIZED: Trust indicators with better performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="hero-stats"
          >
            <div className="hero-stat">
              <span className="hero-stat-number">500+</span>
              <div className="hero-stat-label">Premium Properties</div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">98%</span>
              <div className="hero-stat-label">Client Satisfaction</div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">8+</span>
              <div className="hero-stat-label">Years Experience</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* OPTIMIZED: Simplified scroll indicator */}
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