import { CheckCircle } from "lucide-react";

const reasons = [
  {
    title: "Pengalaman 15+ Tahun",
    description: "Tim profesional dengan track record terbukti dalam pasar properti Yogyakarta"
  },
  {
    title: "Jaringan Luas",
    description: "Koneksi dengan developer, notaris, dan bank terpercaya di seluruh DIY"
  },
  {
    title: "Legalitas Terjamin",
    description: "Pendampingan penuh proses legal dari PPJB hingga AJB"
  },
  {
    title: "Harga Kompetitif",
    description: "Akses langsung ke developer tanpa biaya tambahan untuk pembeli"
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Mengapa Memilih Kami?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami berkomitmen memberikan pelayanan terbaik dengan standar profesionalisme tinggi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="flex items-start space-x-4 p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}