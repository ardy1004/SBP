import { Users, Target, Award, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl font-body">Tentang Salam Bumi Property</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Finding the Best Properties Will Be Easier and More Precise
          </h2>
          <p className="text-lg text-muted-foreground font-body leading-relaxed">
            Salam Bumi Property adalah platform properti terpercaya yang membantu Anda menemukan properti impian dengan mudah dan cepat. Kami menyediakan berbagai pilihan properti berkualitas di seluruh Indonesia dengan layanan profesional dan terpercaya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Tim Profesional</h3>
              <p className="text-sm text-muted-foreground font-body">
                Tim berpengalaman siap membantu Anda menemukan properti terbaik
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Pilihan Lengkap</h3>
              <p className="text-sm text-muted-foreground font-body">
                Berbagai jenis properti dari rumah, apartemen, hingga komersial
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Terpercaya</h3>
              <p className="text-sm text-muted-foreground font-body">
                Layanan terpercaya dengan track record yang baik
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Harga Kompetitif</h3>
              <p className="text-sm text-muted-foreground font-body">
                Penawaran harga terbaik dan transparan
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted">
          <CardContent className="p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-6">Visi & Misi</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-3">Visi</h4>
                <p className="text-muted-foreground font-body leading-relaxed">
                  Menjadi platform properti terdepan di Indonesia yang menghadirkan solusi properti terbaik dengan teknologi dan layanan yang inovatif.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-3">Misi</h4>
                <ul className="space-y-2 text-muted-foreground font-body">
                  <li>• Menyediakan platform pencarian properti yang mudah dan efisien</li>
                  <li>• Memberikan layanan profesional dan terpercaya</li>
                  <li>• Menghubungkan pembeli dan penjual properti dengan aman</li>
                  <li>• Terus berinovasi dalam teknologi properti</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
