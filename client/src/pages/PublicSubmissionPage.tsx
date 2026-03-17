// Public Property Submission Page
// Accessible via sharelink for owners to submit their properties

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ProductionPropertyForm } from "@/components/admin/ProductionPropertyForm";
import { OwnerIdentityForm } from "@/components/admin/OwnerIdentityForm";
import { MarketingAgreementForm } from "@/components/admin/MarketingAgreementForm";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ShareLinkToken {
  id: string;
  token: string;
  property_id: string;
  owner_identity_id: string;
  status: string;
}

// Interface for owner data
interface OwnerData {
  nama_lengkap: string;
  no_ktp: string;
  alamat_ktp: string;
  whatsapp_1: string;
}

// Interface for agreement data
interface AgreementData {
  agreement_type: string;
  exclusive_booster_duration_months: number;
  meta_ads_enabled: boolean;
  tiktok_ads_enabled: boolean;
}

export default function PublicSubmissionPage() {
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<ShareLinkToken | null>(null);
  const [currentStep, setCurrentStep] = useState<"agreement" | "owner" | "property" | "complete">("agreement");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [agreementId, setAgreementId] = useState<string | null>(null);
  
  // Store owner and agreement data for the agreement preview
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null);

  // Extract token from URL
  const token = location.split("/submit/")[1]?.split("?")[0];

  console.log('[PublicSubmissionPage] Token extracted:', token);
  console.log('[PublicSubmissionPage] Full location:', location);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError("Link tidak valid");
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    console.log('[PublicSubmissionPage] validateToken called with token:', token);
    try {
      // Check if token exists and is valid
      const { data, error } = await supabase
        .from('sharelink_tokens')
        .select('*')
        .eq('token', token)
        .single();

      console.log('[PublicSubmissionPage] Query result:', { data, error });

      if (error || !data) {
        setError("Link tidak valid atau sudah expired");
        setLoading(false);
        return;
      }

      // Check if token is active
      if (data.status !== 'ACTIVE') {
        setError(`Link sudah tidak aktif (status: ${data.status})`);
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (new Date(data.expires_at) < new Date()) {
        setError("Link sudah expired");
        setLoading(false);
        return;
      }

      // Token is valid
      setTokenData(data);
      
      // Check if already submitted
      if (data.status === 'SUBMITTED') {
        setCurrentStep("complete");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error validating token:', err);
      setError("Terjadi kesalahan saat validasi link");
      setLoading(false);
    }
  };

  const handleOwnerSuccess = async (newOwnerId: string) => {
    setOwnerId(newOwnerId);
    
    // Load owner data for agreement preview
    try {
      const { data: ownerData, error: ownerError } = await supabase
        .from('owner_identities')
        .select('nama_lengkap, no_ktp, alamat_ktp, whatsapp_1')
        .eq('id', newOwnerId)
        .single();
      
      if (!ownerError && ownerData) {
        setOwnerData({
          nama_lengkap: ownerData.nama_lengkap || '',
          no_ktp: ownerData.no_ktp || '',
          alamat_ktp: ownerData.alamat_ktp || '',
          whatsapp_1: ownerData.whatsapp_1 || ''
        });
      }
    } catch (err) {
      console.error('Error loading owner data:', err);
    }
    
    // Update agreement with owner_identity_id
    if (agreementId) {
      await supabase
        .from('marketing_agreements')
        .update({ owner_identity_id: newOwnerId })
        .eq('id', agreementId);
    }
    
    // Go to property step
    setCurrentStep("property");
  };

  const handlePropertySuccess = async (newPropertyId: string, goToComplete: boolean = true) => {
    if (newPropertyId) {
      setPropertyId(newPropertyId);
      
      // Update agreement with property_id
      if (agreementId) {
        await supabase
          .from('marketing_agreements')
          .update({ property_id: newPropertyId })
          .eq('id', agreementId);
      }
      
      // Update token status to submitted
      if (tokenData && ownerId && agreementId) {
        await supabase
          .from('sharelink_tokens')
          .update({ 
            status: 'SUBMITTED',
            property_id: newPropertyId,
            owner_identity_id: ownerId,
            submitted_at: new Date().toISOString()
          })
          .eq('id', tokenData.id);
      }
      
      // Go to complete step if goToComplete is true (default for normal flow)
      // Stay on property form if goToComplete is false (for showing "Tambah Properti Lain" option)
      if (goToComplete) {
        setCurrentStep("complete");
      }
    }
  };

  const handleAgreementSuccess = async (newAgreementId: string) => {
    setAgreementId(newAgreementId);
    
    // Load agreement data for agreement preview
    try {
      const { data: agreementData, error: agreementError } = await supabase
        .from('marketing_agreements')
        .select('agreement_type, exclusive_booster_duration_months, meta_ads_enabled, tiktok_ads_enabled')
        .eq('id', newAgreementId)
        .single();
      
      if (!agreementError && agreementData) {
        setAgreementData({
          agreement_type: agreementData.agreement_type || 'open_listing',
          exclusive_booster_duration_months: agreementData.exclusive_booster_duration_months || 6,
          meta_ads_enabled: agreementData.meta_ads_enabled || false,
          tiktok_ads_enabled: agreementData.tiktok_ads_enabled || false
        });
      }
    } catch (err) {
      console.error('Error loading agreement data:', err);
    }
    
    // After agreement, go to owner data
    setCurrentStep("owner");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-semibold">Memuat...</h2>
              <p className="text-muted-foreground mt-2">Sedang memvalidasi link Anda</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-red-600">Link Tidak Valid</h2>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button 
                className="mt-4" 
                onClick={() => setLocation('/')}
              >
                Kembali ke Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-green-600">Pengajuan Berhasil!</h2>
              <p className="text-muted-foreground mt-2">
                Terima kasih telah mengajukan properti Anda. 
                Tim Salam Bumi Property akan segera menghubungi Anda.
              </p>
              <div className="mt-6 p-4 bg-green-50 rounded-lg w-full">
                <p className="text-sm text-green-700">
                  <strong>WhatsApp:</strong> 0813-9127-8889<br />
                  <strong>Email:</strong> salambumiproperty@gmail.com
                </p>
              </div>
              
              <Button 
                className="mt-4" 
                onClick={() => setLocation('/')}
              >
                Kembali ke Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ajukan Properti Anda</h1>
          <p className="text-gray-600 mt-2">Pilih jenis perjanjian marketing, lalu isi data properti Anda</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { key: "agreement", label: "Perjanjian" },
            { key: "owner", label: "Pemilik" },
            { key: "property", label: "Properti" }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${currentStep === step.key ? 'bg-primary text-white' : 
                  ['agreement', 'owner', 'property'].indexOf(currentStep) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {['agreement', 'owner', 'property'].indexOf(currentStep) > index ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep === step.key ? 'text-primary' : 'text-gray-500'}`}>
                {step.label}
              </span>
              {index < 2 && (
                <div className={`
                  w-8 h-0.5 mx-2
                  ${['agreement', 'owner', 'property'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Forms */}
        {/* Step 1: Marketing Agreement - First so owner understands options before filling data */}
        {currentStep === "agreement" && (
          <MarketingAgreementForm 
            onSuccess={handleAgreementSuccess}
          />
        )}

        {/* Step 2: Owner Identity */}
        {currentStep === "owner" && agreementId && (
          <Card>
            <CardHeader>
              <CardTitle>Identitas Pemilik</CardTitle>
              <CardDescription>Mohon lengkapi data diri Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <OwnerIdentityForm 
                onSuccess={handleOwnerSuccess}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Property Details */}
        {currentStep === "property" && ownerId && (
          <ProductionPropertyForm 
            property={null}
            sourceInput="OWNER"
            ownerData={ownerData}
            agreementData={agreementData}
            agreementId={agreementId}
            onSuccess={handlePropertySuccess}
          />
        )}
      </div>
    </div>
  );
}
