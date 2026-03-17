import { useEffect, useState } from "react";
import { useLPContent, useUpdateLPContent } from "@/hooks/use-lp-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";

// Dynamic Hero Component for LP-3 (Elegant Design)
function DynamicHero({ heroContent, isEditMode, onEdit }: {
  heroContent?: any;
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 group">
      {/* Edit Overlay for Hero */}
      {isEditMode && (
        <div className="absolute inset-0 z-20 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onEdit?.('hero', heroContent || {}, (data) => {
              // This will be handled by the parent component
            })}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Hero Section
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className={`space-y-4 ${isEditMode ? 'cursor-pointer hover:bg-white/5 rounded-lg p-4 -m-4' : ''}`}
               onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : undefined}>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              {heroContent?.title || "Elegant"}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {heroContent?.subtitle || "Properties"}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {heroContent?.description || "Discover luxury properties with sophisticated design and premium locations in Yogyakarta"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <button
              className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = (heroContent?.ctaLink || "/properties")}
            >
              {heroContent?.ctaText || "Explore Luxury Properties"}
            </button>
            <button
              className={`px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300 ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = "/#contact"}
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>
  );
}

// Dynamic Features Section
function DynamicFeatures({ featuresContent, isEditMode, onEdit }: {
  featuresContent?: any[];
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  const defaultFeatures = [
    {
      icon: "🏛️",
      title: "Premium Architecture",
      description: "Modern design with attention to detail and luxury finishes"
    },
    {
      icon: "📍",
      title: "Prime Locations",
      description: "Strategic locations in the most desirable areas of Yogyakarta"
    },
    {
      icon: "🔒",
      title: "Legal Assurance",
      description: "Complete legal documentation and clear property titles"
    }
  ];

  const features = featuresContent || defaultFeatures;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Our Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the perfect blend of luxury, comfort, and sophistication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature: any, index: number) => (
            <div key={index} className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 ${isEditMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                 onClick={isEditMode ? () => onEdit?.('features', features, () => {}) : undefined}>
              <div className="text-6xl mb-6">{feature.icon || "✨"}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title || "Feature Title"}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description || "Feature description"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Dynamic Properties Showcase
function DynamicProperties({ propertiesContent }: { propertiesContent?: any[] }) {
  if (!propertiesContent || propertiesContent.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Featured Luxury Properties
          </h2>
          <p className="text-xl text-gray-600">
            Discover our most exclusive and prestigious properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propertiesContent.slice(0, 6).map((property: any, index: number) => (
            <div key={index} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-200 to-pink-200 relative overflow-hidden">
                <img
                  src={property.image || "/default-property.jpg"}
                  alt={property.title || "Luxury Property"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-2xl font-bold">{property.price || "Price"}</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title || "Luxury Property"}</h3>
                <p className="text-gray-600 mb-4">{property.location || "Prime Location"}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">{property.type || "Property Type"}</div>
                  <a
                    href={property.link || "/properties"}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    View Details
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

export default function LP3Page() {
  const { data: contentData, isLoading } = useLPContent("LP-3");
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
        lp_template: "LP-3",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading Elegant Landing Page...</p>
        </div>
      </div>
    );
  }

  // Extract content from database
  const heroContent = contentData?.find(c => c.content_type === 'hero')?.content_data;
  const featuresContent = contentData?.find(c => c.content_type === 'features')?.content_data;
  const propertiesContent = contentData?.find(c => c.content_type === 'properties')?.content_data;

  return (
    <main className="overflow-hidden min-h-screen">
      <DynamicHero
        heroContent={heroContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicFeatures
        featuresContent={featuresContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicProperties propertiesContent={propertiesContent} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-pink-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience Luxury Living?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Let us guide you through our exclusive collection of premium properties
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/properties">
              <button className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg">
                Browse Properties
              </button>
            </a>
            <a href="/#contact">
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-purple-900 transition-all duration-300 hover:scale-105">
                Contact Our Experts
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, type: '', data: null, onSave: () => {} })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type === 'hero' ? 'Hero Section' : editDialog.type === 'features' ? 'Features' : editDialog.type}</DialogTitle>
          </DialogHeader>

          {editDialog.type === 'hero' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={editDialog.data?.title || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, title: e.target.value }
                  }))}
                  placeholder="Elegant"
                />
              </div>

              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Input
                  id="hero-subtitle"
                  value={editDialog.data?.subtitle || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, subtitle: e.target.value }
                  }))}
                  placeholder="Properties"
                />
              </div>

              <div>
                <Label htmlFor="hero-description">Description</Label>
                <Textarea
                  value={editDialog.data?.description || ''}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, description: e.target.value }
                  }))}
                  placeholder="Discover luxury properties..."
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
                  placeholder="Explore Luxury Properties"
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

          {editDialog.type === 'features' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Features will be editable in the next update. Currently using default elegant features.
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