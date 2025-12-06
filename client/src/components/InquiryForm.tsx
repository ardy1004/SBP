import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@shared/types";

interface InquiryFormProps {
  propertyId: string;
  property?: Property;
  onSubmit?: (data: { name: string; whatsapp: string; message: string }) => Promise<void>;
}

export function InquiryForm({ propertyId, property }: InquiryFormProps) {
  // Create WhatsApp link with greeting message and current page URL
  const whatsappNumber = "+6281391278889";

  // Use current page URL for Open Graph preview
  const currentUrl = window.location.href;

  const message = `Halo, saya tertarik dengan properti yang saya lihat di website Salam Bumi Property. Bisakah saya mendapatkan informasi lebih detail?\n\n${currentUrl}`;

  const greetingMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${greetingMessage}`;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Hubungi Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {/* Agent Avatar/Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white">
              <img
                src="https://images.salambumi.xyz/monic%20sbp.webp"
                alt="Property Agent"
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
        </div>

        {/* Agent Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Monica Vera S</h3>
          <p className="text-sm text-muted-foreground">
            Siap membantu Anda menemukan properti impian
          </p>
        </div>

        {/* WhatsApp Button */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
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
              WhatsApp +6281391278889
            </Button>
          </a>

          <p className="text-xs text-muted-foreground">
            Klik untuk langsung chat dengan agent kami
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
