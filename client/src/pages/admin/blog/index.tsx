/**
 * Blog Admin Index Page - Advanced Blog Management Dashboard
 * Complex table view with filtering, batch operations, and analytics
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Eye, Filter, Search, Calendar, Tag, List, Grid, ArrowUpDown, ChevronDown, ChevronUp, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { getAllArticles, deleteArticle, updateArticle, Article } from '@/services/admin/articleService';
import { DatabaseStatusIndicator } from '@/components/admin/DatabaseStatusIndicator';
import { AdminSidebar } from '@/components/admin/layouts';

// Blog Table Component
interface BlogTableProps {
  articles: Article[];
  selectedArticles: string[];
  onSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onAction: (action: string, id?: string) => void;
}

function BlogTable({ articles, selectedArticles, onSelect, onSelectAll, onAction }: BlogTableProps) {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[50px]">
                <Checkbox
                  checked={selectedArticles.length === articles.length && articles.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Thumbnail
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Title
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Category
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {articles.map(article => (
              <tr key={article.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 w-[50px]">
                  <Checkbox
                    checked={selectedArticles.includes(article.id)}
                    onCheckedChange={() => onSelect(article.id)}
                    aria-label="Select row"
                  />
                </td>
                <td className="p-4 align-middle">
                  {article.thumbnail ? (
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle max-w-[300px] truncate">
                  <div className="font-medium">{article.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{article.excerpt}</div>
                </td>
                <td className="p-4 align-middle">
                  <Badge variant={article.status === 'publish' ? 'default' : 'secondary'}>
                    {article.status}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  {article.category || '-'}
                </td>
                <td className="p-4 align-middle">
                  {article.published_at
                    ? format(new Date(article.published_at), 'MMM dd, yyyy')
                    : format(new Date(article.created_at), 'MMM dd, yyyy')}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex gap-2">
                    <Link href={`/blog/${article.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/blog/editor/${article.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the article
                            "{article.title}" from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => onAction('delete', article.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BlogAdminIndexPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState('table');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all articles (including drafts for admin)
  const { data: articlesData, isLoading, isError, error } = useQuery({
    queryKey: ['admin-articles', searchTerm, statusFilter, categoryFilter],
    queryFn: () => getAllArticles({
      status: statusFilter === 'all' ? 'all' : statusFilter as 'draft' | 'publish',
      search: searchTerm,
      limit: 1000 // Get all for client-side filtering
    })
  });

  const articles = articlesData?.data || [];

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
      setSelectedArticles([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete article",
        variant: "destructive"
      });
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: { ids: string[]; data: Partial<Article> }) => {
      // Implement bulk update by calling updateArticle for each id
      return Promise.all(
        updates.ids.map(id => updateArticle(id, updates.data))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({
        title: "Success",
        description: "Bulk update completed successfully",
      });
      setSelectedArticles([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to bulk update articles",
        variant: "destructive"
      });
    }
  });

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;

    const matchesCategory = categoryFilter === 'all' ||
                          article.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalArticles = filteredArticles.length;
  const totalPages = Math.ceil(totalArticles / pageSize);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get unique categories for filter
  const categories = Array.from(new Set(
    articles.map(article => article.category).filter(Boolean)
  ));

  // Handle actions
  const handleAction = (action: string, id?: string) => {
    if (action === 'delete' && id) {
      deleteMutation.mutate(id);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedArticles.length === 0) {
      toast({
        title: "Info",
        description: "Please select at least one article",
      });
      return;
    }

    if (action === 'publish') {
      bulkUpdateMutation.mutate({
        ids: selectedArticles,
        data: { status: 'publish', published_at: new Date().toISOString() }
      });
    } else if (action === 'draft') {
      bulkUpdateMutation.mutate({
        ids: selectedArticles,
        data: { status: 'draft' }
      });
    } else if (action === 'delete') {
      // Show confirmation for bulk delete
      if (window.confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) {
        selectedArticles.forEach(id => deleteMutation.mutate(id));
      }
    }
  };

  // Selection handlers
  const handleSelect = (id: string) => {
    setSelectedArticles(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedArticles(checked ? paginatedArticles.map(a => a.id) : []);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
                <p className="text-gray-600">Advanced blog management with filtering, batch operations, and analytics</p>
              </div>

              {/* Database Status Indicator */}
              <div className="w-full md:w-auto">
                <DatabaseStatusIndicator />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-[120px]">
                <div className="text-2xl font-bold text-primary">{articles.length}</div>
                <div className="text-sm text-muted-foreground">Total Articles</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-[120px]">
                <div className="text-2xl font-bold text-green-600">{articles.filter(a => a.status === 'publish').length}</div>
                <div className="text-sm text-muted-foreground">Published</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-[120px]">
                <div className="text-2xl font-bold text-yellow-600">{articles.filter(a => a.status === 'draft').length}</div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/admin/blog/editor">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Article
                  </Button>
                </Link>
                <Link href="/admin/blog/seed-test-data">
                  <Button variant="outline">
                    Seed Test Data
                  </Button>
                </Link>

                {selectedArticles.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkAction('publish')}
                      disabled={bulkUpdateMutation.isPending}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Publish Selected
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBulkAction('draft')}
                      disabled={bulkUpdateMutation.isPending}
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Move to Draft
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleBulkAction('delete')}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Selected
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedArticles.length} selected
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="mr-2 h-4 w-4" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="mr-2 h-4 w-4" />
                    Grid
                  </Button>
                </div>

                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="publish">Published</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category || ''}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
            </div>

            {/* Articles Table */}
            {viewMode === 'table' ? (
              <BlogTable
                articles={paginatedArticles}
                selectedArticles={selectedArticles}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                onAction={handleAction}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map(article => (
                  <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden border">
                    <div className="relative">
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                      <Badge
                        variant={article.status === 'publish' ? 'default' : 'secondary'}
                        className="absolute top-2 right-2"
                      >
                        {article.status}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 truncate">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {article.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {article.published_at
                            ? format(new Date(article.published_at), 'MMM dd, yyyy')
                            : format(new Date(article.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link href={`/admin/blog/editor/${article.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700">
                              <Trash className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{article.title}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleAction('delete', article.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalArticles)} of {totalArticles} articles
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      if (page === currentPage) {
                        return (
                          <Button key={page} variant="default" size="sm" className="h-8 w-8 p-0">
                            {page}
                          </Button>
                        );
                      }
                      return (
                        <Button
                          key={page}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span className="text-sm text-muted-foreground px-2">...</span>
                    )}
                    {totalPages > 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}