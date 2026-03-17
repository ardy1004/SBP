/**
 * Article Service for Salam Bumi Property Blog System
 * Handles all article-related operations with Supabase integration
 *
 * @swagger
 * tags:
 *   - name: Articles
 *     description: Blog article management endpoints
 */

import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

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
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n/gim, '<br />')
    // Paragraphs (wrap text in p tags)
    .replace(/^(?!<)(.*)$/gim, '<p>$1</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/gim, '')
    .replace(/<p><br \/><\/p>/gim, '');
}

// Types and Interfaces
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  featured_image_url?: string;
  status: 'draft' | 'publish';
  author?: string;
  category?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  reading_time_minutes?: number;
  schema_json?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  featured_image_url?: string;
  status?: 'draft' | 'publish';
  category?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  reading_time_minutes?: number;
  author?: string;
}

// Utility function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// A. FRONTEND BLOG PUBLIK FUNCTIONS

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get published articles
 *     description: Retrieves published blog articles with pagination support
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of articles per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 count:
 *                   type: integer
 *                   description: Total number of articles
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *       500:
 *         description: Server error
 *         $ref: '#/components/schemas/Error'
 */
export async function getPublishedArticles(limit: number = 10, page: number = 1): Promise<{
  data: Article[];
  count: number;
  totalPages: number;
}> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get total count first
    const { count, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'publish');

    if (countError) throw countError;

    // Get paginated data
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'publish')
      .order('published_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      data: data as Article[],
      count: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  } catch (error) {
    console.error('Error fetching published articles:', error);
    toast({
      title: "Error",
      description: "Failed to fetch articles",
      variant: "destructive"
    });
    return { data: [], count: 0, totalPages: 0 };
  }
}

/**
 * Get article by slug for public display
 * @param slug Article slug
 * @returns Promise with single article or null
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'publish')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as Article;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    toast({
      title: "Error",
      description: "Failed to fetch article",
      variant: "destructive"
    });
    return null;
  }
}

// B. ADMIN PANEL FUNCTIONS

/**
 * Get all articles (for admin)
 * @param includeDrafts Whether to include draft articles
 * @returns Promise with all articles
 */
export async function getAllArticles(includeDrafts: boolean = false): Promise<Article[]> {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeDrafts) {
      query = query.eq('status', 'publish');
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as Article[];
  } catch (error) {
    console.error('Error fetching all articles:', error);
    toast({
      title: "Error",
      description: "Failed to fetch articles",
      variant: "destructive"
    });
    return [];
  }
}

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create new article
 *     description: Creates a new blog article with all metadata and SEO fields
 *     tags: [Articles]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Article title
 *               content:
 *                 type: string
 *                 description: Article content (HTML/Markdown)
 *               excerpt:
 *                 type: string
 *                 maxLength: 500
 *                 description: Article excerpt/summary
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *                 description: Thumbnail image URL
 *               featured_image_url:
 *                 type: string
 *                 format: uri
 *                 description: Featured image URL
 *               status:
 *                 type: string
 *                 enum: [draft, publish]
 *                 default: draft
 *                 description: Publication status
 *               category:
 *                 type: string
 *                 description: Article category
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Article tags
 *               meta_title:
 *                 type: string
 *                 maxLength: 60
 *                 description: SEO meta title
 *               meta_description:
 *                 type: string
 *                 maxLength: 160
 *                 description: SEO meta description
 *               seo_title:
 *                 type: string
 *                 maxLength: 60
 *                 description: SEO optimized title
 *               seo_description:
 *                 type: string
 *                 maxLength: 160
 *                 description: SEO optimized description
 *               focus_keyword:
 *                 type: string
 *                 description: SEO focus keyword
 *               reading_time_minutes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 60
 *                 default: 5
 *                 description: Estimated reading time
 *               author:
 *                 type: string
 *                 description: Article author
 *     responses:
 *       200:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Invalid input data
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         $ref: '#/components/schemas/Error'
 */
export async function createArticle(articleData: CreateArticleData): Promise<Article | null> {
  try {
    // Validate required fields
    if (!articleData.title || !articleData.content) {
      throw new Error('Title and content are required');
    }

    // Generate slug if not provided
    const slug = articleData.title ? generateSlug(articleData.title) : 'untitled';

    // Set default status
    const status = articleData.status || 'draft';

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: articleData.title,
        slug,
        content: articleData.content,
        excerpt: articleData.excerpt || '',
        thumbnail: articleData.thumbnail || null,
        featured_image_url: articleData.featured_image_url || null,
        status,
        category: articleData.category || null,
        tags: articleData.tags || [],
        meta_title: articleData.meta_title || articleData.title,
        meta_description: articleData.meta_description || articleData.excerpt || '',
        seo_title: articleData.seo_title || articleData.title,
        seo_description: articleData.seo_description || articleData.meta_description || '',
        focus_keyword: articleData.focus_keyword || '',
        reading_time_minutes: articleData.reading_time_minutes || 5,
        author: articleData.author || null,
        published_at: status === 'publish' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Success",
      description: "Article created successfully",
    });

    return data as Article;
  } catch (error) {
    console.error('Error creating article:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create article",
      variant: "destructive"
    });
    return null;
  }
}

/**
 * Update existing article
 * @param id Article ID
 * @param updates Article updates
 * @returns Promise with updated article
 */
export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
  try {
    // Validate required fields if they are being updated
    if (updates.title && !updates.title.trim()) {
      throw new Error('Title cannot be empty');
    }

    if (updates.content && !updates.content.trim()) {
      throw new Error('Content cannot be empty');
    }

    // Generate new slug if title is updated
    if (updates.title) {
      updates.slug = generateSlug(updates.title);
    }

    // Update published_at if status changes to publish
    if (updates.status === 'publish' && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Success",
      description: "Article updated successfully",
    });

    return data as Article;
  } catch (error) {
    console.error('Error updating article:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update article",
      variant: "destructive"
    });
    return null;
  }
}

/**
 * Get article by ID (for admin editing)
 * @param id Article ID
 * @returns Promise with single article or null
 */
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as Article;
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    toast({
      title: "Error",
      description: "Failed to fetch article",
      variant: "destructive"
    });
    return null;
  }
}

/**
 * Delete article
 * @param id Article ID
 * @returns Promise with boolean success status
 */
export async function deleteArticle(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Success",
      description: "Article deleted successfully",
    });

    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete article",
      variant: "destructive"
    });
    return false;
  }
}

// Additional helper functions

/**
 * Get related articles by category or tags
 * @param currentArticleId Current article ID to exclude
 * @param category Category to match
 * @param tags Tags to match
 * @param limit Number of related articles
 * @returns Promise with related articles
 */
export async function getRelatedArticles(
  currentArticleId: string,
  category?: string,
  tags?: string[],
  limit: number = 4
): Promise<Article[]> {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'publish')
      .neq('id', currentArticleId)
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as Article[];
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}