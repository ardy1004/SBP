/**
 * BlogEditorPage - Admin panel for creating/editing blog articles
 * Rich text editor with full article management
 */

import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createArticle, updateArticle, getArticleById } from '@/services/admin/articleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Tag, Image as ImageIcon } from 'lucide-react';
import { Link } from 'wouter';

// Simple Rich Text Editor Component (placeholder for actual implementation)
function SimpleRichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="border rounded-md p-4 min-h-[300px]">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[300px] w-full border-none focus:ring-0"
        placeholder="Write your article content here..."
      />
      <div className="mt-4 text-sm text-gray-500">
        Note: In a real implementation, this would be replaced with a proper rich text editor like TipTap or CKEditor
      </div>
    </div>
  );
}

export default function BlogEditorPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'publish'>('draft');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch article if editing
  const { data: article } = useQuery({
    queryKey: ['article-edit', id],
    queryFn: () => {
      if (!id) return null;
      return getArticleById(id);
    },
    enabled: !!id,
  });

  // Handle article data after fetch
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setExcerpt(article.excerpt || '');
      setContent(article.content);
      setThumbnailUrl(article.thumbnail || '');
      setCategory(article.category || '');
      setTags(article.tags || []);
      setStatus(article.status);
      setMetaTitle(article.meta_title || article.title);
      setMetaDescription(article.meta_description || article.excerpt || '');
      setIsLoading(false);
    }
  }, [article]);

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Success",
          description: "Article created successfully",
        });
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
    mutationFn: (updates: any) => {
      if (!article?.id) throw new Error('Article ID not found');
      return updateArticle(article.id, updates);
    },
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const articleData = {
      title,
      excerpt,
      content,
      thumbnail: thumbnailUrl || null,
      category: category || null,
      tags: tags.length > 0 ? tags : null,
      status,
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt || ''
    };

    if (id) {
      // Update existing article
      updateMutation.mutate(articleData);
    } else {
      // Create new article
      createArticle({
        ...articleData,
        thumbnail: articleData.thumbnail || undefined,
        category: articleData.category || undefined
      });
    }
  };

  // Generate slug from title
  const generateSlugFromTitle = () => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Add tag
  const addTag = () => {
    const newTag = prompt('Enter a new tag:');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (isLoading && id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 w-64 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          </div>
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
          onClick={() => navigate('/admin/blog')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {id ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Update existing article content' : 'Write a new blog post for Salam Bumi Property'}
          </p>
        </div>

        {/* Article Form */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Article title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      placeholder="article-slug"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSlugFromTitle}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary of the article (160 characters max)"
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  {excerpt.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="thumbnail"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <ImageIcon className="mr-1 h-4 w-4" />
                    Upload
                  </Button>
                </div>
                {thumbnailUrl && (
                  <div className="mt-2">
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="max-w-xs max-h-32 object-contain rounded"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property-tips">Property Tips</SelectItem>
                      <SelectItem value="market-updates">Market Updates</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="guides">Guides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-xs hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      Add Tag
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Content</h2>
            <SimpleRichTextEditor value={content} onChange={setContent} />
          </div>

          {/* SEO */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">SEO</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO optimized title"
                />
                <p className="text-sm text-gray-500">
                  {metaTitle.length}/60 characters recommended
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  {metaDescription.length}/160 characters recommended
                </p>
              </div>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Publish</h2>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Status:</span>
                <Switch
                  id="status"
                  checked={status === 'publish'}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? 'publish' : 'draft')
                  }
                />
                <Label htmlFor="status" className="text-sm font-medium">
                  {status === 'publish' ? 'Published' : 'Draft'}
                </Label>
              </div>

              <div className="flex gap-2">
                {id && (
                  <Link href={`/blog/${slug}`} target="_blank">
                    <Button variant="outline" type="button">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </Link>
                )}
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {id ? 'Update Article' : 'Publish Article'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}