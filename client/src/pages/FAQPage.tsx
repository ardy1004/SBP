import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQPage() {
  const faqs = [
    {
      question: "Bagaimana cara mencari properti di Salam Bumi Property?",
      answer: "Anda dapat menggunakan fitur pencarian di halaman utama dengan memilih status (jual/sewa), jenis properti, dan lokasi. Anda juga dapat menggunakan filter lanjutan untuk menyaring berdasarkan harga, jumlah kamar, luas tanah/bangunan, dan status legal.",
    },
    {
      question: "Apakah saya bisa melihat properti secara langsung?",
      answer: "Ya, tentu saja. Setelah Anda tertarik dengan properti tertentu, Anda dapat menghubungi kami melalui formulir inquiry atau WhatsApp yang tersedia. Tim kami akan mengatur jadwal viewing untuk Anda.",
    },
    {
      question: "Bagaimana proses pembelian properti?",
      answer: "Proses pembelian dimulai dengan viewing properti, negosiasi harga, pembuatan PPJB (Perjanjian Pengikatan Jual Beli), pembayaran DP, proses KPR (jika menggunakan), pengurusan dokumen legal dengan notaris, pembayaran pelunasan, dan serah terima properti.",
    },
    {
      question: "Apakah ada biaya tambahan selain harga properti?",
      answer: "Ya, ada beberapa biaya tambahan seperti biaya notaris, biaya balik nama sertifikat, pajak penjual (PPN/PPh), dan biaya admin bank jika menggunakan KPR. Tim kami akan menjelaskan detail biaya-biaya ini.",
    },
    {
      question: "Bagaimana dengan proses KPR?",
      answer: "Kami memiliki kerjasama dengan berbagai bank untuk membantu proses KPR Anda. Tim kami dapat membantu mengurus dokumen dan persyaratan yang diperlukan untuk pengajuan KPR.",
    },
    {
      question: "Apa itu label Premium, Featured, dan Hot Listing?",
      answer: "Premium adalah properti pilihan berkualitas tinggi, Featured adalah properti unggulan yang kami rekomendasikan, dan Hot Listing adalah properti dengan harga yang baru saja diturunkan dan merupakan penawaran terbaik.",
    },
    {
      question: "Bagaimana cara mengetahui status legal properti?",
      answer: "Setiap properti yang kami tampilkan sudah dilengkapi informasi status legal (SHM, SHGB, PPJB, dll). Untuk verifikasi lebih lanjut, tim kami dan notaris partner akan melakukan pengecekan menyeluruh sebelum transaksi.",
    },
    {
      question: "Apakah bisa membeli properti untuk investasi?",
      answer: "Tentu saja. Banyak properti di platform kami cocok untuk investasi. Tim kami dapat memberikan konsultasi mengenai properti mana yang memiliki potensi investasi terbaik sesuai dengan budget dan tujuan Anda.",
    },
    {
      question: "Bagaimana cara menyewa properti?",
      answer: "Untuk properti dengan status 'disewakan', prosesnya lebih sederhana. Setelah viewing dan deal, Anda akan membuat perjanjian sewa, membayar deposit dan sewa periode awal, kemudian menerima kunci properti.",
    },
    {
      question: "Apakah ada garansi setelah pembelian?",
      answer: "Untuk properti baru dari developer, biasanya ada garansi tertentu. Untuk properti second, kami memastikan semua dokumen legal lengkap dan sah. Detail garansi akan dijelaskan sesuai dengan jenis dan kondisi properti.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">FAQ</h1>
          <p className="text-lg md:text-xl font-body">Pertanyaan yang Sering Diajukan</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ada Pertanyaan?
          </h2>
          <p className="text-lg text-muted-foreground font-body">
            Berikut adalah jawaban untuk pertanyaan yang paling sering kami terima
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`accordion-trigger-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body leading-relaxed" data-testid={`accordion-content-${index}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Card className="bg-muted">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-3">
                Masih Ada Pertanyaan?
              </h3>
              <p className="text-muted-foreground mb-4 font-body">
                Jika Anda memiliki pertanyaan lain, jangan ragu untuk menghubungi kami
              </p>
              <p className="text-foreground font-semibold">
                WhatsApp: +62 813 9127 8889<br />
                Email: info@salambumi.xyz
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
