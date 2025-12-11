/**
 * Search Analytics Hook
 * Tracks search behavior and provides intelligent suggestions
 */

import { useCallback, useEffect, useState, useMemo } from 'react';

interface SearchEvent {
  term: string;
  resultCount: number;
  duration: number;
  timestamp: number;
  source: string;
  filters?: Record<string, any>;
}

interface PopularSearch {
  term: string;
  count: number;
  lastUsed: number;
}

export function useSearchAnalytics() {
  const [searchHistory, setSearchHistory] = useState<SearchEvent[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('search-analytics-history');
      const savedPopular = localStorage.getItem('search-analytics-popular');

      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
      }

      if (savedPopular) {
        const popular = JSON.parse(savedPopular);
        setPopularSearches(popular);
      }
    } catch (error) {
      console.warn('Failed to load search analytics from localStorage:', error);
    }

    // Initialize with default popular searches if empty
    if (popularSearches.length === 0) {
      setPopularSearches([
        'rumah jogja',
        'tanah sleman',
        'apartemen yogyakarta',
        'ruko malioboro',
        'kost ugm',
        'villa jogja',
        'tanah bantul',
        'rumah jl kaliurang'
      ]);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem('search-analytics-history', JSON.stringify(searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, [searchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('search-analytics-popular', JSON.stringify(popularSearches));
    } catch (error) {
      console.warn('Failed to save popular searches:', error);
    }
  }, [popularSearches]);

  // Track a search event
  const trackSearch = useCallback(async (
    term: string,
    source: string,
    resultCount = 0,
    duration = 0,
    filters?: Record<string, any>
  ) => {
    const event: SearchEvent = {
      term: term.trim(),
      resultCount,
      duration,
      timestamp: Date.now(),
      source,
      filters
    };

    setSearchHistory(prev => {
      const updated = [event, ...prev.slice(0, 99)]; // Keep last 100 searches
      return updated;
    });

    // Update popular searches
    setPopularSearches(prev => {
      const termLower = term.toLowerCase().trim();
      const existingIndex = prev.findIndex(s => s.toLowerCase() === termLower);

      if (existingIndex >= 0) {
        // Move to front and increment count
        const updated = [...prev];
        const [item] = updated.splice(existingIndex, 1);
        updated.unshift(item);
        return updated.slice(0, 20); // Keep top 20
      } else {
        // Add new term to front
        return [term, ...prev.slice(0, 19)];
      }
    });

    // Send to analytics service if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: term,
        custom_parameter_1: source,
        custom_parameter_2: resultCount,
        custom_parameter_3: duration,
        custom_map: filters
      });
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Search tracked:', {
        term,
        source,
        resultCount,
        duration,
        filters
      });
    }
  }, []);

  // Get search suggestions based on history and popularity
  const getSuggestions = useCallback((partial: string): string[] => {
    const term = partial.toLowerCase().trim();
    if (!term) {
      return popularSearches.slice(0, 5);
    }

    // Filter history by partial matches
    const historyMatches = searchHistory
      .filter(event => event.term.toLowerCase().includes(term))
      .map(event => event.term)
      .filter((value, index, self) => self.indexOf(value) === index) // Unique
      .slice(0, 3);

    // Filter popular searches
    const popularMatches = popularSearches
      .filter(search => search.toLowerCase().includes(term))
      .slice(0, 2);

    return [...historyMatches, ...popularMatches];
  }, [searchHistory, popularSearches]);

  // Get search statistics
  const getSearchStats = useMemo(() => {
    const totalSearches = searchHistory.length;
    const averageResults = totalSearches > 0
      ? searchHistory.reduce((sum, event) => sum + event.resultCount, 0) / totalSearches
      : 0;

    const averageDuration = totalSearches > 0
      ? searchHistory.reduce((sum, event) => sum + event.duration, 0) / totalSearches
      : 0;

    const sourceBreakdown = searchHistory.reduce((acc, event) => {
      acc[event.source] = (acc[event.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSearches,
      averageResults: Math.round(averageResults * 100) / 100,
      averageDuration: Math.round(averageDuration),
      sourceBreakdown,
      popularSearches: popularSearches.slice(0, 10)
    };
  }, [searchHistory, popularSearches]);

  // Clear all analytics data
  const clearAnalytics = useCallback(() => {
    setSearchHistory([]);
    setPopularSearches([]);
    try {
      localStorage.removeItem('search-analytics-history');
      localStorage.removeItem('search-analytics-popular');
    } catch (error) {
      console.warn('Failed to clear analytics from localStorage:', error);
    }
  }, []);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    return {
      searchHistory,
      popularSearches,
      stats: getSearchStats,
      exportDate: new Date().toISOString()
    };
  }, [searchHistory, popularSearches, getSearchStats]);

  return {
    trackSearch,
    getSuggestions,
    searchHistory,
    popularSearches,
    getSearchStats,
    clearAnalytics,
    exportAnalytics
  };
}