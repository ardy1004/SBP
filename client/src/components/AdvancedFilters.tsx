import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LEGAL_STATUSES } from "@shared/types";

export interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minLandArea?: number;
  maxLandArea?: number;
  minBuildingArea?: number;
  maxBuildingArea?: number;
  legalStatus?: string;
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterValues) => void;
  currentFilters: FilterValues;
}

export function AdvancedFilters({ onApplyFilters, currentFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(currentFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {};
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" data-testid="button-filters">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter Lanjutan
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Properti</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Rentang Harga</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min-price" className="text-sm text-muted-foreground">Min (Rp)</Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ""}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  data-testid="input-min-price"
                />
              </div>
              <div>
                <Label htmlFor="max-price" className="text-sm text-muted-foreground">Max (Rp)</Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ""}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  data-testid="input-max-price"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bedrooms">Kamar Tidur</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="Jumlah"
                value={filters.bedrooms || ""}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                data-testid="input-bedrooms"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Kamar Mandi</Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="Jumlah"
                value={filters.bathrooms || ""}
                onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value ? Number(e.target.value) : undefined })}
                data-testid="input-bathrooms"
              />
            </div>
          </div>

          {/* Land Area */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Luas Tanah (m²)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min-land" className="text-sm text-muted-foreground">Min</Label>
                <Input
                  id="min-land"
                  type="number"
                  placeholder="Min"
                  value={filters.minLandArea || ""}
                  onChange={(e) => setFilters({ ...filters, minLandArea: e.target.value ? Number(e.target.value) : undefined })}
                  data-testid="input-min-land-area"
                />
              </div>
              <div>
                <Label htmlFor="max-land" className="text-sm text-muted-foreground">Max</Label>
                <Input
                  id="max-land"
                  type="number"
                  placeholder="Max"
                  value={filters.maxLandArea || ""}
                  onChange={(e) => setFilters({ ...filters, maxLandArea: e.target.value ? Number(e.target.value) : undefined })}
                  data-testid="input-max-land-area"
                />
              </div>
            </div>
          </div>

          {/* Building Area */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Luas Bangunan (m²)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min-building" className="text-sm text-muted-foreground">Min</Label>
                <Input
                  id="min-building"
                  type="number"
                  placeholder="Min"
                  value={filters.minBuildingArea || ""}
                  onChange={(e) => setFilters({ ...filters, minBuildingArea: e.target.value ? Number(e.target.value) : undefined })}
                  data-testid="input-min-building-area"
                />
              </div>
              <div>
                <Label htmlFor="max-building" className="text-sm text-muted-foreground">Max</Label>
                <Input
                  id="max-building"
                  type="number"
                  placeholder="Max"
                  value={filters.maxBuildingArea || ""}
                  onChange={(e) => setFilters({ ...filters, maxBuildingArea: e.target.value ? Number(e.target.value) : undefined })}
                  data-testid="input-max-building-area"
                />
              </div>
            </div>
          </div>

          {/* Legal Status */}
          <div>
            <Label htmlFor="legal-status">Status Legal</Label>
            <Select
              value={filters.legalStatus || ""}
              onValueChange={(value) => setFilters({ ...filters, legalStatus: value || undefined })}
            >
              <SelectTrigger id="legal-status" data-testid="select-legal-status">
                <SelectValue placeholder="Pilih status legal" />
              </SelectTrigger>
              <SelectContent>
                {LEGAL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleReset} variant="outline" className="flex-1" data-testid="button-reset-filters">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1" data-testid="button-apply-filters">
              Terapkan
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
