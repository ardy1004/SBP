// Virtual Tour Generator
// AI-powered tool to help create virtual tours and photo recommendations

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Video, MapPin, Home, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

interface VirtualTourPlan {
  propertyType: string;
  roomCount: number;
  outdoorSpaces: string[];
  recommendedShots: Array<{
    type: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    tips: string[];
  }>;
  tourScript: string;
  estimatedTime: string;
  equipmentNeeded: string[];
}

export function VirtualTourGenerator() {
  const [propertyType, setPropertyType] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [outdoorSpaces, setOutdoorSpaces] = useState('');
  const [specialFeatures, setSpecialFeatures] = useState('');
  const [tourPlan, setTourPlan] = useState<VirtualTourPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTourPlan = async () => {
    if (!propertyType || !roomCount) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon isi tipe properti dan jumlah kamar",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate virtual tour plan based on property details
      const plan = generateVirtualTourPlan({
        propertyType,
        roomCount: parseInt(roomCount),
        outdoorSpaces: outdoorSpaces.split(',').map(s => s.trim()).filter(s => s),
        specialFeatures: specialFeatures.split(',').map(s => s.trim()).filter(s => s)
      });

      setTourPlan(plan);

      toast({
        title: "Virtual Tour Plan Generated",
        description: "Rencana virtual tour berhasil dibuat",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal generate rencana virtual tour",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVirtualTourPlan = (data: {
    propertyType: string;
    roomCount: number;
    outdoorSpaces: string[];
    specialFeatures: string[];
  }): VirtualTourPlan => {
    const baseShots: VirtualTourPlan['recommendedShots'] = [
      {
        type: 'Exterior Front',
        description: 'Tampilan depan properti dari jalan',
        priority: 'high',
        tips: ['Foto pagi hari untuk pencahayaan terbaik', 'Sertakan lingkungan sekitar', 'Tunjukkan akses parkir']
      },
      {
        type: 'Living Room',
        description: 'Ruang tamu utama',
        priority: 'high' as const,
        tips: ['Foto dari sudut yang menunjukkan keseluruhan ruangan', 'Pastikan pencahayaan cukup', 'Tunjukkan furniture dan dekorasi']
      },
      {
        type: 'Kitchen',
        description: 'Dapur dan area memasak',
        priority: 'high',
        tips: ['Tunjukkan appliances dan counter space', 'Foto dari berbagai sudut', 'Sertakan pantry jika ada']
      }
    ];

    // Add bedroom shots based on room count
    for (let i = 1; i <= data.roomCount; i++) {
      baseShots.push({
        type: `Bedroom ${i}`,
        description: `Kamar tidur ${i}`,
        priority: i === 1 ? 'high' : 'medium',
        tips: ['Tunjukkan ukuran kamar dan penyimpanan', 'Foto dari pintu masuk', 'Sertakan kamar mandi jika terhubung']
      });
    }

    // Add bathroom shots
    const bathroomCount = Math.max(1, Math.ceil(data.roomCount / 2));
    for (let i = 1; i <= bathroomCount; i++) {
      baseShots.push({
        type: `Bathroom ${i}`,
        description: `Kamar mandi ${i}`,
        priority: 'medium' as const,
        tips: ['Fokus pada fixtures dan tiles', 'Tunjukkan shower/bathtub', 'Jaga privasi']
      });
    }

    // Add outdoor spaces
    data.outdoorSpaces.forEach(space => {
      baseShots.push({
        type: `${space} View`,
        description: `Area ${space.toLowerCase()}`,
        priority: 'medium' as const,
        tips: ['Tunjukkan ukuran dan potensi', 'Foto dari berbagai sudut', 'Sertakan landscape']
      });
    });

    // Add special features
    data.specialFeatures.forEach(feature => {
      baseShots.push({
        type: `${feature} Feature`,
        description: `Fitur khusus: ${feature}`,
        priority: 'high',
        tips: ['Highlight fitur unik', 'Tunjukkan fungsionalitas', 'Jelaskan keunggulan']
      });
    });

    // Generate tour script
    const tourScript = generateTourScript(data);

    // Equipment recommendations
    const equipmentNeeded = [
      'Smartphone atau kamera DSLR',
      'Tripod untuk stabilitas',
      'Aplikasi virtual tour (Matterport, Zillow, dll)',
      'Pencahayaan tambahan jika diperlukan',
      'Stabilizer untuk video smooth'
    ];

    // Estimate time
    const estimatedTime = `${Math.max(2, data.roomCount + data.outdoorSpaces.length)} jam`;

    return {
      propertyType: data.propertyType,
      roomCount: data.roomCount,
      outdoorSpaces: data.outdoorSpaces,
      recommendedShots: baseShots,
      tourScript,
      estimatedTime,
      equipmentNeeded
    };
  };

  const generateTourScript = (data: {
    propertyType: string;
    roomCount: number;
    outdoorSpaces: string[];
    specialFeatures: string[];
  }): string => {
    let script = `Selamat datang di virtual tour ${data.propertyType} ini!\n\n`;

    script += `Mari kita mulai dengan melihat tampilan eksterior yang menawan...\n\n`;

    script += `Sekarang mari masuk ke dalam dan melihat ruang tamu yang nyaman...\n\n`;

    script += `Berikutnya adalah dapur yang modern dan fungsional...\n\n`;

    // Add bedrooms
    for (let i = 1; i <= data.roomCount; i++) {
      script += `Kamar tidur ${i} menawarkan kenyamanan dan privasi yang sempurna...\n\n`;
    }

    // Add bathrooms
    const bathroomCount = Math.max(1, Math.ceil(data.roomCount / 2));
    for (let i = 1; i <= bathroomCount; i++) {
      script += `Kamar mandi ${i} dilengkapi dengan fasilitas modern...\n\n`;
    }

    // Add outdoor spaces
    data.outdoorSpaces.forEach(space => {
      script += `Area ${space.toLowerCase()} memberikan kesempatan untuk bersantai dan menikmati udara segar...\n\n`;
    });

    // Add special features
    data.specialFeatures.forEach(feature => {
      script += `Fitur khusus ${feature.toLowerCase()} menambah nilai properti ini...\n\n`;
    });

    script += `Terima kasih telah bergabung dalam virtual tour ini. Untuk informasi lebih lanjut, hubungi kami!`;

    return script;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Virtual Tour Generator
          </CardTitle>
          <CardDescription>
            Buat rencana virtual tour profesional untuk properti Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property-type">Tipe Properti *</Label>
              <Input
                id="property-type"
                placeholder="Rumah, Apartemen, Kost, dll"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="room-count">Jumlah Kamar Tidur *</Label>
              <Input
                id="room-count"
                type="number"
                placeholder="2"
                value={roomCount}
                onChange={(e) => setRoomCount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="outdoor-spaces">Area Outdoor (pisahkan dengan koma)</Label>
            <Input
              id="outdoor-spaces"
              placeholder="Taman, Balkon, Garasi, Kolam Renang"
              value={outdoorSpaces}
              onChange={(e) => setOutdoorSpaces(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="special-features">Fitur Khusus (pisahkan dengan koma)</Label>
            <Input
              id="special-features"
              placeholder="Gym, Rooftop, Smart Home, Security 24/7"
              value={specialFeatures}
              onChange={(e) => setSpecialFeatures(e.target.value)}
            />
          </div>

          <Button
            onClick={generateTourPlan}
            disabled={isGenerating || !propertyType || !roomCount}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Virtual Tour Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Tour Plan */}
      {tourPlan && (
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Tour Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {tourPlan.recommendedShots.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Shots</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {tourPlan.estimatedTime}
                  </div>
                  <div className="text-sm text-muted-foreground">Estimasi Waktu</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {tourPlan.equipmentNeeded.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Equipment Needed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Shots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Recommended Shots ({tourPlan.recommendedShots.length})
              </CardTitle>
              <CardDescription>
                Daftar foto/video yang perlu diambil untuk virtual tour yang lengkap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tourPlan.recommendedShots.map((shot, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{shot.type}</h4>
                        <p className="text-sm text-muted-foreground">{shot.description}</p>
                      </div>
                      <Badge className={getPriorityColor(shot.priority)}>
                        {shot.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="mt-2">
                      <h5 className="text-sm font-medium mb-1">Tips Shooting:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {shot.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tour Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Tour Script
              </CardTitle>
              <CardDescription>
                Script narasi untuk virtual tour video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={tourPlan.tourScript}
                readOnly
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Equipment Needed */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Tools</CardTitle>
              <CardDescription>
                Peralatan yang dibutuhkan untuk membuat virtual tour profesional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tourPlan.equipmentNeeded.map((equipment, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{equipment}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Photo Session
            </Button>
            <Button variant="outline" className="flex-1">
              <Video className="h-4 w-4 mr-2" />
              Record Tour Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}