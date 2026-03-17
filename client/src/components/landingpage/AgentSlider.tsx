import { useState, useEffect, useRef, useCallback } from 'react';

const agents = [
  { name: "Agent Andi", photo: "https://images.salambumi.xyz/agent/Agent%20Andi.webp" },
  { name: "Agent Dimas", photo: "https://images.salambumi.xyz/agent/Agent%20Dimas.webp" },
  { name: "Agent Maya", photo: "https://images.salambumi.xyz/agent/Agent%20Maya.webp" },
  { name: "Agent Putri", photo: "https://images.salambumi.xyz/agent/Agent%20Putri.webp" },
  { name: "Agent Rizal", photo: "https://images.salambumi.xyz/agent/Agent%20Rizal.webp" },
  { name: "Agent Sarah", photo: "https://images.salambumi.xyz/agent/Agent%20Sarah.webp" }
];

export default function AgentSlider() {
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
      prevIndex === agents.length - 1 ? 0 : prevIndex + 1
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

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50" onMouseEnter={() => setIsAutoSliding(false)} onMouseLeave={() => setIsAutoSliding(true)}>
      <div className="container mx-auto px-4">
        <div
          className="text-center mb-16"
          data-aos="fade-up"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tim Agen Profesional Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tim ahli yang siap membantu Anda menemukan properti impian
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl">
            <div className="flex justify-center space-x-8">
              {agents.map((agent, index) => {
                const isActive = index === currentIndex;
                const offset = (index - currentIndex + agents.length) % agents.length;

                return (
                  <div
                    key={index}
                    className={`transition-all duration-700 ease-out ${
                      isActive
                        ? 'scale-110 z-10'
                        : offset === 1 || offset === agents.length - 1
                        ? 'scale-90 opacity-60'
                        : 'scale-75 opacity-30'
                    }`}
                    style={{
                      transition: `all ${TIMING.slide}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    }}
                  >
                    <div className={`text-center ${isActive ? '' : 'pointer-events-none'}`}>
                      <div className={`inline-block rounded-full overflow-hidden border-4 transition-all duration-300 ${
                        isActive ? 'border-blue-600 shadow-2xl' : 'border-gray-200'
                      }`}>
                        <picture>
                          <source srcSet={agent.photo} type="image/webp" />
                          <img
                            src={agent.photo}
                            alt={agent.name}
                            className="w-32 h-32 object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.endsWith('.webp')) {
                                target.src = '/placeholder-lp.png';
                              } else {
                                target.src = '/placeholder-lp.png';
                              }
                            }}
                          />
                        </picture>
                      </div>
                      <h3 className={`mt-4 text-xl font-semibold transition-colors duration-300 ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {agent.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-12 space-x-3">
              {agents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoSliding(false);
                  }}
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
      </div>
    </section>
  );
}