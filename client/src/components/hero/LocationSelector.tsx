/**
 * LocationSelector Component
 * Province > City > District dropdown selector using centralized location data
 * Improved UI/UX with better spacing and compact design
 */

import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProvinces, getCitiesByProvince, getDistrictsByCity } from '@/data/locations';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  province: string;
  city: string;
  district: string;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  layout?: 'horizontal' | 'vertical';
  size?: 'default' | 'large' | 'compact';
  className?: string;
  showLabel?: boolean;
}

export function LocationSelector({
  province,
  city,
  district,
  onProvinceChange,
  onCityChange,
  onDistrictChange,
  layout = 'horizontal',
  size = 'default',
  className = '',
  showLabel = false,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get provinces from centralized data
  const provinces = useMemo(() => getProvinces(), []);
  
  // Get cities based on selected province
  const cities = useMemo(() => {
    if (!province) return [];
    return getCitiesByProvince(province);
  }, [province]);
  
  // Get districts based on selected city
  const districts = useMemo(() => {
    if (!province || !city) return [];
    return getDistrictsByCity(city);
  }, [province, city]);

  // Size configurations
  const sizeConfig = {
    compact: {
      container: 'gap-1',
      trigger: 'h-10 text-xs',
      icon: true,
    },
    default: {
      container: 'gap-2',
      trigger: 'h-11 text-sm',
      icon: true,
    },
    large: {
      container: 'gap-3',
      trigger: 'h-14 text-base',
      icon: true,
    },
  };

  const config = sizeConfig[size];
  const hasSelection = province || city || district;

  const handleProvinceChange = (value: string) => {
    onProvinceChange(value);
    onCityChange('');
    onDistrictChange('');
  };

  const handleCityChange = (value: string) => {
    onCityChange(value);
    onDistrictChange('');
  };

  return (
    <div className={`flex ${layout === 'horizontal' ? 'flex-row' : 'flex-col'} ${config.container} ${className}`}>
      {/* Province Select */}
      <div className="flex-1 min-w-0">
        <Select 
          value={province} 
          onValueChange={handleProvinceChange}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className={`${config.trigger} border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full`}>
            <div className="flex items-center gap-2 truncate">
              {config.icon && <MapPin size={14} className="text-gray-400 flex-shrink-0" />}
              <SelectValue placeholder="Provinsi" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="">{'{Semua Provinsi}'}</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p.seoSlug} value={p.seoSlug} className="text-sm">
                {p.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Select - disabled if no province */}
      <div className="flex-1 min-w-0">
        <Select 
          value={city} 
          onValueChange={handleCityChange} 
          disabled={!province}
        >
          <SelectTrigger 
            className={`${config.trigger} border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full disabled:opacity-60 disabled:cursor-not-allowed`}
            disabled={!province}
          >
            <div className="flex items-center gap-2 truncate">
              {config.icon && <MapPin size={14} className="text-gray-400 flex-shrink-0" />}
              <SelectValue placeholder={province ? "Kabupaten/Kota" : "Pilih Provinsi"} />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="">{'{Semua Kab./Kota}'}</SelectItem>
            {cities.length > 0 ? (
              cities.map((c) => (
                <SelectItem key={c.seoSlug} value={c.seoSlug} className="text-sm">
                  {c.nama}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500 text-center">
                Data tidak tersedia
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* District Select - disabled if no city */}
      <div className="flex-1 min-w-0">
        <Select 
          value={district} 
          onValueChange={onDistrictChange} 
          disabled={!city}
        >
          <SelectTrigger 
            className={`${config.trigger} border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full disabled:opacity-60 disabled:cursor-not-allowed`}
            disabled={!city}
          >
            <div className="flex items-center gap-2 truncate">
              {config.icon && <MapPin size={14} className="text-gray-400 flex-shrink-0" />}
              <SelectValue placeholder={city ? "Kecamatan" : "Pilih Kabupaten"} />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="">{'{Semua Kec.}'}</SelectItem>
            {districts.length > 0 ? (
              districts.map((d) => (
                <SelectItem key={d.seoSlug} value={d.seoSlug} className="text-sm">
                  {d.nama}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500 text-center">
                Kecamatan tidak tersedia
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default LocationSelector;
