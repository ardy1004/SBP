import { trackWhatsAppConversion } from '@/utils/tracking';

export default function CTA() {
  const handleWhatsAppClick = () => {
    trackWhatsAppConversion('final_cta_section');
    window.open('https://wa.me/6281391278889', '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-slate-800">
      <div className="container mx-auto px-4">
        <div
          className="max-w-4xl mx-auto text-center"
          data-aos="fade-zoom-in"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Siap Survey Lokasi?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
            Klik WhatsApp dan kami bantu sampai tuntas.
          </p>

          <button
            onClick={handleWhatsAppClick}
            className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-5 rounded-xl text-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Chat WhatsApp Sekarang
          </button>

          <div className="mt-8 text-blue-200">
            <p className="text-lg">
              Konsultasi gratis • Respon cepat • Solusi terpercaya
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}