import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface InquiryFormProps {
  propertyId: string;
  onSubmit?: (data: { name: string; whatsapp: string; message: string }) => Promise<void>;
}

export function InquiryForm({ propertyId, onSubmit }: InquiryFormProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !whatsapp || !message) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ name, whatsapp, message });
      }
      toast({
        title: "Berhasil!",
        description: "Pesan Anda telah dikirim. Kami akan segera menghubungi Anda.",
      });
      setName("");
      setWhatsapp("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim pesan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Hubungi Kami
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nama lengkap Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-name"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+62 812 3456 7890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              data-testid="input-whatsapp"
            />
          </div>

          <div>
            <Label htmlFor="message">Pesan</Label>
            <Textarea
              id="message"
              placeholder="Saya tertarik dengan properti ini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="min-h-32 resize-none"
              data-testid="textarea-message"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-inquiry">
            {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
