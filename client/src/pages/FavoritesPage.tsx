import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@shared/types";
import { usePropertyStore } from "@/store/propertyStore";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = usePropertyStore();

  const { data: allProperties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties/newest'],
  });

  const favoriteProperties = allProperties.filter((property) =>
    favorites.includes(property.id)
  );

  const toggleFavorite = (id: string) => {
    removeFavorite(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-muted py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Properti Favorit</h1>
          </div>
          <p className="text-lg text-muted-foreground font-body">
            Properti yang Anda simpan untuk dilihat nanti
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        {favoriteProperties.length === 0 ? (
          <Card className="bg-muted">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Belum Ada Favorit</h2>
              <p className="text-muted-foreground font-body">
                Mulai tambahkan properti ke favorit dengan menekan ikon hati pada kartu properti
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {favoriteProperties.length} properti tersimpan
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {favoriteProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
