import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PropertyImageGalleryProps {
  images: string[];
  propertyTitle: string;
  propertyLabels?: {
    isPremium: boolean;
    isFeatured: boolean;
    isHot: boolean;
    isSold: boolean;
  };
}

export function PropertyImageGallery({ images, propertyTitle, propertyLabels }: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set([0]));
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Device detection
  const getDeviceType = useCallback(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  const deviceType = getDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // Adaptive UI configuration
  const adaptiveConfig = {
    mobile: {
      closePosition: 'bottom-right',
      navPosition: 'bottom-center',
      showThumbnails: false,
      enableSwipe: true,
      buttonSize: 'h-16 w-16',
      iconSize: 'h-8 w-8'
    },
    tablet: {
      closePosition: 'top-center',
      navPosition: 'sides',
      showThumbnails: true,
      enableSwipe: true,
      buttonSize: 'h-14 w-14',
      iconSize: 'h-7 w-7'
    },
    desktop: {
      closePosition: 'top-center',
      navPosition: 'sides',
      showThumbnails: true,
      enableSwipe: false,
      buttonSize: 'h-14 w-14',
      iconSize: 'h-7 w-7'
    }
  };

  const config = adaptiveConfig[deviceType];

  // Auto-play slideshow (disabled when lightbox is open)
  useEffect(() => {
    if (isLightboxOpen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, isLightboxOpen]);

  // Smart image preloading
  useEffect(() => {
    const preloadIndices = [currentIndex - 1, currentIndex + 1];
    preloadIndices.forEach(idx => {
      if (idx >= 0 && idx < images.length && !loadedImages.has(idx)) {
        const img = new Image();
        img.src = images[idx];
        img.onload = () => {
          setLoadedImages(prev => new Set([...Array.from(prev), idx]));
        };
      }
    });
  }, [currentIndex, images, loadedImages]);

  // Touch and mouse gesture handling for all devices
  useEffect(() => {
    if (!isLightboxOpen) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handleStart = (clientX: number, clientY: number) => {
      startX = clientX;
      startY = clientY;
      isDragging = true;
    };

    const handleEnd = (clientX: number, clientY: number) => {
      if (!isDragging || !startX || !startY) return;

      const deltaX = startX - clientX;
      const deltaY = startY - clientY;

      // Only handle horizontal swipes/drags (ignore vertical scrolls)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe/drag left - go to next image
          goToNext();
        } else {
          // Swipe/drag right - go to previous image
          goToPrevious();
        }
      }

      startX = 0;
      startY = 0;
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      handleEnd(e.clientX, e.clientY);
    };

    const lightboxElement = lightboxRef.current;
    if (lightboxElement) {
      // Touch events for mobile/tablet
      lightboxElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      lightboxElement.addEventListener('touchend', handleTouchEnd, { passive: false });

      // Mouse events for desktop
      lightboxElement.addEventListener('mousedown', handleMouseDown);
      lightboxElement.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (lightboxElement) {
        lightboxElement.removeEventListener('touchstart', handleTouchStart);
        lightboxElement.removeEventListener('touchend', handleTouchEnd);
        lightboxElement.removeEventListener('mousedown', handleMouseDown);
        lightboxElement.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isLightboxOpen]);

  // Enhanced keyboard navigation with zoom controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Escape':
          event.preventDefault();
          setIsLightboxOpen(false);
          break;
      }
    };

    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, isDesktop]);


  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Focus trapping for accessibility
  useEffect(() => {
    if (!isLightboxOpen) return;

    const focusableElements = lightboxRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    // Small delay to ensure DOM is ready
    setTimeout(() => firstElement?.focus(), 100);

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isLightboxOpen]);

  // Reduced motion support
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any cached images
      loadedImages.forEach(idx => {
        if (idx >= 0 && idx < images.length) {
          const img = new Image();
          img.src = images[idx];
          // Clear cache by setting to empty
          img.src = '';
        }
      });
    };
  }, [loadedImages, images]);

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted">
          <img
            src={images[currentIndex]}
            alt={`${propertyTitle} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop';
            }}
            data-testid="image-main"
          />

          {/* Property Labels Overlay */}
          {propertyLabels && (
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {propertyLabels.isPremium && (
                <Badge variant="secondary" className="bg-white/90 text-black border-0 shadow-lg">
                  Premium
                </Badge>
              )}
              {propertyLabels.isFeatured && (
                <Badge className="bg-amber-500/90 text-white border-0 shadow-lg">
                  Featured
                </Badge>
              )}
              {propertyLabels.isHot && (
                <Badge variant="destructive" className="bg-red-500/90 border-0 shadow-lg">
                  Hot Listing
                </Badge>
              )}
              {propertyLabels.isSold && (
                <Badge variant="destructive" className="bg-red-600/90 border-0 shadow-lg">
                  SOLD
                </Badge>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={goToPrevious}
                data-testid="button-previous-image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={goToNext}
                data-testid="button-next-image"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden hover-elevate transition-all ${
                  index === currentIndex ? "ring-2 ring-primary" : ""
                }`}
                data-testid={`button-thumbnail-${index}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Lightbox with Adaptive Layout */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/96 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button - Top Center for All Devices */}
          <div className="absolute top-0 left-0 right-0 z-60 p-6 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              className={`bg-black/80 backdrop-blur-md hover:bg-black/95 text-white border border-white/40 hover:border-white/60 rounded-full ${config.buttonSize} shadow-2xl transition-all duration-200 hover:scale-105`}
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              data-testid="button-close-lightbox"
              aria-label="Close image preview"
            >
              <X className={config.iconSize} />
            </Button>
          </div>


          {/* Image Counter - Positioned to not interfere with full screen image */}
          <div className={`absolute z-60 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30 shadow-lg ${
            isMobile ? 'top-20 left-6' : 'top-20 left-6'
          }`}>
            {currentIndex + 1} / {images.length}
          </div>

          {/* Keyboard Shortcuts Hint - Desktop only, positioned safely */}
          {isDesktop && (
            <div className="absolute top-20 right-6 z-60 bg-black/60 backdrop-blur-md text-white px-3 py-2 rounded-lg text-xs border border-white/20">
              <div>← → Navigate</div>
              <div>Esc Close</div>
            </div>
          )}

          {/* Main Content Area - TRUE Full Screen Images */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Main Image Container - TRUE Full Screen */}
            <div className="relative w-screen h-screen flex items-center justify-center">
              <img
                src={images[currentIndex]}
                alt={`${propertyTitle} - Full screen ${currentIndex + 1}`}
                className="w-screen h-screen object-cover select-none"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop';
                }}
                draggable={false}
              />

            </div>

            {images.length > 1 && (
              <>

                {/* Thumbnail Strip - Positioned safely above bottom */}
                {config.showThumbnails && (
                  <div className={`absolute z-60 flex gap-2 bg-black/60 backdrop-blur-md rounded-full p-2 border border-white/20 ${
                    isMobile ? 'bottom-32 left-1/2 -translate-x-1/2' : 'bottom-20 left-1/2 -translate-x-1/2'
                  }`}>
                    {images.slice(Math.max(0, currentIndex - 2), Math.min(images.length, currentIndex + 3)).map((image, idx) => {
                      const actualIndex = Math.max(0, currentIndex - 2) + idx;
                      return (
                        <button
                          key={actualIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(actualIndex);
                          }}
                          className={`rounded-lg overflow-hidden border-2 transition-all ${
                            isMobile ? 'w-10 h-10' : 'w-12 h-12'
                          } ${
                            actualIndex === currentIndex
                              ? 'border-white shadow-lg scale-110'
                              : 'border-white/30 hover:border-white/60'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${actualIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Accessibility hints */}
                <div className="sr-only" aria-live="polite">
                  {isMobile
                    ? "Swipe left or right to navigate images, tap outside to close"
                    : "Drag left or right to navigate images, press Escape to close preview"
                  }
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
