import { motion } from 'framer-motion';
import { Phone, MessageCircle, Calendar, CheckCircle, ArrowRight, Sparkles, Star, Users, Shield } from 'lucide-react';
import { trackWhatsAppConversion } from '@/utils/tracking';
import { WHATSAPP_CONFIG, COMPANY_CONFIG } from '@/lib/config';

export default function CTAV2Optimized() {
  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('final_cta_optimized');
    window.open(WHATSAPP_CONFIG.getLink('Halo, saya ingin konsultasi properti premium di Yogyakarta. Mohon info properti terbaru.'), '_blank');
  };

  const handleScheduleCall = () => {
    trackWhatsAppConversion('schedule_call_optimized');
    window.open(WHATSAPP_CONFIG.getLink('Halo, saya ingin jadwalkan panggilan dengan konsultan properti premium Anda.'), '_blank');
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* OPTIMIZED: Simplified background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* ENHANCED: Main CTA Content with Urgency */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {/* URGENCY ELEMENT */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full mb-8 font-bold shadow-2xl animate-pulse"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              PENAWARAN TERBATAS - Hanya 15 Slot Bulan Ini
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Jangan Sampai Kehabisan!
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600">
                Properti Impian Anda?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              47 orang sedang melihat properti ini sekarang. 
              <span className="font-bold text-amber-400"> Klaim konsultasi gratis Anda sebelum terlambat!</span>
            </p>

            {/* LIVE ACTIVITY INDICATOR */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-2 rounded-full mb-8"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">LIVE: 23 orang sedang online</span>
            </motion.div>
          </motion.div>

          {/* ENHANCED: Primary CTA Buttons with better conversion optimization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16"
          >
            {/* PRIMARY CTA - Enhanced with urgency and benefits */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppClick}
              className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/50 flex items-center justify-center gap-4 border-2 border-white/20 min-w-[350px] relative overflow-hidden"
            >
              {/* SHIMMER EFFECT */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <MessageCircle className="w-7 h-7 group-hover:animate-bounce relative z-10" />
              <div className="text-left relative z-10">
                <div className="text-xl">Saya Mau Konsultasi GRATIS!</div>
                <div className="text-sm opacity-90">Response 2 menit • 100% Gratis</div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
            </motion.button>

            {/* SECONDARY CTA */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleScheduleCall}
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-white/20 flex items-center justify-center gap-4 border-2 border-white/30 min-w-[350px]"
            >
              <Calendar className="w-7 h-7" />
              <div className="text-left">
                <div>Jadwalkan Panggilan</div>
                <div className="text-sm opacity-90">Konsultasi 30 menit gratis</div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* ENHANCED: Trust Indicators with Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Konsultasi GRATIS</h3>
                  <p className="text-blue-100">Tanpa biaya apapun untuk konsultasi awal</p>
                  <div className="text-green-400 text-sm font-semibold mt-1">✅ 100% No Hidden Cost</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Response Super Cepat</h3>
                  <p className="text-blue-100">Rata-rata 90 detik response time</p>
                  <div className="text-blue-400 text-sm font-semibold mt-1">⚡ Tim expert 24/7</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Garansi Kepuasan</h3>
                  <p className="text-blue-100">100% garansi kepuasan atau uang kembali</p>
                  <div className="text-purple-400 text-sm font-semibold mt-1">🛡️ Zero Risk Guarantee</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ENHANCED: Customer Testimonial Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-md rounded-3xl p-8 border border-amber-400/30 text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              {['★', '★', '★', '★', '★'].map((star, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <blockquote className="text-xl text-white italic mb-6">
              "Pelayanan yang sangat profesional! Dalam 2 hari sudah dapat rumah Impian saya di Yogyakarta. 
              Tim Salam Bumi Property sangat responsif dan membantu dari awal sampai proses akad selesai."
            </blockquote>
            
            <div className="flex items-center justify-center gap-4">
              <img 
                src="/images/customer-avatar-1.jpg" 
                alt="Sari Wijaya" 
                className="w-16 h-16 rounded-full border-2 border-amber-400"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=Sari+Wijaya&background=fbbf24&color=000&size=64`;
                }}
              />
              <div className="text-left">
                <div className="font-bold text-white text-lg">Sari Wijaya</div>
                <div className="text-amber-200">Cliente • Membeli Villa di Yogyakarta</div>
                <div className="text-amber-300 text-sm">⭐ 5/5 - Sangat Puas!</div>
              </div>
            </div>
          </motion.div>

          {/* ENHANCED: Final Urgency Section with Scarcity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-md rounded-3xl p-8 border border-red-400/30 text-center relative overflow-hidden"
          >
            {/* BACKGROUND PULSE EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                <span className="text-2xl">🔥</span>
                Properti Premium Terbatas - Jangan Sampai Terlewat!
                <span className="text-2xl">🔥</span>
              </h3>
              
              <p className="text-red-100 mb-6 text-lg">
                <strong>Setiap hari ada properti baru yang masuk.</strong> Konsultasikan kebutuhan Anda sekarang
                dan dapatkan rekomendasi properti terbaik sebelum orang lain.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="text-amber-400 font-bold">⏰ Tinggal 12 slot lagi</div>
                  <div className="text-white text-sm">untuk bulan ini</div>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="text-green-400 font-bold">💰 Hemat hingga 50 juta</div>
                  <div className="text-white text-sm">dengan diskon khusus</div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black px-12 py-6 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-3 mx-auto"
              >
                <MessageCircle className="w-6 h-6" />
                Klaim Konsultasi Gratis Sekarang
                <span className="animate-bounce">⚡</span>
              </motion.button>
            </div>
          </motion.div>

          {/* ENHANCED: Contact Info with multiple channels */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-blue-200 mb-6 text-lg">
              Atau hubungi kami langsung melalui channel favorit Anda:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center text-blue-100">
              <div className="flex items-center justify-center gap-3 bg-white/5 rounded-xl p-4">
                <Phone className="w-6 h-6 text-green-400" />
                <div>
                  <div className="font-bold">Telepon Langsung</div>
                  <div className="text-green-400 font-semibold">{WHATSAPP_CONFIG.NUMBER_DISPLAY}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-white/5 rounded-xl p-4">
                <MessageCircle className="w-6 h-6 text-green-400" />
                <div>
                  <div className="font-bold">WhatsApp Business</div>
                  <div className="text-green-400 font-semibold">@SalamBumiProperty</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-white/5 rounded-xl p-4">
                <Users className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-bold">Instagram DM</div>
                  <div className="text-blue-400 font-semibold">@salambumiproperty</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center items-center gap-6 text-sm text-blue-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Response 2 menit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Konsultasi 100% Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Tanpa Komitmen</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}