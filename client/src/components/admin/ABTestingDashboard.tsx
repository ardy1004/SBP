import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Clock,
  Target,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ABTestVariant {
  id: string;
  name: string;
  lpTemplate: string;
  status: 'draft' | 'running' | 'completed' | 'winner';
  traffic: number;
  conversions: number;
  ctr: number;
  bounceRate: number;
  avgSessionDuration: number;
  createdAt: Date;
  winner?: boolean;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed';
  variants: ABTestVariant[];
  totalTraffic: number;
  totalConversions: number;
  startDate?: Date;
  endDate?: Date;
  winner?: string;
  confidence: number;
}

export default function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockTests: ABTest[] = [
      {
        id: "test-1",
        name: "Hero CTA Button Test",
        description: "Testing different CTA button texts for higher conversion",
        status: "running",
        totalTraffic: 2450,
        totalConversions: 127,
        confidence: 85,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        variants: [
          {
            id: "variant-a",
            name: "Jelajahi Properti",
            lpTemplate: "LP-1",
            status: "running",
            traffic: 1225,
            conversions: 58,
            ctr: 4.7,
            bounceRate: 32.1,
            avgSessionDuration: 185,
            createdAt: new Date()
          },
          {
            id: "variant-b",
            name: "Temukan Rumah Impian",
            lpTemplate: "LP-1",
            status: "running",
            traffic: 1225,
            conversions: 69,
            ctr: 5.6,
            bounceRate: 28.7,
            avgSessionDuration: 212,
            createdAt: new Date(),
            winner: true
          }
        ]
      },
      {
        id: "test-2",
        name: "Headline Optimization",
        description: "Testing different headline variations for better engagement",
        status: "completed",
        totalTraffic: 3200,
        totalConversions: 189,
        confidence: 95,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        winner: "variant-c",
        variants: [
          {
            id: "variant-c",
            name: "Temukan Hunian Impian Anda",
            lpTemplate: "LP-2",
            status: "winner",
            traffic: 1600,
            conversions: 105,
            ctr: 6.6,
            bounceRate: 25.3,
            avgSessionDuration: 245,
            createdAt: new Date(),
            winner: true
          },
          {
            id: "variant-d",
            name: "Investasi Properti Terbaik",
            lpTemplate: "LP-2",
            status: "completed",
            traffic: 1600,
            conversions: 84,
            ctr: 5.3,
            bounceRate: 31.2,
            avgSessionDuration: 198,
            createdAt: new Date()
          }
        ]
      }
    ];

    setTests(mockTests);
    setSelectedTest(mockTests[0]);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        activeUsers: Math.floor(Math.random() * 50) + 20,
        conversionsLastHour: Math.floor(Math.random() * 10) + 1,
        avgConversionRate: (Math.random() * 2 + 4).toFixed(1),
        timestamp: new Date()
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startTest = (testId: string) => {
    setTests(prev => prev.map(test =>
      test.id === testId
        ? { ...test, status: 'running', startDate: new Date() }
        : test
    ));
    toast({
      title: "A/B Test Started",
      description: "Test telah dimulai dan traffic akan didistribusikan ke variants.",
    });
  };

  const stopTest = (testId: string) => {
    setTests(prev => prev.map(test =>
      test.id === testId
        ? { ...test, status: 'completed', endDate: new Date() }
        : test
    ));
    toast({
      title: "A/B Test Stopped",
      description: "Test telah dihentikan. Analisis hasil akan segera tersedia.",
    });
  };

  const declareWinner = (testId: string, winnerVariantId: string) => {
    setTests(prev => prev.map(test =>
      test.id === testId
        ? {
            ...test,
            winner: winnerVariantId,
            variants: test.variants.map(v => ({
              ...v,
              winner: v.id === winnerVariantId,
              status: v.id === winnerVariantId ? 'winner' : 'completed'
            }))
          }
        : test
    ));
    toast({
      title: "Winner Declared",
      description: "Variant pemenang telah ditentukan dan akan digunakan sebagai default.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'winner': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running';
      case 'completed': return 'Completed';
      case 'winner': return 'Winner';
      default: return 'Draft';
    }
  };

  const calculateImprovement = (variant: ABTestVariant, baseline: ABTestVariant) => {
    const improvement = ((variant.conversions / variant.traffic) - (baseline.conversions / baseline.traffic)) /
                       (baseline.conversions / baseline.traffic) * 100;
    return improvement.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            A/B Testing Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Optimalkan landing page Anda dengan testing scientific yang data-driven
          </p>
        </div>

        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
          <Zap className="w-4 h-4 mr-2" />
          Create New Test
        </Button>
      </div>

      {/* Real-time Metrics */}
      {realTimeData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <div className="text-2xl font-bold mt-2">{realTimeData.activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Conversions/Hour</span>
              </div>
              <div className="text-2xl font-bold mt-2">{realTimeData.conversionsLastHour}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Avg Conversion Rate</span>
              </div>
              <div className="text-2xl font-bold mt-2">{realTimeData.avgConversionRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Last Update</span>
              </div>
              <div className="text-sm mt-2">{realTimeData.timestamp.toLocaleTimeString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">All Tests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Active Tests Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Tests</p>
                    <p className="text-3xl font-bold">{tests.filter(t => t.status === 'running').length}</p>
                  </div>
                  <Play className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Tests</p>
                    <p className="text-3xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
                  </div>
                  <Award className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Conversions</p>
                    <p className="text-3xl font-bold">{tests.reduce((sum, t) => sum + t.totalConversions, 0)}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Running Tests */}
          {tests.filter(t => t.status === 'running').map(test => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {test.name}
                      <Badge className="bg-green-500">Running</Badge>
                    </CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => stopTest(test.id)}>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Test
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {test.variants.map((variant, index) => {
                    const baseline = test.variants[0];
                    const improvement = index > 0 ? calculateImprovement(variant, baseline) : null;

                    return (
                      <div key={variant.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{variant.name}</h4>
                          {variant.winner && <Award className="w-4 h-4 text-yellow-500" />}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Traffic</span>
                            <span className="font-medium">{variant.traffic.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Conversions</span>
                            <span className="font-medium">{variant.conversions}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>CTR</span>
                            <span className="font-medium">{variant.ctr}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bounce Rate</span>
                            <span className="font-medium">{variant.bounceRate}%</span>
                          </div>

                          {improvement && (
                            <div className={`text-sm font-medium ${parseFloat(improvement) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(improvement) > 0 ? '+' : ''}{improvement}% vs baseline
                            </div>
                          )}
                        </div>

                        <Progress
                          value={(variant.conversions / Math.max(...test.variants.map(v => v.conversions))) * 100}
                          className="mt-3"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Statistical Confidence: {test.confidence}%
                      {test.confidence >= 95 && " (High confidence - ready to declare winner)"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid gap-4">
            {tests.map(test => (
              <Card key={test.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTest(test)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.name}
                        <Badge className={getStatusColor(test.status)}>
                          {getStatusText(test.status)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">{test.totalConversions}</div>
                      <div className="text-sm text-muted-foreground">conversions</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">{test.totalTraffic.toLocaleString()}</div>
                      <div className="text-muted-foreground">Total Traffic</div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {((test.totalConversions / test.totalTraffic) * 100).toFixed(1)}%
                      </div>
                      <div className="text-muted-foreground">Conversion Rate</div>
                    </div>
                    <div>
                      <div className="font-medium">{test.confidence}%</div>
                      <div className="text-muted-foreground">Confidence</div>
                    </div>
                    <div>
                      <div className="font-medium">{test.variants.length}</div>
                      <div className="text-muted-foreground">Variants</div>
                    </div>
                  </div>

                  {test.status === 'running' && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); stopTest(test.id); }}>
                        Stop Test
                      </Button>
                      {test.confidence >= 95 && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); declareWinner(test.id, test.variants[0].id); }}>
                          Declare Winner
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Detailed analytics for all A/B tests and variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics dashboard coming soon...</p>
                <p className="text-sm mt-2">Real-time heatmaps, funnel analysis, and conversion attribution</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}