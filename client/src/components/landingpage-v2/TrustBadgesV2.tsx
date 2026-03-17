import { motion } from 'framer-motion';
import { Shield, Award, CheckCircle, Star, Users, Clock } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    title: "100% Legal & Aman",
    description: "Semua properti terverifikasi notaris",
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50"
  },
  {
    icon: Award,
    title: "Premium Certified",
    description: "Standar layanan properti tertinggi",
    color: "from-amber-500 to-yellow-600",
    bgColor: "from-yellow-50 to-amber-50"
  },
  {
    icon: CheckCircle,
    title: "Terverifikasi Owner",
    description: "Pemilik properti teridentifikasi",
    color: "from-blue-500 to-cyan-600",
    bgColor: "from-blue-50 to-cyan-50"
  },
  {
    icon: Star,
    title: "98% Kepuasan Client",
    description: "Rating tertinggi dari pelanggan",
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-50"
  },
  {
    icon: Users,
    title: "500+ Transaksi",
    description: "Berhasil memfasilitasi properti",
    color: "from-indigo-500 to-blue-600",
    bgColor: "from-indigo-50 to-blue-50"
  },
  {
    icon: Clock,
    title: "8+ Tahun Experience",
    description: "Pengalaman di industri properti",
    color: "from-red-500 to-pink-600",
    bgColor: "from-red-50 to-pink-50"
  }
];

export default function TrustBadgesV2() {
  return (
    <section id="trust-badges-v2" className="py-16 bg-gradient-to-r from-slate-50 to-blue-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mengapa <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Kami Terpercaya</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Komitmen kami untuk memberikan pengalaman properti premium dengan standar tertinggi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative p-8 bg-gradient-to-br ${badge.bgColor} rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${badge.color} opacity-10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500`} />

                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${badge.color} rounded-xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300">
                    {badge.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {badge.description}
                  </p>
                </div>

                {/* Hover effect line */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${badge.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom trust statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-white/50">
            <div className="flex text-yellow-400">
              {'★'.repeat(5)}
            </div>
            <span className="text-gray-800 font-semibold">
              4.9/5 Rating • 200+ Ulasan • Google Reviews
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}