import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CSVImportDialog } from "@/components/admin/CSVImportDialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Property } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default function AdminPropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/admin/properties'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/properties/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      toast({ title: "Properti berhasil dihapus" });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus properti ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Properti</h1>
              <p className="text-muted-foreground">
                Kelola semua properti Anda
              </p>
            </div>

            <div className="flex gap-2">
              <CSVImportDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] })} />
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
            <div className="space-y-4">
              {properties.map((property) => (
                <Card key={property.id} className="hover-elevate transition-all" data-testid={`property-card-${property.id}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={property.imageUrl}
                        alt={property.kodeListing}
                        className="w-24 h-24 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop';
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg" data-testid="text-listing-code">
                              {property.kodeListing}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {property.jenisProperti.charAt(0).toUpperCase() + property.jenisProperti.slice(1)} - {property.kabupaten}
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

                        <p className="font-semibold text-primary mb-2" data-testid="text-property-price">
                          {formatPrice(property.hargaProperti)}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {property.isPremium && <Badge variant="blue">Premium</Badge>}
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
              queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
