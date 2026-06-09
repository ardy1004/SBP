import { useEffect, useState } from "react";
import { generateSlug, calculateSEOScore, validateSlug } from "@/utils/slugGenerator";
import { CheckCircle, AlertCircle, Edit2, X, Copy, Check } from "lucide-react";

interface SlugPreviewProps {
  title: string;
  propertyType: string;
  location: string;
  listingCode: string;
  value?: string;
  onChange?: (slug: string) => void;
  showFullUrl?: boolean;
}

export function SlugPreview({
  title,
  propertyType,
  location,
  listingCode,
  value,
  onChange,
  showFullUrl = true
}: SlugPreviewProps) {
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [manualSlug, setManualSlug] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [copied, setCopied] = useState(false);

  // Generate slug ketika input berubah
  useEffect(() => {
    if (!isEditing) {
      const slug = generateSlug({ title, propertyType, location, listingCode });
      setGeneratedSlug(slug);
      setSeoScore(calculateSEOScore(slug));
      setValidation(validateSlug(slug));
      
      if (onChange) {
        onChange(slug);
      }
    }
  }, [title, propertyType, location, listingCode, isEditing]);

  // Handle manual edit
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setManualSlug(newSlug);
    setSeoScore(calculateSEOScore(newSlug));
    setValidation(validateSlug(newSlug));
    
    if (onChange) {
      onChange(newSlug);
    }
  };

  // Save manual edit
  const handleSaveManual = () => {
    setGeneratedSlug(manualSlug);
    setIsEditing(false);
  };

  // Cancel manual edit
  const handleCancelManual = () => {
    setManualSlug(generatedSlug);
    setIsEditing(false);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const slugToCopy = isEditing ? manualSlug : generatedSlug;
    await navigator.clipboard.writeText(`https://salambumi.xyz/properti/${slugToCopy}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displaySlug = isEditing ? manualSlug : (value || generatedSlug);

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Slug (URL Properti)
        </label>
        <div className="flex items-center gap-2">
          {/* SEO Score */}
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            seoScore >= 80 ? "bg-green-100 text-green-700" :
            seoScore >= 50 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            SEO: {seoScore}/100
          </div>
          
          {/* Length Counter */}
          <span className={`text-xs ${
            displaySlug.length > 60 ? "text-red-500" :
            displaySlug.length > 50 ? "text-yellow-500" :
            "text-gray-400"
          }`}>
            {displaySlug.length}/80
          </span>
        </div>
      </div>

      {/* Preview Box */}
      <div className="relative">
        <div className={`flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg ${
          !validation.isValid ? "border-red-300" : "border-gray-200"
        }`}>
          {showFullUrl && (
            <span className="text-sm text-gray-400 shrink-0">
              salambumi.xyz/properti/
            </span>
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={manualSlug}
              onChange={handleManualChange}
              className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ketik-slug-disini"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm font-mono text-gray-700 truncate">
              {displaySlug || "(belum ada slug)"}
            </span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveManual}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Simpan"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelManual}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                  title="Batal"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setManualSlug(generatedSlug);
                    setIsEditing(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                  title="Edit manual"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Validation Status */}
        {validation.isValid ? (
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            Slug valid dan SEO-friendly
          </div>
        ) : (
          <div className="mt-1 space-y-1">
            {validation.errors.map((err, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                {err}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO Tips */}
      {seoScore < 80 && !isEditing && (
        <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded-lg p-2">
          <strong>Tips SEO:</strong>
          <ul className="list-disc list-inside mt-1">
            {!displaySlug.includes("rumah") && !displaySlug.includes("kost") && !displaySlug.includes("tanah") && (
              <li>Tambahkan tipe properti (rumah, kost, tanah, dll)</li>
            )}
            {displaySlug.length < 30 && (
              <li>Tambahkan deskripsi fitur utama</li>
            )}
            {displaySlug.length > 60 && (
              <li>Pendekkan slug (maksimal 60 karakter)</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
