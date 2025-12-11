// AI-Powered Property Matchmaker
// Recommends properties based on user preferences and market analysis

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Target, TrendingUp, Users, MapPin, DollarSign } from "lucide-react";
import { PROPERTY_TYPES } from "@shared/types";

interface UserPreferences {
  budgetMin?: number;
  budgetMax?: number;
  propertyType?: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
  priority?: 'budget' | 'location' | 'size' | 'facilities';
}

interface PropertyRecommendation {
  id: string;
  kode_listing: string;
  judul_properti: string;
  jenis_properti: string;
  harga_properti: string;
  kabupaten: string;
  provinsi: string;
  kamar_tidur?: number;
  kamar_mandi?: number;
  luas_tanah?: number;
  luas_bangunan?: number;
  image_url?: string;
  matchScore: number;
  matchReasons: string[];
}

export function PropertyMatchmaker() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    priority: 'budget'
  });
  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const { toast } = useToast();

  // Memoize recommendations to prevent unnecessary re-renders
  const memoizedRecommendations = useMemo(() => recommendations, [recommendations]);

  // Memoize market insights to prevent unnecessary re-renders
  const memoizedMarketInsights = useMemo(() => marketInsights, [marketInsights]);

  // Memoize the handleFindMatches function to prevent unnecessary re-creations
  const handleFindMatches = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Fetch properties from database
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'dijual')
        .is('is_sold', false)
        .limit(50);

      if (error) throw error;

      // Analyze market data
      const insights = analyzeMarketData(properties);
      setMarketInsights(insights);

      // Generate recommendations
      const matches = generateRecommendations(properties, preferences);
      setRecommendations(matches);

      toast({
        title: "Rekomendasi Ditemukan",
        description: `Ditemukan ${matches.length} properti yang cocok dengan preferensi Anda`,
      });
    } catch (error) {
      console.error('Error finding matches:', error);
      toast({
        title: "Error",
        description: "Gagal menganalisis properti",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [preferences, toast]);

  const analyzeMarketData = (properties: any[]) => {
    const insights = {
      totalProperties: properties.length,
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      popularLocations: [] as string[],
      popularTypes: [] as string[],
      marketTrends: [] as string[]
    };

    if (properties.length === 0) return insights;

    // Calculate price statistics
    const prices = properties
      .map(p => parseFloat(p.harga_properti?.replace(/[^\d]/g, '') || '0'))
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    insights.averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    insights.priceRange = {
      min: prices[0] || 0,
      max: prices[prices.length - 1] || 0
    };

    // Popular locations
    const locationCount = properties.reduce((acc, prop) => {
      const location = `${prop.kabupaten}, ${prop.provinsi}`;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    insights.popularLocations = Object.entries(locationCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([location]) => location);

    // Popular property types
    const typeCount = properties.reduce((acc, prop) => {
      acc[prop.jenis_properti] = (acc[prop.jenis_properti] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    insights.popularTypes = Object.entries(typeCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([type]) => type);

    // Market trends
    insights.marketTrends = [];
    if (insights.averagePrice > 100000000) {
      insights.marketTrends.push("Harga properti premium sedang tinggi");
    }
    if (insights.popularLocations.length > 0) {
      insights.marketTrends.push(`${insights.popularLocations[0]} adalah lokasi paling diminati`);
    }
    if (insights.popularTypes.includes('kost')) {
      insights.marketTrends.push("Kost/kontrakan sangat diminati mahasiswa");
    }

    return insights;
  };

  const generateRecommendations = (properties: any[], prefs: UserPreferences): PropertyRecommendation[] => {
    return properties
      .map(prop => {
        const matchScore = calculateMatchScore(prop, prefs);
        const matchReasons = getMatchReasons(prop, prefs);

        return {
          id: prop.id,
          kode_listing: prop.kode_listing,
          judul_properti: prop.judul_properti,
          jenis_properti: prop.jenis_properti,
          harga_properti: prop.harga_properti,
          kabupaten: prop.kabupaten,
          provinsi: prop.provinsi,
          kamar_tidur: prop.kamar_tidur,
          kamar_mandi: prop.kamar_mandi,
          luas_tanah: prop.luas_tanah,
          luas_bangunan: prop.luas_bangunan,
          image_url: prop.image_url,
          matchScore,
          matchReasons
        };
      })
      .filter(rec => rec.matchScore > 30) // Only show matches with score > 30
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Top 10 matches
  };

  const calculateMatchScore = (property: any, prefs: UserPreferences): number => {
    let score = 50; // Base score

    // Budget matching (highest priority)
    if (prefs.budgetMin || prefs.budgetMax) {
      const price = parseFloat(property.harga_properti?.replace(/[^\d]/g, '') || '0');
      const minPrice = prefs.budgetMin || 0;
      const maxPrice = prefs.budgetMax || Infinity;

      if (price >= minPrice && price <= maxPrice) {
        score += 30;
      } else if (price < minPrice * 1.2 || price > maxPrice * 0.8) {
        score += 10; // Close match
      }
    }

    // Property type matching
    if (prefs.propertyType && property.jenis_properti === prefs.propertyType) {
      score += 20;
    }

    // Location matching
    if (prefs.location) {
      const propLocation = `${property.kabupaten} ${property.provinsi}`.toLowerCase();
      if (propLocation.includes(prefs.location.toLowerCase())) {
        score += 25;
      }
    }

    // Size matching
    if (prefs.areaMin || prefs.areaMax) {
      const area = property.luas_bangunan || property.luas_tanah || 0;
      const minArea = prefs.areaMin || 0;
      const maxArea = prefs.areaMax || Infinity;

      if (area >= minArea && area <= maxArea) {
        score += 15;
      }
    }

    // Room matching
    if (prefs.bedrooms && property.kamar_tidur === prefs.bedrooms) {
      score += 10;
    }
    if (prefs.bathrooms && property.kamar_mandi === prefs.bathrooms) {
      score += 10;
    }

    return Math.min(score, 100); // Max score 100
  };

  const getMatchReasons = (property: any, prefs: UserPreferences): string[] => {
    const reasons: string[] = [];

    // Budget reasons
    if (prefs.budgetMin || prefs.budgetMax) {
      const price = parseFloat(property.harga_properti?.replace(/[^\d]/g, '') || '0');
      const minPrice = prefs.budgetMin || 0;
      const maxPrice = prefs.budgetMax || Infinity;

      if (price >= minPrice && price <= maxPrice) {
        reasons.push("Harga sesuai budget");
      }
    }

    // Type reasons
    if (prefs.propertyType && property.jenis_properti === prefs.propertyType) {
      reasons.push(`Tipe properti: ${property.jenis_properti}`);
    }

    // Location reasons
    if (prefs.location) {
      const propLocation = `${property.kabupaten} ${property.provinsi}`.toLowerCase();
      if (propLocation.includes(prefs.location.toLowerCase())) {
        reasons.push(`Lokasi: ${property.kabupaten}`);
      }
    }

    // Size reasons
    if (prefs.areaMin || prefs.areaMax) {
      const area = property.luas_bangunan || property.luas_tanah || 0;
      const minArea = prefs.areaMin || 0;
      const maxArea = prefs.areaMax || Infinity;

      if (area >= minArea && area <= maxArea) {
        reasons.push(`Luas: ${area} m²`);
      }
    }

    return reasons;
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price?.replace(/[^\d]/g, '') || '0');
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(1)}M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}M`;
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      {/* User Preferences Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Smart Property Matchmaker
          </CardTitle>
          <CardDescription>
            Temukan properti impian Anda berdasarkan preferensi dan analisis pasar AI
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget-min">Budget Minimum</Label>
              <Input
                id="budget-min"
                type="number"
                placeholder="Rp 100.000.000"
                value={preferences.budgetMin || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  budgetMin: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="budget-max">Budget Maximum</Label>
              <Input
                id="budget-max"
                type="number"
                placeholder="Rp 500.000.000"
                value={preferences.budgetMax || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  budgetMax: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="property-type">Tipe Properti</Label>
              <Select
                value={preferences.propertyType || ''}
                onValueChange={(value) => setPreferences({
                  ...preferences,
                  propertyType: value || undefined
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe properti" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                placeholder="Yogyakarta, Sleman, dll"
                value={preferences.location || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  location: e.target.value || undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="bedrooms">Kamar Tidur</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="2"
                value={preferences.bedrooms || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  bedrooms: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="area-min">Luas Minimum (m²)</Label>
              <Input
                id="area-min"
                type="number"
                placeholder="50"
                value={preferences.areaMin || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  areaMin: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          <Button
            onClick={handleFindMatches}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menganalisis...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Cari Properti Impian
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Market Insights */}
      {memoizedMarketInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(memoizedMarketInsights.averagePrice.toString())}
                </div>
                <div className="text-sm text-muted-foreground">Harga Rata-rata</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">
                  {memoizedMarketInsights.popularLocations[0] || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Lokasi Terpopuler</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">
                  {memoizedMarketInsights.totalProperties}
                </div>
                <div className="text-sm text-muted-foreground">Total Properti</div>
              </div>
            </div>

            {memoizedMarketInsights.marketTrends.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Market Trends:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {memoizedMarketInsights.marketTrends.map((trend: string, index: number) => (
                    <li key={index}>{trend}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {memoizedRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rekomendasi Properti ({memoizedRecommendations.length})</CardTitle>
            <CardDescription>
              Properti yang paling cocok dengan preferensi Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memoizedRecommendations.map((property) => (
                <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{property.judul_properti}</h4>
                      <p className="text-sm text-muted-foreground">
                        {property.kabupaten}, {property.provinsi}
                      </p>
                    </div>
                    <Badge variant={property.matchScore > 80 ? "default" : "secondary"}>
                      {property.matchScore}% Match
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                    <span>💰 {formatPrice(property.harga_properti)}</span>
                    <span>🏠 {property.jenis_properti}</span>
                    {property.kamar_tidur && <span>🛏️ {property.kamar_tidur} KT</span>}
                    {property.luas_bangunan && <span>📐 {property.luas_bangunan} m²</span>}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {property.matchReasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>

                  <Button size="sm" variant="outline">
                    Lihat Detail
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}