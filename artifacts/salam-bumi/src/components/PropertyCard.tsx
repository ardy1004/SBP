import { useState } from "react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Property } from "@/data/properties";
import { 
  MapPin, Bed, Bath, Maximize, Share2, Layers, Check,
  Home, Building, Hotel, Diamond, Star, Flame, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveImg((p) => (p + 1) % property.images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveImg((p) => (p - 1 + property.images.length) % property.images.length);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/property/${property.slug}`;
    const shareData = {
      title: property.title,
      text: `${property.title} - ${formatCurrency(property.price)} | Salam Bumi Property`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({ title: "Link disalin", description: "Tautan properti berhasil disalin." });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or error — fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({ title: "Link disalin", description: "Tautan properti berhasil disalin." });
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({ title: "Gagal", description: "Tidak dapat menyalin link.", variant: "destructive" });
      }
    }
  };

  const getTypeIcon = () => {
    switch (property.type) {
      case "Rumah": return <Home className="w-3.5 h-3.5" />;
      case "Apartment": return <Building className="w-3.5 h-3.5" />;
      case "Kost": return <Hotel className="w-3.5 h-3.5" />;
      default: return <Home className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top badges Layering */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
          {getTypeIcon()}
          {property.type}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
        {property.badges.is_premium && (
          <div className="bg-gradient-to-r from-secondary to-yellow-400 text-primary text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg animate-pulse">
            <Star className="w-3.5 h-3.5 fill-primary" />
            PREMIUM
          </div>
        )}
        {property.badges.is_featured && (
          <div className="bg-gradient-to-r from-blue-400 to-primary text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
            <Diamond className="w-3.5 h-3.5 fill-white" />
            FEATURED
          </div>
        )}
        {(property.badges.is_hot || property.old_price) && (
          <div className="bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
            <Flame className="w-3.5 h-3.5 fill-white" />
            HOT
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <Link href={`/property/${property.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={property.images[activeImg]} 
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* TERJUAL Ribbon */}
        {property.badges.is_sold && (
          <>
            {/* Red overlay on entire image (20% opacity) */}
            <div className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none"></div>
            {/* Ribbon container */}
            <div className="absolute top-0 right-0 z-20 w-[180px] h-[180px] overflow-hidden">
              {/* Ribbon shadow */}
              <div className="absolute top-[38px] right-[-48px] bg-red-900/30 text-transparent font-bold text-base px-16 py-2.5 transform rotate-45 shadow-xl">
                TERJUAL
              </div>
              {/* Main ribbon */}
              <div className="absolute top-[35px] right-[-47px] bg-gradient-to-r from-red-600 to-red-500 text-white font-extrabold text-base px-16 py-2.5 transform rotate-45 shadow-lg tracking-wider border-y-[3px] border-white/30">
                TERJUAL
              </div>
              {/* Ribbon tails */}
              <div className="absolute bottom-[125px] left-[-12px] w-0 h-0 border-r-[12px] border-r-red-800 border-b-[12px] border-b-transparent"></div>
              <div className="absolute top-0 left-[-3px] w-0 h-0 border-r-[10px] border-r-red-700 border-b-[10px] border-b-transparent"></div>
            </div>
          </>
        )}
        
        {/* Navigation Arrows (Show on hover if multiple imgs) */}
        {property.images.length > 1 && isHovered && (
          <>
            <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-primary transition-colors z-20 backdrop-blur-sm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-primary transition-colors z-20 backdrop-blur-sm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {property.images.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {property.images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); setActiveImg(idx); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeImg 
                    ? "bg-white w-4" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Purpose Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
            {property.purpose}
          </span>
        </div>

        {/* Share Button - Bottom Right */}
        <button 
          onClick={handleShare}
          className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-primary hover:bg-white shadow-sm transition-colors"
          title="Bagikan properti"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
        </button>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
            {property.listing_code}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            property.status_legalitas === "On Hand" 
              ? "bg-green-50 text-green-700" 
              : "bg-amber-50 text-amber-700"
          }`}>
            {property.status_legalitas}
          </span>
        </div>

        <Link href={`/property/${property.slug}`}>
          <h3 className="font-bold text-base text-gray-900 leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-start gap-1.5 text-gray-500 mb-4">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
          <span className="text-xs leading-relaxed">{property.location}</span>
        </div>

        {/* Prices */}
        <div className="mt-auto mb-4">
          {property.old_price && (
            <div className="text-xs text-gray-400 line-through mb-0.5">
              {formatCurrency(property.old_price)}
            </div>
          )}
          <div className="font-extrabold text-xl text-primary">
            {formatCurrency(property.price)}
            {property.purpose === "Disewa" && <span className="text-xs font-medium text-gray-500"> / thn</span>}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 w-full mb-4" />

        {/* Specs Row: LT, LB, KT, KM, Lantai */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {property.specs.lt !== undefined && property.specs.lt > 0 && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Luas Tanah">
              <Maximize className="w-3.5 h-3.5 text-gray-500 mb-1" />
              <span className="text-[11px] font-semibold text-gray-700">{property.specs.lt}<span className="text-[9px]">m²</span></span>
              <span className="text-[8px] text-gray-400">LT</span>
            </div>
          )}
          {property.specs.lb !== undefined && property.specs.lb > 0 && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Luas Bangunan">
              <Maximize className="w-3.5 h-3.5 text-gray-500 mb-1" />
              <span className="text-[11px] font-semibold text-gray-700">{property.specs.lb}<span className="text-[9px]">m²</span></span>
              <span className="text-[8px] text-gray-400">LB</span>
            </div>
          )}
          {property.specs.kt !== undefined && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Kamar Tidur">
              <Bed className="w-3.5 h-3.5 text-gray-500 mb-1" />
              <span className="text-[11px] font-semibold text-gray-700">{property.specs.kt}</span>
              <span className="text-[8px] text-gray-400">KT</span>
            </div>
          )}
          {property.specs.km !== undefined && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Kamar Mandi">
              <Bath className="w-3.5 h-3.5 text-gray-500 mb-1" />
              <span className="text-[11px] font-semibold text-gray-700">{property.specs.km}</span>
              <span className="text-[8px] text-gray-400">KM</span>
            </div>
          )}
          {property.specs.lantai !== undefined && (
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2" title="Lantai">
              <Layers className="w-3.5 h-3.5 text-gray-500 mb-1" />
              <span className="text-[11px] font-semibold text-gray-700">{property.specs.lantai}</span>
              <span className="text-[8px] text-gray-400">Lt</span>
            </div>
          )}
        </div>

        {/* Legalitas - Separate Section */}
        {property.legalitas && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 px-1">
            <span className="font-semibold text-primary">{property.legalitas.split(',')[0]}</span>
          </div>
        )}

        <Button asChild variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl h-11 transition-all">
          <Link href={`/property/${property.slug}`}>
            Lihat Detail
          </Link>
        </Button>
      </div>
    </div>
  );
}
