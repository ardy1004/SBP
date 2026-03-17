import { Share2, MessageCircle, Facebook, Twitter, Copy, Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { generatePropertySlug } from "@/lib/utils";
import type { Property } from "@shared/types";

interface ShareButtonsProps {
  property: Property;
  className?: string;
  variant?: 'default' | 'compact';
}

export function ShareButtons({ property, className, variant = 'default' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isSharing = useRef(false);

  // Generate SEO-friendly slug URL
  const slug = generatePropertySlug({
    status: property.status,
    jenis_properti: property.jenisProperti,
    provinsi: property.provinsi,
    kabupaten: property.kabupaten,
    judul_properti: property.judulProperti || undefined,
    kode_listing: property.kodeListing
  });

  const shareUrl = `${window.location.origin}/${slug}`;
  const shareTitle = property.judulProperti || `${property.jenisProperti} ${property.status}`;
  const shareText = `${shareTitle} di ${property.kabupaten}. ${property.hargaProperti ? `Harga: Rp ${parseFloat(property.hargaProperti).toLocaleString('id-ID')}` : 'Hubungi untuk harga'}`;

  // Debounce protection for share buttons
  const handleShare = (shareFunction: () => void) => {
    if (isSharing.current) return;
    isSharing.current = true;
    shareFunction();
    // Reset after 2 seconds
    setTimeout(() => {
      isSharing.current = false;
    }, 2000);
  };

  const shareToWhatsApp = () => {
    handleShare(() => {
      // Simplified format to avoid duplication
      const text = `${shareText}\n\n${shareUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  };

  const shareToFacebook = () => {
    handleShare(() => {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    });
  };

  const shareToTwitter = () => {
    handleShare(() => {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=properti,yogyakarta,realestate`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    });
  };

  const shareToTelegram = () => {
    handleShare(() => {
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback untuk browser yang tidak support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWebShare = async () => {
    if (isSharing.current) return;
    isSharing.current = true;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy
      await copyToClipboard();
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      isSharing.current = false;
    }, 2000);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={shareViaWebShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Bagikan
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Share2 className="h-4 w-4" />
        <span>Bagikan properti ini:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp */}
        <Button
          variant="outline"
          size="sm"
          onClick={shareToWhatsApp}
          className="flex items-center gap-2 bg-green-50 border-green-200 hover:bg-green-100"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={shareToFacebook}
          className="flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook
        </Button>

        {/* Twitter */}
        <Button
          variant="outline"
          size="sm"
          onClick={shareToTwitter}
          className="flex items-center gap-2 bg-sky-50 border-sky-200 hover:bg-sky-100"
        >
          <Twitter className="h-4 w-4 text-sky-600" />
          Twitter
        </Button>

        {/* Telegram */}
        <Button
          variant="outline"
          size="sm"
          onClick={shareToTelegram}
          className="flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
        >
          <MessageCircle className="h-4 w-4 text-blue-600" />
          Telegram
        </Button>

        {/* Copy Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Tersalin!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Salin Link
            </>
          )}
        </Button>

        {/* Web Share API (if available) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (navigator as any).share ? (
          <Button
            variant="outline"
            size="sm"
            onClick={shareViaWebShare}
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            Lainnya
          </Button>
        ) : null}
      </div>

      {/* Share Statistics (placeholder for future analytics) */}
      <div className="text-xs text-muted-foreground">
        Bagikan untuk membantu lebih banyak orang menemukan properti impian mereka! 🏠
      </div>
    </div>
  );
}