import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { createArticle, updateArticle, getArticleById, Article } from '@/services/admin/articleService';
import { AdminSidebar } from '@/components/admin/layouts';
import BlogEditor from './components/BlogEditor';

export default function BlogEditorPage() {
  const [match, params] = useRoute('/admin/blog/editor/:id');
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const id = match ? params.id : null;

  // Fetch article if editing
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticleById(id!),
    enabled: !!id,
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Success",
          description: "Article created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
        navigate(`/admin/blog`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create article",
        variant: "destructive"
      });
    }
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateArticle(id, data),
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Success",
          description: "Article updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
        navigate(`/admin/blog`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update article",
        variant: "destructive"
      });
    }
  });

  const handleSave = (articleData: any) => {
    if (id) {
      updateMutation.mutate({ id, data: articleData });
    } else {
      createMutation.mutate(articleData);
    }
  };

  const handlePreview = () => {
    if (article?.slug) {
      window.open(`/blog/${article.slug}`, '_blank');
    } else {
      toast({
        title: "Info",
        description: "Please save the article first to preview",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <Button
                  variant="ghost"
                  className="mb-6"
                  onClick={() => navigate('/admin/blog')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Articles
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                  {id ? 'Edit Article' : 'Create New Article'}
                </h1>
                <p className="text-gray-600">
                  {id ? 'Update existing article content' : 'Write a new blog post for Salam Bumi Property'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Blog Editor Component */}
            <BlogEditor
              article={article || undefined}
              onSave={handleSave}
              onPreview={handlePreview}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}