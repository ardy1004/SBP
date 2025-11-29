// AI-Powered SEO Optimization Component
// Helps optimize property titles and descriptions for better search engine visibility

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAIContent } from "@/hooks/use-ai-content";
import { Search, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SEOOptimizerProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  keywords?: string[];
  onKeywordsChange?: (keywords: string[]) => void;
}

export function SEOOptimizer({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  keywords = [],
  onKeywordsChange
}: SEOOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { optimizeSEO } = useAIContent();
  const { toast } = useToast();

  const handleOptimizeSEO = async () => {
    if (!title && !description) {
      toast({
        title: "Konten Diperlukan",
        description: "Masukkan minimal judul atau deskripsi untuk dioptimasi",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeSEO.mutateAsync({
        title: title || undefined,
        description: description || undefined,
      });

      if (result.success) {
        if (result.optimizedTitle && result.optimizedTitle !== title) {
          onTitleChange(result.optimizedTitle);
        }
        if (result.optimizedDescription && result.optimizedDescription !== description) {
          onDescriptionChange(result.optimizedDescription);
        }
        if (result.keywords && onKeywordsChange) {
          onKeywordsChange(result.keywords);
        }

        toast({
          title: "SEO Dioptimasi",
          description: "Konten berhasil dioptimasi untuk mesin pencari",
        });
      }
    } catch (error) {
      // Error sudah di-handle oleh hook
    } finally {
      setIsOptimizing(false);
    }
  };

  const getTitleScore = (text: string) => {
    if (!text) return { score: 0, status: 'empty', message: 'Judul kosong' };

    const length = text.length;
    if (length < 30) return { score: 40, status: 'short', message: 'Terlalu pendek (< 30 karakter)' };
    if (length > 60) return { score: 60, status: 'long', message: 'Terlalu panjang (> 60 karakter)' };
    if (length >= 30 && length <= 60) return { score: 100, status: 'optimal', message: 'Optimal (30-60 karakter)' };

    return { score: 70, status: 'good', message: 'Cukup baik' };
  };

  const getDescriptionScore = (text: string) => {
    if (!text) return { score: 0, status: 'empty', message: 'Deskripsi kosong' };

    const length = text.length;
    if (length < 120) return { score: 30, status: 'short', message: 'Terlalu pendek (< 120 karakter)' };
    if (length > 160) return { score: 50, status: 'long', message: 'Terlalu panjang (> 160 karakter)' };
    if (length >= 120 && length <= 160) return { score: 100, status: 'optimal', message: 'Optimal (120-160 karakter)' };

    return { score: 80, status: 'good', message: 'Cukup baik' };
  };

  const titleScore = getTitleScore(title);
  const descriptionScore = getDescriptionScore(description);
  const overallScore = Math.round((titleScore.score + descriptionScore.score) / 2);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Optimization Wizard
        </CardTitle>
        <CardDescription>
          Optimasi konten untuk mesin pencari dengan AI. Klik "Optimize SEO" untuk meningkatkan visibility.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SEO Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{overallScore}</div>
            <div className="text-sm text-muted-foreground">SEO Score</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{titleScore.score}</div>
            <div className="text-sm text-muted-foreground">Title Score</div>
          </div>

          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{descriptionScore.score}</div>
            <div className="text-sm text-muted-foreground">Description Score</div>
          </div>
        </div>

        {/* Title Optimization */}
        <div className="space-y-2">
          <Label htmlFor="seo-title">Judul SEO ({title.length}/60 karakter)</Label>
          <Input
            id="seo-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Masukkan judul properti..."
            className={titleScore.status === 'optimal' ? 'border-green-500' :
                      titleScore.status === 'short' || titleScore.status === 'long' ? 'border-yellow-500' : ''}
          />
          <div className="flex items-center gap-2 text-sm">
            {titleScore.status === 'optimal' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className={titleScore.status === 'optimal' ? 'text-green-600' : 'text-yellow-600'}>
              {titleScore.message}
            </span>
          </div>
        </div>

        {/* Description Optimization */}
        <div className="space-y-2">
          <Label htmlFor="seo-description">Meta Description ({description.length}/160 karakter)</Label>
          <Textarea
            id="seo-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Masukkan deskripsi properti..."
            rows={3}
            className={descriptionScore.status === 'optimal' ? 'border-green-500' :
                      descriptionScore.status === 'short' || descriptionScore.status === 'long' ? 'border-yellow-500' : ''}
          />
          <div className="flex items-center gap-2 text-sm">
            {descriptionScore.status === 'optimal' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className={descriptionScore.status === 'optimal' ? 'text-green-600' : 'text-yellow-600'}>
              {descriptionScore.message}
            </span>
          </div>
        </div>

        {/* Keywords Display */}
        {keywords.length > 0 && (
          <div className="space-y-2">
            <Label>SEO Keywords</Label>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Optimize Button */}
        <Button
          onClick={handleOptimizeSEO}
          disabled={isOptimizing || (!title && !description)}
          className="w-full"
        >
          {isOptimizing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize SEO with AI
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips SEO:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Sertakan nama lokasi (kabupaten/kota) di judul</li>
            <li>Gunakan kata kunci seperti "dijual", "disewakan", "murah"</li>
            <li>Judul ideal: 30-60 karakter</li>
            <li>Meta description ideal: 120-160 karakter</li>
            <li>Sertakan harga jika memungkinkan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}