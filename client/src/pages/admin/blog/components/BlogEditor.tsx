import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Bold, Italic, List, ListOrdered, Link, Image, Quote, Code, Heading1, Heading2, Heading3, Undo, Redo, Save, Eye, Loader } from 'lucide-react';
import { Article } from '@/services/admin/articleService';
import FeaturedImageUploader from '@/components/admin/blog/FeaturedImageUploader';
import { uploadContentImage } from '@/services/admin/imageService';

interface BlogEditorProps {
  article?: Article;
  onSave: (data: Partial<Article>) => void;
  onPreview?: () => void;
  isLoading?: boolean;
}

export default function BlogEditor({ article, onSave, onPreview, isLoading }: BlogEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft',
    thumbnail: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    published_at: '',
  });

  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Populate form when article loads
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || '',
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '',
        status: article.status || 'draft',
        thumbnail: article.thumbnail || '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        published_at: article.published_at || '',
      });
    }
  }, [article]);

  // Calculate word count and read time
  useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadTime(Math.ceil(words.length / 200)); // Average reading speed: 200 words per minute
  }, [formData.content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required",
        variant: "destructive"
      });
      return;
    }

    if (wordCount < 300) {
      toast({
        title: "Validation Warning",
        description: "Content should be at least 300 words for better SEO",
        variant: "destructive"
      });
      return;
    }

    const processedTags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const articleData = {
      ...formData,
      status: formData.status as 'draft' | 'publish',
      tags: processedTags.length > 0 ? processedTags : undefined,
      published_at: formData.status === 'publish' && !formData.published_at
        ? new Date().toISOString()
        : formData.published_at,
    };

    onSave(articleData);
  };


  const insertFormatting = (format: string) => {
    // Simple text formatting for textarea - in real implementation, use a proper WYSIWYG editor
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'heading1':
        replacement = `# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'heading2':
        replacement = `## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'heading3':
        replacement = `### ${selectedText || 'Heading 3'}\n`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'quote text'}\n`;
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        break;
      case 'list':
        replacement = `- ${selectedText || 'list item'}\n`;
        break;
      case 'ordered-list':
        replacement = `1. ${selectedText || 'list item'}\n`;
        break;
    }

    const newContent = formData.content.substring(0, start) + replacement + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  // Handle image upload for content
  const handleImageUpload = async (file: File) => {
    if (isUploadingImage) return;

    setIsUploadingImage(true);

    try {
      const result = await uploadContentImage(file, article?.id);

      if (result.success && result.url) {
        // Insert image into content
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const imageMarkdown = `![${file.name}](${result.url})`;
          const newContent = formData.content.substring(0, start) + imageMarkdown + formData.content.substring(end);

          setFormData(prev => ({ ...prev, content: newContent }));

          // Focus back to textarea
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
          }, 0);
        }

        toast({
          title: 'Gambar berhasil diupload',
          description: 'Gambar telah ditambahkan ke konten artikel',
        });
      } else {
        throw new Error(result.error || 'Upload gagal');
      }
    } catch (error: any) {
      console.error('Image upload failed:', error);
      toast({
        title: 'Upload gambar gagal',
        description: error.message || 'Terjadi kesalahan saat upload gambar',
        variant: 'destructive'
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image button click
  const handleImageButtonClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };

    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onPreview}
            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant={formData.status === 'publish' ? 'default' : 'secondary'}>
            {formData.status}
          </Badge>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings & SEO</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{wordCount} words</span>
                  <span>{readTime} min read</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the article"
                    rows={3}
                  />
                </div>

                {/* WYSIWYG Toolbar */}
                <div className="border rounded-lg p-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('bold')}
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('italic')}
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('heading1')}
                      title="Heading 1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('heading2')}
                      title="Heading 2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('heading3')}
                      title="Heading 3"
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('list')}
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('ordered-list')}
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('link')}
                      title="Link"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleImageButtonClick}
                      disabled={isUploadingImage}
                      title="Insert Image"
                    >
                      {isUploadingImage ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Image className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('quote')}
                      title="Quote"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('code')}
                      title="Code"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    id="content-editor"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your article content here... (supports Markdown formatting)"
                    rows={20}
                    required
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>

                <FeaturedImageUploader
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                  articleId={article?.id}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings & SEO Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Property Tips, Market News"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., real estate, investment, tips (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="publish">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <Input
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="Custom SEO title (leave empty to use article title)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Preview: {formData.seo_title || formData.title || 'Your SEO Title'} ({(formData.seo_title || formData.title || '').length}/60 chars)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <Textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Meta description for search engines"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(formData.seo_description || formData.excerpt || '').length}/160 chars
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <Input
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    placeholder="Comma separated keywords"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom CSS Class
                  </label>
                  <Input
                    placeholder="e.g., custom-article-style"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redirect URL
                  </label>
                  <Input
                    placeholder="Optional redirect URL"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="no-index" className="rounded" />
                  <label htmlFor="no-index" className="text-sm font-medium text-gray-700">
                    No-index (hide from search engines)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <Input
                    placeholder="Canonical URL override"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}