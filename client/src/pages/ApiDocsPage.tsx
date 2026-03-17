import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/**
 * API Documentation Page
 * Interactive API documentation using Swagger UI
 */
const ApiDocsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Swagger UI
    const loadSwaggerUI = async () => {
      try {
        // Check if Swagger UI is already loaded
        if (!(window as any).SwaggerUIBundle) {
          // Load Swagger UI from CDN
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js';
          script.async = true;

          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css';

          document.head.appendChild(link);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize Swagger UI
        const ui = (window as any).SwaggerUIBundle({
          url: '/api/docs',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.presets.standalone
          ],
          plugins: [
            (window as any).SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: 'StandaloneLayout',
          validatorUrl: null,
          tryItOutEnabled: true
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Swagger UI:', err);
        setError('Failed to load API documentation');
        setIsLoading(false);
      }
    };

    loadSwaggerUI();
  }, []);

  const handleDownloadSpec = async () => {
    try {
      const response = await fetch('/api/docs');
      if (!response.ok) throw new Error('Failed to fetch API spec');

      const spec = await response.json();
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'salam-bumi-api-spec.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "API specification downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download API specification",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">API Documentation Error</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              API Documentation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete API reference for Salam Bumi Property platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadSpec} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Spec
            </Button>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* API Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Version</p>
                  <p className="text-2xl font-bold">1.0.0</p>
                </div>
                <Badge variant="secondary">Stable</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Base URL</p>
                  <p className="text-sm font-mono">https://salambumi.xyz</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Format</p>
                  <p className="text-lg font-bold">OpenAPI 3.0</p>
                </div>
                <Badge variant="outline">JSON</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="#/articles"
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div>
                  <p className="font-medium">Articles</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Blog management</p>
                </div>
              </a>

              <a
                href="#/AI"
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div>
                  <p className="font-medium">AI Services</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Content generation</p>
                </div>
              </a>

              <a
                href="#/Analytics"
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">GA4 data</p>
                </div>
              </a>

              <a
                href="#/Media"
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div>
                  <p className="font-medium">Media</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Image uploads</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Swagger UI Container */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 dark:text-gray-400">Loading API documentation...</p>
              </div>
            </div>
          ) : (
            <div id="swagger-ui" className="min-h-screen"></div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Salam Bumi Property API Documentation |
          Generated with{' '}
          <a
            href="https://swagger.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Swagger UI
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiDocsPage;