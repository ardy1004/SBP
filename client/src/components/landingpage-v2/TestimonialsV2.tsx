import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Maya Putri",
    role: "Owner Homestay",
    company: "Maya's Homestay",
    message: "Pelayanan yang sangat profesional dan membantu. Tim expert berhasil menemukan lokasi properti yang strategis untuk pengembangan homestay saya. Proses yang smooth dari awal hingga selesai.",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/2.webp",
    location: "Yogyakarta"
  },
  {
    id: 2,
    name: "Budi Hartono",
    role: "Pengusaha",
    company: "CV. Budi Jaya",
    message: "Sebagai pengusaha, saya sangat menghargai pendekatan profesional dan analisis mendalam yang diberikan. Berhasil menemukan properti komersial yang sesuai dengan visi bisnis saya.",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/1.webp",
    location: "Surakarta"
  },
  {
    id: 3,
    name: "Dr. Ahmad Santoso",
    role: "Investor Properti",
    company: "PT. Properti Indonesia",
    message: "Sebagai investor properti berpengalaman, saya sangat terkesan dengan database properti yang lengkap dan analisis investasi yang akurat. Layanan premium yang recommended.",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/3.webp",
    location: "Jakarta"
  },
  {
    id: 4,
    name: "Siti Nurhaliza",
    role: "Ibu Rumah Tangga",
    company: "Personal",
    message: "Pengalaman pertama membeli properti yang sangat menyenangkan. Tim yang sabar dan profesional membantu saya menemukan rumah impian keluarga. Terima kasih atas pelayanannya!",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/8c850dd6-c0a8-44cd-90f7-c37a50ae8f68.webp",
    location: "Sleman"
  }
];

export default function TestimonialsV2() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play testimonials
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentTestimonial = testimonials[currentIndex];

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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-3 rounded-full mb-6">
            <Quote className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-semibold text-sm">TESTIMONI KLIEN</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Apa Kata <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Klien Kami</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lebih dari 500 klien telah mempercayai kami untuk mewujudkan impian properti mereka.
            Berikut cerita sukses dari beberapa klien terpilih kami.
          </p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="text-center"
              >
                {/* Quote icon */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
                    <Quote className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Rating stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial text */}
                <blockquote className="text-2xl md:text-3xl text-gray-800 font-light leading-relaxed mb-8 max-w-4xl mx-auto">
                  "{currentTestimonial.message}"
                </blockquote>

                {/* Client info */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="text-left">
                      <h4 className="text-xl font-bold text-gray-900">{currentTestimonial.name}</h4>
                      <p className="text-gray-600">{currentTestimonial.role}</p>
                      <p className="text-sm text-blue-600 font-medium">{currentTestimonial.location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              {/* Dots indicator */}
              <div className="flex gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-blue-600 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
          >
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Happy Clients</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">8+</div>
              <div className="text-gray-600 font-medium">Years Experience</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gold-50 to-yellow-50 rounded-2xl border border-gold-100">
              <div className="text-3xl font-bold text-gold-600 mb-2">4.9/5</div>
              <div className="text-gray-600 font-medium">Google Rating</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}