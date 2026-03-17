import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Eye, Upload, X, Plus, Sparkles } from "lucide-react";
import { useLPContent, useUpdateLPContent, useLPContentManager } from "@/hooks/use-lp-content";
import { useToast } from "@/hooks/use-toast";
import { AIContentGenerator } from "./AIContentGenerator";

interface LPContentEditorProps {
  lpTemplate: string;
  onPreview?: () => void;
}

interface ContentFormData {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  agent: {
    name: string;
    title: string;
    photo: string;
    bio: string;
    phone: string;
    email: string;
  };
  testimonials: Array<{
    name: string;
    photo: string;
    quote: string;
    rating: number;
  }>;
  properties: Array<{
    title: string;
    image: string;
    price: string;
    link: string;
    location: string;
  }>;
}

export function LPContentEditor({ lpTemplate, onPreview }: LPContentEditorProps) {
  const { data: contentData, isLoading: loadingContent } = useLPContent(lpTemplate);
  const updateContent = useUpdateLPContent();
  const { getDefaultContent } = useLPContentManager();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ContentFormData>({
    hero: getDefaultContent('hero'),
    agent: getDefaultContent('agent'),
    testimonials: getDefaultContent('testimonials'),
    properties: getDefaultContent('properties'),
  });

  const [saving, setSaving] = useState<string | null>(null);

  // Load existing content when data is available
  useEffect(() => {
    if (contentData && contentData.length > 0) {
      const newFormData = { ...formData };

      contentData.forEach(content => {
        if (content.content_type in newFormData) {
          (newFormData as any)[content.content_type] = content.content_data;
        }
      });

      setFormData(newFormData);
    }
  }, [contentData]);

  const handleSave = async (contentType: keyof ContentFormData) => {
    setSaving(contentType);

    try {
      await updateContent.mutateAsync({
        lp_template: lpTemplate,
        content_type: contentType,
        content_data: formData[contentType],
        is_active: true,
      });

      toast({
        title: "Konten Disimpan",
        description: `Konten ${contentType} untuk ${lpTemplate} berhasil disimpan.`,
      });

      // Trigger preview refresh after successful save
      if (onPreview) {
        onPreview();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal menyimpan konten ${contentType}.`,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const updateFormData = (contentType: keyof ContentFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [contentType]: data,
    }));
  };

  const addTestimonial = () => {
    const newTestimonial = {
      name: "",
      photo: "",
      quote: "",
      rating: 5,
    };
    updateFormData('testimonials', [...formData.testimonials, newTestimonial]);
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = formData.testimonials.filter((_, i) => i !== index);
    updateFormData('testimonials', newTestimonials);
  };

  const addProperty = () => {
    const newProperty = {
      title: "",
      image: "",
      price: "",
      link: "",
      location: "",
    };
    updateFormData('properties', [...formData.properties, newProperty]);
  };

  const removeProperty = (index: number) => {
    const newProperties = formData.properties.filter((_, i) => i !== index);
    updateFormData('properties', newProperties);
  };

  // Drag & Drop functionality
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex !== dropIndex) {
      const newProperties = [...formData.properties];
      const [draggedItem] = newProperties.splice(dragIndex, 1);
      newProperties.splice(dropIndex, 0, draggedItem);
      updateFormData('properties', newProperties);
    }

    setDraggedIndex(null);
  };

  if (loadingContent) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Memuat konten...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edit Konten {lpTemplate}</h2>
          <p className="text-muted-foreground">
            Sesuaikan konten landing page sesuai kebutuhan kampanye Anda
          </p>
        </div>
        <Button onClick={onPreview} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai-generator">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        {/* AI Content Generator */}
        <TabsContent value="ai-generator">
          <AIContentGenerator
            onContentGenerated={(generatedContent) => {
              // Apply generated content to form
              Object.keys(generatedContent).forEach(contentType => {
                if (generatedContent[contentType]) {
                  updateFormData(contentType as keyof ContentFormData, generatedContent[contentType]);
                }
              });

              toast({
                title: "Konten AI Diterapkan",
                description: "Konten yang di-generate AI telah dimuat ke editor.",
              });
            }}
            currentContent={formData}
          />
        </TabsContent>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Bagian utama landing page yang menampilkan pesan utama
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Judul Utama</Label>
                  <Input
                    id="hero-title"
                    value={formData.hero.title}
                    onChange={(e) => updateFormData('hero', { ...formData.hero, title: e.target.value })}
                    placeholder="Temukan Properti Impian Anda"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-subtitle">Sub Judul</Label>
                  <Input
                    id="hero-subtitle"
                    value={formData.hero.subtitle}
                    onChange={(e) => updateFormData('hero', { ...formData.hero, subtitle: e.target.value })}
                    placeholder="Platform terpercaya untuk jual beli properti"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-bg">Background Image URL</Label>
                <Input
                  id="hero-bg"
                  value={formData.hero.backgroundImage}
                  onChange={(e) => updateFormData('hero', { ...formData.hero, backgroundImage: e.target.value })}
                  placeholder="/images/hero-bg.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-cta-text">CTA Button Text</Label>
                  <Input
                    id="hero-cta-text"
                    value={formData.hero.ctaText}
                    onChange={(e) => updateFormData('hero', { ...formData.hero, ctaText: e.target.value })}
                    placeholder="Jelajahi Properti"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-cta-link">CTA Button Link</Label>
                  <Input
                    id="hero-cta-link"
                    value={formData.hero.ctaLink}
                    onChange={(e) => updateFormData('hero', { ...formData.hero, ctaLink: e.target.value })}
                    placeholder="/search"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('hero')}
                disabled={saving === 'hero'}
                className="w-full"
              >
                {saving === 'hero' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan Hero Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Section */}
        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle>Agent Section</CardTitle>
              <CardDescription>
                Informasi agent properti yang akan ditampilkan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Nama Agent</Label>
                  <Input
                    id="agent-name"
                    value={formData.agent.name}
                    onChange={(e) => updateFormData('agent', { ...formData.agent, name: e.target.value })}
                    placeholder="Nama Lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-title">Jabatan</Label>
                  <Input
                    id="agent-title"
                    value={formData.agent.title}
                    onChange={(e) => updateFormData('agent', { ...formData.agent, title: e.target.value })}
                    placeholder="Property Consultant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-photo">Foto Agent URL</Label>
                <Input
                  id="agent-photo"
                  value={formData.agent.photo}
                  onChange={(e) => updateFormData('agent', { ...formData.agent, photo: e.target.value })}
                  placeholder="/images/agent.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-bio">Bio Agent</Label>
                <Textarea
                  id="agent-bio"
                  value={formData.agent.bio}
                  onChange={(e) => updateFormData('agent', { ...formData.agent, bio: e.target.value })}
                  placeholder="Deskripsi singkat tentang agent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-phone">Nomor Telepon</Label>
                  <Input
                    id="agent-phone"
                    value={formData.agent.phone}
                    onChange={(e) => updateFormData('agent', { ...formData.agent, phone: e.target.value })}
                    placeholder="+62 812-3456-7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-email">Email</Label>
                  <Input
                    id="agent-email"
                    type="email"
                    value={formData.agent.email}
                    onChange={(e) => updateFormData('agent', { ...formData.agent, email: e.target.value })}
                    placeholder="agent@salambumi.com"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSave('agent')}
                disabled={saving === 'agent'}
                className="w-full"
              >
                {saving === 'agent' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan Agent Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Section */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Testimonials</CardTitle>
                  <CardDescription>
                    Testimoni customer yang akan ditampilkan
                  </CardDescription>
                </div>
                <Button onClick={addTestimonial} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Testimoni
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.testimonials.map((testimonial, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="outline">Testimoni {index + 1}</Badge>
                      <Button
                        onClick={() => removeTestimonial(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nama Customer</Label>
                        <Input
                          value={testimonial.name}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index].name = e.target.value;
                            updateFormData('testimonials', newTestimonials);
                          }}
                          placeholder="Nama Customer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Foto Customer URL</Label>
                        <Input
                          value={testimonial.photo}
                          onChange={(e) => {
                            const newTestimonials = [...formData.testimonials];
                            newTestimonials[index].photo = e.target.value;
                            updateFormData('testimonials', newTestimonials);
                          }}
                          placeholder="/images/customer.jpg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Quote/Testimoni</Label>
                      <Textarea
                        value={testimonial.quote}
                        onChange={(e) => {
                          const newTestimonials = [...formData.testimonials];
                          newTestimonials[index].quote = e.target.value;
                          updateFormData('testimonials', newTestimonials);
                        }}
                        placeholder="Testimoni customer"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={() => handleSave('testimonials')}
                disabled={saving === 'testimonials'}
                className="w-full"
              >
                {saving === 'testimonials' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan Testimonials
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Section */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Cards</CardTitle>
                  <CardDescription>
                    Drag & drop untuk mengatur urutan properti yang akan ditampilkan
                  </CardDescription>
                </div>
                <Button onClick={addProperty} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Property
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.properties.map((property, index) => (
                <Card
                  key={index}
                  className={`border cursor-move hover:shadow-md transition-shadow ${
                    draggedIndex === index ? 'opacity-50 shadow-lg scale-105' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Property {index + 1}</Badge>
                        <span className="text-xs text-gray-500">⋮⋮ Drag to reorder</span>
                      </div>
                      <Button
                        onClick={() => removeProperty(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Judul Property</Label>
                        <Input
                          value={property.title}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].title = e.target.value;
                            updateFormData('properties', newProperties);
                          }}
                          placeholder="Rumah Minimalis Condongcatur"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Harga</Label>
                        <Input
                          value={property.price}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].price = e.target.value;
                            updateFormData('properties', newProperties);
                          }}
                          placeholder="Rp 500.000.000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gambar Property URL</Label>
                        <Input
                          value={property.image}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].image = e.target.value;
                            updateFormData('properties', newProperties);
                          }}
                          placeholder="/images/property.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lokasi</Label>
                        <Input
                          value={property.location}
                          onChange={(e) => {
                            const newProperties = [...formData.properties];
                            newProperties[index].location = e.target.value;
                            updateFormData('properties', newProperties);
                          }}
                          placeholder="Condongcatur, Yogyakarta"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Link Detail Property</Label>
                      <Input
                        value={property.link}
                        onChange={(e) => {
                          const newProperties = [...formData.properties];
                          newProperties[index].link = e.target.value;
                          updateFormData('properties', newProperties);
                        }}
                        placeholder="/properti/rumah-minimalis-condongcatur"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={() => handleSave('properties')}
                disabled={saving === 'properties'}
                className="w-full"
              >
                {saving === 'properties' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan Property Cards
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}