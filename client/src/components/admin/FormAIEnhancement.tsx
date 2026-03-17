import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAIContent } from "@/hooks/use-ai-content";

interface FormAIEnhancementProps {
  formData: {
    kodeListing: string;
    judulProperti: string;
    jenisProperti: string;
    kabupaten: string;
    provinsi: string;
    hargaProperti: string;
    kamarTidur: string;
    kamarMandi: string;
    luasTanah: string;
    luasBangunan: string;
    legalitas: string;
    deskripsi: string;
  };
  setFormData: (updater: (prev: any) => any) => void;
  isGeneratingDescription: boolean;
}

export function FormAIEnhancement({
  formData,
  setFormData,
  isGeneratingDescription
}: FormAIEnhancementProps) {
  const { toast } = useToast();
  const { generateDescription } = useAIContent();

  const handleAIGenerateDescription = useCallback(async () => {
    if (!formData.jenisProperti || !formData.kabupaten || !formData.provinsi) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon lengkapi jenis properti, kabupaten, dan provinsi terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateDescription.mutateAsync({
        kodeListing: formData.kodeListing,
        judulProperti: formData.judulProperti,
        jenisProperti: formData.jenisProperti,
        kabupaten: formData.kabupaten,
        provinsi: formData.provinsi,
        hargaProperti: formData.hargaProperti,
        kamarTidur: formData.kamarTidur ? parseInt(formData.kamarTidur) : undefined,
        kamarMandi: formData.kamarMandi ? parseInt(formData.kamarMandi) : undefined,
        luasTanah: formData.luasTanah ? parseFloat(formData.luasTanah) : undefined,
        luasBangunan: formData.luasBangunan ? parseFloat(formData.luasBangunan) : undefined,
        legalitas: formData.legalitas,
      });

      if (result.success && result.content) {
        setFormData(prev => ({ ...prev, deskripsi: result.content! }));
        toast({
          title: "AI Description Generated",
          description: `Generated using ${result.source === 'local-ai' ? 'Local AI (Free)' : 'Cloud AI'}`,
        });
      }
    } catch (error) {
      // Error sudah di-handle oleh hook
    }
  }, [
    formData.jenisProperti,
    formData.kabupaten,
    formData.provinsi,
    formData.kodeListing,
    formData.judulProperti,
    formData.hargaProperti,
    formData.kamarTidur,
    formData.kamarMandi,
    formData.luasTanah,
    formData.luasBangunan,
    formData.legalitas,
    generateDescription,
    setFormData,
    toast
  ]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAIGenerateDescription}
          disabled={isGeneratingDescription || !formData.jenisProperti || !formData.kabupaten || !formData.provinsi}
          className="flex items-center gap-2"
        >
          {isGeneratingDescription ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              AI Generate (Free)
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground self-center">
          Generate deskripsi dengan AI lokal (gratis, tanpa batas)
        </p>
      </div>
    </div>
  );
}