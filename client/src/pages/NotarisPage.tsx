import { FileCheck, Shield, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotarisPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Layanan Notaris</h1>
          <p className="text-lg md:text-xl font-body">Proses Legal Properti yang Aman dan Terpercaya</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Layanan Notaris Profesional
          </h2>
          <p className="text-lg text-muted-foreground font-body leading-relaxed">
            Kami bekerja sama dengan notaris bersertifikat dan berpengalaman untuk memastikan semua proses legal transaksi properti Anda berjalan lancar, aman, dan sesuai dengan hukum yang berlaku.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pengurusan Dokumen</h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                Kami membantu pengurusan lengkap dokumen legal seperti Akta Jual Beli (AJB), Surat Kuasa, dan dokumen penting lainnya dengan prosedur yang benar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verifikasi Legal</h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                Melakukan pengecekan dan verifikasi menyeluruh terhadap status legal properti untuk memastikan tidak ada masalah hukum yang tersembunyi.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Proses Cepat</h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                Proses pengurusan dokumen yang efisien dengan timeline yang jelas, sehingga transaksi properti Anda dapat diselesaikan tepat waktu.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Konsultasi Gratis</h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                Dapatkan konsultasi gratis mengenai proses legal properti dari tim notaris profesional kami yang berpengalaman.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Butuh Bantuan Notaris?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Hubungi kami untuk konsultasi gratis mengenai kebutuhan legal properti Anda
            </p>
            <Button variant="secondary" size="lg" data-testid="button-contact-notaris">
              Hubungi Kami
            </Button>
          </CardContent>
        </Card>

        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Dokumen yang Ditangani</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Akta Jual Beli (AJB)",
              "Sertifikat Hak Milik (SHM)",
              "Sertifikat Hak Guna Bangunan (SHGB)",
              "Perjanjian Pengikatan Jual Beli (PPJB)",
              "Surat Kuasa",
              "Akta Hibah",
              "Akta Waris",
              "Balik Nama Sertifikat",
            ].map((doc, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium">{doc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
