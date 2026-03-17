import { motion } from 'framer-motion';
import { MapPin, CheckCircle, FileText, Shield, Users, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import { trackWhatsAppConversion } from '@/utils/tracking';

const valueProps = [
  {
    icon: MapPin,
    title: "Spesialis Area Yogyakarta",
    description: "Pengetahuan mendalam tentang setiap sudut kota, dari Malioboro hingga perumahan elite",
    highlight: "15+ tahun experience lokal",
    color: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-50 via-cyan-50 to-blue-100"
  },
  {
    icon: CheckCircle,
    title: "Database Properti Premium",
    description: "Koleksi eksklusif properti terverifikasi dengan update real-time setiap hari",
    highlight: "500+ properti aktif",
    color: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 via-emerald-50 to-green-100"
  },
  {
    icon: FileText,
    title: "Legalitas 100% Jaminan",
    description: "Proses akad, balik nama, dan sertifikat hak milik dengan notaris terpercaya",
    highlight: "Konsultasi Gratis",
    color: "from-purple-500 to-violet-600",
    bgGradient: "from-purple-50 via-violet-50 to-purple-100"
  },
  {
    icon: Shield,
    title: "Pendampingan VIP",
    description: "Dari survei lokasi hingga transaksi selesai, tim expert siap 24/7",
    highlight: "Response < 3 menit",
    color: "from-amber-500 to-yellow-600",
    bgGradient: "from-yellow-50 via-amber-50 to-yellow-100"
  },
  {
    icon: Users,
    title: "Network Investor Premium",
    description: "Terhubung dengan investor dan developer properti terkemuka di Yogyakarta",
    highlight: "50+ partner strategis",
    color: "from-indigo-500 to-blue-600",
    bgGradient: "from-indigo-50 via-blue-50 to-indigo-100"
  },
  {
    icon: Award,
    title: "8+ Tahun Experience",
    description: "Pengalaman di industri properti",
    highlight: "Pengalaman di industri properti",
    color: "from-red-500 to-pink-600",
    bgGradient: "from-red-50 via-pink-50 to-red-100"
  }
];

export default function ValuePropsV2() {
  const [, setLocation] = useLocation();

  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('value_props_cta');
    window.open('https://wa.me/6281391278889?text=Halo,%20saya%20ingin%20konsultasi%20gratis%20tentang%20properti%20premium%20di%20Yogyakarta.%20Mohon%20info%20properti%20terbaru.', '_blank');
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-semibold text-sm">KEUNGGULAN KAMI</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Mengapa Memilih Kami?
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kami bukan sekadar agen properti. Kami adalah partner terpercaya yang memahami
            kebutuhan properti premium Anda dengan layanan concierge tingkat tinggi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.02 }}
                className={`group relative p-8 bg-gradient-to-br ${prop.bgGradient} rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden`}
              >
                {/* Animated background decoration */}
                <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${prop.color} opacity-10 rounded-full group-hover:scale-150 group-hover:opacity-20 transition-all duration-700`} />
                <div className={`absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br ${prop.color} opacity-5 rounded-full group-hover:scale-125 transition-all duration-500`} />

                <div className="relative z-10">
                  {/* Icon with premium styling */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${prop.color} rounded-2xl mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title with gradient on hover */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300">
                    {prop.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                    {prop.description}
                  </p>

                  {/* Highlight badge */}
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${prop.color} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md`}>
                    <CheckCircle className="w-4 h-4" />
                    {prop.highlight}
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${prop.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-r-full`} />
              </motion.div>
            );
          })}
        </div>

        {/* Call-to-action section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-200/50 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Siap Temukan Properti Impian Anda?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Konsultasi gratis dengan tim expert kami. Kami bantu dari awal pencarian hingga proses akad selesai.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Mulai Konsultasi Gratis
              </button>
              <button
                onClick={() => setLocation('/')}
                className="bg-white border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                LIHAT SEMUA PROPERTI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}