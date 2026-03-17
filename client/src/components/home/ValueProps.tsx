import { MapPin, ShieldCheck, TrendingUp, Users, Home } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Yogyakarta Specialist",
    desc: "Agen properti lokal dengan pemahaman mendalam tentang area strategis Yogyakarta."
  },
  {
    icon: Home,
    title: "Listing Lengkap",
    desc: "Update setiap hari untuk rumah, tanah, dan properti komersial premium."
  },
  {
    icon: ShieldCheck,
    title: "Legalitas Aman",
    desc: "Pendampingan full cek legalitas sertifikat hingga transaksi notaris selesai."
  },
  {
    icon: Users,
    title: "Ratusan Buyer Aktif",
    desc: "Jaringan pembeli dan investor yang luas dan aktif setiap bulan."
  },
  {
    icon: TrendingUp,
    title: "Fokus Investasi",
    desc: "Kurasi properti dengan potensi kenaikan nilai investasi (capital gain) tinggi."
  }
];

export function ValueProps() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 space-y-4" data-aos="fade-up">
          <span className="text-primary font-semibold tracking-wider text-sm uppercase">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Partner Properti Terpercaya Anda</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-secondary/50 transition-colors duration-300"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <feature.icon size={28} />
              </div>
              <h3 className="font-bold text-lg text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}