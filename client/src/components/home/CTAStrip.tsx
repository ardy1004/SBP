import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export function CTAStrip() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Temukan Properti Impian Anda?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Konsultasikan kebutuhan properti Anda dengan tim profesional kami.
            Gratis dan tanpa komitmen.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <MessageCircle className="w-5 h-5 mr-2" />
                Hubungi Kami Sekarang
              </Button>
            </Link>

            <a href="tel:+6281234567890">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm">
                <Phone className="w-5 h-5 mr-2" />
                +62 812-3456-7890
              </Button>
            </a>
          </div>

          <div className="mt-8 text-blue-100">
            <p className="text-sm">
              ✓ Konsultasi gratis ✓ Legalitas terjamin ✓ Proses cepat ✓ Harga transparan
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}