import { Shield, Award, CheckCircle, Star } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: "Legalitas Terjamin",
    description: "Semua properti diverifikasi legalitasnya"
  },
  {
    icon: CheckCircle,
    title: "Terverifikasi",
    description: "Proses verifikasi ketat & transparan"
  },
  {
    icon: Star,
    title: "Premium Service",
    description: "Layanan terbaik untuk klien premium"
  }
];

export default function TrustBadges() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mengapa Memilih Kami?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Komitmen kami untuk memberikan pelayanan properti terbaik dengan standar tertinggi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {badge.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}