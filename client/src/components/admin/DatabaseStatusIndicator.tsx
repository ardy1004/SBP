import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { getAllArticles } from '@/services/admin/articleService';

interface DatabaseStatus {
  connected: boolean;
  articlesCount: number;
  policiesWorking: boolean;
  lastChecked: string;
}

export function DatabaseStatusIndicator() {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    articlesCount: 0,
    policiesWorking: false,
    lastChecked: 'Never'
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseStatus = async () => {
    setIsChecking(true);
    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('articles')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Database connection test failed:', testError);
        setStatus(prev => ({
          ...prev,
          connected: false,
          policiesWorking: false,
          lastChecked: new Date().toLocaleTimeString()
        }));
        return;
      }

      // Test admin service (which uses service role)
      const result = await getAllArticles({ limit: 1000 });

      setStatus({
        connected: true,
        articlesCount: result.data.length,
        policiesWorking: true,
        lastChecked: new Date().toLocaleTimeString()
      });

    } catch (error) {
      console.error('Database status check failed:', error);
      setStatus(prev => ({
        ...prev,
        connected: false,
        policiesWorking: false,
        lastChecked: new Date().toLocaleTimeString()
      }));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
    // Check every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`border-2 ${status.connected && status.policiesWorking ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg ${status.connected && status.policiesWorking ? 'text-green-800' : 'text-red-800'}`}>
          {status.connected && status.policiesWorking ? '✅ Database Ready' : '❌ Database Issues'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge variant={status.connected ? 'default' : 'destructive'}>
            {status.connected ? 'Connected' : 'Failed'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">RLS Policies:</span>
          <Badge variant={status.policiesWorking ? 'default' : 'destructive'}>
            {status.policiesWorking ? 'Working' : 'Failed'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Articles Count:</span>
          <Badge variant="outline">
            {status.articlesCount}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Checked:</span>
          <span className="text-xs text-muted-foreground">
            {status.lastChecked}
          </span>
        </div>

        <button
          onClick={checkDatabaseStatus}
          disabled={isChecking}
          className="w-full text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 px-3 py-2 rounded transition-colors"
        >
          {isChecking ? 'Checking...' : 'Refresh Status'}
        </button>

        {status.connected && status.policiesWorking && (
          <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
            ✅ All systems operational. You can now create, edit, and manage blog articles.
          </div>
        )}

        {(!status.connected || !status.policiesWorking) && (
          <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
            ❌ Database issues detected. Check console for details or contact support.
          </div>
        )}
      </CardContent>
    </Card>
  );
}