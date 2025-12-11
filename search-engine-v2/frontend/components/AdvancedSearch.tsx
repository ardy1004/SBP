/**
 * Advanced Search Component V2
 * Features: Auto-suggestions, Search Analytics, Enhanced UX
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, X, Clock, TrendingUp, MapPin, Home, DollarSign } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchAnalytics } from '../hooks/useSearchAnalytics';

interface SearchQuery {
  term: string;
  filters?: Record<string, any>;
  timestamp: number;
  source: string;
}

interface AdvancedSearchProps {
  onSearch: (query: SearchQuery) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  enableAnalytics?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AdvancedSearch({
  onSearch,
  placeholder = "Cari properti impian Anda...",
  showSuggestions = true,
  enableAnalytics = true,
  className = "",
  size = 'md'
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { trackSearch, getSuggestions, searchHistory, popularSearches } = useSearchAnalytics();

  // Size configurations
  const sizeConfig = {
    sm: {
      input: 'h-10 text-sm px-3',
      button: 'h-10 w-10',
      icon: 'h-4 w-4'
    },
    md: {
      input: 'h-12 text-base px-4',
      button: 'h-12 w-12',
      icon: 'h-5 w-5'
    },
    lg: {
      input: 'h-14 text-lg px-6',
      button: 'h-14 w-14',
      icon: 'h-6 w-6'
    }
  };

  const config = sizeConfig[size];

  // Search suggestions based on history and popularity
  const suggestions = useMemo(() => {
    if (!showSuggestions || !query.trim()) return [];

    const term = query.toLowerCase().trim();
    const historyMatches = searchHistory
      .filter(event => event.term.toLowerCase().includes(term))
      .map(event => event.term)
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 3);

    const popularMatches = popularSearches
      .filter(search => search.toLowerCase().includes(term))
      .slice(0, 2);

    return [...historyMatches, ...popularMatches];
  }, [query, showSuggestions, searchHistory, popularSearches]);

  // Detect search intent for smart suggestions
  const searchIntent = useMemo(() => {
    const term = query.toLowerCase();
    return {
      hasLocation: /\b(jl|jalan|kaliurang|malioboro|ugm|sleman|yogyakarta|jogja)\b/i.test(term),
      hasPropertyType: /\b(rumah|kost|apartemen|tanah|ruko|villa|gedung)\b/i.test(term),
      hasPrice: /\b(juta|milyar|jt|m)\b/i.test(term),
      isExactCode: /^[A-Z]{1,3}\d{1,4}$/.test(term.trim())
    };
  }, [query]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);

    try {
      // Track search analytics
      if (enableAnalytics) {
        await trackSearch(searchTerm, 'advanced-search');
      }

      // Smart filter detection
      const filters: Record<string, any> = {};

      // Property type detection
      const propertyTypes = {
        'rumah': 'rumah',
        'kost': 'kost',
        'apartemen': 'apartemen',
        'tanah': 'tanah',
        'ruko': 'ruko',
        'villa': 'villa'
      };

      for (const [key, value] of Object.entries(propertyTypes)) {
        if (searchTerm.toLowerCase().includes(key)) {
          filters.jenis_properti = value;
          break;
        }
      }

      // Price range detection
      const priceMatch = searchTerm.match(/(\d+(?:\.\d+)?)\s*(juta|milyar|jt|m)/i);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        const unit = priceMatch[2].toLowerCase();

        let priceInRupiah = price;
        if (unit.includes('milyar')) {
          priceInRupiah *= 1000000000;
        } else if (unit.includes('juta') || unit.includes('jt') || unit.includes('m')) {
          priceInRupiah *= 1000000;
        }

        // Set flexible price range
        filters.minPrice = Math.max(0, priceInRupiah * 0.7);
        filters.maxPrice = priceInRupiah * 1.5;
      }

      onSearch({
        term: searchTerm,
        filters,
        timestamp: Date.now(),
        source: 'advanced-search'
      });

      // Clear focus after search
      setIsFocused(false);

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, enableAnalytics, trackSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setQuery('');
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      // Focus first suggestion (could be enhanced)
      e.preventDefault();
    }
  }, [query, handleSearch, suggestions.length]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  // Auto-focus on mount for better UX
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className={`relative w-full max-w-4xl ${className}`}>
      {/* Main Search Container */}
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-blue-300 focus-within:border-blue-500 transition-all duration-200 overflow-hidden">

        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          <Search className={config.icon} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`
            w-full ${config.input} pl-12 pr-24
            border-0 outline-none bg-transparent
            placeholder-gray-400 text-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          `}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            absolute right-0 top-0 ${config.button}
            flex items-center justify-center
            bg-gray-50 hover:bg-gray-100 border-l border-gray-200
            transition-colors duration-200
            ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}
          `}
          title="Advanced filters"
        >
          <Filter className="h-4 w-4" />
        </button>

        {/* Search Button */}
        <button
          onClick={() => handleSearch(query)}
          disabled={!query.trim() || isLoading}
          className={`
            ${config.button} bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
            text-white font-medium rounded-r-xl
            flex items-center justify-center
            transition-colors duration-200
            disabled:cursor-not-allowed
          `}
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Search Intent Indicators */}
      {query && isFocused && (
        <div className="absolute -bottom-8 left-0 flex gap-2 text-xs">
          {searchIntent.hasLocation && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              <MapPin className="h-3 w-3" />
              Lokasi
            </span>
          )}
          {searchIntent.hasPropertyType && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              <Home className="h-3 w-3" />
              Tipe
            </span>
          )}
          {searchIntent.hasPrice && (
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              <DollarSign className="h-3 w-3" />
              Harga
            </span>
          )}
          {searchIntent.isExactCode && (
            <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              <TrendingUp className="h-3 w-3" />
              Kode
            </span>
          )}
        </div>
      )}

      {/* Search Suggestions Dropdown */}
      {isFocused && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">

          {/* Current suggestions */}
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{suggestion}</div>
                <div className="text-sm text-gray-500">Pencarian populer</div>
              </div>
            </button>
          ))}

          {/* Search history */}
          {searchHistory.length > 0 && suggestions.length > 0 && (
            <div className="border-t border-gray-100" />
          )}

          {searchHistory.slice(0, 3).map((historyItem, index) => (
            <button
              key={`history-${index}`}
              onClick={() => handleSuggestionClick(historyItem.term)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{historyItem.term}</div>
                <div className="text-sm text-gray-500">
                  {historyItem.resultCount} hasil • {new Date(historyItem.timestamp).toLocaleDateString('id-ID')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
          <div className="text-sm font-medium text-gray-900 mb-3">Filter Lanjutan</div>

          {/* Quick filters could be added here */}
          <div className="text-sm text-gray-500">
            Advanced filters panel - Implementation depends on specific requirements
          </div>

          <button
            onClick={() => setShowFilters(false)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}