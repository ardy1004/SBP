import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPES, PROPERTY_STATUSES } from "@shared/types";

interface HeroSectionProps {
  onSearch: (filters: {
    status?: string;
    type?: string;
    location?: string;
  }) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const handleSearch = () => {
    onSearch({
      status: status || undefined,
      type: type || undefined,
      location: location || undefined,
    });
  };

  return (
    <div className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&h=1080&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Salam Bumi Property
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 font-body">
          Finding the Best Properties Will Be Easier and More Precise
        </p>

        {/* Search Bar */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-status" className="bg-background">
                <SelectValue placeholder="Jual / Sewa" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="select-type" className="bg-background">
                <SelectValue placeholder="Jenis Properti" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Lokasi (kota)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="input-location"
              className="bg-background"
            />

            <Button 
              onClick={handleSearch} 
              className="w-full" 
              size="lg"
              data-testid="button-search"
            >
              <Search className="h-4 w-4 mr-2" />
              Cari Properti
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
