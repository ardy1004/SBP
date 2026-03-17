import { useEffect, useState } from "react";
import { useLPContent, useUpdateLPContent } from "@/hooks/use-lp-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Zap, TrendingUp, Users } from "lucide-react";

// Dynamic Hero Component for LP-4 (Dynamic/Animated)
function DynamicHero({ heroContent, isEditMode, onEdit }: {
  heroContent?: any;
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { bg: "from-red-500 to-pink-500", title: "Dynamic", subtitle: "Properties" },
    { bg: "from-blue-500 to-purple-500", title: "Modern", subtitle: "Living" },
    { bg: "from-green-500 to-teal-500", title: "Smart", subtitle: "Homes" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden group">
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bg} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-white/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/5 rounded-full animate-ping"></div>
      </div>

      {/* Edit Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 z-20 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onEdit?.('hero', heroContent || {}, () => {})}
            className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Dynamic Hero
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className={`space-y-6 ${isEditMode ? 'cursor-pointer hover:bg-white/5 rounded-lg p-6 -m-6' : ''}`}
               onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : undefined}>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-white font-medium">Live Animation</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight tracking-tight animate-fade-in">
              <span className="animate-slide-up">{currentSlideData.title}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 animate-slide-up animation-delay-200">
                {currentSlideData.subtitle}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-400">
              {heroContent?.description || "Experience cutting-edge property technology with smooth animations and interactive features"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 animate-fade-in animation-delay-600">
            <button
              className={`px-10 py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-full shadow-2xl hover:shadow-red-500/25 transform hover:scale-110 transition-all duration-300 animate-pulse-slow ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = (heroContent?.ctaLink || "/properties")}
            >
              <Zap className="w-5 h-5 inline mr-2" />
              {heroContent?.ctaText || "Explore Dynamic Properties"}
            </button>
            <button
              className={`px-10 py-5 border-2 border-white/50 text-white font-bold rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = "/#contact"}
            >
              Get Started
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-3 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic Stats Section
function DynamicStats({ statsContent, isEditMode, onEdit }: {
  statsContent?: any[];
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  const defaultStats = [
    { icon: TrendingUp, value: "500+", label: "Properties Sold", color: "text-green-500" },
    { icon: Users, value: "10K+", label: "Happy Clients", color: "text-blue-500" },
    { icon: Zap, value: "24/7", label: "Support", color: "text-purple-500" },
  ];

  const stats = statsContent || defaultStats;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat: any, index: number) => {
            const IconComponent = stat.icon || TrendingUp;
            return (
              <div key={index} className={`text-center group ${isEditMode ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-4 -m-4' : ''}`}
                   onClick={isEditMode ? () => onEdit?.('stats', stats, () => {}) : undefined}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className={`w-10 h-10 ${stat.color || 'text-red-500'} animate-pulse`} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 animate-count-up">
                  {stat.value || "0"}
                </div>
                <div className="text-lg text-gray-600">
                  {stat.label || "Statistic"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Dynamic Interactive Properties
function DynamicProperties({ propertiesContent }: { propertiesContent?: any[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!propertiesContent || propertiesContent.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-up">
            Interactive Property Showcase
          </h2>
          <p className="text-xl text-gray-600 animate-fade-in animation-delay-200">
            Hover and explore our dynamic property collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propertiesContent.slice(0, 6).map((property: any, index: number) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-red-200 to-pink-200 relative overflow-hidden">
                <img
                  src={property.image || "/default-property.jpg"}
                  alt={property.title || "Dynamic Property"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* Animated overlay content */}
                <div className={`absolute bottom-4 left-4 right-4 text-white transition-all duration-300 ${hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <div className="text-2xl font-bold mb-2 animate-slide-up">{property.price || "Price"}</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Available Now</span>
                  </div>
                </div>

                {/* Floating animation elements */}
                <div className={`absolute top-4 right-4 w-3 h-3 bg-white rounded-full transition-all duration-300 ${hoveredIndex === index ? 'animate-ping' : 'opacity-0'}`}></div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                  {property.title || "Dynamic Property"}
                </h3>
                <p className="text-gray-600 mb-4">{property.location || "Prime Location"}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">{property.type || "Property Type"}</div>
                  <a
                    href={property.link || "/properties"}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 animate-pulse-slow"
                  >
                    Explore Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LP4Page() {
  const { data: contentData, isLoading } = useLPContent("LP-4");
  const updateContent = useUpdateLPContent();
  const { toast } = useToast();

  // Check if we're in edit mode (from URL params)
  const isEditMode = new URLSearchParams(window.location.search).get('editMode') === 'true';

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    type: string;
    data: any;
    onSave: (data: any) => void;
  }>({
    isOpen: false,
    type: '',
    data: null,
    onSave: () => {},
  });

  // Helper function to open edit dialog
  const openEditDialog = (type: string, currentData: any, onSave: (data: any) => void) => {
    setEditDialog({
      isOpen: true,
      type,
      data: { ...currentData },
      onSave: (data: any) => saveContent(type, data),
    });
  };

  // Helper function to save content
  const saveContent = async (contentType: string, data: any) => {
    try {
      await updateContent.mutateAsync({
        lp_template: "LP-4",
        content_type: contentType,
        content_data: data,
        is_active: true,
      });

      toast({
        title: "Konten Disimpan",
        description: `${contentType} berhasil diperbarui.`,
      });

      setEditDialog({ isOpen: false, type: '', data: null, onSave: () => {} });
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal menyimpan ${contentType}.`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading Dynamic Landing Page...</p>
        </div>
      </div>
    );
  }

  // Extract content from database
  const heroContent = contentData?.find(c => c.content_type === 'hero')?.content_data;
  const statsContent = contentData?.find(c => c.content_type === 'stats')?.content_data;
  const propertiesContent = contentData?.find(c => c.content_type === 'properties')?.content_data;

  return (
    <main className="overflow-hidden min-h-screen">
      <DynamicHero
        heroContent={heroContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicStats
        statsContent={statsContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicProperties propertiesContent={propertiesContent} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-bounce">
            Ready for Dynamic Living?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect property through our dynamic platform
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/properties">
              <button className="bg-white text-red-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-110 shadow-lg animate-pulse">
                Start Your Journey
              </button>
            </a>
            <a href="/#contact">
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-red-600 transition-all duration-300 hover:scale-105">
                Contact Experts
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, type: '', data: null, onSave: () => {} })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type === 'hero' ? 'Dynamic Hero' : editDialog.type === 'stats' ? 'Statistics' : editDialog.type}</DialogTitle>
          </DialogHeader>

          {editDialog.type === 'hero' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero-description">Hero Description</Label>
                <Textarea
                  id="hero-description"
                  value={editDialog.data?.description || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, description: e.target.value }
                  }))}
                  placeholder="Experience cutting-edge property technology..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="hero-cta-text">CTA Button Text</Label>
                <Input
                  id="hero-cta-text"
                  value={editDialog.data?.ctaText || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, ctaText: e.target.value }
                  }))}
                  placeholder="Explore Dynamic Properties"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => editDialog.onSave(editDialog.data)}
                  disabled={updateContent.isPending}
                  className="flex-1"
                >
                  {updateContent.isPending ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditDialog({ isOpen: false, type: '', data: null, onSave: () => {} })}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </div>
            </div>
          )}

          {editDialog.type === 'stats' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Statistics will be editable in the next update. Currently using default dynamic stats.
              </div>
              <Button
                variant="outline"
                onClick={() => setEditDialog({ isOpen: false, type: '', data: null, onSave: () => {} })}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}