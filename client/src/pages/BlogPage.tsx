/**
 * BlogPage - Public blog listing page
 * Displays all published articles with pagination
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
// Remove Helmet import as it's not available
import { getPublishedArticles } from '@/services/articleService';
import { BlogCard, BlogCardSkeleton } from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch published articles
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['published-articles', page, limit, searchTerm, categoryFilter],
    queryFn: () => getPublishedArticles(limit, page)
  });

  // Filter articles based on search and category
  const filteredArticles = data?.data.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' ||
                          article.category === categoryFilter;

    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories for filter
  const categories = Array.from(new Set(
    data?.data.map(article => article.category).filter(Boolean) || []
  ));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* SEO Meta Tags - Basic implementation without Helmet */}
      <title>Blog - Salam Bumi Property</title>
      <meta name="description" content="Latest property news, tips, and insights from Salam Bumi Property" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest news, tips, and insights about property in Indonesia
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

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

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {isLoading ? (
            Array(limit).fill(0).map((_, index) => (
              <BlogCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : isError ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-500 mb-4">Error loading articles</p>
              <p className="text-gray-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 mb-2">No articles found</p>
              <p className="text-sm text-gray-500">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new content'}
              </p>
            </div>
          ) : (
            filteredArticles.map(article => (
              <BlogCard
                key={article.id}
                article={article}
                showCategory={true}
                showExcerpt={true}
                showDate={true}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>

              <span className="flex items-center px-4 py-2 text-sm">
                Page {page} of {data.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}