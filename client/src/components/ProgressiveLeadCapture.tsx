import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Building, Briefcase, MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface ProgressiveLeadCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: 'scroll' | 'load_more' | 'time' | 'manual';
}

const intentOptions = [
  {
    value: 'buyer',
    label: 'Saya adalah Calon Pembeli',
    icon: Home,
    description: 'Mencari properti untuk dibeli'
  },
  {
    value: 'owner',
    label: 'Saya adalah Owner/Pemilik Properti',
    icon: Building,
    description: 'Ingin menjual atau menyewakan properti'
  },
  {
    value: 'agent',
    label: 'Saya adalah Broker/Agent Properti',
    icon: Briefcase,
    description: 'Mencari peluang kerjasama'
  },
  {
    value: 'consultation',
    label: 'Saya ingin Konsultasi',
    icon: MessageCircle,
    description: 'Butuh saran tentang properti'
  }
];

export function ProgressiveLeadCapture({ isOpen, onClose, triggerSource = 'manual' }: ProgressiveLeadCaptureProps) {
  const [step, setStep] = useState<'intent' | 'contact' | 'success'>('intent');
  const [userIntent, setUserIntent] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Track user behavior for analytics
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 Lead capture opened', {
        triggerSource,
        sessionId,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      });
    }
  }, [isOpen, triggerSource, sessionId]);

  const formatWhatsApp = (value: string) => {
    // Remove all non-numeric characters
    const numeric = value.replace(/\D/g, '');

    // Handle Indonesian phone number formatting
    if (numeric.startsWith('62')) {
      // Already has country code
      return numeric;
    } else if (numeric.startsWith('0')) {
      // Convert 08xx to 628xx
      return '62' + numeric.substring(1);
    } else if (numeric.length > 0) {
      // Assume it's without country code, add 62
      return '62' + numeric;
    }

    return numeric;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setWhatsapp(formatted);
  };

  const validateWhatsApp = (number: string) => {
    // Indonesian mobile number validation (62xxxxxxxxx)
    const regex = /^62[8-9][0-9]{7,11}$/;
    return regex.test(number);
  };

  const handleIntentSelect = (intent: string) => {
    setUserIntent(intent);
    setStep('contact');
  };

  const handleBackToIntent = () => {
    setStep('intent');
    setWhatsapp('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateWhatsApp(whatsapp)) {
      toast({
        title: 'Nomor WhatsApp tidak valid',
        description: 'Masukkan nomor WhatsApp yang valid (contoh: 081234567890)',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const leadData = {
        user_intent: userIntent,
        whatsapp: whatsapp,
        ip_address: '', // Will be filled by server
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        referrer: document.referrer || 'direct',
        session_id: sessionId
      };

      console.log('📤 Submitting lead:', {
        intent: userIntent,
        whatsapp: whatsapp.substring(0, 3) + '***' + whatsapp.substring(whatsapp.length - 3),
        sessionId
      });

      const response = await apiRequest('POST', '/api/leads', leadData);

      console.log('✅ Lead submitted successfully:', response);

      setStep('success');

      toast({
        title: 'Terima kasih!',
        description: 'Informasi Anda telah kami terima. Tim kami akan segera menghubungi Anda.',
      });

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        // Reset form
        setStep('intent');
        setUserIntent('');
        setWhatsapp('');
      }, 3000);

    } catch (error) {
      console.error('❌ Lead submission failed:', error);

      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal mengirim data. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    console.log('👋 User skipped lead capture', { sessionId, step });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-lg blur-xl" />
        <div className="relative bg-white/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl">
          <DialogHeader className="pb-2">
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                {step === 'intent' && <MessageCircle className="h-8 w-8 text-white" />}
                {step === 'contact' && <Phone className="h-8 w-8 text-white" />}
                {step === 'success' && <CheckCircle className="h-8 w-8 text-white" />}
              </div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {step === 'intent' && 'Siapakah Anda?'}
                {step === 'contact' && 'Informasi Kontak'}
                {step === 'success' && 'Terima Kasih!'}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                {step === 'intent' && 'Pilih kategori yang paling sesuai dengan kebutuhan Anda'}
                {step === 'contact' && 'Kami akan segera menghubungi Anda'}
                {step === 'success' && 'Informasi Anda telah kami terima'}
              </p>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {step === 'intent' && (
              <>
                <div className="space-y-4">
                  {intentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 ${
                          userIntent === option.value
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleIntentSelect(option.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-full ${
                              userIntent === option.value
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <Label className="font-semibold text-gray-800 cursor-pointer text-base">
                                {option.label}
                              </Label>
                              <p className="text-sm text-gray-600 mt-1">
                                {option.description}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              userIntent === option.value
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {userIntent === option.value && (
                                <div className="w-3 h-3 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Lain kali saja
                  </Button>
                  <Button
                    onClick={() => userIntent && handleIntentSelect(userIntent)}
                    disabled={!userIntent}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    Lanjutkan
                  </Button>
                </div>
              </>
            )}

            {step === 'contact' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-3">
                    {React.createElement(intentOptions.find(opt => opt.value === userIntent)?.icon || MessageCircle, {
                      className: "h-7 w-7 text-blue-600"
                    })}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {intentOptions.find(opt => opt.value === userIntent)?.label}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">
                    No. WhatsApp Aktif
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="081234567890"
                      value={whatsapp}
                      onChange={handleWhatsAppChange}
                      className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Contoh: 081234567890 atau 6281234567890
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToIntent}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← Kembali
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !whatsapp}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengirim...</span>
                      </div>
                    ) : (
                      'Kirim Pesan'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Informasi Diterima! 🎉</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Terima kasih telah menghubungi <span className="font-semibold text-blue-600">Salam Bumi Property</span>.
                    Tim kami akan segera menghubungi Anda melalui WhatsApp untuk memberikan informasi yang Anda butuhkan.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs text-gray-500">
                    Jendela ini akan tertutup secara otomatis dalam beberapa detik...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}