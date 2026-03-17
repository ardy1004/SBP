import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, TrendingUp, Users, Eye, Clock, MousePointer } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AnalyticsData {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  metrics: {
    totalUsers: number;
    sessions: number;
    pageViews: number;
    bounceRate: string;
    avgSessionDuration: string;
  };
  charts: {
    pageViews: Array<{ date: string; views: number }>;
    topPages: Array<{ page: string; views: number }>;
    trafficSources: Array<{ name: string; value: number }>;
    demographics?: {
      age: Array<{ age: string; users: number }>;
      gender: Array<{ gender: string; users: number }>;
    };
    geography?: {
      countries: Array<{ country: string; users: number }>;
      cities: Array<{ city: string; users: number }>;
    };
  };
  lastUpdated: string;
  error?: string;
}

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const { data: analytics, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', selectedPeriod],
    queryFn: () => apiRequest('GET', `/api/analytics?days=${selectedPeriod}`),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const handleRefresh = () => {
    refetch();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: string) => {
    const num = parseFloat(seconds);
    const minutes = Math.floor(num / 60);
    const remainingSeconds = Math.floor(num % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load analytics data</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Website performance metrics from Google Analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.metrics.totalUsers || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MousePointer className="h-4 w-4 mr-2" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.metrics.sessions || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.metrics.pageViews || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Bounce Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.metrics.bounceRate || '0.00'}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Avg. Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analytics?.metrics.avgSessionDuration || '0')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables (Fallback for Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Trend */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Page Views Trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily page views over the selected period
            </p>
          </CardHeader>
          <CardContent>
            {analytics?.charts.pageViews && analytics.charts.pageViews.length > 0 ? (
              <div className="space-y-4">
                {/* Bar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.charts.pageViews}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tickFormatter={formatNumber} />
                      <Tooltip
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value) => [formatNumber(value as number), 'Page Views']}
                      />
                      <Bar dataKey="views" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Table as additional info */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Date</th>
                        <th className="text-right py-2">Page Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.charts.pageViews.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-2">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="text-right py-2 font-medium">{formatNumber(item.views)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <p className="text-sm text-muted-foreground">
              Most visited pages
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.charts.topPages?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.page.length > 30 ? item.page.substring(0, 30) + '...' : item.page}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatNumber(item.views)}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <p className="text-sm text-muted-foreground">
              Where visitors come from
            </p>
          </CardHeader>
          <CardContent>
            {analytics?.charts.trafficSources && analytics.charts.trafficSources.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.charts.trafficSources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.charts.trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(value as number), 'Sessions']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Table as additional info */}
                <div className="space-y-3">
                  {analytics.charts.trafficSources.map((item, index) => {
                    const percentage = analytics.metrics.sessions > 0
                      ? ((item.value / analytics.metrics.sessions) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatNumber(item.value)}</p>
                          <p className="text-xs text-muted-foreground">{percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Demographics and Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
            <p className="text-sm text-muted-foreground">
              User age and gender distribution
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Age Distribution */}
              {analytics?.charts.demographics?.age && analytics.charts.demographics.age.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-3">Age Groups</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.charts.demographics.age}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
                        <YAxis tickFormatter={formatNumber} />
                        <Tooltip formatter={(value) => [formatNumber(value as number), 'Users']} />
                        <Bar dataKey="users" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Age distribution data not available</p>
                  <p className="text-xs mt-1">Configure Google Analytics 4 to see demographic data</p>
                </div>
              )}

              {/* Gender Distribution */}
              {analytics?.charts.demographics?.gender && analytics.charts.demographics.gender.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-3">Gender Distribution</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.charts.demographics.gender}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="users"
                        >
                          {analytics.charts.demographics.gender.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatNumber(value as number), 'Users']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Gender distribution data not available</p>
                  <p className="text-xs mt-1">Configure Google Analytics 4 to see demographic data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geography */}
        <Card>
          <CardHeader>
            <CardTitle>Geography</CardTitle>
            <p className="text-sm text-muted-foreground">
              User location distribution
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Countries */}
              {analytics?.charts.geography?.countries && analytics.charts.geography.countries.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Countries</h4>
                  <div className="space-y-3">
                    {analytics.charts.geography.countries.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{item.country}</span>
                        <span className="text-lg font-bold">{formatNumber(item.users)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Country data not available</p>
                  <p className="text-xs mt-1">Configure Google Analytics 4 to see geographic data</p>
                </div>
              )}

              {/* Cities */}
              {analytics?.charts.geography?.cities && analytics.charts.geography.cities.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Cities</h4>
                  <div className="space-y-3">
                    {analytics.charts.geography.cities.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{item.city}</span>
                        <span className="text-lg font-bold">{formatNumber(item.users)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">City data not available</p>
                  <p className="text-xs mt-1">Configure Google Analytics 4 to see geographic data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'Never'}
        {analytics?.error && (
          <div className="text-red-600 mt-2">
            Error: {analytics.error}
          </div>
        )}
      </div>
    </div>
  );
}