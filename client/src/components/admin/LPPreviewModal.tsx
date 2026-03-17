import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Loader2 } from "lucide-react";
import { useState } from "react";

interface LPPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lpId: string;
  lpName: string;
  previewUrl?: string;
}

export function LPPreviewModal({ isOpen, onClose, lpId, lpName }: LPPreviewModalProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleViewFullPage = () => {
    window.open(`/${lpId}`, '_blank');
    onClose();
  };

  const previewUrl = `${window.location.origin}/${lpId}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Preview: {lpName}</DialogTitle>
              <DialogDescription>
                Pratinjau landing page dengan konten yang sudah dikonfigurasi
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewFullPage}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Lihat Full Page
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative overflow-hidden max-h-[calc(90vh-80px)]">
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    Memuat Preview
                  </p>
                  <p className="text-sm text-gray-600">
                    Membuka landing page...
                  </p>
                </div>
              </div>
            </div>
          )}

          <iframe
            src={previewUrl}
            className="w-full h-full min-h-[600px]"
            onLoad={() => setIframeLoading(false)}
            onError={() => setIframeLoading(false)}
            title={`Preview ${lpName}`}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Preview Mode - Konten ditampilkan dalam iframe
            </div>
            <div className="flex items-center gap-4">
              <span>LP ID: {lpId}</span>
              <Button variant="outline" size="sm" onClick={onClose}>
                Tutup Preview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}