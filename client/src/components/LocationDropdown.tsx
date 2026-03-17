/**
 * Location Dropdown Component
 * Cascading dropdown for Provinsi -> Kabupaten -> Kecamatan -> Kelurahan
 * Uses LocationService for data and mapping
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { locationService } from '@/services/locationService';
import type { Provinsi, Kabupaten } from '@/data/locations';

export interface LocationValue {
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
}

interface LocationDropdownProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  disabled?: boolean;
  showKecamatan?: boolean;
  showKelurahan?: boolean;
  required?: boolean;
  errors?: {
    provinsi?: string;
    kabupaten?: string;
    kecamatan?: string;
    kelurahan?: string;
  };
}

export function LocationDropdown({
  value,
  onChange,
  disabled = false,
  showKecamatan = false,
  showKelurahan = false,
  required = false,
  errors,
}: LocationDropdownProps) {
  // Get all provinsi
  const provinsiList = useMemo(() => locationService.getAllProvinsi(), []);

  // Get kabupaten based on selected provinsi
  const kabupatenList = useMemo(() => {
    if (!value.provinsi) return [];
    const provinsi = provinsiList.find(
      (p) => p.nama === value.provinsi || p.seoSlug === value.provinsi
    );
    if (!provinsi) return [];
    return locationService.getKabupatenByProvinsiId(provinsi.id);
  }, [value.provinsi, provinsiList]);

  // Handle provinsi change
  const handleProvinsiChange = (provinsiNama: string) => {
    onChange({
      provinsi: provinsiNama,
      kabupaten: undefined,
      kecamatan: undefined,
      kelurahan: undefined,
    });
  };

  // Handle kabupaten change
  const handleKabupatenChange = (kabupatenNama: string) => {
    onChange({
      ...value,
      kabupaten: kabupatenNama,
      kecamatan: undefined,
      kelurahan: undefined,
    });
  };

  // Handle kecamatan change
  const handleKecamatanChange = (kecamatan: string) => {
    onChange({
      ...value,
      kecamatan,
      kelurahan: undefined,
    });
  };

  // Handle kelurahan change
  const handleKelurahanChange = (kelurahan: string) => {
    onChange({
      ...value,
      kelurahan,
    });
  };

  return (
    <div className="space-y-4">
      {/* Provinsi Select */}
      <div className="space-y-2">
        <Label htmlFor="provinsi" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          Provinsi
          {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={value.provinsi}
          onValueChange={handleProvinsiChange}
          disabled={disabled}
        >
          <SelectTrigger
            id="provinsi"
            className={errors?.provinsi ? 'border-red-500' : ''}
          >
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent>
            {provinsiList.map((provinsi) => (
              <SelectItem key={provinsi.id} value={provinsi.nama}>
                {provinsi.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.provinsi && (
          <p className="text-sm text-red-500">{errors.provinsi}</p>
        )}
      </div>

      {/* Kabupaten Select */}
      <div className="space-y-2">
        <Label htmlFor="kabupaten" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          Kabupaten/Kota
          {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={value.kabupaten}
          onValueChange={handleKabupatenChange}
          disabled={disabled || !value.provinsi}
        >
          <SelectTrigger
            id="kabupaten"
            className={errors?.kabupaten ? 'border-red-500' : ''}
          >
            <SelectValue
              placeholder={
                value.provinsi
                  ? 'Pilih Kabupaten/Kota'
                  : 'Pilih Provinsi terlebih dahulu'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {kabupatenList.map((kabupaten) => (
              <SelectItem key={kabupaten.id} value={kabupaten.nama}>
                {kabupaten.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.kabupaten && (
          <p className="text-sm text-red-500">{errors.kabupaten}</p>
        )}
      </div>

      {/* Kecamatan Select (Optional) */}
      {showKecamatan && (
        <div className="space-y-2">
          <Label htmlFor="kecamatan" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Kecamatan
          </Label>
          <Select
            value={value.kecamatan}
            onValueChange={handleKecamatanChange}
            disabled={disabled || !value.kabupaten}
          >
            <SelectTrigger
              id="kecamatan"
              className={errors?.kecamatan ? 'border-red-500' : ''}
            >
              <SelectValue
                placeholder={
                  value.kabupaten
                    ? 'Pilih Kecamatan'
                    : 'Pilih Kabupaten terlebih dahulu'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {/* Placeholder - kecamatan data will be loaded from API */}
              <SelectItem value="placeholder">
                Data kecamatan akan dimuat...
              </SelectItem>
            </SelectContent>
          </Select>
          {errors?.kecamatan && (
            <p className="text-sm text-red-500">{errors.kecamatan}</p>
          )}
        </div>
      )}

      {/* Kelurahan Select (Optional) */}
      {showKelurahan && showKecamatan && (
        <div className="space-y-2">
          <Label htmlFor="kelurahan" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Kelurahan/Desa
          </Label>
          <Select
            value={value.kelurahan}
            onValueChange={handleKelurahanChange}
            disabled={disabled || !value.kecamatan}
          >
            <SelectTrigger
              id="kelurahan"
              className={errors?.kelurahan ? 'border-red-500' : ''}
            >
              <SelectValue
                placeholder={
                  value.kecamatan
                    ? 'Pilih Kelurahan'
                    : 'Pilih Kecamatan terlebih dahulu'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {/* Placeholder - kelurahan data will be loaded from API */}
              <SelectItem value="placeholder">
                Data kelurahan akan dimuat...
              </SelectItem>
            </SelectContent>
          </Select>
          {errors?.kelurahan && (
            <p className="text-sm text-red-500">{errors.kelurahan}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for using location dropdown state
export function useLocationDropdown(initialValue?: LocationValue) {
  const [location, setLocation] = useState<LocationValue>(initialValue || {});
  const [errors, setErrors] = useState<LocationDropdownProps['errors']>({});

  const validate = (requiredFields?: (keyof LocationValue)[]): boolean => {
    const newErrors: LocationDropdownProps['errors'] = {};

    if (requiredFields?.includes('provinsi') && !location.provinsi) {
      newErrors.provinsi = 'Provinsi wajib dipilih';
    }

    if (requiredFields?.includes('kabupaten') && !location.kabupaten) {
      newErrors.kabupaten = 'Kabupaten/Kota wajib dipilih';
    }

    if (requiredFields?.includes('kecamatan') && !location.kecamatan) {
      newErrors.kecamatan = 'Kecamatan wajib dipilih';
    }

    if (requiredFields?.includes('kelurahan') && !location.kelurahan) {
      newErrors.kelurahan = 'Kelurahan/Desa wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setLocation({});
    setErrors({});
  };

  return {
    location,
    setLocation,
    errors,
    setErrors,
    validate,
    reset,
  };
}

export default LocationDropdown;