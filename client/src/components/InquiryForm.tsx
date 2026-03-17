import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Property } from "@shared/types";
import { trackQualifiedLead } from "@/lib/metaPixel";
import { WHATSAPP_CONFIG, COMPANY_CONFIG } from "@/lib/config";

interface InquiryFormProps {
  propertyId: string;
  property?: Property;
  onSubmit?: (data: { name: string; whatsapp: string; message: string }) => Promise<void>;
}

type UserType = 'buyer' | 'seller' | 'broker' | '';
type SellerHelpType = 'titip' | 'consultation' | '';
type BrokerPurposeType = 'cooperation' | 'consultation' | '';
type BudgetRange = 'under-1m' | '1m-2m' | '2m-3m' | '3m-4m' | '4m-5m' | '5m-6m' | '6m-7m' | '7m-8m' | '8m-9m' | '9m-10m' | 'above-10m' | '';
type PaymentPlan = 'cash' | 'soft-cash' | 'kpr' | '';
type PropertyType = 'apartment' | 'rumah' | 'tanah' | 'kost' | 'hotel' | 'homestay' | 'ruko' | 'komersial' | '';

export function InquiryForm({ propertyId, property }: InquiryFormProps) {
  const [userType, setUserType] = useState<UserType>('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '' as BudgetRange,
    paymentPlan: '' as PaymentPlan,
    sellerHelp: '' as SellerHelpType,
    propertyType: '' as PropertyType,
    brokerPurpose: '' as BrokerPurposeType,
    message: ''
  });

  const whatsappNumber = WHATSAPP_CONFIG.NUMBER_DISPLAY;

  // Update WhatsApp URL when form data changes
  useEffect(() => {
    const updateWhatsappUrl = async () => {
      try {
        if (userType && formData.name && formData.location) {
          const message = await generateWhatsAppMessage();
          setWhatsappUrl(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`);
        } else {
          setWhatsappUrl(`https://wa.me/${whatsappNumber.replace('+', '')}?text=Halo%20Monica%20Vera%20S!`);
        }
      } catch (error) {
        console.error('Error updating WhatsApp URL:', error);
        setWhatsappUrl(`https://wa.me/${whatsappNumber.replace('+', '')}?text=Halo%20Monica%20Vera%20S!`);
      }
    };

    updateWhatsappUrl();
  }, [userType, formData.name, formData.location, formData.budget, formData.paymentPlan, formData.sellerHelp, formData.propertyType, formData.brokerPurpose, formData.message, property]);

  const generateWhatsAppMessage = async () => {
    let propertyUrl = window.location.href;

    if (property) {
      try {
        const { generatePropertySlug } = await import('@/lib/utils');
        const slug = generatePropertySlug({
          status: property.status,
          jenis_properti: property.jenisProperti,
          provinsi: property.provinsi,
          kabupaten: property.kabupaten,
          judul_properti: property.judulProperti || undefined,
          kode_listing: property.kodeListing
        });
        propertyUrl = `${window.location.origin}/${slug}`;
      } catch (error) {
        console.error('Error generating property slug:', error);
        // Fallback to current URL
        propertyUrl = window.location.href;
      }
    }

    let message = `*Halo ${COMPANY_CONFIG.AGENT.NAME}!*\n\n`;

    if (property) {
      message += `Saya tertarik dengan properti:\n*${property.judulProperti || property.jenisProperti}*\n${propertyUrl}\n\n`;
    }

    switch (userType) {
      case 'buyer':
        message += `*Saya Adalah Calon Pembeli*\n\n`;
        message += `Nama: ${formData.name}\n`;
        message += `Asal Daerah: ${formData.location}\n`;
        message += `Estimasi Budget: ${getBudgetLabel(formData.budget)}\n`;
        message += `Rencana Pembayaran: ${getPaymentLabel(formData.paymentPlan)}\n`;
        if (formData.message) message += `Pesan: ${formData.message}\n`;
        break;

      case 'seller':
        message += `*Saya Adalah Penjual / Pemilik Properti*\n\n`;
        message += `Nama: ${formData.name}\n`;
        message += `Asal Daerah: ${formData.location}\n`;
        if (formData.sellerHelp === 'titip') {
          message += `Saya Ingin Titip Jual Properti\n`;
          message += `Jenis Properti: ${getPropertyTypeLabel(formData.propertyType)}\n`;
          message += `Lokasi Properti: ${formData.location}\n`;
        } else if (formData.sellerHelp === 'consultation') {
          message += `Saya Mau Konsultasi\n`;
        }
        if (formData.message) message += `Pesan: ${formData.message}\n`;
        break;

      case 'broker':
        message += `*Saya Adalah Broker / Agent Properti*\n\n`;
        message += `Nama: ${formData.name}\n`;
        message += `Asal Daerah: ${formData.location}\n`;
        if (formData.brokerPurpose === 'cooperation') {
          message += `Apakah Bisa Bekerjasama?\n`;
        } else if (formData.brokerPurpose === 'consultation') {
          message += `Saya Mau Konsultasi\n`;
        }
        if (formData.message) message += `Pesan: ${formData.message}\n`;
        break;
    }

    message += `\nMohon informasi lebih lanjut.`;

    return encodeURIComponent(message);
  };

  const getBudgetLabel = (budget: BudgetRange) => {
    const labels: Record<Exclude<BudgetRange, ''>, string> = {
      'under-1m': 'Dibawah 1M',
      '1m-2m': '1M-2M',
      '2m-3m': '2M-3M',
      '3m-4m': '3M-4M',
      '4m-5m': '4M-5M',
      '5m-6m': '5M-6M',
      '6m-7m': '6M-7M',
      '7m-8m': '7M-8M',
      '8m-9m': '8M-9M',
      '9m-10m': '9M-10M',
      'above-10m': 'Diatas 10M'
    };
    return budget ? labels[budget] : '';
  };

  const getPaymentLabel = (payment: PaymentPlan) => {
    const labels: Record<Exclude<PaymentPlan, ''>, string> = {
      'cash': 'Hard Cash',
      'soft-cash': 'Soft Cash',
      'kpr': 'KPR/Pembiayaan Bank'
    };
    return payment ? labels[payment] : '';
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    const labels: Record<Exclude<PropertyType, ''>, string> = {
      'apartment': 'Apartment',
      'rumah': 'Rumah',
      'tanah': 'Tanah',
      'kost': 'Kost',
      'hotel': 'Hotel',
      'homestay': 'Homestay/Guesthouse',
      'ruko': 'Ruko',
      'komersial': 'Bangunan Komersial Lainnya'
    };
    return type ? labels[type] : '';
  };


  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-center">
          Kirim Pesan Ke Admin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Avatar/Icon */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white">
              <img
                src={COMPANY_CONFIG.AGENT.AVATAR}
                alt={COMPANY_CONFIG.AGENT.NAME}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to professional Asian businessman
                  e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";
                }}
              />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{COMPANY_CONFIG.AGENT.NAME}</h3>
            <p className="text-sm text-muted-foreground">Admin / Agent Properti</p>
          </div>
        </div>

        {/* User Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="user-type">Beritahu Kami Siapakah Anda?</Label>
          <Select value={userType} onValueChange={(value: UserType) => setUserType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis pengguna" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Saya Adalah Calon Pembeli</SelectItem>
              <SelectItem value="seller">Saya Adalah Penjual / Pemilik Properti</SelectItem>
              <SelectItem value="broker">Saya Adalah Broker / Agent Properti</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Fields based on User Type */}
        {userType && (
          <div className="space-y-4">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Asal Daerah</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Masukkan asal daerah Anda"
                required
              />
            </div>

            {/* Buyer Fields */}
            {userType === 'buyer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="budget">Estimasi Budget</Label>
                  <Select value={formData.budget} onValueChange={(value: BudgetRange) => setFormData(prev => ({ ...prev, budget: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih estimasi budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-1m">Dibawah 1M</SelectItem>
                      <SelectItem value="1m-2m">1M-2M</SelectItem>
                      <SelectItem value="2m-3m">2M-3M</SelectItem>
                      <SelectItem value="3m-4m">3M-4M</SelectItem>
                      <SelectItem value="4m-5m">4M-5M</SelectItem>
                      <SelectItem value="5m-6m">5M-6M</SelectItem>
                      <SelectItem value="6m-7m">6M-7M</SelectItem>
                      <SelectItem value="7m-8m">7M-8M</SelectItem>
                      <SelectItem value="8m-9m">8M-9M</SelectItem>
                      <SelectItem value="9m-10m">9M-10M</SelectItem>
                      <SelectItem value="above-10m">Diatas 10M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Rencana Pembayaran</Label>
                  <Select value={formData.paymentPlan} onValueChange={(value: PaymentPlan) => setFormData(prev => ({ ...prev, paymentPlan: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rencana pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Hard Cash</SelectItem>
                      <SelectItem value="soft-cash">Soft Cash</SelectItem>
                      <SelectItem value="kpr">KPR/Pembiayaan Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Seller Fields */}
            {userType === 'seller' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="seller-help">Apa yang bisa kami bantu?</Label>
                  <Select value={formData.sellerHelp} onValueChange={(value: SellerHelpType) => setFormData(prev => ({ ...prev, sellerHelp: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis bantuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="titip">Saya Ingin Titip Jual Properti</SelectItem>
                      <SelectItem value="consultation">Saya Mau Konsultasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.sellerHelp === 'titip' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="property-type">Jenis Properti</Label>
                      <Select value={formData.propertyType} onValueChange={(value: PropertyType) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis properti" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="rumah">Rumah</SelectItem>
                          <SelectItem value="tanah">Tanah</SelectItem>
                          <SelectItem value="kost">Kost</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="homestay">Homestay/Guesthouse</SelectItem>
                          <SelectItem value="ruko">Ruko</SelectItem>
                          <SelectItem value="komersial">Bangunan Komersial Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Broker Fields */}
            {userType === 'broker' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="broker-purpose">Apa Tujuan Anda?</Label>
                  <Select value={formData.brokerPurpose} onValueChange={(value: BrokerPurposeType) => setFormData(prev => ({ ...prev, brokerPurpose: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cooperation">Apakah Bisa Bekerjasama?</SelectItem>
                      <SelectItem value="consultation">Saya Mau Konsultasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">Pesan Tambahan (Opsional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tulis pesan tambahan jika ada..."
                rows={3}
              />
            </div>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => {
                // Track QualifiedLead when user clicks WhatsApp button
                const propertyValue = property?.hargaProperti ? Number(property.hargaProperti) : undefined;
                const contentName = property?.judulProperti || property?.jenisProperti;
                trackQualifiedLead({
                  value: propertyValue,
                  contentName: contentName,
                });
              }}
            >
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                disabled={!formData.name || !formData.location || (userType === 'buyer' && (!formData.budget || !formData.paymentPlan)) || (userType === 'seller' && !formData.sellerHelp) || (userType === 'broker' && !formData.brokerPurpose)}
                data-testid="button-whatsapp-contact"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Kirim via WhatsApp
              </Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
