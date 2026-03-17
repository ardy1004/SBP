import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, ExternalLink, Loader2, SkipForward, RefreshCw, Database, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LPContentEditor } from "@/components/admin/LPContentEditor";
import { supabase } from "@/lib/supabase";
import {
  useLandingPages,
  useLandingPageConfig,
  useUpdateLandingPageConfig,
  useCacheManager,
  useOfflineSupport,
  useCachePerformance
} from "@/hooks/use-landing-pages";
import { LPPreviewModal } from "@/components/admin/LPPreviewModal";

interface LandingPage {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  isActive: boolean;
}

// Progressive Image Component with Multiple Fallbacks
const ProgressiveImage = ({ lp, className }: { lp: LandingPage; className?: string }) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Multiple fallback sources for each LP
  const getImageSources = (lp: LandingPage): string[] => {
    const lpId = lp.id;
    return [
      `/lp-previews/${lpId}.jpg`, // Primary: local preview folder
      lp.previewUrl, // Secondary: actual LP opengraph.jpg (if accessible)
      '/placeholder-lp.png' // Tertiary: generic placeholder
    ];
  };

  const sources = getImageSources(lp);

  const handleError = () => {
    if (currentSrcIndex < sources.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  // Enhanced alt text for accessibility
  const getAltText = (lp: LandingPage, srcIndex: number): string => {
    const baseText = `Preview of ${lp.name} landing page template. ${lp.description}`;
    if (srcIndex > 0) {
      return `${baseText}. Fallback image ${srcIndex + 1} of ${sources.length}`;
    }
    return baseText;
  };

  return (
    <img
      src={sources[currentSrcIndex]}
      alt={getAltText(lp, currentSrcIndex)}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      role="img"
      aria-describedby={`lp-title-${lp.id}`}
    />
  );
};

// Lazy Loading Image Component with Intersection Observer
const ImageWithLazyLoading = ({ lp }: { lp: LandingPage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
      {isVisible ? (
        <ProgressiveImage lp={lp} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
          <div className="text-gray-400 text-sm">Loading preview...</div>
        </div>
      )}
    </div>
  );
};


export default function AdminPersonalizePage() {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    lpId: string;
    lpName: string;
    previewUrl?: string;
  }>({
    isOpen: false,
    lpId: "",
    lpName: "",
  });

  const [selectedLPForEdit, setSelectedLPForEdit] = useState<{
    lpId: string;
    lpName: string;
  } | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use new caching hooks
  const { data: landingPages = [], isLoading: loadingPages, error: lpError } = useLandingPages();
  const { data: config } = useLandingPageConfig();
  const updateConfigMutation = useUpdateLandingPageConfig();
  const { invalidateLandingPages, clearAllCaches } = useCacheManager();
  const { isOnline } = useOfflineSupport();
  const { cacheStats } = useCachePerformance();

  // Get active LP from config or default to first available
  const activeLP = config?.active_lp || (landingPages.length > 0 ? landingPages[0].lp_id : "LP-1");

  // Live region for screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Clear announcements after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 5000);
  }, []);

  // Memoized landing pages with active state
  const LANDING_PAGES = useMemo(() => {
    return landingPages.map(lp => ({
      id: lp.lp_id,
      name: lp.name,
      description: lp.description,
      previewUrl: lp.preview_url,
      isActive: lp.lp_id === activeLP,
    }));
  }, [landingPages, activeLP]);

  const handleSelectLP = useCallback(async (lpId: string) => {
    try {
      // Use the mutation hook for optimistic updates and caching
      await updateConfigMutation.mutateAsync({
        active_lp: lpId,
        google_ads_link: config?.google_ads_link,
        tiktok_link: config?.tiktok_link,
        custom_links: config?.custom_links,
      });

      // Announce to screen readers
      announceToScreenReader(`${lpId} telah dipilih sebagai landing page aktif`);

      toast({
        title: "Landing Page Diperbarui",
        description: `${lpId} telah dipilih sebagai landing page aktif.`,
      });
    } catch (error) {
      console.error('Error saving config:', error);
      announceToScreenReader("Gagal menyimpan konfigurasi landing page");
      toast({
        title: "Error",
        description: "Gagal menyimpan konfigurasi landing page",
        variant: "destructive",
      });
    }
  }, [config, updateConfigMutation, announceToScreenReader, toast]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!LANDING_PAGES.length) return;

    const { key, ctrlKey, shiftKey } = event;
    let newIndex = focusedIndex;

    // Handle different keyboard shortcuts
    switch (key) {
      case 'ArrowRight':
        newIndex = Math.min(focusedIndex + 1, LANDING_PAGES.length - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'ArrowDown':
        newIndex = Math.min(focusedIndex + 3, LANDING_PAGES.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(focusedIndex - 3, 0);
        break;
      case 'Home':
        if (ctrlKey) {
          // Ctrl+Home: First item
          newIndex = 0;
        }
        break;
      case 'End':
        if (ctrlKey) {
          // Ctrl+End: Last item
          newIndex = LANDING_PAGES.length - 1;
        }
        break;
      case 'PageUp':
        newIndex = Math.max(focusedIndex - 9, 0); // Previous page (3x3 grid)
        break;
      case 'PageDown':
        newIndex = Math.min(focusedIndex + 9, LANDING_PAGES.length - 1); // Next page
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          event.preventDefault();
          handleSelectLP(LANDING_PAGES[focusedIndex].id);
          announceToScreenReader(`${LANDING_PAGES[focusedIndex].name} dipilih sebagai landing page aktif`);
        }
        return;
      case 'Tab':
        // Allow normal tab navigation out of grid
        if (!shiftKey) {
          setFocusedIndex(-1); // Reset focus when tabbing out
        }
        return;
      default:
        return;
    }

    event.preventDefault();
    setFocusedIndex(newIndex);

    // Focus the corresponding card with proper accessibility
    const cards = gridRef.current?.querySelectorAll('[role="gridcell"]');
    if (cards && cards[newIndex]) {
      (cards[newIndex] as HTMLElement).focus({ preventScroll: false });
      (cards[newIndex] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
      announceToScreenReader(`Navigasi ke ${LANDING_PAGES[newIndex].name}. ${LANDING_PAGES[newIndex].description}`);
    }
  }, [focusedIndex, LANDING_PAGES, handleSelectLP, announceToScreenReader]);

  // Handle grid focus entry
  const handleGridFocus = useCallback(() => {
    if (focusedIndex === -1 && LANDING_PAGES.length > 0) {
      setFocusedIndex(0);
      announceToScreenReader('Masuk ke grid landing page. Gunakan arrow keys untuk navigasi.');
    }
  }, [focusedIndex, LANDING_PAGES.length, announceToScreenReader]);

  const handlePreviewLP = useCallback((lpId: string) => {
    const lp = LANDING_PAGES.find(lp => lp.id === lpId);
    if (lp) {
      setPreviewModal({
        isOpen: true,
        lpId: lp.id,
        lpName: lp.name,
        previewUrl: lp.previewUrl,
      });
    } else {
      toast({
        title: "Error",
        description: `Landing page ${lpId} tidak ditemukan.`,
        variant: "destructive",
      });
    }
  }, [LANDING_PAGES, toast]);

  const closePreviewModal = useCallback(() => {
    setPreviewModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleEditContent = useCallback((lpId: string) => {
    const lp = LANDING_PAGES.find(lp => lp.id === lpId);
    if (lp) {
      setSelectedLPForEdit({
        lpId: lp.id,
        lpName: lp.name,
      });
    }
  }, [LANDING_PAGES]);

  const closeContentEditor = useCallback(() => {
    setSelectedLPForEdit(null);
  }, []);

  const refreshPreview = useCallback(() => {
    setPreviewRefreshKey(prev => prev + 1);
  }, []);


  if (loadingPages) {
    return (
      <div className="space-y-6">
        {/* Skip Links for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        <a
          href="#lp-grid"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to landing page grid
        </a>
  
        {/* Live Region for Screen Reader Announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          role="status"
        >
          {announcements.map((announcement) => (
            <div key={announcement}>{announcement}</div>
          ))}
        </div>
  
        <header>
          <h1
            id="main-content"
            className="text-3xl font-bold"
            tabIndex={-1}
          >
            Personalize Landing Pages
          </h1>
          <p className="text-muted-foreground mt-2">
            Pilih dan konfigurasikan template landing page untuk kampanye iklan Anda
          </p>
          <div id="keyboard-instructions" className="mt-4 text-sm text-gray-600" aria-hidden="true">
            <p>
              <strong>Keyboard navigation:</strong>{' '}
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs" aria-label="Tab key">Tab</kbd> navigasi,
              <kbd className="px-2 py-1 bg-gray-100 rounded ml-1 text-xs" aria-label="Enter key">Enter</kbd> atau
              <kbd className="px-2 py-1 bg-gray-100 rounded ml-1 text-xs" aria-label="Space key">Space</kbd> pilih,
              <kbd className="px-2 py-1 bg-gray-100 rounded ml-1 text-xs" aria-label="Arrow keys">Arrow keys</kbd> grid.
            </p>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">
            Memuat landing pages...
          </span>
        </div>
      </div>
    );
  }

  // If editing a specific LP, show visual inline editing layout
  if (selectedLPForEdit) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b shadow-sm p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Visual Editor: {selectedLPForEdit.lpName}</h1>
            <p className="text-sm text-gray-600">Klik pada elemen di preview untuk mengedit</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshPreview}>
              🔄 Refresh Preview
            </Button>
            <Button variant="ghost" onClick={closeContentEditor}>
              ✕ Keluar Editor
            </Button>
          </div>
        </div>

        {/* Visual Editor Container */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${window.location.origin}/${selectedLPForEdit.lpId}?editMode=true&t=${Date.now()}`}
            className="w-full h-full border-0"
            title={`Visual Editor ${selectedLPForEdit.lpName}`}
            key={`${selectedLPForEdit.lpId}-${previewRefreshKey}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personalize Landing Pages</h1>
        <p className="text-muted-foreground">
          Pilih dan konfigurasikan template landing page untuk kampanye iklan Anda
        </p>
      </div>

      <section
        id="lp-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="grid"
        aria-label="Grid template landing page. Gunakan arrow keys untuk navigasi."
        aria-rowcount={Math.ceil(LANDING_PAGES.length / 3)}
        aria-colcount={3}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={handleGridFocus}
        ref={gridRef}
        aria-describedby="keyboard-instructions"
      >
        {LANDING_PAGES.map((lp, index) => (
          <Card
            key={lp.id}
            className={`relative ${lp.isActive ? 'ring-2 ring-blue-500' : ''} ${
              focusedIndex === index ? 'ring-2 ring-blue-300' : ''
            }`}
            role="gridcell"
            aria-selected={lp.isActive}
            aria-label={`${lp.name}. ${lp.description}. ${lp.isActive ? 'Currently active' : 'Not active'}. URL: ${lp.id}`}
            tabIndex={focusedIndex === index ? 0 : -1}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg" id={`lp-title-${lp.id}`}>{lp.name}</CardTitle>
                {lp.isActive && (
                  <Badge variant="default" className="bg-green-500" aria-label="Landing page aktif">
                    <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                    Aktif
                  </Badge>
                )}
              </div>
              <CardDescription aria-describedby={`lp-title-${lp.id}`}>
                {lp.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview Image with Progressive Loading */}
              <ImageWithLazyLoading lp={lp} />

              {/* Action Buttons */}
              <div className="flex gap-2" role="group" aria-label={`Actions for ${lp.name}`}>
                <Button
                  variant={lp.isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectLP(lp.id)}
                  className="flex-1"
                  aria-pressed={lp.isActive}
                  aria-describedby={`lp-title-${lp.id}`}
                >
                  {lp.isActive ? "Aktif" : "Pilih"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditContent(lp.id)}
                  aria-label={`Edit content ${lp.name} landing page`}
                  title={`Edit Content ${lp.name}`}
                >
                  <Edit className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Edit</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewLP(lp.id)}
                  aria-label={`Preview ${lp.name} landing page`}
                  title={`Preview ${lp.name}`}
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Preview</span>
                </Button>
              </div>

              {/* URL Info */}
              <div className="text-sm text-muted-foreground">
                <span id={`url-label-${lp.id}`}>URL:</span>{' '}
                <code
                  className="bg-gray-100 px-1 rounded"
                  aria-labelledby={`url-label-${lp.id}`}
                >
                  /{lp.id}
                </code>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Cache Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Cache Management
          </CardTitle>
          <CardDescription>
            Monitor dan kelola cache untuk performa optimal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.memoryCacheSize}</div>
              <div className="text-sm text-muted-foreground">Memory Cache</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{cacheStats.imageCacheSize}</div>
              <div className="text-sm text-muted-foreground">Image Cache</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? '●' : '●'}
              </div>
              <div className="text-sm text-muted-foreground">Connection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {updateConfigMutation.isPending ? '...' : '✓'}
              </div>
              <div className="text-sm text-muted-foreground">Sync Status</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={invalidateLandingPages}
              disabled={!isOnline}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllCaches}
            >
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}