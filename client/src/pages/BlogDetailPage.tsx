/**
 * BlogDetailPage - Public blog detail page
 * Displays full article content with related articles
 */

import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getArticleBySlug, getRelatedArticles } from '@/services/articleService';

// Simple Markdown to HTML converter for blog content
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br />')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // Code blocks
    .replace(/`(.*)`/gim, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Wrap in paragraphs
    .replace(/^([^<].*)$/gim, '<p>$1</p>')
    // Clean up
    .replace(/<p><\/p>/gim, '')
    .replace(/<p><br \/>/gim, '<p>')
    .replace(/<br \/><\/p>/gim, '</p>');
}
import { BlogCard, BlogCardSkeleton } from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch article by slug
  const { data: article, isError, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticleBySlug(slug || ''),
    enabled: !!slug
  });

  // Fetch related articles
  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', article?.id, article?.category, article?.tags],
    queryFn: () => {
      if (!article?.id) return [];
      return getRelatedArticles(
        article.id,
        article.category,
        article.tags,
        3
      );
    },
    enabled: !!article?.id
  });

  useEffect(() => {
    if (article) {
      setIsLoading(false);
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-6 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
              <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'The article you are looking for does not exist.'}
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you are looking for does not exist.</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Thumbnail */}
          {article.thumbnail && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              {article.category && (
                <div className="flex items-center">
                  <Tag className="mr-1 h-3 w-3" />
                  <span>{article.category}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                <span>
                  {article.published_at
                    ? format(new Date(article.published_at), 'MMMM dd, yyyy')
                    : format(new Date(article.created_at), 'MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center">
                <User className="mr-1 h-3 w-3" />
                <span>Salam Bumi Property</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-gray-600 italic mb-6">{article.excerpt}</p>
            )}

            {/* Content */}
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
            />
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map(relatedArticle => (
                <BlogCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  showCategory={true}
                  showExcerpt={false}
                  showDate={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}