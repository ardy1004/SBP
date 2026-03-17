import { Card, CardContent } from "@/components/ui/card";

export default function PortfolioPage() {
  const projects = [
    {
      title: "Dampingi Klien Negosiasi Kost Exclusive",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/da94e869-53dc-447c-be01-94b6a31cdbae_imgupscaler.ai_V2(Pro)_2K.webp",
      description: "Dokumentasi survey lokasi lengkap dengan analisis lingkungan",
    },
    {
      title: "Penyerahan dokumen AJB Notaris",
      location: "Sleman",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/e29ea026-1025-4590-97d8-bb6e5fe18713_imgupscaler.ai_V2(Pro)_2K.webp",
      description: "Survey detail dengan pemetaan aksesibilitas dan fasilitas umum",
    },
    {
      title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UPN",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/6e28aee2-087e-4051-99d6-5eead23d2698_imgupscaler.ai_V2(Pro)_2K.webp",
      description: "Proses dokumentasi Akta Jual Beli dengan verifikasi legalitas",
    },
    {
      title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UII",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/957b50e0-5769-481b-9de6-11c02b0822d8_imgupscaler.ai_V2(Pro)_2K.webp",
      description: "Dokumentasi lengkap survey lokasi dan proses AJB",
    },
    {
      title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UGM",
      location: "Sleman",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/8800b8fc-fc97-46a0-b7d8-f91cd64027f8_imgupscaler.ai_V2(Pro)_2K.webp",
      description: "Verifikasi menyeluruh lokasi dengan dokumentasi foto profesional",
    },
    {
      title: "Dokumentasi Proses AJB Notaris : Kost Exclusive dekat UGM",
      location: "Sleman",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/23854ae2-be1f-416f-85ed-15e6d694a66a_imgupscaler.ai_V2(Pro)_2K.webp",
      description: "Dokumentasi lengkap untuk keperluan legal dan AJB",
    },
    {
      title: "Dampingi Klien Survey Lokasi Rumah Perum Elite",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/41.webp",
      description: "Dokumentasi survey lokasi rumah perumahan elite dengan analisis lingkungan",
    },
    {
      title: "Dampingi Klien Survey Lokasi Rumah Villa Mewah",
      location: "Sleman",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/60.webp",
      description: "Survey detail villa mewah dengan pemetaan aksesibilitas premium",
    },
    {
      title: "Dampingi Klien Survey Lokasi Hotel Bintang",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/65.webp",
      description: "Dokumentasi lengkap survey lokasi hotel bintang dengan verifikasi legalitas",
    },
    {
      title: "Dampingi Klien Survey Lokasi Kost Exclusive",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(11).webp",
      description: "Survey kost exclusive dengan analisis fasilitas dan lingkungan",
    },
    {
      title: "Dampingi Klien Survey Lokasi Hotel Budget",
      location: "Sleman",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(14).webp",
      description: "Dokumentasi survey hotel budget dengan pemetaan aksesibilitas strategis",
    },
    {
      title: "Dampingi Klien Survey Lokasi Kost Exclusive",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(19).webp",
      description: "Survey detail kost exclusive dengan verifikasi kualitas dan fasilitas",
    },
    {
      title: "Dampingi Klien Survey Lokasi Kost Exclusive",
      location: "Yogyakarta",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(20).webp",
      description: "Dokumentasi lengkap survey kost exclusive dengan analisis lingkungan",
    },
    {
      title: "Dampingi Klien Survey Lokasi Rumah Mewah Private Pool",
      location: "Sleman",
      year: "2024",
      image: "https://images.salambumi.xyz/portfolio%20gallery/survey%20lokasi/IMAGE%20(25).webp",
      description: "Survey rumah mewah dengan private pool dan pemetaan premium amenities",
    },
  ];

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Portfolio Gallery</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dokumentasi Survey Lokasi & AJB
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card key={index} className="overflow-hidden hover-elevate transition-all duration-200" data-testid={`card-portfolio-${index}`}>
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2" data-testid={`text-portfolio-title-${index}`}>{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 font-body">
                  {project.location} • {project.year}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
