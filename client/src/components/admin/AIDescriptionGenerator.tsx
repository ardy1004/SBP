import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Copy, Check, Settings } from "lucide-react";
import { generatePropertyDescription } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PropertyData {
  jenis_properti?: string;
  kabupaten?: string;
  provinsi?: string;
  harga_properti?: string;
  kamar_tidur?: number;
  kamar_mandi?: number;
  luas_tanah?: number;
  luas_bangunan?: number;
  kode_listing?: string;
  judul_properti?: string;
  legalitas?: string;
}

interface AIDescriptionGeneratorProps {
  propertyData: PropertyData;
  currentDescription?: string;
  onDescriptionChange: (description: string) => void;
  onTitleChange?: (title: string) => void;
}

export function AIDescriptionGenerator({
  propertyData,
  currentDescription = "",
  onDescriptionChange,
  onTitleChange
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const { toast } = useToast();

  // Only include available models for current API key
  const geminiModels = [
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      tier: "Latest",
      description: "Latest Gemini 2.0 model with enhanced performance"
    },
    {
      id: "gemini-2.0-flash-lite",
      name: "Gemini 2.0 Flash Lite",
      tier: "Fast",
      description: "Lightweight version for faster responses"
    },
    {
      id: "gemini-2.5-flash-lite",
      name: "Gemini 2.5 Flash Lite",
      tier: "Fast",
      description: "Optimized for speed and efficiency"
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      tier: "Premium",
      description: "Most advanced model with best quality"
    }
  ];

  const handleGenerate = async () => {
    const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔥 [${clickId}] GENERATE BUTTON CLICKED - Checking conditions...`);

    // Prevent double-clicks and rapid requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    console.log(`⏱️ [${clickId}] Time since last request: ${timeSinceLastRequest}ms`);

    if (timeSinceLastRequest < 3000) { // Increased to 3 second cooldown
      console.log(`❌ [${clickId}] BLOCKED: Too soon after last request`);
      toast({
        title: "Mohon tunggu",
        description: `Harap tunggu ${Math.ceil((3000 - timeSinceLastRequest) / 1000)} detik sebelum mencoba lagi.`,
        variant: "default",
      });
      return;
    }

    if (!propertyData.jenis_properti || !propertyData.provinsi) {
      console.log(`❌ [${clickId}] BLOCKED: Missing required data`);
      toast({
        title: "Data tidak lengkap",
        description: "Minimal jenis properti dan provinsi harus diisi untuk generate deskripsi AI.",
        variant: "destructive",
      });
      return;
    }

    if (isGenerating) {
      console.log(`❌ [${clickId}] BLOCKED: Already generating`);
      return; // Prevent concurrent requests
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`✅ [${clickId}] STARTING API REQUEST [${requestId}]...`);
    setIsGenerating(true);
    setLastRequestTime(now);

    try {
      // Prepare data for API request
      const requestData = {
        title: propertyData.judul_properti || "",
        type: propertyData.jenis_properti,
        status: "dijual", // Default status, could be made dynamic if needed
        price: propertyData.harga_properti || "",
        land_area: propertyData.luas_tanah,
        building_area: propertyData.luas_bangunan,
        bedrooms: propertyData.kamar_tidur,
        bathrooms: propertyData.kamar_mandi,
        legal: propertyData.legalitas || "",
        location: {
          province: propertyData.provinsi,
          district: propertyData.kabupaten || ""
        },
        old_description: currentDescription,
        model: selectedModel,
        requestId: requestId // Add request ID for tracking
      };

      console.log(`📡 [${requestId}] SENDING API REQUEST to /api/generate-description`);
      console.log(`📦 [${requestId}] Request payload:`, requestData);

      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log(`📥 [${requestId}] API RESPONSE received:`, response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Failed to generate description';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`📄 [${requestId}] API RESPONSE DATA:`, result);

      // Update description
      const newDescription = result.ai_description;
      console.log(`✏️ [${requestId}] UPDATING DESCRIPTION:`, newDescription.substring(0, 100) + '...');
      setGeneratedDescription(newDescription);
      onDescriptionChange(newDescription);

      // Update title if onTitleChange is provided
      if (onTitleChange && result.ai_title) {
        console.log(`🏷️ [${requestId}] UPDATING TITLE:`, result.ai_title);
        onTitleChange(result.ai_title);
      }

      console.log(`✅ [${requestId}] DESCRIPTION UPDATE COMPLETE`);
      console.log(`📊 [${requestId}] FINAL STATE - Generated:`, !!newDescription);

      // Show appropriate message based on whether AI actually generated content
      if (result.is_generated) {
        console.log("UPDATE_DESKRIPTION:", result.ai_description);
        toast({
          title: "Deskripsi AI berhasil dibuat!",
          description: "Judul dan deskripsi telah di-generate oleh AI dan diterapkan ke form.",
        });
      } else {
        console.warn("Worker fallback aktif — cek validasi province/type atau regex parsing format AI.");
        toast({
          title: "Fallback aktif",
          description: result.message || "Worker fallback aktif — cek validasi province/type atau regex parsing format AI.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error(`❌ [${requestId}] AI GENERATION FAILED:`, error);

      const errorMessage = (error as any)?.message || String(error) || '';
      toast({
        title: "Gagal generate deskripsi",
        description: errorMessage || "Terjadi kesalahan saat generate deskripsi AI. Coba lagi.",
        variant: "destructive",
      });
    } finally {
      console.log(`🏁 [${requestId}] REQUEST COMPLETE - Resetting loading state`);
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = generatedDescription || currentDescription;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Tersalin!",
        description: "Deskripsi telah disalin ke clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Gagal menyalin",
        description: "Tidak dapat menyalin ke clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleApply = () => {
    if (generatedDescription) {
      onDescriptionChange(generatedDescription);
      toast({
        title: "Deskripsi diterapkan",
        description: "Deskripsi AI telah diterapkan ke form properti.",
      });
    }
  };

  const displayDescription = generatedDescription || currentDescription;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Description Generator
          <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
            Gratis
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate deskripsi properti yang SEO-friendly, menarik, dan rapi secara otomatis menggunakan AI.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Data Summary */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Data Properti Saat Ini:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><strong>Type:</strong> {propertyData.jenis_properti || "Belum diisi"}</div>
            <div><strong>Lokasi:</strong> {propertyData.kabupaten || "Belum diisi"}, {propertyData.provinsi || ""}</div>
            <div><strong>Kamar:</strong> {propertyData.kamar_tidur || 0} tidur, {propertyData.kamar_mandi || 0} mandi</div>
            <div><strong>Luas:</strong> {propertyData.luas_tanah || 0}m² tanah, {propertyData.luas_bangunan || 0}m² bangunan</div>
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-medium text-purple-900">AI Model Selection</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-purple-800 mb-1 block">
                Pilih Model Gemini:
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih model AI" />
                </SelectTrigger>
                <SelectContent>
                  {geminiModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${model.tier === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {model.tier}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
              <strong>{geminiModels.find(m => m.id === selectedModel)?.name}:</strong>{' '}
              {geminiModels.find(m => m.id === selectedModel)?.description}
            </div>

            <div className="text-xs text-purple-600">
              💡 <strong>Auto-Safe:</strong> Sistem selalu memberikan konten yang aman meskipun AI tidak tersedia.
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
            variant="default"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Description
              </>
            )}
          </Button>

          {generatedDescription && (
            <>
              <Button
                onClick={handleApply}
                variant="outline"
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply
              </Button>

              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </>
          )}
        </div>

        {/* Generated Description Preview */}
        {displayDescription && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {generatedDescription ? "AI Generated Description:" : "Current Description:"}
              </label>
              {generatedDescription && (
                <span className="inline-flex items-center text-xs border px-2 py-1 rounded">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </span>
              )}
            </div>

            <Textarea
              value={displayDescription}
              onChange={(e) => {
                const newValue = e.target.value;
                setGeneratedDescription(newValue);
                onDescriptionChange(newValue);
              }}
              placeholder="Deskripsi properti akan muncul di sini..."
              className="min-h-[200px] resize-y"
              rows={8}
            />

            {/* SEO Analysis */}
            {displayDescription && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="text-sm font-medium text-blue-900 mb-2">SEO Analysis:</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong>Word Count:</strong> {displayDescription.split(/\s+/).length}
                  </div>
                  <div>
                    <strong>Character Count:</strong> {displayDescription.length}
                  </div>
                  <div>
                    <strong>Paragraphs:</strong> {displayDescription.split('\n\n').length}
                  </div>
                  <div>
                    <strong>SEO Keywords:</strong>
                    {propertyData.jenis_properti && displayDescription.toLowerCase().includes(propertyData.jenis_properti.toLowerCase()) ? " ✅" : " ❌"}
                    {propertyData.kabupaten && displayDescription.toLowerCase().includes(propertyData.kabupaten.toLowerCase()) ? " ✅" : " ❌"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
           <h5 className="text-sm font-medium text-blue-900 mb-2">🤖 AI Engine Status:</h5>
           <div className="text-xs text-blue-800 space-y-1">
             <div className="flex items-center gap-2">
               <span>• Google Gemini:</span>
               <span className={import.meta.env.VITE_GEMINI_API_KEY ? "text-green-600" : "text-orange-600"}>
                 {import.meta.env.VITE_GEMINI_API_KEY ? "✅ Active" : "⚠️ No API Key"}
               </span>
             </div>
             <div className="text-gray-600 mt-1">
               💡 Tanpa API key, sistem akan menggunakan fallback rule-based generation
             </div>
           </div>
         </div>

        {/* Features List */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-green-900 mb-2">✨ Fitur AI Description:</h5>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• 🚀 Click-bait opening yang menarik perhatian</li>
            <li>• 📝 Struktur paragraf yang rapi dan engaging</li>
            <li>• 🎯 SEO keywords yang natural dan optimal</li>
            <li>• 🌐 Bahasa Indonesia yang persuasive</li>
            <li>• 📊 Panjang optimal untuk Google (150-250 kata)</li>
            <li>• 🏷️ Auto-include semua spesifikasi properti</li>
            <li>• 🎨 Hook yang membuat orang ingin baca terus</li>
            <li>• 📱 Mobile-friendly formatting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}