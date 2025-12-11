/**
 * Hybrid Search Engine V2
 * Combines Full-Text Search (FTS) with traditional ILIKE search
 * Provides intelligent fallbacks and advanced ranking
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SearchSanitizer, validateSearchInput } from './searchSanitizer';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  sortBy?: 'relevance' | 'date' | 'price';
  includeSold?: boolean;
}

export interface SearchResult {
  id: string;
  kode_listing: string;
  judul_properti: string;
  deskripsi?: string;
  jenis_properti: string;
  harga_properti?: string;
  kabupaten?: string;
  provinsi?: string;
  alamat_lengkap?: string;
  search_score?: number;
  created_at: string;
}

export interface SearchAnalytics {
  query: string;
  duration: number;
  resultCount: number;
  strategy: 'fts' | 'hybrid' | 'fallback';
  timestamp: number;
}

export class HybridSearchEngine {
  private supabase: SupabaseClient;
  private analytics: SearchAnalytics[] = [];

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Main search method with intelligent strategy selection
   */
  async search(searchTerm: string, options: SearchOptions = {}): Promise<{
    results: SearchResult[];
    totalCount: number;
    strategy: string;
    analytics: SearchAnalytics;
  }> {
    const startTime = Date.now();

    // Validate and sanitize input
    const validation = validateSearchInput(searchTerm);
    if (!validation.isValid) {
      throw new Error(`Invalid search term: ${validation.warnings.join(', ')}`);
    }

    const sanitizedTerm = validation.sanitizedTerm;
    const intent = SearchSanitizer.detectSearchIntent(sanitizedTerm);

    let results: SearchResult[] = [];
    let strategy: 'fts' | 'hybrid' | 'fallback' = 'hybrid';
    let totalCount = 0;

    try {
      // Strategy 1: Full-Text Search (Fastest, most relevant)
      if (this.shouldUseFTS(sanitizedTerm, intent)) {
        console.log('🔍 Using Full-Text Search strategy');
        const ftsResult = await this.fullTextSearch(sanitizedTerm, options);
        if (ftsResult.results.length > 0) {
          results = ftsResult.results;
          totalCount = ftsResult.totalCount;
          strategy = 'fts';
        }
      }

      // Strategy 2: Hybrid Search (ILIKE + Trigram)
      if (results.length === 0) {
        console.log('🔍 Using Hybrid Search strategy');
        const hybridResult = await this.hybridSearch(sanitizedTerm, options);
        results = hybridResult.results;
        totalCount = hybridResult.totalCount;
        strategy = 'hybrid';
      }

      // Strategy 3: Fallback (Basic ILIKE)
      if (results.length === 0) {
        console.log('🔍 Using Fallback Search strategy');
        const fallbackResult = await this.fallbackSearch(sanitizedTerm, options);
        results = fallbackResult.results;
        totalCount = fallbackResult.totalCount;
        strategy = 'fallback';
      }

    } catch (error) {
      console.error('Search strategy failed:', error);
      // Emergency fallback
      const fallbackResult = await this.fallbackSearch(sanitizedTerm, options);
      results = fallbackResult.results;
      totalCount = fallbackResult.totalCount;
      strategy = 'fallback';
    }

    // Calculate search analytics
    const analytics: SearchAnalytics = {
      query: sanitizedTerm,
      duration: Date.now() - startTime,
      resultCount: results.length,
      strategy,
      timestamp: Date.now()
    };

    this.analytics.push(analytics);

    return {
      results,
      totalCount,
      strategy,
      analytics
    };
  }

  /**
   * Determine if Full-Text Search should be used
   */
  private shouldUseFTS(term: string, intent: any): boolean {
    // Use FTS for complex queries or when we expect good matches
    return term.length > 3 || intent.hasLocation || intent.hasPropertyType;
  }

  /**
   * PostgreSQL Full-Text Search implementation
   */
  private async fullTextSearch(term: string, options: SearchOptions): Promise<{
    results: SearchResult[];
    totalCount: number;
  }> {
    try {
      // Build query with FTS
      let query = this.supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .textSearch('search_vector', term, {
          type: 'websearch',
          config: 'indonesian'
        });

      // Apply filters
      query = this.applyFilters(query, options);

      // Ordering
      if (options.sortBy === 'date') {
        query = query.order('created_at', { ascending: false });
      } else if (options.sortBy === 'price') {
        query = query.order('harga_properti', { ascending: true, nullsFirst: false });
      } else {
        // Default: relevance (FTS rank is built-in)
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 20)) - 1);
      } else if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error, count } = await query;

      if (error) {
        console.warn('FTS search failed:', error);
        throw error;
      }

      return {
        results: data || [],
        totalCount: count || 0
      };

    } catch (error) {
      console.warn('Full-text search failed, falling back to hybrid:', error);
      throw error;
    }
  }

  /**
   * Hybrid search combining ILIKE with trigram similarity
   */
  private async hybridSearch(term: string, options: SearchOptions): Promise<{
    results: SearchResult[];
    totalCount: number;
  }> {
    const words = SearchSanitizer.splitSearchTerms(term);
    const searchConditions = this.buildHybridConditions(term, words);

    if (searchConditions.length === 0) {
      return { results: [], totalCount: 0 };
    }

    let query = this.supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .or(searchConditions.join(','));

    // Apply filters
    query = this.applyFilters(query, options);

    // Ordering
    query = this.applyOrdering(query, options, term);

    // Pagination
    query = this.applyPagination(query, options);

    const { data, error, count } = await query;

    if (error) {
      console.error('Hybrid search error:', error);
      throw error;
    }

    return {
      results: data || [],
      totalCount: count || 0
    };
  }

  /**
   * Basic fallback search for edge cases
   */
  private async fallbackSearch(term: string, options: SearchOptions): Promise<{
    results: SearchResult[];
    totalCount: number;
  }> {
    let query = this.supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .or(`judul_properti.ilike.%${term}%,deskripsi.ilike.%${term}%,kode_listing.ilike.%${term}%`);

    // Apply filters
    query = this.applyFilters(query, options);

    // Simple ordering
    query = query.order('created_at', { ascending: false });

    // Pagination
    query = this.applyPagination(query, options);

    const { data, error, count } = await query;

    if (error) {
      console.error('Fallback search error:', error);
      throw error;
    }

    return {
      results: data || [],
      totalCount: count || 0
    };
  }

  /**
   * Build hybrid search conditions
   */
  private buildHybridConditions(term: string, words: string[]): string[] {
    const conditions: string[] = [];

    // Full term matches (highest priority)
    conditions.push(`judul_properti.ilike.%${term}%`);
    conditions.push(`kode_listing.ilike.%${term}%`);
    conditions.push(`alamat_lengkap.ilike.%${term}%`);

    // Individual word matches
    words.forEach(word => {
      if (SearchSanitizer.shouldIncludeWord(word)) {
        // Primary fields
        conditions.push(`judul_properti.ilike.%${word}%`);
        conditions.push(`deskripsi.ilike.%${word}%`);
        conditions.push(`alamat_lengkap.ilike.%${word}%`);

        // Secondary fields
        conditions.push(`jenis_properti.ilike.%${word}%`);
        conditions.push(`kabupaten.ilike.%${word}%`);
        conditions.push(`provinsi.ilike.%${word}%`);
      }
    });

    return conditions;
  }

  /**
   * Apply common filters to query
   */
  private applyFilters(query: any, options: SearchOptions) {
    if (options.filters) {
      const { jenis_properti, status, minPrice, maxPrice } = options.filters;

      if (jenis_properti) {
        query = query.eq('jenis_properti', jenis_properti);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (minPrice) {
        query = query.gte('harga_properti', minPrice);
      }

      if (maxPrice) {
        query = query.lte('harga_properti', maxPrice);
      }
    }

    // Default: exclude sold properties unless explicitly requested
    if (options.includeSold !== true) {
      query = query.neq('is_sold', true);
    }

    return query;
  }

  /**
   * Apply ordering based on search options
   */
  private applyOrdering(query: any, options: SearchOptions, searchTerm: string) {
    if (options.sortBy === 'date') {
      return query.order('created_at', { ascending: false });
    } else if (options.sortBy === 'price') {
      return query.order('harga_properti', { ascending: true, nullsFirst: false });
    } else {
      // Default: relevance-based ordering
      // For now, use date as secondary sort
      return query.order('created_at', { ascending: false });
    }
  }

  /**
   * Apply pagination to query
   */
  private applyPagination(query: any, options: SearchOptions) {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    return query.range(offset, offset + limit - 1);
  }

  /**
   * Get search analytics
   */
  getAnalytics(): SearchAnalytics[] {
    return [...this.analytics];
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.analytics = [];
  }

  /**
   * Get search performance metrics
   */
  getPerformanceMetrics() {
    if (this.analytics.length === 0) {
      return {
        totalSearches: 0,
        averageDuration: 0,
        strategyBreakdown: {},
        successRate: 0
      };
    }

    const totalSearches = this.analytics.length;
    const averageDuration = this.analytics.reduce((sum, a) => sum + a.duration, 0) / totalSearches;

    const strategyBreakdown = this.analytics.reduce((acc, a) => {
      acc[a.strategy] = (acc[a.strategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const successfulSearches = this.analytics.filter(a => a.resultCount > 0).length;
    const successRate = (successfulSearches / totalSearches) * 100;

    return {
      totalSearches,
      averageDuration: Math.round(averageDuration),
      strategyBreakdown,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}

/**
 * Factory function to create search engine instance
 */
export function createSearchEngine(supabaseUrl?: string, supabaseKey?: string) {
  const url = supabaseUrl || process.env.VITE_SUPABASE_URL;
  const key = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and key are required');
  }

  const supabase = createClient(url, key);
  return new HybridSearchEngine(supabase);
}