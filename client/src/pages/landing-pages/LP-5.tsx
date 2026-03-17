import { useEffect, useState } from "react";
import { useLPContent, useUpdateLPContent } from "@/hooks/use-lp-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Building, Award, Shield } from "lucide-react";

// Dynamic Hero Component for LP-5 (Professional)
function DynamicHero({ heroContent, isEditMode, onEdit }: {
  heroContent?: any;
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 group">
      {/* Edit Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 z-20 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onEdit?.('hero', heroContent || {}, () => {})}
            className="bg-slate-700 hover:bg-slate-600 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Professional Hero
          </Button>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isEditMode ? 'cursor-pointer hover:bg-white/5 rounded-lg p-6 -m-6' : ''}`}
                 onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : undefined}>
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-blue-600/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-medium text-sm">Trusted Property Experts</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  {heroContent?.title || "Professional"}
                  <span className="block text-blue-400">
                    {heroContent?.subtitle || "Property Solutions"}
                  </span>
                </h1>

                <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                  {heroContent?.description || "Delivering excellence in property management with over 15 years of industry expertise and proven track record"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className={`px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ${isEditMode ? 'cursor-pointer' : ''}`}
                  onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = (heroContent?.ctaLink || "/properties")}
                >
                  {heroContent?.ctaText || "View Our Portfolio"}
                </button>
                <button
                  className={`px-8 py-4 border border-slate-400 text-white hover:bg-white hover:text-slate-900 font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 ${isEditMode ? 'cursor-pointer' : ''}`}
                  onClick={isEditMode ? () => onEdit?.('hero', heroContent || {}, () => {}) : () => window.location.href = "/#contact"}
                >
                  Schedule Consultation
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-slate-400">Properties Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">15+</div>
                  <div className="text-sm text-slate-400">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-sm text-slate-400">Client Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Content - Professional Image/Stats */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Property Management</div>
                      <div className="text-slate-400 text-sm">Full-service solutions</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Legal Compliance</div>
                      <div className="text-slate-400 text-sm">Complete documentation</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Award Winning</div>
                      <div className="text-slate-400 text-sm">Industry recognition</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic Services Section
function DynamicServices({ servicesContent, isEditMode, onEdit }: {
  servicesContent?: any[];
  isEditMode?: boolean;
  onEdit?: (type: string, data: any, onSave: (data: any) => void) => void;
}) {
  const defaultServices = [
    {
      icon: "🏢",
      title: "Commercial Properties",
      description: "Office spaces, retail locations, and investment properties with prime locations",
      features: ["Strategic Locations", "High ROI", "Professional Management"]
    },
    {
      icon: "🏠",
      title: "Residential Properties",
      description: "Luxury homes, apartments, and condominiums for discerning buyers",
      features: ["Premium Quality", "Modern Amenities", "Secure Environment"]
    },
    {
      icon: "🌳",
      title: "Land Development",
      description: "Prime land parcels for development and investment opportunities",
      features: ["Clear Titles", "Infrastructure Ready", "Growth Potential"]
    }
  ];

  const services = servicesContent || defaultServices;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Professional Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive property solutions backed by industry expertise and proven methodologies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service: any, index: number) => (
            <div key={index} className={`group bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg ${isEditMode ? 'cursor-pointer' : ''}`}
                 onClick={isEditMode ? () => onEdit?.('services', services, () => {}) : undefined}>
              <div className="text-5xl mb-6">{service.icon || "🏢"}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title || "Service Title"}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description || "Service description"}</p>

              <ul className="space-y-2">
                {(service.features || []).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Dynamic Portfolio Section
function DynamicPortfolio({ portfolioContent }: { portfolioContent?: any[] }) {
  if (!portfolioContent || portfolioContent.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Portfolio
          </h2>
          <p className="text-xl text-gray-600">
            Showcasing our successful property transactions and developments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioContent.slice(0, 8).map((item: any, index: number) => (
            <div key={index} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-slate-200 relative">
                <img
                  src={item.image || "/default-portfolio.jpg"}
                  alt={item.title || "Portfolio Item"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title || "Project Title"}</h3>
                <p className="text-sm text-gray-600">{item.category || "Category"}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">{item.value || "Value"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LP5Page() {
  const { data: contentData, isLoading } = useLPContent("LP-5");
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
        lp_template: "LP-5",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p>Loading Professional Landing Page...</p>
        </div>
      </div>
    );
  }

  // Extract content from database
  const heroContent = contentData?.find(c => c.content_type === 'hero')?.content_data;
  const servicesContent = contentData?.find(c => c.content_type === 'services')?.content_data;
  const portfolioContent = contentData?.find(c => c.content_type === 'portfolio')?.content_data;

  return (
    <main className="overflow-hidden min-h-screen">
      <DynamicHero
        heroContent={heroContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicServices
        servicesContent={servicesContent}
        isEditMode={isEditMode}
        onEdit={openEditDialog}
      />

      <DynamicPortfolio portfolioContent={portfolioContent} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Partner with Professionals?
          </h2>
          <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">
            Join our network of satisfied clients who trust us with their most valuable investments
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/properties">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold hover:shadow-lg transition-all duration-300">
                Explore Opportunities
              </button>
            </a>
            <a href="/#contact">
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-slate-900 transition-all duration-300">
                Contact Our Team
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, type: '', data: null, onSave: () => {} })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type === 'hero' ? 'Professional Hero' : editDialog.type === 'services' ? 'Services' : editDialog.type}</DialogTitle>
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
                  placeholder="Professional"
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
                  placeholder="Property Solutions"
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
                  placeholder="Delivering excellence in property management..."
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
                  placeholder="View Our Portfolio"
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

          {editDialog.type === 'services' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Services will be editable in the next update. Currently using default professional services.
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