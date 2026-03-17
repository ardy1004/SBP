import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maya Putri",
    role: "Owner Homestay",
    content: "Pelayanan yang sangat profesional dan membantu. Tim expert berhasil menemukan lokasi properti yang strategis untuk pengembangan homestay saya. Proses yang smooth dari awal hingga selesai.",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/2.webp"
  },
  {
    name: "Budi Hartono",
    role: "Pengusaha",
    content: "Sebagai pengusaha, saya sangat menghargai pendekatan profesional dan analisis mendalam yang diberikan. Berhasil menemukan properti komersial yang sesuai dengan visi bisnis saya.",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/1.webp"
  },
  {
    name: "Dr. Ahmad Santoso",
    role: "Investor Properti",
    content: "Sebagai investor properti berpengalaman, saya sangat terkesan dengan database properti yang lengkap dan analisis investasi yang akurat. Layanan premium yang recommended.",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/3.webp"
  },
  {
    name: "Siti Nurhaliza",
    role: "Ibu Rumah Tangga",
    content: "Pengalaman pertama membeli properti yang sangat menyenangkan. Tim yang sabar dan profesional membantu saya menemukan rumah impian keluarga. Terima kasih atas pelayanannya!",
    rating: 5,
    image: "https://images.salambumi.xyz/asset/8c850dd6-c0a8-44cd-90f7-c37a50ae8f68.webp"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Apa Kata Klien Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Testimoni dari klien yang telah berhasil menemukan properti impian mereka
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
              />
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}