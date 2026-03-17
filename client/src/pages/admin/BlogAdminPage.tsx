/**
 * BlogAdminPage - Admin panel for managing blog articles
 * CRUD operations for articles with filtering and pagination
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllArticles, deleteArticle } from '@/services/articleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Plus, Edit, Trash, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'wouter';

export default function BlogAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch all articles (including drafts for admin)
  const { data: articles, isLoading, isError, error } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => getAllArticles(true)
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete article",
        variant: "destructive"
      });
    }
  });

  // Filter articles
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;

    const matchesCategory = categoryFilter === 'all' ||
                          article.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  // Get unique categories for filter
  const categories = Array.from(new Set(
    articles?.map(article => article.category).filter(Boolean) || []
  ));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
            <p className="text-gray-600">Manage all blog articles for Salam Bumi Property</p>
          </div>
          <Link href="/admin/blog/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Article
            </Button>
          </Link>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles..."
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
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={6} className="h-12 animate-pulse bg-gray-100"></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-red-500 mb-2">Error loading articles</p>
                    <p className="text-gray-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
                  </TableCell>
                </TableRow>
              ) : filteredArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-gray-600">No articles found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredArticles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.id.slice(0, 6)}...</TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.status === 'publish' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.category || '-'}</TableCell>
                    <TableCell>
                      {article.published_at
                        ? format(new Date(article.published_at), 'MMM dd, yyyy')
                        : format(new Date(article.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/blog/${article.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${article.id}`}>
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
                                onClick={() => deleteMutation.mutate(article.id)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">
            Showing {filteredArticles.length} of {articles?.length || 0} articles
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              <span className="font-medium">{articles?.filter(a => a.status === 'publish').length || 0}</span> Published
            </span>
            <span>
              <span className="font-medium">{articles?.filter(a => a.status === 'draft').length || 0}</span> Drafts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}