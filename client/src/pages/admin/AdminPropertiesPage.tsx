import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Tag, CheckSquare, Square, Settings, Search, Filter, X, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CSVImportDialog } from "@/components/admin/CSVImportDialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import type { Property } from "@shared/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default function AdminPropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [bulkStatusValue, setBulkStatusValue] = useState<string>("");
  const [bulkProvinceValue, setBulkProvinceValue] = useState<string>("");
  const [bulkKabupatenValue, setBulkKabupatenValue] = useState<string>("");
  const [bulkJenisPropertiValue, setBulkJenisPropertiValue] = useState<string>("");
  const { toast } = useToast();

  const { data: rawProperties = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      console.log('Raw properties from Supabase:', data?.slice(0, 3));
      return data || [];
    },
  });

  // Transform Supabase snake_case to camelCase for admin panel
  const properties = rawProperties.map((property: any) => ({
    id: property.id,
    kodeListing: property.kode_listing,
    judulProperti: property.judul_properti,
    deskripsi: property.deskripsi,
    jenisProperti: property.jenis_properti,
    luasTanah: property.luas_tanah,
    luasBangunan: property.luas_bangunan,
    kamarTidur: property.kamar_tidur,
    kamarMandi: property.kamar_mandi,
    legalitas: property.legalitas,
    hargaProperti: property.harga_properti,
    provinsi: property.provinsi,
    kabupaten: property.kabupaten,
    alamatLengkap: property.alamat_lengkap,
    imageUrl: property.image_url,
    imageUrl1: property.image_url1,
    imageUrl2: property.image_url2,
    imageUrl3: property.image_url3,
    imageUrl4: property.image_url4,
    imageUrl5: property.image_url5,
    imageUrl6: property.image_url6,
    imageUrl7: property.image_url7,
    imageUrl8: property.image_url8,
    imageUrl9: property.image_url9,
    isPremium: property.is_premium,
    isFeatured: property.is_featured,
    isHot: property.is_hot,
    isSold: property.is_sold,
    priceOld: property.price_old,
    isPropertyPilihan: property.is_property_pilihan,
    hargaPerMeter: Boolean((property as any).harga_per_meter || false),
    ownerContact: property.owner_contact,
    status: property.status,
    metaTitle: property.meta_title,
    metaDescription: property.meta_description,
    createdAt: new Date(property.created_at),
    updatedAt: new Date(property.updated_at),
  }));

  // Filter and search properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm ||
      property.kodeListing.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.judulProperti && property.judulProperti.toLowerCase().includes(searchTerm.toLowerCase())) ||
      property.provinsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.kabupaten.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || filterType === "all" || property.jenisProperti === filterType;
    const matchesStatus = !filterStatus || filterStatus === "all" || property.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({ title: "Properti berhasil dihapus" });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menghapus properti",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      setSelectedIds([]);
      toast({ title: `${variables.length} properti berhasil dihapus` });
    },
    onError: (error: any) => {
      console.error('Bulk delete error:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menghapus properti",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[], updates: any }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .in('id', ids)
        .select();

      if (error) throw error;
      return { updated: data?.length || 0, properties: data };
    },
    onSuccess: async (data, variables) => {
      console.log('=== BULK UPDATE SUCCESS ===');
      console.log('Response data:', data);
      console.log('Variables:', variables);
      console.log('Updated properties count:', data?.updated);
      console.log('Sample updated properties:', data?.properties?.slice(0, 3));

      // Force multiple invalidations and refetches to ensure UI updates
      console.log('Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey: ['admin-properties'] });

      console.log('Refetching queries...');
      await queryClient.refetchQueries({ queryKey: ['admin-properties'] });

      // Additional refetch after a short delay
      setTimeout(async () => {
        console.log('Additional refetch to ensure UI updates...');
        await queryClient.refetchQueries({ queryKey: ['admin-properties'] });
      }, 100);

      setSelectedIds([]);
      toast({ title: `${data?.updated || variables.ids.length} properti berhasil diupdate` });
    },
    onError: (error: any) => {
      console.error('=== BULK UPDATE ERROR ===', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal mengupdate properti",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus properti ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} properti yang dipilih?`)) {
      console.log('Attempting bulk delete for IDs:', selectedIds);
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleBulkUpdate = (field: string, value: any) => {
    if (selectedIds.length === 0) return;
    console.log('=== BULK UPDATE ===');
    console.log('Field:', field);
    console.log('Value:', value);
    console.log('Selected IDs:', selectedIds);
    console.log('Selected IDs type:', typeof selectedIds, 'isArray:', Array.isArray(selectedIds));
    const updates: any = {};
    updates[field] = value;
    console.log('Updates object:', updates);
    console.log('Calling bulkUpdateMutation.mutate with:', { ids: selectedIds, updates });
    bulkUpdateMutation.mutate({ ids: selectedIds, updates });
  };

  const handleBulkStatusChange = () => {
    if (selectedIds.length === 0 || !bulkStatusValue) return;
    handleBulkUpdate('status', bulkStatusValue);
    setBulkStatusValue("");
  };

  const handleBulkLocationChange = () => {
    if (selectedIds.length === 0) return;
    const updates: any = {};
    if (bulkProvinceValue) updates.provinsi = bulkProvinceValue.toLowerCase();
    if (bulkKabupatenValue) updates.kabupaten = bulkKabupatenValue.toLowerCase();
    if (Object.keys(updates).length > 0) {
      bulkUpdateMutation.mutate({ ids: selectedIds, updates });
      setBulkProvinceValue("");
      setBulkKabupatenValue("");
    }
  };

  const handleBulkJenisPropertiChange = () => {
    if (selectedIds.length === 0 || !bulkJenisPropertiValue) return;
    console.log('=== BULK JENIS PROPERTI CHANGE ===');
    console.log('Selected IDs:', selectedIds);
    console.log('Selected IDs type:', typeof selectedIds, 'length:', selectedIds.length);
    console.log('New jenisProperti value:', bulkJenisPropertiValue);
    console.log('Calling handleBulkUpdate with field: jenisProperti, value:', bulkJenisPropertiValue);
    handleBulkUpdate('jenisProperti', bulkJenisPropertiValue);
    setBulkJenisPropertiValue("");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBulkMode) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'a':
              e.preventDefault();
              toggleSelectAll();
              break;
            case 'd':
              e.preventDefault();
              if (selectedIds.length > 0) handleBulkDelete();
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBulkMode, selectedIds, filteredProperties]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProperties.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProperties.map(p => p.id));
    }
  };

  const formatPrice = (price: string, isPerMeter: boolean = false) => {
    const num = parseFloat(price);
    let displayPrice = num;

    if (isPerMeter) {
      // For per meter pricing, show as "Rp 8.5jt/m²"
      if (num >= 1000000000) {
        const value = num / 1000000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
      } else if (num >= 1000000) {
        const value = num / 1000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
      } else if (num >= 1000) {
        const value = num / 1000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}rb/m²`;
      }
      return `Rp ${num.toLocaleString('id-ID')}/m²`;
    } else {
      // Regular pricing - use full format for admin panel
      if (num >= 1000000000) {
        const value = num / 1000000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
      } else if (num >= 1000000) {
        const value = num / 1000000;
        const rounded = Math.round(value * 10) / 10;
        return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
      }
      return `Rp ${num.toLocaleString('id-ID')}`;
    }
  };

  // Helper function to get property image with fallbacks
  const getPropertyImage = (property: any) => {
    // Check all available images in order
    const imageFields = [
      property.imageUrl,
      property.imageUrl1,
      property.imageUrl2,
      property.imageUrl3,
      property.imageUrl4,
      property.imageUrl5,
    ];

    for (const img of imageFields) {
      if (img && img.trim() !== '') {
        try {
          new URL(img);
          return img;
        } catch {
          continue;
        }
      }
    }

    // Return property-type specific placeholder
    const propertyTypePlaceholders: Record<string, string> = {
      rumah: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
      kost: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
      apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      villa: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop',
      ruko: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      tanah: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
      gudang: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop',
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    };

    return propertyTypePlaceholders[property.jenisProperti] ||
           'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Properti</h1>
                <p className="text-muted-foreground">
                  Kelola semua properti Anda {isBulkMode && `(${selectedIds.length} dipilih)`}
                </p>
              </div>

              <div className="flex gap-2">
                <CSVImportDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-properties'] })} />
                <Button
                  variant={isBulkMode ? "secondary" : "outline"}
                  onClick={() => {
                    setIsBulkMode(!isBulkMode);
                    if (isBulkMode) setSelectedIds([]); // Clear selection when exiting bulk mode
                  }}
                  data-testid="button-bulk-mode"
                >
                  {isBulkMode ? <Square className="h-4 w-4 mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                  {isBulkMode ? "Keluar Mode Bulk" : "Mode Bulk"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedProperty(null);
                    setIsFormOpen(true);
                  }}
                  data-testid="button-add-property"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Properti
                </Button>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari kode listing, judul, provinsi, atau kabupaten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                  data-testid="input-search"
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40" data-testid="select-filter-type">
                    <SelectValue placeholder="Tipe Properti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {["rumah", "apartment", "villa", "ruko", "tanah", "kost", "hotel", "gudang", "bangunan_komersial"].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32" data-testid="select-filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="dijual">Dijual</SelectItem>
                    <SelectItem value="disewakan">Disewakan</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || filterType || filterStatus) && (
                  <Button variant="outline" onClick={clearFilters} size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isBulkMode && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 mb-3">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Mode Bulk Aktif</span>
                  <span className="text-sm">({selectedIds.length} properti dipilih)</span>
                </div>
                <div className="text-sm text-amber-700">
                  Gunakan Ctrl+A untuk pilih semua, Ctrl+D untuk hapus terpilih
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p>Memuat properti...</p>
            </div>
          ) : properties.length === 0 ? (
            <Card className="bg-muted">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Belum ada properti</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {isBulkMode && selectedIds.length > 0 && (
                <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-900">{selectedIds.length} properti dipilih</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedIds([])}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Custom Status Update */}
                        <div className="flex items-center gap-2">
                          <Select value={bulkStatusValue} onValueChange={setBulkStatusValue}>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dijual">Dijual</SelectItem>
                              <SelectItem value="disewakan">Disewakan</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={handleBulkStatusChange}
                            disabled={!bulkStatusValue || bulkUpdateMutation.isPending}
                            className="h-8"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Set Status
                          </Button>
                        </div>

                        {/* Jenis Properti Update */}
                        <div className="flex items-center gap-2">
                          <Select value={bulkJenisPropertiValue} onValueChange={setBulkJenisPropertiValue}>
                            <SelectTrigger className="w-40 h-8">
                              <SelectValue placeholder="Jenis Properti" />
                            </SelectTrigger>
                            <SelectContent>
                              {["rumah", "apartment", "villa", "ruko", "tanah", "kost", "hotel", "gudang", "bangunan_komersial"].map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={handleBulkJenisPropertiChange}
                            disabled={!bulkJenisPropertiValue || bulkUpdateMutation.isPending}
                            className="h-8"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Set Jenis
                          </Button>
                        </div>

                        {/* Location Update */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Provinsi"
                            value={bulkProvinceValue}
                            onChange={(e) => setBulkProvinceValue(e.target.value)}
                            className="px-2 py-1 text-sm border border-input rounded h-8 w-24"
                          />
                          <input
                            type="text"
                            placeholder="Kabupaten"
                            value={bulkKabupatenValue}
                            onChange={(e) => setBulkKabupatenValue(e.target.value)}
                            className="px-2 py-1 text-sm border border-input rounded h-8 w-28"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBulkLocationChange}
                            disabled={(!bulkProvinceValue && !bulkKabupatenValue) || bulkUpdateMutation.isPending}
                            className="h-8"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Set Lokasi
                          </Button>
                        </div>

                        {/* Quick Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Settings className="h-3 w-3 mr-2" />
                              Quick Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isPremium', true)}>
                              <Tag className="h-4 w-4 mr-2" />
                              Set Premium: Ya
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isPremium', false)}>
                              <Tag className="h-4 w-4 mr-2" />
                              Set Premium: Tidak
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isFeatured', true)}>
                              Set Featured: Ya
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isFeatured', false)}>
                              Set Featured: Tidak
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isHot', true)}>
                              Set Hot: Ya
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isHot', false)}>
                              Set Hot: Tidak
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isSold', true)}>
                              Set SOLD: Ya
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isSold', false)}>
                              Set SOLD: Tidak
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isPropertyPilihan', true)}>
                              Set Pilihan: Ya
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkUpdate('isPropertyPilihan', false)}>
                              Set Pilihan: Tidak
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                          disabled={bulkDeleteMutation.isPending}
                          className="h-8"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Hapus {selectedIds.length}
                        </Button>
                      </div>
                    </div>

                    {bulkUpdateMutation.isPending && (
                      <div className="mt-3 text-sm text-blue-600 flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 animate-spin" />
                        Memproses update...
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <Card key={property.id} className={`hover-elevate transition-all ${selectedIds.includes(property.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`} data-testid={`property-card-${property.id}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {isBulkMode && (
                          <div className="flex items-center">
                            <Checkbox
                              checked={selectedIds.includes(property.id)}
                              onCheckedChange={() => toggleSelection(property.id)}
                              data-testid={`checkbox-select-${property.id}`}
                            />
                          </div>
                        )}
                        <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                           <img
                             src={getPropertyImage(property)}
                             alt={property.kodeListing}
                             className="w-full h-full object-cover"
                             onError={(e) => {
                               // Fallback to generic placeholder if all images fail
                               e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
                             }}
                           />
                         </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-semibold text-lg" data-testid="text-listing-code">
                                  {property.judulProperti || property.kodeListing}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {property.kabupaten || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  ID: {property.kodeListing}
                                </p>
                                <div className="mt-1">
                                  {property.isHot && property.priceOld && (
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm text-muted-foreground line-through">
                                        {formatPrice(property.priceOld, (property as any).hargaPerMeter)}
                                      </span>
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                        DROP PRICE
                                      </span>
                                    </div>
                                  )}
                                  <p className="text-sm font-medium text-primary">
                                    {formatPrice(property.hargaProperti, (property as any).hargaPerMeter)}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Legalitas: {property.legalitas || 'N/A'}
                                </p>
                              </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setIsFormOpen(true);
                                }}
                                data-testid="button-edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(property.id)}
                                data-testid="button-delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {/* Price moved to header section */}

                          <div className="flex flex-wrap gap-2 mb-3">
                            {property.isPremium && <Badge variant="secondary">Premium</Badge>}
                            {property.isFeatured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                            {property.isHot && <Badge variant="destructive">Hot</Badge>}
                            {property.isSold && <Badge variant="destructive">SOLD</Badge>}
                            {property.isPropertyPilihan && <Badge variant="outline">Pilihan</Badge>}
                            <Badge variant="secondary">{property.status}</Badge>
                          </div>

                          {property.ownerContact && (
                            <p className="text-sm text-muted-foreground">
                              Kontak: {property.ownerContact}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {isBulkMode && filteredProperties.length > 0 && (
                <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.length === filteredProperties.length && filteredProperties.length > 0}
                      onCheckedChange={toggleSelectAll}
                      data-testid="checkbox-select-all"
                    />
                    <label className="text-sm font-medium">
                      Pilih Semua ({selectedIds.length}/{filteredProperties.length})
                    </label>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {filteredProperties.length !== properties.length &&
                      `Menampilkan ${filteredProperties.length} dari ${properties.length} properti`
                    }
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProperty ? "Edit Properti" : "Tambah Properti Baru"}
            </DialogTitle>
          </DialogHeader>
          <PropertyForm
            property={selectedProperty}
            onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
