import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactAgentForm } from "@/components/ContactAgentForm";
import { MapPin, Phone, Mail, Clock, Building } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        {/* Hero Header */}
        <section className="bg-primary text-white py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Hubungi Kami</h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Tim profesional kami siap membantu Anda menemukan properti impian atau menjual properti dengan harga terbaik.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                {/* Office Address */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-primary mb-1">Kantor Utama</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Jl. Malioboro No. 88<br />
                        Yogyakarta, DI Yogyakarta 55211<br />
                        Indonesia
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-primary mb-1">Telepon</h3>
                      <p className="text-gray-600 text-sm">
                        <a href="tel:+6281391278889" className="hover:text-primary transition-colors">
                          +62 813-9127-8889
                        </a>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Senin - Sabtu, 08:00 - 18:00 WIB</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-primary mb-1">Email</h3>
                      <p className="text-gray-600 text-sm">
                        <a href="mailto:info@salambumi.xyz" className="hover:text-primary transition-colors">
                          info@salambumi.xyz
                        </a>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Respon dalam 1-2 jam kerja</p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-primary mb-1">Jam Operasional</h3>
                      <p className="text-gray-600 text-sm space-y-1">
                        <span className="block">Senin - Jumat: 08:00 - 18:00 WIB</span>
                        <span className="block">Sabtu: 09:00 - 15:00 WIB</span>
                        <span className="block">Minggu & Hari Libur: Tutup</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Profile */}
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Salam Bumi Properti</h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        Agen properti terpercaya di Yogyakarta dengan lebih dari 10 tahun Experience. Kami berkomitmen memberikan pelayanan terbaik dan transparan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">
                      Kirim Pesan
                    </h2>
                    <p className="text-gray-500">
                      Isi formulir di bawah ini dan tim kami akan menghubungi Anda secepatnya.
                    </p>
                  </div>
                  <ContactAgentForm propertyTitle="" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">Lokasi Kami</h2>
              <p className="text-gray-500">Kunjungi kantor kami di Yogyakarta</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d110.36844931578355!3d-7.797622979316567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a59a2a2a2a2a3%3A0x2e7a59a2a2a2a2a3!2sJl.%20Malioboro%2C%20Yogyakarta!5e0!3m2!1sid!2sid!4v1620000000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
