"use client"

import { companyInfo } from "@/lib/data"
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, MessageCircle } from "@/components/icons"
import { ContactForm } from "@/components/contact-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent("Halo, saya ingin bertanya tentang properti")
    const whatsappUrl = `https://wa.me/${companyInfo.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Kami siap membantu Anda menemukan properti impian. Jangan ragu untuk menghubungi kami
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Informasi Kontak</h3>

                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Alamat</p>
                        <p className="text-sm text-muted-foreground">{companyInfo.address}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Telepon</p>
                        <a
                          href={`tel:${companyInfo.phone}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {companyInfo.phone}
                        </a>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">WhatsApp</p>
                        <p className="text-sm text-muted-foreground">{companyInfo.whatsapp}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Email</p>
                        <a
                          href={`mailto:${companyInfo.email}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {companyInfo.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <Button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Hubungi via WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Media Sosial</h3>
                <div className="space-y-3">
                  {companyInfo.socialMedia.facebook && (
                    <a
                      href={companyInfo.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {companyInfo.socialMedia.instagram && (
                    <a
                      href={companyInfo.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {companyInfo.socialMedia.twitter && (
                    <a
                      href={companyInfo.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                      <span>Twitter</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Jam Operasional</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Senin - Jumat</span>
                    <span className="font-medium">08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sabtu</span>
                    <span className="font-medium">08:00 - 15:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minggu</span>
                    <span className="font-medium">Tutup</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Lokasi Kami</h2>
          <div className="w-full h-[400px] bg-muted rounded-xl flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">{companyInfo.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
