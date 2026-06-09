import { Link } from "wouter";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

// SEO Internal Links Data
const PROPERTY_TYPES = [
  { label: "Rumah Dijual", href: "/rumah-dijual-yogyakarta" },
  { label: "Kost Dijual", href: "/kost-dijual-yogyakarta" },
  { label: "Tanah Dijual", href: "/tanah-dijual-yogyakarta" },
  { label: "Villa Dijual", href: "/villa-dijual-yogyakarta" },
  { label: "Apartemen Dijual", href: "/apartment-dijual-yogyakarta" },
  { label: "Ruko Dijual", href: "/ruko-dijual-yogyakarta" },
  { label: "Gudang Dijual", href: "/gudang-dijual-yogyakarta" },
  { label: "Hotel Dijual", href: "/hotel-dijual-yogyakarta" },
];

const INVESTASI_LINKS = [
  { label: "Kost Dijual UGM", href: "/kost-dijual-depok" },
  { label: "Kost Eksklusif Sleman", href: "/kost-dijual-sleman" },
  { label: "Rumah Investasi Bantul", href: "/rumah-dijual-bantul" },
  { label: "Tanah Komersial", href: "/tanah-dijual-yogyakarta" },
];

const LOKASI_POPULER = [
  { label: "Sleman", href: "/rumah-dijual-sleman" },
  { label: "Bantul", href: "/rumah-dijual-bantul" },
  { label: "Kota Yogyakarta", href: "/rumah-dijual-kota-yogyakarta" },
  { label: "Kulon Progo", href: "/rumah-dijual-kulon-progo" },
  { label: "Gunungkidul", href: "/rumah-dijual-gunungkidul" },
  { label: "Depok (UGM)", href: "/rumah-dijual-depok" },
  { label: "Kaliurang", href: "/villa-dijual-kaliurang" },
];

const POPULER_LINKS = [
  { label: "Kost Dekat UGM", href: "/kost-dijual-depok" },
  { label: "Rumah Sleman", href: "/rumah-dijual-sleman" },
  { label: "Tanah Bantul", href: "/tanah-dijual-bantul" },
  { label: "Villa Kaliurang", href: "/villa-dijual-kaliurang" },
];

export function Footer() {
  return (
    <footer className="bg-[#0B152A] text-white pt-20 pb-10 border-t-4 border-secondary">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold text-2xl">
                  SB
                </div>
                <div>
                  SALAM BUMI
                  <span className="block text-sm font-medium text-secondary tracking-widest uppercase mt-[-2px]">
                    Property
                  </span>
                </div>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              Agen properti terpercaya di Yogyakarta. Membantu Anda menemukan rumah, kost, tanah, dan properti komersial idaman dengan legalitas aman terjamin.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <p>CV Salam Bumi Property<br/>Jl Pajajaran, Catur Tunggal<br/>Depok, Sleman, DI Yogyakarta</p>
              </div>
              <a href="https://wa.me/6281391278889" className="flex items-center gap-3 text-gray-300 hover:text-secondary transition-colors w-max">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span>0813-9127-8889</span>
              </a>
              <a href="mailto:info@salambumi.xyz" className="flex items-center gap-3 text-gray-300 hover:text-secondary transition-colors w-max">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>info@salambumi.xyz</span>
              </a>
            </div>
          </div>

          {/* Populer di Yogyakarta */}
          <div>
            <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-3 inline-block">Populer di Yogyakarta</h4>
            <ul className="space-y-3">
              {POPULER_LINKS.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jenis Properti */}
          <div>
            <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-3 inline-block">Jenis Properti</h4>
            <ul className="space-y-3">
              {PROPERTY_TYPES.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lokasi Populer */}
          <div>
            <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-3 inline-block">Lokasi Populer</h4>
            <ul className="space-y-3">
              {LOKASI_POPULER.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                    Properti di {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Second Row: Investasi + Social */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-start-5">
            <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-3 inline-block">Investasi</h4>
            <ul className="space-y-3 mb-8">
              {INVESTASI_LINKS.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-secondary transition-colors text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/50"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-bold text-lg mb-4">Ikuti Kami</h4>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/salam.bumi/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; 2026 Salam Bumi Property. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/properties" className="hover:text-white transition-colors">Semua Properti</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Kontak</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
