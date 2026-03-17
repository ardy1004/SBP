import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wand2, RefreshCw, Copy, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIContentGeneratorProps {
  onContentGenerated: (content: any) => void;
  currentContent?: any;
}

interface GenerationOptions {
  niche: string;
  tone: string;
  targetAudience: string;
  keywords: string[];
  competitorAnalysis: boolean;
  seoOptimization: boolean;
  emotionalAppeal: boolean;
}

export function AIContentGenerator({ onContentGenerated, currentContent }: AIContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [options, setOptions] = useState<GenerationOptions>({
    niche: "real-estate",
    tone: "professional",
    targetAudience: "young-professionals",
    keywords: ["properti", "rumah", "apartemen", "investasi"],
    competitorAnalysis: true,
    seoOptimization: true,
    emotionalAppeal: true,
  });

  const { toast } = useToast();

  // AI Content Generation Simulation (Replace with actual AI API)
  const generateContent = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const aiGeneratedContent = {
        hero: {
          title: generateHeroTitle(options),
          subtitle: generateHeroSubtitle(options),
          ctaText: generateCTAText(options),
          ctaLink: "/properties"
        },
        agent: {
          name: generateAgentName(options),
          title: generateAgentTitle(options),
          bio: generateAgentBio(options),
          phone: "+62 812-3456-7890",
          email: generateAgentEmail(options)
        },
        testimonials: generateTestimonials(options),
        properties: generateProperties(options),
        valueProps: generateValueProps(options),
        cta: generateCTASection(options)
      };

      setGeneratedContent(aiGeneratedContent);

      toast({
        title: "Konten AI Generated",
        description: "Konten telah berhasil di-generate berdasarkan analisis AI.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal generate konten AI. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [options, toast]);

  // AI Generation Functions (Mock implementations - replace with real AI)
  const generateHeroTitle = (opts: GenerationOptions) => {
    const titles = {
      "real-estate": [
        "Temukan Hunian Impian Anda di Yogyakarta",
        "Investasi Properti Terbaik untuk Masa Depan",
        "Rumah Idaman dengan Lokasi Strategis",
        "Apartemen Modern dengan Fasilitas Lengkap"
      ]
    };
    return titles[opts.niche as keyof typeof titles]?.[0] || "Temukan Properti Impian Anda";
  };

  const generateHeroSubtitle = (opts: GenerationOptions) => {
    return opts.niche === "real-estate"
      ? "Koleksi properti premium dengan legalitas terjamin dan lokasi strategis di Yogyakarta"
      : "Solusi properti terbaik untuk kebutuhan Anda";
  };

  const generateCTAText = (opts: GenerationOptions) => {
    return opts.tone === "professional" ? "Jelajahi Koleksi Properti" : "Lihat Sekarang!";
  };

  const generateAgentName = (opts: GenerationOptions) => {
    const names = ["Ahmad Rahman", "Sari Wijaya", "Budi Santoso", "Maya Sari", "Rizki Pratama"];
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateAgentTitle = (opts: GenerationOptions) => {
    return opts.tone === "professional" ? "Senior Property Consultant" : "Ahli Properti Terpercaya";
  };

  const generateAgentBio = (opts: GenerationOptions) => {
    return `Berpengalaman lebih dari ${Math.floor(Math.random() * 10) + 5} tahun dalam bidang properti Yogyakarta. Telah membantu ratusan klien menemukan properti impian mereka dengan pendekatan yang profesional dan personal.`;
  };

  const generateAgentEmail = (opts: GenerationOptions) => {
    const name = generateAgentName(opts).toLowerCase().replace(" ", ".");
    return `${name}@salambumi.com`;
  };

  const generateTestimonials = (opts: GenerationOptions) => {
    const testimonialTemplates = [
      {
        name: "Customer 1",
        quote: "Pelayanan yang sangat memuaskan dan profesional. Berhasil menemukan rumah impian dengan harga yang kompetitif.",
        rating: 5
      },
      {
        name: "Customer 2",
        quote: "Tim yang responsif dan terpercaya. Proses jual beli berjalan lancar tanpa kendala.",
        rating: 5
      },
      {
        name: "Customer 3",
        quote: "Kualitas properti sesuai dengan yang dijanjikan. Recommended untuk yang mencari properti di Yogyakarta.",
        rating: 5
      }
    ];

    return testimonialTemplates.map(t => ({
      ...t,
      name: generateAgentName(opts), // Random names
      photo: `/testimonials/customer-${Math.floor(Math.random() * 3) + 1}.jpg`
    }));
  };

  const generateProperties = (opts: GenerationOptions) => {
    const propertyTemplates = [
      {
        title: "Villa Mewah Condongcatur",
        price: "Rp 2.500.000.000",
        location: "Condongcatur, Yogyakarta",
        image: "/properties/villa-1.jpg"
      },
      {
        title: "Apartemen Modern Malioboro",
        price: "Rp 1.200.000.000",
        location: "Malioboro, Yogyakarta",
        image: "/properties/apartment-1.jpg"
      },
      {
        title: "Rumah Minimalis Sleman",
        price: "Rp 850.000.000",
        location: "Sleman, Yogyakarta",
        image: "/properties/house-1.jpg"
      }
    ];

    return propertyTemplates.map(p => ({
      ...p,
      link: `/properti/${p.title.toLowerCase().replace(/\s+/g, '-')}`
    }));
  };

  const generateValueProps = (opts: GenerationOptions) => {
    return [
      {
        icon: "🏠",
        title: "Properti Berkualitas",
        description: "Koleksi properti premium dengan legalitas terjamin"
      },
      {
        icon: "🤝",
        title: "Layanan Terpercaya",
        description: "Tim profesional siap membantu Anda 24/7"
      },
      {
        icon: "📍",
        title: "Lokasi Strategis",
        description: "Properti di lokasi terbaik Yogyakarta"
      }
    ];
  };

  const generateCTASection = (opts: GenerationOptions) => {
    return {
      title: "Ready to Find Your Dream Property?",
      subtitle: "Hubungi kami sekarang dan dapatkan konsultasi gratis",
      primaryButton: "Explore Properties",
      secondaryButton: "Contact Us"
    };
  };

  const applyGeneratedContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      toast({
        title: "Konten Diterapkan",
        description: "Konten AI telah diterapkan ke landing page.",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Teks Disalin",
      description: "Teks telah disalin ke clipboard.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Content Generator
        </CardTitle>
        <CardDescription>
          Generate konten landing page yang personalized menggunakan AI berdasarkan niche dan target audience Anda
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Niche Industri</Label>
            <Select value={options.niche} onValueChange={(value) => setOptions(prev => ({ ...prev, niche: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="e-commerce">E-Commerce</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone & Style</Label>
            <Select value={options.tone} onValueChange={(value) => setOptions(prev => ({ ...prev, tone: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={options.targetAudience} onValueChange={(value) => setOptions(prev => ({ ...prev, targetAudience: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="young-professionals">Young Professionals</SelectItem>
                <SelectItem value="families">Families</SelectItem>
                <SelectItem value="investors">Investors</SelectItem>
                <SelectItem value="senior-citizens">Senior Citizens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma separated)</Label>
            <Input
              id="keywords"
              value={options.keywords.join(', ')}
              onChange={(e) => setOptions(prev => ({
                ...prev,
                keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
              }))}
              placeholder="properti, rumah, apartemen"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.competitorAnalysis}
              onChange={(e) => setOptions(prev => ({ ...prev, competitorAnalysis: e.target.checked }))}
            />
            <span className="text-sm">Analisis Kompetitor</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.seoOptimization}
              onChange={(e) => setOptions(prev => ({ ...prev, seoOptimization: e.target.checked }))}
            />
            <span className="text-sm">SEO Optimization</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.emotionalAppeal}
              onChange={(e) => setOptions(prev => ({ ...prev, emotionalAppeal: e.target.checked }))}
            />
            <span className="text-sm">Emotional Appeal</span>
          </label>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateContent}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate AI Content
            </>
          )}
        </Button>

        {/* Generated Content Preview */}
        {generatedContent && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                AI Generated Content
              </h3>
              <Button onClick={applyGeneratedContent} size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply Content
              </Button>
            </div>

            <Tabs defaultValue="hero" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="agent">Agent</TabsTrigger>
                <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
              </TabsList>

              <TabsContent value="hero" className="space-y-2">
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{generatedContent.hero.title}</p>
                      <p className="text-sm text-gray-600">{generatedContent.hero.subtitle}</p>
                      <p className="text-sm text-blue-600 mt-1">CTA: {generatedContent.hero.ctaText}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent.hero.title)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agent" className="space-y-2">
                <div className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{generatedContent.agent.name}</p>
                      <p className="text-sm text-gray-600">{generatedContent.agent.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{generatedContent.agent.bio.substring(0, 100)}...</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent.agent.bio)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="testimonials" className="space-y-2">
                {generatedContent.testimonials.map((t: any, i: number) => (
                  <div key={i} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-gray-600">"{t.quote}"</p>
                        <div className="flex mt-1">
                          {[...Array(t.rating)].map((_, j) => (
                            <span key={j} className="text-yellow-400">★</span>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(t.quote)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="properties" className="space-y-2">
                {generatedContent.properties.map((p: any, i: number) => (
                  <div key={i} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-sm text-blue-600">{p.price}</p>
                        <p className="text-xs text-gray-500">{p.location}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(p.title)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">AI Insights</h4>
              <p className="text-sm text-blue-700 mt-1">
                Berdasarkan analisis pasar terkini, konten yang dihasilkan AI telah dioptimalkan untuk:
                • Conversion rate yang lebih tinggi
                • SEO performance yang excellent
                • Emotional connection dengan audience
                • Competitive advantage di niche Anda
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}