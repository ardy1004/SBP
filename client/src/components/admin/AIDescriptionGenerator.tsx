import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, RefreshCw } from "lucide-react";
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
}

interface AIDescriptionGeneratorProps {
  propertyData: PropertyData;
  currentDescription?: string;
  onDescriptionChange: (description: string) => void;
}

export function AIDescriptionGenerator({
  propertyData,
  currentDescription = "",
  onDescriptionChange
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!propertyData.jenis_properti || !propertyData.kabupaten) {
      toast({
        title: "Data tidak lengkap",
        description: "Minimal jenis properti dan kabupaten harus diisi untuk generate deskripsi AI.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const description = await generatePropertyDescription(propertyData);
      setGeneratedDescription(description);
      onDescriptionChange(description);

      toast({
        title: "Deskripsi AI berhasil dibuat!",
        description: "Deskripsi telah di-generate dan diterapkan ke form.",
      });
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast({
        title: "Gagal generate deskripsi",
        description: "Terjadi kesalahan saat generate deskripsi AI. Coba lagi.",
        variant: "destructive",
      });
    } finally {
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
          <Badge variant="secondary" className="text-xs">
            Gratis
          </Badge>
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
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
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
            <div className="flex items-center gap-2">
              <span>• OpenAI GPT:</span>
              <span className={import.meta.env.VITE_OPENAI_API_KEY ? "text-green-600" : "text-orange-600"}>
                {import.meta.env.VITE_OPENAI_API_KEY ? "✅ Active" : "⚠️ No API Key"}
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