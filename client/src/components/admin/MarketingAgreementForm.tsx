// Marketing Agreement Form Component
// Form for capturing marketing agreement options for property submissions

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  FileSignature, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Shield
} from "lucide-react";

interface MarketingAgreementFormProps {
  propertyId?: string;
  ownerIdentityId?: string;
  agreementId?: string;
  onSuccess?: (agreementId: string) => void;
  isReadOnly?: boolean;
}

// Agreement type options
const AGREEMENT_TYPES = [
  {
    value: "open_listing",
    label: "Open Listing - Pemasaran Bebas",
    description: "Fee 3% dari Harga Deal Penjual (Setelah AJB)",
    icon: "📋",
    details: "Owner/Pemilik Property bebas memasarkan propertinya via agent lain. siapapun agent yang berhasil membawa calon pembeli sampai terjual/terjadinya akad AJB, maka agent tersebut yang berhak menerima fee/komisi."
  },
  {
    value: "exclusive_booster",
    label: "Exclusive Booster - Pemasaran Exclusive",
    description: "Kontrak 6 Bulan - Fee 3%+Biaya Pemasaran",
    icon: "🚀",
    details: "Khusus Untuk Owner Properti Yang ingin Peluang terjual lebih cepat, dengan reach/jangkauan calon pembeli potensial lebih luas, traffic/calon pembeli lebih banyak, peluang closing/terjual lebih tinggi."
  }
];

// Exclusive booster marketing options
const MARKETING_OPTIONS = [
  {
    id: "meta_ads",
    label: "Meta Ads (IG & FB)",
    description: "Tayang Exclusive dengan penargetan terperinci sesuai usia, buying power, lokasi, demografi, minat, perilaku, dll.",
    icon: "📘",
    adminFee: 1500000,
    dailyBudget: 50000
  },
  {
    id: "tiktok_ads",
    label: "TikTok Ads",
    description: "Tayang Exclusive dengan penargetan terperinci sesuai usia, buying power, lokasi, demografi, minat, perilaku, dll.",
    icon: "🎵",
    adminFee: 1000000,
    dailyBudget: 50000
  }
];

export function MarketingAgreementForm({ 
  propertyId, 
  ownerIdentityId, 
  agreementId, 
  onSuccess,
  isReadOnly = false 
}: MarketingAgreementFormProps) {
  const [formData, setFormData] = useState({
    agreement_type: "open_listing",
    
    // Open Listing
    open_listing_fee_percent: 3,
    open_listing_fee_timing: "setelah AJB",
    
    // Exclusive Booster
    exclusive_booster_duration_months: 6,
    exclusive_booster_fee_percent: 3,
    exclusive_booster_marketing_fee: 0,
    
    // Marketing Options
    meta_ads_enabled: false,
    meta_ads_admin_fee: 1500000,
    meta_ads_budget_daily: 50000,
    tiktok_ads_enabled: false,
    tiktok_ads_admin_fee: 1000000,
    tiktok_ads_budget_daily: 50000,
    
    // Agreement Status
    agreement_status: "draft",
    terms_accepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!agreementId);
  const { toast } = useToast();

  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAgreementTypeChange = useCallback((value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      agreement_type: value,
      // Reset marketing options when switching to open listing
      meta_ads_enabled: value === "exclusive_booster" ? prev.meta_ads_enabled : false,
      tiktok_ads_enabled: value === "exclusive_booster" ? prev.tiktok_ads_enabled : false,
    }));
  }, []);

  const handleMarketingOptionChange = useCallback((optionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [`${optionId}_enabled`]: checked
    }));
  }, []);

  const calculateTotalCost = useCallback(() => {
    let total = 0;
    const months = formData.exclusive_booster_duration_months;
    const daysPerMonth = 30;
    
    if (formData.agreement_type === "exclusive_booster") {
      // Calculate Meta Ads total
      if (formData.meta_ads_enabled) {
        // Admin fee dibayar sekali di awal
        const adminFeeTotal = formData.meta_ads_admin_fee;
        // Budget iklan per bulan × bulan
        const adsCostTotal = formData.meta_ads_budget_daily * daysPerMonth * months;
        total += adminFeeTotal + adsCostTotal;
      }
      // Calculate TikTok Ads total
      if (formData.tiktok_ads_enabled) {
        // Admin fee dibayar sekali di awal
        const adminFeeTotal = formData.tiktok_ads_admin_fee;
        // Budget iklan per bulan × bulan
        const adsCostTotal = formData.tiktok_ads_budget_daily * daysPerMonth * months;
        total += adminFeeTotal + adsCostTotal;
      }
    }
    
    return total;
  }, [formData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Terms validation moved to ProductionPropertyForm agreement preview

    setIsSubmitting(true);
    try {
      let newAgreementId = agreementId;

      const payload = {
        property_id: propertyId || null,
        owner_identity_id: ownerIdentityId || null,
        agreement_type: formData.agreement_type,
        
        // Open Listing
        open_listing_fee_percent: formData.open_listing_fee_percent,
        open_listing_fee_timing: formData.open_listing_fee_timing,
        
        // Exclusive Booster
        exclusive_booster_duration_months: formData.exclusive_booster_duration_months,
        exclusive_booster_fee_percent: formData.exclusive_booster_fee_percent,
        exclusive_booster_marketing_fee: formData.exclusive_booster_marketing_fee,
        
        // Marketing Options
        meta_ads_enabled: formData.meta_ads_enabled,
        meta_ads_admin_fee: formData.meta_ads_enabled ? formData.meta_ads_admin_fee : null,
        meta_ads_budget_daily: formData.meta_ads_enabled ? formData.meta_ads_budget_daily : null,
        tiktok_ads_enabled: formData.tiktok_ads_enabled,
        tiktok_ads_admin_fee: formData.tiktok_ads_enabled ? formData.tiktok_ads_admin_fee : null,
        tiktok_ads_budget_daily: formData.tiktok_ads_enabled ? formData.tiktok_ads_budget_daily : null,
        
        // Status
        agreement_status: formData.agreement_status,
        terms_accepted: formData.terms_accepted,
        terms_accepted_at: formData.terms_accepted ? new Date().toISOString() : null,
      };

      if (agreementId) {
        // Update existing
        const { error } = await supabase
          .from('marketing_agreements')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', agreementId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('marketing_agreements')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        newAgreementId = data?.id;
      }

      toast({
        title: "Berhasil",
        description: "Perjanjian marketing berhasil disimpan",
      });

      if (onSuccess && newAgreementId) {
        onSuccess(newAgreementId);
      }
    } catch (error: any) {
      console.error('Error saving marketing agreement:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan perjanjian marketing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = calculateTotalCost();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Perjanjian Marketing
        </CardTitle>
        <CardDescription>
          Pilih jenis perjanjian marketing yang diinginkan
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agreement Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Jenis Perjanjian <span className="text-red-500">*</span>
            </Label>
            
            <RadioGroup
              value={formData.agreement_type}
              onValueChange={handleAgreementTypeChange}
              disabled={isReadOnly}
              className="space-y-3"
            >
              {AGREEMENT_TYPES.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={`
                      flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
                      transition-all hover:shadow-md
                      ${formData.agreement_type === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                    {formData.agreement_type === option.value && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Open Listing Details */}
          {formData.agreement_type === "open_listing" && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Open Listing - Pemasaran Bebas</h4>
                  <p className="text-sm text-blue-700 mt-2">
                    Dengan Open Listing, properti Anda akan kami pasarkan secara gratis. <br/>
                    <strong>Fee 3%</strong> dari harga deal akan dibayarkan setelah 
                    Akta Jual Beli (AJB) ditandatangani.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>Catatan:</strong> Owner/Pemilik Property bebas memasarkan propertinya via agent lain. 
                    Siapa pun agent yang berhasil membawa calon pembeli sampai terjual/terjadinya akad AJB, 
                    maka agent tersebut yang berhak menerima fee/komisi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Exclusive Booster Details */}
          {formData.agreement_type === "exclusive_booster" && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900">Exclusive Booster - Pemasaran Exclusive</h4>
                    <p className="text-sm text-purple-700 mt-2">
                      Khusus Untuk Owner Properti Yang ingin <strong>Peluang terjual lebih cepat</strong>, 
                      dengan reach/jangkauan calon pembeli potensial lebih luas, traffic/calon pembeli lebih banyak, 
                      peluang closing/terjual lebih tinggi.
                    </p>
                    <p className="text-sm text-purple-700 mt-2">
                      <strong>Tayang Exclusive</strong> dengan penargetan terperinci sesuai usia, buying power, 
                      lokasi, demografi, minat, perilaku, dll.
                    </p>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Durasi Kontrak <span className="text-red-500">*</span>
                </Label>
                <select
                  id="duration"
                  value={formData.exclusive_booster_duration_months}
                  onChange={(e) => handleChange("exclusive_booster_duration_months", parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={6}>6 Bulan</option>
                  <option value={3}>3 Bulan</option>
                  <option value={12}>12 Bulan</option>
                </select>
              </div>

              {/* Fee */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Biaya</h4>
                    <ul className="text-sm text-yellow-700 space-y-1 mt-2">
                      <li>• Fee transaksi: {formData.exclusive_booster_fee_percent}% (setelah AJB)</li>
                      <li>• Biaya pemasaran: Sesuai opsi yang dipilih</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Marketing Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Opsi Pemasaran (Pilih salah satu atau keduanya)
                </Label>
                
                <div className="space-y-3">
                  {MARKETING_OPTIONS.map((option) => (
                    <div key={option.id}>
                      <div className={`
                        flex items-start gap-3 p-4 rounded-lg border-2
                        ${(formData as any)[`${option.id}_enabled`] 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200'
                        }
                      `}>
                        <Checkbox
                          id={option.id}
                          checked={(formData as any)[`${option.id}_enabled`] as boolean}
                          onCheckedChange={(checked) => handleMarketingOptionChange(option.id, checked as boolean)}
                          disabled={isReadOnly}
                        />
                        <div className="flex-1">
                          <Label htmlFor={option.id} className="font-semibold cursor-pointer">
                            {option.icon} {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>

                      {/* Marketing Option Details */}
                      {(formData as any)[`${option.id}_enabled`] && (
                        <div className="ml-8 mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs">Admin Fee (Dibayar Sekali di Awal)</Label>
                              <div className="h-8 px-3 py-2 rounded-md border border-gray-200 bg-gray-100 text-sm font-medium text-gray-700 flex items-center">
                                {option.id === 'meta_ads' ? 'Rp 1.500.000' : 'Rp 1.000.000'}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Budget Ads Harian</Label>
                              <Input
                                type="number"
                                value={(formData as any)[`${option.id}_budget_daily`] as number}
                                onChange={(e) => handleChange(`${option.id}_budget_daily`, parseInt(e.target.value))}
                                disabled={isReadOnly}
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Cost Summary */}
              {totalCost > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">Total Biaya Pemasaran:</span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {formData.exclusive_booster_duration_months} bulan × Budget Ads + Admin Fee (sekali)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Terms and Conditions - Dipindahkan ke Preview Perjanjian di ProductionPropertyForm */}

          {/* Submit Button */}
          {!isReadOnly && (
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Simpan Perjanjian
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
