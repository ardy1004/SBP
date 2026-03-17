import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminSidebar } from "@/components/admin/layouts";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Integration } from "@shared/types";

export default function AdminIntegrationsPage() {
  const { toast } = useToast();

  const { data: integrations } = useQuery<Integration>({
    queryKey: ['/api/admin/integrations'],
  });

  const [formData, setFormData] = useState({
    googleAnalyticsId: integrations?.googleAnalyticsId || "",
    googleTag: integrations?.googleTag || "",
    facebookPixel: integrations?.facebookPixel || "",
    tiktokPixel: integrations?.tiktokPixel || "",
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', '/api/admin/integrations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations'] });
      toast({ title: "Integrasi berhasil disimpan" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Third-Party Integrations</h1>
            <p className="text-muted-foreground">
              Kelola integrasi dengan platform pihak ketiga
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
                <CardDescription>
                  Tracking ID untuk Google Analytics (contoh: G-XXXXXXXXXX)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    placeholder="G-XXXXXXXXXX"
                    value={formData.googleAnalyticsId}
                    onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                    data-testid="input-google-analytics"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Google Tag Manager</CardTitle>
                <CardDescription>
                  ID untuk Google Tag Manager (contoh: GTM-XXXXXXX)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="googleTag">Google Tag ID</Label>
                  <Input
                    id="googleTag"
                    placeholder="GTM-XXXXXXX"
                    value={formData.googleTag}
                    onChange={(e) => setFormData({ ...formData, googleTag: e.target.value })}
                    data-testid="input-google-tag"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facebook Pixel</CardTitle>
                <CardDescription>
                  ID untuk Facebook Pixel tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixel"
                    placeholder="XXXXXXXXXXXXXXX"
                    value={formData.facebookPixel}
                    onChange={(e) => setFormData({ ...formData, facebookPixel: e.target.value })}
                    data-testid="input-facebook-pixel"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>TikTok Pixel</CardTitle>
                <CardDescription>
                  ID untuk TikTok Pixel tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="tiktokPixel">TikTok Pixel ID</Label>
                  <Input
                    id="tiktokPixel"
                    placeholder="XXXXXXXXXXXXXXX"
                    value={formData.tiktokPixel}
                    onChange={(e) => setFormData({ ...formData, tiktokPixel: e.target.value })}
                    data-testid="input-tiktok-pixel"
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={updateMutation.isPending} data-testid="button-save-integrations">
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Integrasi"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
