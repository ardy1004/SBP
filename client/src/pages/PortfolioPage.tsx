import { Card, CardContent } from "@/components/ui/card";

export default function PortfolioPage() {
  const projects = [
    {
      title: "Perumahan Griya Asri",
      location: "Jakarta Selatan",
      year: "2023",
      image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
      description: "Proyek perumahan modern dengan 50 unit rumah",
    },
    {
      title: "Apartemen Sky Tower",
      location: "Jakarta Pusat",
      year: "2023",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      description: "Apartemen mewah 20 lantai di pusat kota",
    },
    {
      title: "Ruko Premium Sudirman",
      location: "Jakarta Pusat",
      year: "2022",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
      description: "Ruko strategis untuk bisnis dan investasi",
    },
    {
      title: "Villa Puncak Paradise",
      location: "Bogor",
      year: "2022",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      description: "Villa eksklusif dengan pemandangan gunung",
    },
    {
      title: "Gudang Logistik Modern",
      location: "Tangerang",
      year: "2021",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
      description: "Fasilitas gudang 5000m² untuk logistik",
    },
    {
      title: "Hotel Bintang 4",
      location: "Bandung",
      year: "2021",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      description: "Hotel modern dengan 100 kamar",
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
          <p className="text-lg md:text-xl font-body">Proyek-Proyek Terbaik Kami</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Proyek yang Telah Kami Selesaikan
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Berikut adalah beberapa proyek properti yang telah kami tangani dengan sukses, dari residensial hingga komersial.
          </p>
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
                <p className="text-foreground font-body">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
