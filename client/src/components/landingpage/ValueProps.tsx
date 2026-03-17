import { MapPin, CheckCircle, FileText, Shield } from 'lucide-react';

const valueProps = [
  {
    icon: MapPin,
    title: "Agen Spesialis Area Yogyakarta",
    description: "Kami fokus pada properti di Yogyakarta dengan pengetahuan mendalam tentang setiap area"
  },
  {
    icon: CheckCircle,
    title: "Listing Terverifikasi & Aktual",
    description: "Semua properti kami verifikasi langsung dengan update informasi terkini setiap hari"
  },
  {
    icon: FileText,
    title: "Harga Transparan & Legal Aman",
    description: "Harga bersaing dengan legalitas properti yang terjamin dan transparan"
  },
  {
    icon: Shield,
    title: "Pendampingan Hingga Transaksi Selesai",
    description: "Bantuan penuh dari survei lokasi hingga proses akad dan balik nama properti"
  }
];

export default function ValueProps() {
  return (
    <section id="value-props-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <div
                key={index}
                className="text-center group"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-xl mb-6 group-hover:bg-blue-100 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {prop.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {prop.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}