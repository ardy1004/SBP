import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, Download, Phone, Globe, Home, Building, Briefcase, MessageCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface LeadData {
  id: string;
  user_intent: 'buyer' | 'owner' | 'agent' | 'consultation';
  whatsapp: string;
  ip_address: string;
  user_agent: string;
  page_url: string;
  referrer: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

const intentConfig = {
  buyer: {
    label: 'Calon Pembeli',
    icon: Home,
    color: 'bg-blue-100 text-blue-800'
  },
  owner: {
    label: 'Owner/Pemilik',
    icon: Building,
    color: 'bg-green-100 text-green-800'
  },
  agent: {
    label: 'Broker/Agent',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-800'
  },
  consultation: {
    label: 'Konsultasi',
    icon: MessageCircle,
    color: 'bg-orange-100 text-orange-800'
  }
};

export function LeadManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const { data: leadsResponse, isLoading, error, refetch } = useQuery<{
    leads: LeadData[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ['leads', currentPage, pageSize],
    queryFn: () => apiRequest('GET', `/api/leads?page=${currentPage}&limit=${pageSize}`),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const leads = leadsResponse?.leads || [];
  const totalCount = leadsResponse?.pagination?.total || 0;

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (!leads) return;

    const csvContent = [
      ['ID', 'Intent', 'WhatsApp', 'IP Address', 'Page URL', 'Referrer', 'Created At'],
      ...leads.map(lead => [
        lead.id,
        intentConfig[lead.user_intent]?.label || lead.user_intent,
        lead.whatsapp,
        lead.ip_address,
        lead.page_url,
        lead.referrer,
        lead.created_at
      ])
    ];

    const csvString = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = searchTerm === '' ||
      lead.whatsapp.includes(searchTerm) ||
      lead.page_url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIntent = intentFilter === 'all' || lead.user_intent === intentFilter;

    return matchesSearch && matchesIntent;
  }) || [];

  const totalLeads = totalCount;
  const totalFiltered = filteredLeads.length;

  const getIntentStats = () => {
    if (!leads) return {};

    return leads.reduce((acc, lead) => {
      acc[lead.user_intent] = (acc[lead.user_intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const intentStats = getIntentStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load leads data</p>
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
          <h2 className="text-2xl font-bold">Lead Management</h2>
          <p className="text-muted-foreground">
            Kelola leads yang dikumpulkan dari website
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleExport} variant="outline" disabled={!leads?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>

        {Object.entries(intentConfig).map(([intent, config]) => {
          const count = intentStats[intent] || 0;
          const Icon = config.icon;
          return (
            <Card key={intent}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Icon className="h-4 w-4 mr-2" />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan WhatsApp atau URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={intentFilter} onValueChange={setIntentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Intent</SelectItem>
                {Object.entries(intentConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Data ({totalFiltered} dari {totalLeads})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada leads yang sesuai dengan filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intent</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Page URL</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const intentInfo = intentConfig[lead.user_intent];
                    const Icon = intentInfo?.icon || MessageCircle;

                    return (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <Badge className={intentInfo?.color}>
                              {intentInfo?.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.whatsapp}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={lead.page_url}>
                          {lead.page_url}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {lead.ip_address}
                        </TableCell>
                        <TableCell>
                          {format(new Date(lead.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}