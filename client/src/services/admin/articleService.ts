/**
 * Admin Article Service for Salam Bumi Property Blog System
 * Uses Supabase service role key for admin operations (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js'
import { toast } from '@/hooks/use-toast'

// Initialize Supabase admin client with service role key
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string | undefined
const supabaseServiceKey = import.meta.env['VITE_SUPABASE_SERVICE_ROLE_KEY'] as string | undefined

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin configuration')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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
  seo_keywords?: string;
  focus_keyword?: string;
  reading_time_minutes?: number;
  schema_json?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
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
  seo_keywords?: string;
  focus_keyword?: string;
  reading_time_minutes?: number;
  author?: string;
}

export interface ArticleFilters {
  status?: 'draft' | 'publish' | 'all';
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
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

// Utility function to ensure unique slug
async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const query = supabaseAdmin
      .from('articles')
      .select('id')
      .eq('slug', uniqueSlug)
      .limit(1);

    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      break;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * CREATE - Create new article
 */
export async function createArticle(articleData: any): Promise<Article | null> {
  try {
    // === 🔴 CRITICAL DEBUG - INSERT ATTEMPT ===
    console.log('=== 🔴 CRITICAL DEBUG - INSERT ATTEMPT ===');
    console.log('Full articleData:', JSON.stringify(articleData, null, 2));
    console.log('Keys in articleData:', Object.keys(articleData));
    console.log('Database columns:', [
      'id', 'title', 'slug', 'excerpt', 'content', 'thumbnail',
      'category', 'tags', 'seo_title', 'meta_description', 'schema_json',
      'status', 'published_at', 'author', 'created_at', 'updated_at',
      'meta_title', 'seo_keywords', 'featured_image_url', 'seo_description',
      'focus_keyword', 'reading_time_minutes'
    ]);

    // Check for null/undefined values that might cause issues
    const problematicValues: any = {};
    Object.entries(articleData).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        problematicValues[key] = value;
      }
    });
    console.log('Problematic null/undefined values:', problematicValues);

    // Validate required fields
    if (!articleData.title || !articleData.content) {
      throw new Error('Title and content are required');
    }

    // Generate and ensure unique slug
    const baseSlug = articleData.title ? generateSlug(articleData.title) : 'untitled';
    const slug = await ensureUniqueSlug(baseSlug);

    // Set default status
    const status = articleData.status || 'draft';

    // PREPARE DATA dengan SEMUA kolom yang ada di DB (22 columns)
    const dbInsertData = {
      // Content
      title: articleData.title || '',
      slug,
      content: articleData.content || '',
      excerpt: articleData.excerpt || '',

      // SEO Fields (SEMUA ADA SEKARANG!)
      seo_title: articleData.seo_title || articleData.meta_title || articleData.title,
      meta_description: articleData.meta_description || articleData.seo_description || '',
      meta_title: articleData.meta_title || articleData.title,
      seo_description: articleData.seo_description || articleData.meta_description || '',
      focus_keyword: articleData.focus_keyword || '',
      seo_keywords: articleData.seo_keywords || '',

      // Media
      thumbnail: articleData.thumbnail || articleData.featured_image_url || '',
      featured_image_url: articleData.featured_image_url || articleData.thumbnail || '',

      // Categorization
      category: articleData.category || '',
      tags: Array.isArray(articleData.tags) ? articleData.tags :
            (articleData.tags ? [articleData.tags] : []),

      // Metadata
      status,
      reading_time_minutes: articleData.reading_time_minutes || 5,
      published_at: status === 'publish' ? new Date().toISOString() : null,
      author: articleData.author || null,
      schema_json: articleData.schema_json || null,

      // Auto timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📦 Final DB insert data:', dbInsertData);

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert([dbInsertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('✅ INSERT SUCCESS! ID:', data.id);

    toast({
      title: "Success",
      description: "Article created successfully",
    });

    return data as Article;
  } catch (error: any) {
    console.error('🎯 CATCH BLOCK ERROR:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create article",
      variant: "destructive"
    });
    return null;
  }
}

/**
 * READ - Get all articles with filters
 */
export async function getAllArticles(filters: ArticleFilters = {}): Promise<{
  data: Article[];
  count: number;
  totalPages: number;
}> {
  try {
    const {
      status = 'all',
      search = '',
      category,
      limit = 10,
      offset = 0
    } = filters;

    // Build query
    let query = supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
      data: data as Article[],
      count: count || 0,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    toast({
      title: "Error",
      description: "Failed to fetch articles",
      variant: "destructive"
    });
    return { data: [], count: 0, totalPages: 0 };
  }
}

/**
 * READ ONE - Get article by ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabaseAdmin
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
 * UPDATE - Update existing article
 */
export async function updateArticle(id: string, updates: Partial<CreateArticleData & { slug?: string }>): Promise<Article | null> {
  try {
    // Validate required fields if they are being updated
    if (updates.title && !updates.title.trim()) {
      throw new Error('Title cannot be empty');
    }

    if (updates.content && !updates.content.trim()) {
      throw new Error('Content cannot be empty');
    }

    // Handle slug update
    if (updates.title) {
      const baseSlug = generateSlug(updates.title);
      updates.slug = await ensureUniqueSlug(baseSlug, id);
    }

    // Update published_at if status changes to publish
    if (updates.status === 'publish') {
      const currentArticle = await getArticleById(id);
      if (currentArticle && currentArticle.status !== 'publish') {
        (updates as any).published_at = new Date().toISOString();
      }
    }

    // Map field names to match database columns
    const dbUpdates: any = { ...updates };
    // Field names already match database columns now

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(dbUpdates)
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
 * DELETE - Delete article
 */
export async function deleteArticle(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
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

/**
 * UPLOAD IMAGE - Upload image to Supabase storage
 */
export async function uploadImage(file: File, folder: string = 'blog-images'): Promise<string | null> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to upload image",
      variant: "destructive"
    });
    return null;
  }
}

/**
 * GET ARTICLE STATS - Get statistics for dashboard
 */
export async function getArticleStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  recent: Article[];
}> {
  try {
    // Get counts
    const { count: totalCount, error: totalError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true });

    const { count: publishedCount, error: publishedError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'publish');

    const { count: draftCount, error: draftError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    // Get recent articles
    const { data: recentArticles, error: recentError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (totalError || publishedError || draftError || recentError) {
      throw new Error('Failed to fetch article stats');
    }

    return {
      total: totalCount || 0,
      published: publishedCount || 0,
      draft: draftCount || 0,
      recent: recentArticles as Article[] || []
    };
  } catch (error) {
    console.error('Error fetching article stats:', error);
    return { total: 0, published: 0, draft: 0, recent: [] };
  }
}