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
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
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
            Salam Bumi Property adalah perusahaan properti terkemuka di Yogyakarta yang telah berpengalaman lebih dari 10 tahun dalam bidang jual-beli properti. Kami berkomitmen untuk memberikan pelayanan terbaik kepada setiap klien dengan integritas, profesionalisme, dan dedikasi tinggi.

            Sebagai spesialis properti di Yogyakarta, kami memahami betul dinamika pasar properti lokal dan nasional. Tim kami terdiri dari para profesional berpengalaman yang siap membantu Anda menemukan properti impian atau menjual properti Anda dengan harga terbaik.

            Kami tidak hanya menawarkan jasa jual-beli properti, tetapi juga menyediakan layanan lengkap mulai dari konsultasi properti, appraisal, hingga layanan notaris dan PPAT yang terpercaya. Dengan jaringan yang luas dan database properti yang komprehensif, kami memastikan setiap transaksi berjalan lancar dan menguntungkan bagi semua pihak.
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
                Tim berpengalaman lebih dari 10 tahun di bidang properti Yogyakarta
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Database Lengkap</h3>
              <p className="text-sm text-muted-foreground font-body">
                Ribuan properti terverifikasi di seluruh Yogyakarta dan sekitarnya
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
                Ratusan transaksi berhasil dengan kepuasan klien 100%
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Harga Terbaik</h3>
              <p className="text-sm text-muted-foreground font-body">
                Negosiasi langsung dengan owner tanpa biaya tersembunyi
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
                  Menjadi perusahaan properti terkemuka di Yogyakarta yang memberikan pelayanan prima dengan integritas tinggi, membantu masyarakat mewujudkan hunian impian melalui solusi properti yang inovatif dan terpercaya.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-3">Misi</h4>
                <ul className="space-y-2 text-muted-foreground font-body">
                  <li>• Memberikan konsultasi properti secara profesional dan jujur</li>
                  <li>• Menyediakan database properti terlengkap di Yogyakarta</li>
                  <li>• Memfasilitasi transaksi properti yang aman dan transparan</li>
                  <li>• Membangun kepercayaan melalui pelayanan yang berkualitas</li>
                  <li>• Terus mengembangkan kompetensi tim untuk pelayanan terbaik</li>
                  <li>• Berkontribusi pada kemajuan industri properti di Yogyakarta</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Layanan Kami</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Jual/Beli Properti</h4>
                  <p className="text-sm text-muted-foreground font-body">
                    Layanan jual-beli rumah, tanah, apartemen, ruko, dan properti komersial lainnya
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Titip Jual</h4>
                  <p className="text-sm text-muted-foreground font-body">
                    Layanan titip jual properti dengan pemasaran maksimal dan harga kompetitif
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Konsultasi Properti</h4>
                  <p className="text-sm text-muted-foreground font-body">
                    Konsultasi gratis untuk investasi properti dan analisis pasar
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Appraisal</h4>
                  <p className="text-sm text-muted-foreground font-body">
                    Penilaian harga properti yang akurat dan profesional
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Jasa Bangun</h4>
                  <p className="text-sm text-muted-foreground font-body">
                    Layanan pembangunan rumah dan renovasi dengan kualitas terjamin
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg mb-2">Notaris & PPAT</h4>
                  <p className="text-sm text-muted-foreground font-body">
                    Fasilitasi proses legal dengan notaris terpercaya
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Mari Wujudkan Hunian Impian Anda!</h3>
              <p className="text-lg mb-6 font-body">
                Hubungi kami sekarang untuk konsultasi properti gratis dan dapatkan penawaran terbaik untuk properti impian Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-center">
                  <p className="font-semibold">📞 Telepon/WhatsApp</p>
                  <p className="text-sm">+62 813 9127 8889</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">📧 Email</p>
                  <p className="text-sm">info@salambumi.xyz</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">📍 Kantor</p>
                  <p className="text-sm">Virtual Office</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
