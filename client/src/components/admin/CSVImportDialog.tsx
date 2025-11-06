import { useState, useRef } from "react";
import { Upload, Download, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function CSVImportDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
      "kode_listing",
      "judul_properti",
      "deskripsi",
      "jenis_properti",
      "luas_tanah",
      "luas_bangunan",
      "kamar_tidur",
      "kamar_mandi",
      "legalitas",
      "harga_property",
      "provinsi",
      "kabupaten",
      "created_at",
      "image_url",
      "image_url1",
      "image_url2",
      "image_url3",
      "image_url4",
    ];

    const csvContent = headers.join(",") + "\n" +
      "PROP001,Rumah Minimalis Modern Jakarta Selatan,Rumah minimalis modern dengan lokasi strategis,rumah,100,80,3,2,SHM,1500000000,jakarta,jakarta-selatan,2024-01-01,https://example.com/img1.jpg,https://example.com/img2.jpg,,,,,";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "property_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiRequest('POST', '/api/admin/properties/csv-import', formData);

      setResult(response);
      toast({
        title: "Import Berhasil",
        description: `${response.success} properti berhasil diimport, ${response.failed} gagal`,
      });

      if (response.success > 0) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Import Gagal",
        description: "Terjadi kesalahan saat mengimport file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-csv-import">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Properti dari CSV</DialogTitle>
          <DialogDescription>
            Import properti dalam jumlah besar menggunakan file CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Download template CSV terlebih dahulu untuk melihat format yang benar
            </p>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
              data-testid="button-download-template"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Upload file CSV Anda
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-csv-file"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-3"
              data-testid="button-select-file"
            >
              <Upload className="h-4 w-4 mr-2" />
              {file ? file.name : "Pilih File"}
            </Button>

            {file && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
                data-testid="button-upload"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>

          {result && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Berhasil: {result.success}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-destructive" />
                <span>Gagal: {result.failed}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
