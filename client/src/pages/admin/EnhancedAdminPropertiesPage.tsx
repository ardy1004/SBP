import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  CheckSquare,
  Square,
  Settings,
  Search,
  Filter,
  X,
  Save,
  RotateCcw,
  Upload,
  Download,
  Grid,
  List,
  Eye,
  Star,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { CSVImportDialog } from "@/components/admin/CSVImportDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EnhancedAdminPropertiesPage() {
  const [match, params] = useRoute("/admin/properties/:tab?");
  const [, setLocation] = useLocation();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [bulkStatusValue, setBulkStatusValue] = useState<string>("");
  const [bulkProvinceValue, setBulkProvinceValue] = useState<string>("");
  const [bulkKabupatenValue, setBulkKabupatenValue] = useState<string>("");
  const [bulkJenisPropertiValue, setBulkJenisPropertiValue] = useState<string>("");
  const { toast } = useToast();

  // Get active tab from URL params
  const activeTab = params?.tab || "all";

  // Handle special tabs
  useEffect(() => {
    if (activeTab === "add") {
      setIsFormOpen(true);
    }
  }, [activeTab]);

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

  // Bulk operations mutations
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

      await queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
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

  const handleBulkUpdate = (field: string, value: any) => {
    if (selectedIds.length === 0) return;
    const updates: any = {};
    updates[field] = value;
    bulkUpdateMutation.mutate({ ids: selectedIds, updates });
  };

  const handleBulkStatusChange = () => {
    if (selectedIds.length === 0 || !bulkStatusValue) return;
    handleBulkUpdate('status', bulkStatusValue);
    setBulkStatusValue("");
  };

  const handleBulkJenisPropertiChange = () => {
    if (selectedIds.length === 0 || !bulkJenisPropertiValue) return;
    handleBulkUpdate('jenisProperti', bulkJenisPropertiValue);
    setBulkJenisPropertiValue("");
  };

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

  const getPropertyImage = (property: any) => {
    const imageFields = [
      property.imageUrl,
      property.imageUrl1,
      property.imageUrl2,
      property.imageUrl3,
      property.imageUrl4,
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

  const PropertyCard = ({ property }: { property: any }) => (
    <Card className={`hover-elevate transition-all ${selectedIds.includes(property.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`} data-testid={`property-card-${property.id}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {isBulkMode && (
            <div className="flex items-center">
              <Checkbox
                checked={selectedIds.includes(property.id)}
                onCheckedChange={() => toggleSelection(property.id)}
                data-testid={`checkbox-select-${property.id}`}
              />
            </div>
          )}

          <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={getPropertyImage(property)}
              alt={property.kodeListing}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate" data-testid="text-listing-code">
                  {property.judulProperti || property.kodeListing}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {property.kabupaten || 'N/A'}, {property.provinsi || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: {property.kodeListing}
                </p>
              </div>

              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setSelectedProperty(property);
                    setIsFormOpen(true);
                  }}
                  data-testid="button-edit"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(`/properti/${property.id}`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Public
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {/* Duplicate logic */}}>
                      <Tag className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {/* Delete logic */}}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">
                  {formatPrice(property.hargaProperti, property.hargaPerMeter)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.legalitas || 'N/A'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {property.isPremium && <Badge variant="secondary" className="text-xs">Premium</Badge>}
                {property.isHot && <Badge variant="destructive" className="text-xs">Hot</Badge>}
                {property.isSold && <Badge variant="destructive" className="text-xs">Sold</Badge>}
                <Badge variant="outline" className="text-xs">{property.status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "categories":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Property Categories</h2>
                <p className="text-muted-foreground">Manage property categories and types</p>
              </div>
              <Button>Add Category</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Rumah", "Apartemen", "Villa", "Ruko", "Tanah", "Kost", "Hotel", "Gudang"].map((category) => (
                <Card key={category}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{category}</h3>
                        <p className="text-sm text-muted-foreground">Property type</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "templates":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Property Templates</h2>
                <p className="text-muted-foreground">Create and manage property templates</p>
              </div>
              <Button>Create Template</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Rumah Minimalis Template</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Template untuk rumah minimalis dengan field-field standar
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Use Template</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Apartemen Mewah Template</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Template untuk apartemen mewah dengan fasilitas premium
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Use Template</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return renderPropertiesContent();
    }
  };

  return (
    <AdminLayout
      title={
        activeTab === "categories" ? "Property Categories" :
        activeTab === "templates" ? "Property Templates" :
        "Properties"
      }
      subtitle={
        activeTab === "categories" ? "Manage property categories and types" :
        activeTab === "templates" ? "Create and manage property templates" :
        `${filteredProperties.length} properties found`
      }
      showSearch={activeTab === "all"}
      onSearch={setSearchTerm}
      notifications={2}
    >
      {renderTabContent()}
    </AdminLayout>
  );

  function renderPropertiesContent() {
    return (
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={isBulkMode ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                if (isBulkMode) setSelectedIds([]);
              }}
              data-testid="button-bulk-mode"
            >
              {isBulkMode ? <Square className="h-4 w-4 mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
              {isBulkMode ? "Exit Bulk Mode" : "Bulk Mode"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <CSVImportDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-properties'] })} />
            <Button
              onClick={() => {
                setSelectedProperty(null);
                setIsFormOpen(true);
              }}
              data-testid="button-add-property"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40" data-testid="select-filter-type">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
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
                <SelectItem value="all">All Status</SelectItem>
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

        {/* Bulk Actions */}
        {isBulkMode && selectedIds.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">{selectedIds.length} properties selected</span>
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

                <div className="flex gap-2">
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

                  <Select value={bulkJenisPropertiValue} onValueChange={setBulkJenisPropertiValue}>
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue placeholder="Type" />
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
                    Set Type
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {/* Bulk delete logic */}}
                    className="h-8"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete {selectedIds.length}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Display */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <Card className="bg-muted">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No properties found</p>
              <Button
                className="mt-4"
                onClick={() => {
                  setSelectedProperty(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Bulk Select All */}
            {isBulkMode && filteredProperties.length > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.length === filteredProperties.length && filteredProperties.length > 0}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                  <label className="text-sm font-medium">
                    Select All ({selectedIds.length}/{filteredProperties.length})
                  </label>
                </div>
                <div className="text-xs text-muted-foreground">
                  {filteredProperties.length !== properties.length &&
                    `Showing ${filteredProperties.length} of ${properties.length} properties`
                  }
                </div>
              </div>
            )}
          </>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProperty ? "Edit Property" : "Add New Property"}
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
}