import { useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { 
  Download, Upload, FileSpreadsheet, CheckCircle, XCircle, 
  AlertTriangle, Loader2, ArrowRight, ArrowLeft, RefreshCw,
  Eye, Trash2, Clock, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/api-client";

type Step = 1 | 2 | 3 | 4 | 5;

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

interface PreviewItem {
  listing_code: string;
  title: string;
  property_type: string;
  price: string;
  location: string;
}

interface ValidationResult {
  validation_id: string;
  validation_data: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  preview: PreviewItem[];
  errors: ValidationError[];
}

interface ImportResult {
  import_id: string;
  total_rows: number;
  success_count: number;
  failed_count: number;
}

export default function ImportCsv() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  
  // Step 2: Upload
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Step 3: Validation
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [acceptInvalid, setAcceptInvalid] = useState(false);
  
  // Step 4: Progress
  const [importId, setImportId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  
  // Step 5: Result
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Step 1: Download Template
  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch("/api/import/download-template", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "template_import_properti_salam_bumi.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({ title: "Template downloaded", description: "File CSV template berhasil di-download" });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({ title: "Error", description: "Gagal download template", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Upload & Validate
  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Error", description: "Pilih file CSV terlebih dahulu", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import/upload-validate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult(data);
        setStep(3);
        toast({ 
          title: "Validasi selesai", 
          description: `${data.valid_rows} baris valid, ${data.invalid_rows} baris invalid`
        });
      } else {
        throw new Error(data.error || "Validation failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: error.message || "Gagal upload file", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Confirm Import
  const handleConfirmImport = async () => {
    if (!validationResult) return;

    setLoading(true);
    setStep(4);
    setProgressStatus("Memulai import...");

    try {
      const token = getToken();
      const response = await fetch("/api/import/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          validation_data: validationResult.validation_data,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setImportId(data.import_id);
        setImportResult(data);
        setProgress(100);
        setProgressStatus("Import selesai!");
        setStep(5);
        
        toast({ 
          title: "Import berhasil!", 
          description: `${data.success_count} properti berhasil diimport`
        });

        // Poll for final status
        pollProgress(data.import_id);
      } else {
        throw new Error(data.error || "Import failed");
      }
    } catch (error: any) {
      console.error("Confirm error:", error);
      setProgressStatus("Import gagal");
      toast({ title: "Error", description: error.message || "Gagal import data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Poll progress
  const pollProgress = async (id: string) => {
    const token = getToken();
    
    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/import/progress/${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (data.success) {
          setProgress(data.progress_percentage);
          setProgressStatus(`${data.processed_rows} / ${data.total_rows} baris`);
          
          if (data.status === "completed" || data.status === "failed") {
            setImportResult({
              import_id: data.import_id,
              total_rows: data.total_rows,
              success_count: data.success_count,
              failed_count: data.failed_count,
            });
            setStep(5);
            return;
          }
        }
        
        // Continue polling
        setTimeout(checkProgress, 2000);
      } catch (error) {
        console.error("Progress poll error:", error);
      }
    };
    
    checkProgress();
  };

  // Download Error Report
  const handleDownloadErrorReport = async () => {
    if (!importId) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/import/error-report/${importId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `error_report_${importId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({ title: "Download berhasil", description: "Error report berhasil di-download" });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({ title: "Error", description: "Gagal download error report", variant: "destructive" });
    }
  };

  // Rollback Import
  const handleRollback = async () => {
    if (!importId) return;
    
    if (!confirm("Apakah Anda yakin ingin rollback? Semua properti dari import ini akan dihapus.")) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/import/rollback/${importId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({ 
          title: "Rollback berhasil", 
          description: `${data.rolled_back_count} properti telah dihapus`
        });
        // Reset to step 1
        resetToStep1();
      } else {
        throw new Error(data.error || "Rollback failed");
      }
    } catch (error: any) {
      console.error("Rollback error:", error);
      toast({ title: "Error", description: error.message || "Gagal rollback", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Reset to step 1
  const resetToStep1 = () => {
    setStep(1);
    setFile(null);
    setValidationResult(null);
    setAcceptInvalid(false);
    setImportId(null);
    setProgress(0);
    setProgressStatus("");
    setImportResult(null);
    setShowErrors(false);
  };

  return (
    <AdminLayout title="Import CSV">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 5 && <div className={`w-12 h-1 ${step > s ? "bg-primary" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Download Template */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Step 1: Download Template</h2>
            <p className="text-gray-500">Download CSV template dengan header yang sesuai database</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Template berisi:</strong> 43 kolom header + 1 contoh baris data. 
              Isi data Anda di Excel/Google Sheets, lalu simpan sebagai CSV (UTF-8).
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Untuk gambar:</strong> Upload dulu ke R2, lalu masukkan URL di kolom image_urls. 
              Pisahkan dengan <code className="bg-amber-100 px-1 rounded">|</code> jika multiple images.
            </p>
          </div>

          <Button 
            onClick={handleDownloadTemplate}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            📥 Download Template CSV
          </Button>

          <Button 
            onClick={() => setStep(2)}
            variant="outline"
            className="w-full mt-3 gap-2"
          >
            Sudah punya file CSV <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Upload File */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Step 2: Upload File CSV</h2>
            <p className="text-gray-500">Upload file CSV yang sudah diisi</p>
          </div>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) setFile(droppedFile);
            }}
          >
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Drag & drop file CSV di sini</p>
            <p className="text-gray-400 text-sm mb-4">atau</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <span className="text-primary font-medium hover:underline">Pilih file</span>
            </label>
          </div>

          {file && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button onClick={() => setStep(1)} variant="outline" className="flex-1 gap-2">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 bg-primary hover:bg-primary/90 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Validasi & Preview
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Validation */}
      {step === 3 && validationResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Step 3: Preview & Validasi</h2>
            <p className="text-gray-500">Review hasil validasi sebelum import</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{validationResult.total_rows}</div>
              <div className="text-sm text-blue-800">Total Rows</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{validationResult.valid_rows}</div>
              <div className="text-sm text-green-800">Valid ✅</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{validationResult.invalid_rows}</div>
              <div className="text-sm text-red-800">Invalid ❌</div>
            </div>
          </div>

          {/* Preview Table */}
          {validationResult.preview.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Preview Data (10 baris pertama)</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Kode</th>
                      <th className="px-3 py-2 text-left">Judul</th>
                      <th className="px-3 py-2 text-left">Tipe</th>
                      <th className="px-3 py-2 text-left">Harga</th>
                      <th className="px-3 py-2 text-left">Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {validationResult.preview.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium">{item.listing_code}</td>
                        <td className="px-3 py-2 truncate max-w-[200px]">{item.title}</td>
                        <td className="px-3 py-2">{item.property_type}</td>
                        <td className="px-3 py-2">{item.price}</td>
                        <td className="px-3 py-2">{item.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="mb-6">
              <button 
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center gap-2 text-red-600 font-semibold mb-3"
              >
                <AlertTriangle className="w-5 h-5" />
                {validationResult.errors.length} Error ditemukan
                <ChevronDown className={`w-4 h-4 transition-transform ${showErrors ? "rotate-180" : ""}`} />
              </button>
              
              {showErrors && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 max-h-60 overflow-y-auto">
                  {validationResult.errors.slice(0, 20).map((err, i) => (
                    <div key={i} className="text-sm text-red-800 mb-2">
                      <strong>Row {err.row}:</strong> {err.field} - {err.error}
                    </div>
                  ))}
                  {validationResult.errors.length > 20 && (
                    <p className="text-sm text-red-600 mt-2">
                      ...dan {validationResult.errors.length - 20} error lainnya
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Accept Invalid Checkbox */}
          {validationResult.invalid_rows > 0 && (
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptInvalid}
                onChange={(e) => setAcceptInvalid(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                Saya mengerti bahwa hanya data valid ({validationResult.valid_rows} baris) yang akan di-import. 
                Data invalid akan dilewati.
              </span>
            </label>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button onClick={() => setStep(2)} variant="outline" className="flex-1 gap-2">
              <ArrowLeft className="w-4 h-4" /> Upload Ulang
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={loading || (validationResult.invalid_rows > 0 && !acceptInvalid)}
              className="flex-1 bg-primary hover:bg-primary/90 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              🚀 Lanjut Import
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Progress */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Step 4: Import Sedang Berlangsung</h2>
            <p className="text-gray-500">Mohon tunggu, sedang mengimport data</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{progressStatus}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 inline mr-1" />
            Estimasi: Beberapa menit lagi...
          </p>
        </div>
      )}

      {/* Step 5: Result */}
      {step === 5 && importResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              importResult.failed_count === 0 ? "bg-green-100" : "bg-amber-100"
            }`}>
              {importResult.failed_count === 0 
                ? <CheckCircle className="w-8 h-8 text-green-600" />
                : <AlertTriangle className="w-8 h-8 text-amber-600" />
              }
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Step 5: Import Selesai</h2>
            <p className="text-gray-500">Hasil import data</p>
          </div>

          {/* Result Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{importResult.success_count}</div>
              <div className="text-sm text-green-800">Success ✅</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{importResult.failed_count}</div>
              <div className="text-sm text-red-800">Failed ❌</div>
            </div>
          </div>

          {/* Messages */}
          {importResult.success_count > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
              <p className="text-green-800">
                ✅ Import selesai! {importResult.success_count} properti berhasil ditambahkan.
              </p>
            </div>
          )}

          {importResult.failed_count > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
              <p className="text-amber-800">
                ⚠️ {importResult.failed_count} baris gagal di-import. Download laporan error untuk detail.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {importResult.failed_count > 0 && (
              <Button onClick={handleDownloadErrorReport} variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" /> 📥 Download Laporan Error
              </Button>
            )}
            
            <Button 
              onClick={() => window.open("/admin/properties", "_blank")}
              className="w-full bg-primary hover:bg-primary/90 gap-2"
            >
              <Eye className="w-4 h-4" /> 🔍 Lihat Properti yang Di-Import
            </Button>
            
            <Button 
              onClick={handleRollback}
              disabled={loading}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2"
            >
              <Trash2 className="w-4 h-4" /> ↩️ Rollback Import (24 jam)
            </Button>
            
            <Button onClick={resetToStep1} variant="outline" className="w-full gap-2">
              <RefreshCw className="w-4 h-4" /> 📤 Import Lagi
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
