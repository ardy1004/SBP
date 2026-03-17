import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<any>;
  color: string;
  isLoading?: boolean;
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, color, isLoading }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="h-8 bg-muted animate-pulse rounded" />
          ) : (
            value
          )}
        </div>
        {change !== undefined && changeLabel && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : change < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            ) : (
              <Activity className="h-3 w-3 text-gray-500 mr-1" />
            )}
            <span className={change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : ""}>
              {Math.abs(change)}% {changeLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActivityItem {
  id: string;
  type: 'property_view' | 'inquiry' | 'property_created' | 'lead_conversion';
  message: string;
  timestamp: Date;
  user?: string;
}

export function RealTimeDashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time metrics query
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      console.log('Fetching real-time metrics...');

      // Get current metrics
      const [propertiesRes, viewsRes, inquiriesRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('analytics_events').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id', { count: 'exact', head: true })
      ]);

      // Get previous period metrics (last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const [propertiesPrev, viewsPrev, inquiriesPrev] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .gte('created_at', fourteenDaysAgo.toISOString())
          .lt('created_at', sevenDaysAgo.toISOString()),
        supabase.from('analytics_events').select('id', { count: 'exact', head: true })
          .gte('created_at', fourteenDaysAgo.toISOString())
          .lt('created_at', sevenDaysAgo.toISOString()),
        supabase.from('inquiries').select('id', { count: 'exact', head: true })
          .gte('created_at', fourteenDaysAgo.toISOString())
          .lt('created_at', sevenDaysAgo.toISOString())
      ]);

      const current = {
        properties: propertiesRes.count || 0,
        views: viewsRes.count || 0,
        inquiries: inquiriesRes.count || 0
      };

      const previous = {
        properties: propertiesPrev.count || 0,
        views: viewsPrev.count || 0,
        inquiries: inquiriesPrev.count || 0
      };

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      return {
        current,
        changes: {
          properties: calculateChange(current.properties, previous.properties),
          views: calculateChange(current.views, previous.views),
          inquiries: calculateChange(current.inquiries, previous.inquiries)
        }
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Recent activity query
  const { data: activities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      // Get recent activities from multiple tables
      const [recentProperties, recentInquiries, recentViews] = await Promise.all([
        supabase.from('properties')
          .select('id, judul_properti, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase.from('inquiries')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase.from('analytics_events')
          .select('id, event_type, created_at, property_id')
          .eq('event_type', 'property_view')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activityItems: ActivityItem[] = [];

      // Add property creations
      recentProperties.data?.forEach(prop => {
        activityItems.push({
          id: `prop-${prop.id}`,
          type: 'property_created',
          message: `Property "${prop.judul_properti || 'New Property'}" was created`,
          timestamp: new Date(prop.created_at)
        });
      });

      // Add inquiries
      recentInquiries.data?.forEach(inq => {
        activityItems.push({
          id: `inq-${inq.id}`,
          type: 'inquiry',
          message: `New inquiry from ${inq.name}`,
          timestamp: new Date(inq.created_at)
        });
      });

      // Add property views
      recentViews.data?.forEach(view => {
        activityItems.push({
          id: `view-${view.id}`,
          type: 'property_view',
          message: `Property viewed`,
          timestamp: new Date(view.created_at)
        });
      });

      // Sort by timestamp and take latest 10
      return activityItems
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Live visitor counter (simulated for demo)
  const [liveVisitors, setLiveVisitors] = useState(0);

  useEffect(() => {
    // Simulate live visitor count updates
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = Math.max(0, prev + change);
        return Math.min(50, newCount); // Cap at 50
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    refetchMetrics();
    setLastUpdate(new Date());
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'property_created': return CheckCircle;
      case 'inquiry': return MessageSquare;
      case 'property_view': return Eye;
      case 'lead_conversion': return TrendingUp;
      default: return Activity;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'property_created': return 'text-green-500';
      case 'inquiry': return 'text-blue-500';
      case 'property_view': return 'text-purple-500';
      case 'lead_conversion': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Dashboard</h2>
          <p className="text-muted-foreground">
            Live metrics and recent activity
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: {formatTimeAgo(lastUpdate)}
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Live Visitors"
          value={liveVisitors}
          icon={Users}
          color="text-green-600"
        />
        <MetricCard
          title="Total Properties"
          value={metrics?.current.properties || 0}
          change={metrics?.changes.properties}
          changeLabel="vs last week"
          icon={Activity}
          color="text-blue-600"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Total Views"
          value={metrics?.current.views || 0}
          change={metrics?.changes.views}
          changeLabel="vs last week"
          icon={Eye}
          color="text-purple-600"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="New Inquiries"
          value={metrics?.current.inquiries || 0}
          change={metrics?.changes.inquiries}
          changeLabel="vs last week"
          icon={MessageSquare}
          color="text-orange-600"
          isLoading={metricsLoading}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities?.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              );
            }) || (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Add New Property</h3>
            <p className="text-sm text-muted-foreground">Create a new property listing</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">View Inquiries</h3>
            <p className="text-sm text-muted-foreground">Check latest customer inquiries</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Analytics Report</h3>
            <p className="text-sm text-muted-foreground">View detailed analytics</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}