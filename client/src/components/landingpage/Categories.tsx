import { Home, MapPin, Building, Trees, Store } from 'lucide-react';

const categories = [
  {
    icon: Home,
    name: "Rumah",
    description: "Rumah idaman dengan berbagai tipe dan lokasi"
  },
  {
    icon: MapPin,
    name: "Tanah",
    description: "Lahan kavling siap bangun di area strategis"
  },
  {
    icon: Building,
    name: "Kost",
    description: "Kost eksklusif dan kost biasa untuk berbagai budget"
  },
  {
    icon: Trees,
    name: "Villa",
    description: "Villa mewah dengan pemandangan indah"
  },
  {
    icon: Store,
    name: "Komersial",
    description: "Ruang usaha dan investasi komersial"
  }
];

export default function Categories() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-slate-800">
      <div className="container mx-auto px-4">
        <div
          className="text-center mb-16"
          data-aos="fade-up"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Kategori Properti
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Temukan jenis properti yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 group-hover:bg-white/30 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {category.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}