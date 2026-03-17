import type { Property, CompanyInfo } from "./types"

export const companyInfo: CompanyInfo = {
  name: "Salam Bumi Property",
  slogan: "Finding the Best Properties Will Be Easier and More Precise",
  about:
    "Salam Bumi Property adalah perusahaan properti terpercaya yang berdedikasi membantu Anda menemukan hunian impian. Dengan pengalaman bertahun-tahun di industri properti, kami menyediakan layanan jual beli dan sewa properti yang profesional dan terpercaya.",
  vision: "Menjadi perusahaan properti terdepan yang memberikan solusi properti terbaik bagi masyarakat Indonesia.",
  mission: [
    "Menyediakan properti berkualitas dengan harga yang kompetitif",
    "Memberikan pelayanan profesional dan transparan kepada klien",
    "Membangun kepercayaan melalui integritas dan komitmen",
    "Terus berinovasi dalam memberikan pengalaman terbaik",
  ],
  address: "Virtual Office",
  phone: "+62 813 9127 8889",
  whatsapp: "+62 813 9127 8889",
  email: "info@salambumi.xyz",
  socialMedia: {
    facebook: "https://facebook.com/salambumiproperty",
    instagram: "https://instagram.com/salambumiproperty",
    twitter: "https://twitter.com/salambumiprop",
  },
}


// Helper functions
export function formatPrice(price: number): string {
  if (price >= 1000000000) {
    const formatted = (price / 1000000000).toFixed(1)
    return `Rp ${formatted.replace(/\.0$/, '')} M`
  } else if (price >= 1000000) {
    return `Rp ${(price / 1000000).toFixed(0)} Jt`
  }
  return `Rp ${price.toLocaleString("id-ID")}`
}

export function formatPriceDetailed(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    gudang: "Gudang",
    villa: "Villa",
    "homestay/guesthouse": "Homestay/Guesthouse",
    hotel: "Hotel",
    kost: "Kost",
    rumah: "Rumah",
    ruko: "Ruko",
    tanah: "Tanah",
    bangunan_komersial: "Bangunan Komersial",
  }
  return labels[type] || type
}

export function getPropertyStatusLabel(status: string): string {
  return status === "sale" ? "Dijual" : "Disewa"
}
