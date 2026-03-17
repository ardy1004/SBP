import { motion } from 'framer-motion';
import { Phone, MessageCircle, Calendar, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { trackWhatsAppConversion } from '@/utils/tracking';

export default function CTAV2() {
  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('final_cta_v2_section');
    window.open('https://wa.me/6281391278889?text=Halo,%20saya%20ingin%20konsultasi%20properti%20premium%20di%20Yogyakarta.%20Mohon%20info%20properti%20terbaru.', '_blank');
  };

  const handleScheduleCall = () => {
    trackWhatsAppConversion('schedule_call_cta_v2');
    window.open('https://wa.me/6281391278889?text=Halo,%20saya%20ingin%20jadwalkan%20panggilan%20dengan%20konsultan%20properti%20premium%20Anda.', '_blank');
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent rounded-full"></div>
        {/* Additional premium floating elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl animate-bounce" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl animate-bounce" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-emerald-400/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '3s'}}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-6 py-3 rounded-full mb-8 font-bold shadow-2xl"
            >
              <Sparkles className="w-5 h-5" />
              PENAWARAN TERBATAS
              <Sparkles className="w-5 h-5" />
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Siap Temukan
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600">
                Properti Impian Anda?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Bergabunglah dengan 500+ klien puas yang telah mewujudkan impian properti mereka bersama kami.
              Konsultasi gratis • Pendampingan penuh • Garansi kepuasan 100%.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppClick}
              className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/50 flex items-center justify-center gap-4 border-2 border-white/20 min-w-[300px]"
            >
              <MessageCircle className="w-7 h-7 group-hover:animate-bounce" />
              <div className="text-left">
                <div>Chat WhatsApp Sekarang</div>
                <div className="text-sm opacity-90">Response &lt; 5 menit</div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleScheduleCall}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-white/20 flex items-center justify-center gap-4 border-2 border-white/30 min-w-[300px]"
            >
              <Calendar className="w-7 h-7" />
              <div className="text-left">
                <div>Jadwalkan Panggilan</div>
                <div className="text-sm opacity-90">Konsultasi 30 menit gratis</div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Gratis Konsultasi</h3>
                  <p className="text-blue-100">Tanpa biaya apapun untuk konsultasi awal</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">24/7 Support</h3>
                  <p className="text-blue-100">Tim expert tersedia kapan saja Anda butuh</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Garansi Kepuasan</h3>
                  <p className="text-blue-100">100% garansi kepuasan atau uang kembali</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Final Urgency Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-md rounded-3xl p-8 border border-amber-400/30 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              🔥 Properti Premium Terbatas - Jangan Sampai Terlewat!
            </h3>
            <p className="text-amber-100 mb-6 text-lg">
              Setiap hari ada properti baru yang masuk. Konsultasikan kebutuhan Anda sekarang
              dan dapatkan rekomendasi properti terbaik sebelum orang lain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Klaim Konsultasi Gratis Sekarang
              </button>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-blue-200 mb-4">
              Atau hubungi kami langsung:
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-blue-100">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="font-semibold">+62 813-9127-8889</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <span className="font-semibold">WhatsApp Business</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}