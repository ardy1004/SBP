// ShareLink Generator Component
// Generates secure share links for owner property submissions

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Link2, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Calendar,
  QrCode,
  Mail
} from "lucide-react";

interface ShareLinkGeneratorProps {
  propertyId?: string;
  ownerIdentityId?: string;
  onTokenCreated?: (token: string, shareUrl: string) => void;
}

interface ShareLinkToken {
  id: string;
  token: string;
  expires_at: string;
  status: string;
  access_count: number;
  created_at: string;
}

export function ShareLinkGenerator({ propertyId, ownerIdentityId, onTokenCreated }: ShareLinkGeneratorProps) {
  const [expiryDays, setExpiryDays] = useState("7");
  const [generatedLink, setGeneratedLink] = useState<ShareLinkToken | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingTokens, setExistingTokens] = useState<ShareLinkToken[]>([]);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const { toast } = useToast();

  // Load existing tokens for this property or owner identity
  useEffect(() => {
    if (propertyId || ownerIdentityId) {
      loadExistingTokens();
    }
  }, [propertyId, ownerIdentityId]);

  const loadExistingTokens = async () => {
    if (!propertyId && !ownerIdentityId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('sharelink_tokens')
        .select('*');
      
      // Query by property_id OR owner_identity_id
      if (propertyId && ownerIdentityId) {
        query = query.or(`property_id.eq.${propertyId},owner_identity_id.eq.${ownerIdentityId}`);
      } else if (propertyId) {
        query = query.eq('property_id', propertyId);
      } else if (ownerIdentityId) {
        query = query.eq('owner_identity_id', ownerIdentityId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setExistingTokens(data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = async () => {
    setIsGenerating(true);
    try {
      // Generate a secure random token
      const token = generateSecureToken();
      
      // Calculate expiry date
      const days = parseInt(expiryDays);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      // Create the token record
      const { data, error } = await supabase
        .from('sharelink_tokens')
        .insert({
          property_id: propertyId || null,
          owner_identity_id: ownerIdentityId || null,
          token: token,
          expires_at: expiresAt.toISOString(),
          status: 'ACTIVE',
          created_by: 'admin',
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedLink(data);
      
      toast({
        title: "Link Dibuat",
        description: `Sharelink berhasil dibuat dan berlaku selama ${days} hari`,
      });

      // Reload existing tokens
      loadExistingTokens();

      if (onTokenCreated && data) {
        const shareUrl = `${window.location.origin}/submit/${data.token}`;
        onTokenCreated(data.token, shareUrl);
      }
    } catch (error: any) {
      console.error('Error generating token:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal membuat sharelink",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSecureToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Disalin",
        description: "Link berhasil disalin ke clipboard",
      });
      setShowCopyDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyalin link",
        variant: "destructive",
      });
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('sharelink_tokens')
        .update({ status: 'REVOKED' })
        .eq('id', tokenId);

      if (error) throw error;

      toast({
        title: "Link Dicabut",
        description: "Sharelink berhasil dicabut",
      });

      loadExistingTokens();
    } catch (error: any) {
      console.error('Error revoking token:', error);
      toast({
        title: "Error",
        description: "Gagal mencabut sharelink",
        variant: "destructive",
      });
    }
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/submit/${token}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'SUBMITTED': return 'bg-blue-500';
      case 'EXPIRED': return 'bg-gray-500';
      case 'REVOKED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Generate ShareLink
        </CardTitle>
        <CardDescription>
          Buat link aman untuk pemilik properti agar dapat mengajukan properti mereka sendiri
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Generate New Link Section */}
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="expiry">Berlaku Selama</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hari</SelectItem>
                  <SelectItem value="3">3 Hari</SelectItem>
                  <SelectItem value="7">7 Hari</SelectItem>
                  <SelectItem value="14">14 Hari</SelectItem>
                  <SelectItem value="30">30 Hari</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={generateToken} 
              disabled={isGenerating}
              className="mb-0.5"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Generate Link
                </>
              )}
            </Button>
          </div>

          {/* Generated Link Display */}
          {generatedLink && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">ShareLink Berhasil Dibuat!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Kirim link ini kepada pemilik properti untuk mengajukan properti mereka.
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      value={getShareUrl(generatedLink.token)}
                      readOnly
                      className="bg-white"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(getShareUrl(generatedLink.token))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowQrDialog(true)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-green-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Berlaku hingga: {formatDate(generatedLink.expires_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing Links */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Riwayat ShareLink</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : existingTokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada sharelink yang dibuat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {existingTokens.map((token) => (
                <div 
                  key={token.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {token.token.substring(0, 12)}...
                        </code>
                        <Badge className={getStatusColor(token.status)}>
                          {token.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(token.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isExpired(token.expires_at) ? 'Expired' : `Expires: ${formatDate(token.expires_at)}`}
                        </span>
                        <span>Dibuka: {token.access_count}x</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {token.status === 'ACTIVE' && !isExpired(token.expires_at) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(getShareUrl(token.token))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeToken(token.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cabut
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Code Dialog */}
        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ShareLink QR Code</DialogTitle>
              <DialogDescription>
                Pindai QR code ini untuk membuka form pengajuan properti
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              {generatedLink && (
                <div className="bg-white p-4 rounded-lg">
                  {/* QR Code placeholder - in production, use a QR code library */}
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    QR Code untuk: {getShareUrl(generatedLink.token).substring(0, 30)}...
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQrDialog(false)}>
                Tutup
              </Button>
              {generatedLink && (
                <Button onClick={() => copyToClipboard(getShareUrl(generatedLink.token))}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
