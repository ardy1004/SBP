// Agreement PDF Generator Component
// Generates marketing agreement document for property submissions

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle,
  Loader2
} from "lucide-react";

interface AgreementData {
  id?: string;
  owner_name: string;
  owner_ktp: string;
  owner_address: string;
  property_address: string;
  property_type: string;
  certificate_type: string;
  price: string;
  agreement_type: "open_listing" | "exclusive_booster";
  duration_months?: number;
  marketing_options?: string[];
}

interface AgreementPDFGeneratorProps {
  agreementId: string;
  onDownload?: () => void;
}

export function AgreementPDFGenerator({ agreementId, onDownload }: AgreementPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null);
  const { toast } = useToast();

  const loadAgreementData = useCallback(async () => {
    if (!agreementId) return null;

    try {
      // Get agreement data
      const { data: agreement, error } = await supabase
        .from('marketing_agreements')
        .select('*')
        .eq('id', agreementId)
        .single();

      if (error || !agreement) {
        console.error('Error loading agreement:', error);
        return null;
      }

      // Get owner data
      const { data: owner } = await supabase
        .from('owner_identities')
        .select('*')
        .eq('id', agreement.owner_identity_id)
        .single();

      // Get property data
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', agreement.property_id)
        .single();

      if (!owner || !property) {
        console.error('Missing owner or property data');
        return null;
      }

      // Build agreement data
      const data: AgreementData = {
        id: agreement.id,
        owner_name: owner.nama_lengkap,
        owner_ktp: owner.no_ktp,
        owner_address: owner.alamat_ktp,
        property_address: property.alamat_lengkap,
        property_type: property.jenis_properti,
        certificate_type: property.property_details?.legalitas || "SHM",
        price: property.harga_properti ? `Rp ${new Intl.NumberFormat('id-ID').format(property.harga_properti)}` : "Nego",
        agreement_type: agreement.agreement_type,
        duration_months: agreement.exclusive_booster_duration_months,
        marketing_options: agreement.meta_ads_enabled || agreement.tiktok_ads_enabled 
          ? [
              ...(agreement.meta_ads_enabled ? ['Meta Ads (Instagram & Facebook)'] : []),
              ...(agreement.tiktok_ads_enabled ? ['TikTok Ads'] : [])
            ]
          : [],
      };

      setAgreementData(data);
      return data;
    } catch (error) {
      console.error('Error loading agreement data:', error);
      return null;
    }
  }, [agreementId]);

  const generateAgreementText = (data: AgreementData): string => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const agreementNumber = `${Date.now().toString().slice(-8)}-${Date.now().toString().slice(-6, -2)}`;

    let marketingDetails = "";
    if (data.agreement_type === "exclusive_booster" && data.marketing_options && data.marketing_options.length > 0) {
      marketingDetails = `
4. JENIS PEMASARAN
   - Meta Ads (Instagram & Facebook)
   - TikTok Ads
   - Penargetan berdasarkan usia, buying power, lokasi, demografi, minat, dan perilaku

5. BIAYA PEMASARAN
   - Biaya Admin: Rp 1.500.000/bulan
   - Biaya Ads: Dimulai dari Rp 50.000/hari`;
    } else {
      marketingDetails = `
4. JENIS PEMASARAN
   - Pemasaran Standar melalui platform Salam Bumi Property`;
    }

    return `
PERJANJIAN JASA PEMASARAN
SALAM BUMI PROPERTY
${data.agreement_type === "exclusive_booster" ? "( EXCLUSIVE BOOSTER – KONTRAK " + data.duration_months + " BULAN )" : "( OPEN LISTING )"}
Nomor: ${agreementNumber}

Pada hari ini, ${today}, telah dibuat dan disepakati Perjanjian Jasa Pemasaran Properti antara:

PIHAK PERTAMA
Nama Perusahaan : Salam Bumi Property
Alamat Kantor : Jl Pajajaran, Catur Tunggal, Depok, Sleman
Telp / WhatsApp : 0813-9127-8889
Email : salambumiproperty@gmail.com
Website : salambumi.xyz
Dalam hal ini bertindak sebagai Penyedia Jasa Pemasaran Properti, selanjutnya disebut PIHAK PERTAMA.

PIHAK KEDUA
Nama : ${data.owner_name}
No. KTP : ${data.owner_ktp}
Alamat KTP : ${data.owner_address}
Dalam hal ini bertindak sebagai Pemilik Properti,K KEDUA.

PIHAK selanjutnya disebut PIHA PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut para Pihak.

PASAL 1
OBJEK PERJANJIAN
PIHAK KEDUA memberikan hak pemasaran${data.agreement_type === "exclusive_booster" ? " secara EXCLUSIVE" : ""} kepada PIHAK PERTAMA untuk memasarkan properti milik PIHAK KEDUA dengan data sebagai berikut:

Objek Properti
Jenis Properti : ${data.property_type}
Sertifikat : ${data.certificate_type}
Alamat : ${data.property_address}
Harga Penawaran : ${data.price}

PASAL 2
JENIS LISTING DAN MASA KONTRAK
Jenis listing yang disepakati adalah ${data.agreement_type === "exclusive_booster" ? "EXCLUSIVE LISTING" : "OPEN LISTING"}.

${data.agreement_type === "exclusive_booster" ? `Masa kontrak berlaku selama ${data.duration_months} (${data.duration_months}) bulan, terhitung sejak tanggal ditandatanganinya perjanjian ini.

Selama masa kontrak berlangsung, PIHAK KEDUA tidak diperkenankan menunjuk agen properti lain untuk memasarkan objek properti sebagaimana dimaksud dalam Pasal 1.

Apabila properti terjual selama masa kontrak, maka transaksi tersebut tetap dianggap sebagai hasil kerja PIHAK PERTAMA.` : "Properti akan dipasarkan secara terbuka. PIHAK KEDUA bebas menunjuk agen lain."}

PASAL 3
KETENTUAN FEE / KOMISI
PIHAK KEDUA menyetujui membayar fee atau komisi sebesar 3% (tiga persen) dari harga deal${data.agreement_type === "exclusive_booster" ? " + biaya pemasaran" : ""} kepada PIHAK PERTAMA.

Pembayaran fee dilakukan selambat-lambatnya 3 (tiga) hari setelah:
- Akta Jual Beli (AJB) ditandatangani, atau
- Apabila transaksi dilakukan secara tunai bertahap, maka pembayaran fee dilakukan setelah pembayaran mencapai minimal 30% (Down Payment) dari total harga.

${marketingDetails}

PASAL 4
PEMBATALAN TRANSAKSI
Apabila terjadi pembatalan sepihak oleh calon pembeli, maka PIHAK KEDUA menyetujui memberikan 50% (lima puluh persen) dari booking fee / tanda jadi kepada PIHAK PERTAMA.
Ketentuan ini berlaku sepanjang pembatalan bukan disebabkan oleh kesalahan PIHAK PERTAMA.

PASAL 5
KEWAJIBAN PIHAK PERTAMA
- Melakukan pemasaran properti secara profesional dan maksimal
- Menyusun strategi pemasaran sesuai standar Salam Bumi Property
- Memberikan laporan pemasaran secara berkala kepada PIHAK KEDUA

KEWAJIBAN PIHAK KEDUA
- Menyediakan data dan dokumen legalitas properti yang benar dan sah
- Memberikan akses yang diperlukan untuk kepentingan pemasaran
- Membayar fee sesuai ketentuan perjanjian ini

PASAL 6
PENYELESAIAN SENGKETA
Apabila terjadi perselisihan, para Pihak sepakat menyelesaikannya terlebih dahulu secara musyawarah untuk mufakat.
Apabila tidak tercapai, diselesaikan melalui jalur hukum di wilayah hukum setempat.

PASAL 7
LAIN-LAIN
- Perjanjian ini mulai berlaku sejak ditandatangani oleh Para Pihak
- Perubahan atau penambahan hanya sah apabila dibuat secara tertulis dan disepakati oleh Para Pihak
- Perjanjian ini dibuat dalam 2 (dua) rangkap, masing-masing mempunyai kekuatan hukum yang sama

${today.split(', ')[1]}, ${today.split(', ')[0]}

Yang Memberikan Persetujuan                    Agent Pemasaran
/ Pemilik                                      Salam Bumi Property

( ${data.owner_name.toUpperCase()} )           ( ARDY SALAM )


Catatan:
- Tanda tangan ini sah secara hukum
- Pembayaran fee dilakukan setelah AJB ditandatangani
- 50% dari booking fee akan diberikan ke agen jika pembatalan bukan caused by agent
`;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const data = agreementData || await loadAgreementData();
      
      if (!data) {
        toast({
          title: "Error",
          description: "Gagal memuat data perjanjian",
          variant: "destructive",
        });
        return;
      }

      const agreementText = generateAgreementText(data);

      // Create a blob and download
      const blob = new Blob([agreementText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Perjanjian_Jasa_Pemasaran_${data.owner_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "Perjanjian berhasil di-download",
      });

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating agreement:', error);
      toast({
        title: "Error",
        description: "Gagal generate perjanjian",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const data = agreementData || await loadAgreementData();
      
      if (!data) {
        toast({
          title: "Error",
          description: "Gagal memuat data perjanjian",
          variant: "destructive",
        });
        return;
      }

      const agreementText = generateAgreementText(data);

      // Open print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Perjanjian Jasa Pemasaran - Salam Bumi Property</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  white-space: pre-wrap;
                  font-size: 12px;
                  line-height: 1.5;
                }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>${agreementText}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }

      toast({
        title: "Berhasil",
        description: "Membuka jendela print",
      });
    } catch (error) {
      console.error('Error printing agreement:', error);
      toast({
        title: "Error",
        description: "Gagal membuka print",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Perjanjian
        </CardTitle>
        <CardDescription>
          Download atau print perjanjian marketing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Perjanjian Jasa Pemasaran</h4>
          <p className="text-sm text-blue-700">
            Generate perjanjian dalam format teks yang bisa di-print atau di-download sebagai dokumen.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
          
          <Button 
            onClick={handlePrint} 
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          * Perjanjian akan digenerate berdasarkan data yang sudah diisi
        </p>
      </CardContent>
    </Card>
  );
}

export default AgreementPDFGenerator;
