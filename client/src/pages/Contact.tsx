import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-lg md:text-xl font-body">Kami Siap Membantu Anda</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 flex-1">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Informasi Kontak</h2>
            <p className="text-lg text-muted-foreground mb-8 font-body">
              Hubungi kami untuk konsultasi properti atau informasi lebih lanjut. Tim kami siap membantu Anda 24/7.
            </p>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Alamat Kantor</h3>
                      <p className="text-muted-foreground font-body">
                        Virtual Office
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Telepon</h3>
                      <p className="text-muted-foreground font-body">
                        +62 813 9127 8889 (WhatsApp)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Email</h3>
                      <p className="text-muted-foreground font-body">
                        info@salambumi.xyz
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Kirim Pesan</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Nama Lengkap *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan alamat email Anda"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Nomor Telepon
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Masukkan nomor telepon Anda"
                      value={formData.phone}
                      onChange={handleChange}
                      data-testid="input-contact-phone"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Pesan *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tuliskan pesan atau pertanyaan Anda"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                      data-testid="textarea-contact-message"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" data-testid="button-send-message">
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
