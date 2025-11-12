"use client"

import Image from "next/image"
import { Phone, Mail, MessageCircle } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Property } from "@/lib/types"

interface ContactAgentCardProps {
  agent: Property["agent"]
  propertyTitle: string
}

export function ContactAgentCard({ agent, propertyTitle }: ContactAgentCardProps) {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Halo ${agent.name}, saya tertarik dengan properti: ${propertyTitle}`)
    const whatsappUrl = `https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handleCall = () => {
    window.location.href = `tel:${agent.phone}`
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Pertanyaan tentang: ${propertyTitle}`)
    window.location.href = `mailto:${agent.email}?subject=${subject}`
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Hubungi Agen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Agent Info */}
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <Image src={agent.photo || "/placeholder.svg"} alt={agent.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">Property Agent</p>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="space-y-2">
          <Button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button onClick={handleCall} variant="outline" className="w-full gap-2 bg-transparent">
            <Phone className="h-4 w-4" />
            {agent.phone}
          </Button>
          <Button onClick={handleEmail} variant="outline" className="w-full gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
