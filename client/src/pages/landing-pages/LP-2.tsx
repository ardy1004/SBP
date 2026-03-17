import { useEffect, useState } from "react";
import { useLPContent, useUpdateLPContent } from "@/hooks/use-lp-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Leaf, Heart, Star } from "lucide-react";

// Dynamic Hero Component for LP-2 (Modern Minimalist)
function DynamicHero({ heroContent, isEditMode, onEdit }: {
  heroContent?: any;
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 group overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Edit Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 z-20 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onEdit?.('hero', heroContent || {}, () => {})}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Minimalist Hero
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className={`space-y-6 ${isEditMode ? 'cursor-pointer hover:bg-white/50 rounded-lg p-6 -m-6' : ''}`}
               onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : undefined}>
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
              <Leaf className="w-4 h-4" />
              <span>Eco-Friendly Living</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-light text-gray-900 leading-tight tracking-tight">
              {heroContent?.title || "Modern"}
              <span className="block font-medium text-emerald-600">
                {heroContent?.subtitle || "Minimalist Living"}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              {heroContent?.description || "Discover the beauty of simplicity with our carefully curated collection of modern minimalist properties"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              className={`px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = (heroContent?.ctaLink || "/properties")}
            >
              {heroContent?.ctaText || "Explore Properties"}
            </button>
            <button
              className={`px-10 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = "/#contact"}
            >
              Learn More
            </button>
          </div>

          {/* Minimalist stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-light text-gray-900 mb-2">50+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-gray-900 mb-2">100%</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Satisfied</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-gray-900 mb-2">24/7</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic Values Section
function DynamicValues({ valuesContent, isEditMode, onEdit }: {
  valuesContent?: any[];
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  const defaultValues = [
    {
      icon: "🌿",
      title: "Sustainable Living",
      description: "Eco-friendly materials and energy-efficient designs"
    },
    {
      icon: "🎯",
      title: "Purposeful Design",
      description: "Every element serves a function and aesthetic purpose"
    },
    {
      icon: "✨",
      title: "Timeless Beauty",
      description: "Classic designs that never go out of style"
    }
  ];

  const values = valuesContent || defaultValues;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              We believe in creating spaces that are not just beautiful, but meaningful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value: any, index: number) => (
              <div key={index} className={`text-center group ${isEditMode ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-4 -m-4' : ''}`}
                   onClick={isEditMode ? () => onEdit?.('values', values, () => {}) : undefined}>
                <div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-300">
                  {value.icon || "✨"}
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4">
                  {value.title || "Value Title"}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {value.description || "Value description"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Dynamic Properties Showcase
function DynamicProperties({ propertiesContent }: { propertiesContent?: any[] }) {
  if (!propertiesContent || propertiesContent.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Carefully selected properties that embody minimalist perfection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {propertiesContent.slice(0, 6).map((property: any, index: number) => (
              <div key={index} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-green-100 relative overflow-hidden">
                  <img
                    src={property.image || "/default-property.jpg"}
                    alt={property.title || "Minimalist Property"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {property.title || "Minimalist Property"}
                  </h3>
                  <p className="text-gray-600 mb-4 font-light">
                    {property.location || "Prime Location"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-light text-emerald-600">
                      {property.price || "Price"}
                    </div>
                    <a
                      href={property.link || "/properties"}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LP2Page() {
  const { data: contentData, isLoading } = useLPContent("LP-2");
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
        lp_template: "LP-2",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading Minimalist Landing Page...</p>
        </div>
      </div>
    );
  }

  // Extract content from database
  const heroContent = contentData?.find(c => c.content_type === 'hero')?.content_data;
  const valuesContent = contentData?.find(c => c.content_type === 'values')?.content_data;
  const propertiesContent = contentData?.find(c => c.content_type === 'properties')?.content_data;

  return (
    <main className="overflow-hidden min-h-screen">
      <DynamicHero
        heroContent={heroContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicValues
        valuesContent={valuesContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicProperties propertiesContent={propertiesContent} />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-900 to-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            Embrace Minimalist Living
          </h2>
          <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto font-light">
            Join the movement towards simpler, more meaningful living spaces
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/properties">
              <button className="bg-white text-emerald-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg">
                Discover Properties
              </button>
            </a>
            <a href="/#contact">
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-emerald-900 transition-all duration-300 hover:scale-105">
                Get In Touch
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, type: '', data: null, onSave: () => {} })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type === 'hero' ? 'Minimalist Hero' : editDialog.type === 'values' ? 'Values' : editDialog.type}</DialogTitle>
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
                  placeholder="Modern"
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
                  placeholder="Minimalist Living"
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
                  placeholder="Discover the beauty of simplicity..."
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
                  placeholder="Explore Properties"
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

          {editDialog.type === 'values' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Values will be editable in the next update. Currently using default minimalist values.
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