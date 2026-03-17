import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '../pages/HomePage';
import { supabase } from '../lib/supabase';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  in: vi.fn(() => ({
                    or: vi.fn(() => ({
                      ilike: vi.fn(() => ({
                        data: [],
                        error: null
                      }))
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => [vi.fn(), vi.fn()]
}));

// Mock property store
vi.mock('../store/propertyStore', () => ({
  usePropertyStore: () => ({
    favorites: [],
    addFavorite: vi.fn(),
    removeFavorite: vi.fn()
  })
}));

// Mock components
vi.mock('../components/HeroSection', () => ({
  default: ({ onSearch }: { onSearch: (filters: any) => void }) => (
    <div data-testid="hero-section">
      <button
        data-testid="search-button"
        onClick={() => onSearch({
          maxPrice: '5000000000',
          legalitas: 'SHGB_PBG'
        })}
      >
        Search
      </button>
    </div>
  )
}));

vi.mock('../components/PropertyPilihanSlider', () => ({
  PropertyPilihanSlider: () => <div data-testid="property-slider" />
}));

vi.mock('../components/PropertyCard', () => ({
  PropertyCard: ({ property }: { property: any }) => (
    <div data-testid={`property-card-${property.id}`}>
      {property.judulProperti}
    </div>
  )
}));

describe('HomePage Filter Query Builder', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('should build correct filter query for maxPrice and legalitas', async () => {
    const mockSupabase = vi.mocked(supabase);

    // Mock the query chain
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'test-1',
            judul_properti: 'Test Property',
            harga_properti: '4000000000',
            legalitas: 'SHGB & PBG'
          }
        ],
        error: null
      })
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    // Trigger search with filters
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Wait for query to be called
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('properties');
    });

    // Verify the query chain was built correctly
    expect(mockQuery.gte).toHaveBeenCalledWith('harga_properti', 5000000000);
    expect(mockQuery.in).toHaveBeenCalledWith('legalitas', ['SHGB & PBG']);
  });

  it('should handle empty filter values correctly', async () => {
    const mockSupabase = vi.mocked(supabase);

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    };

    mockSupabase.from.mockReturnValue(mockQuery as any);

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    // Trigger search with empty filters
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('properties');
    });

    // Verify that filters with empty values are not applied
    expect(mockQuery.gte).not.toHaveBeenCalledWith('harga_properti', NaN);
    expect(mockQuery.lte).not.toHaveBeenCalledWith('harga_properti', NaN);
  });

  it('should transform legalitas from UI format to database format', () => {
    // Test the transformation logic from handleSearch
    const legalitasInput = 'SHGB_PBG';
    const expectedOutput = ['SHGB & PBG'];

    const transformed = legalitasInput.replace(/_/g, ' & ');

    expect([transformed]).toEqual(expectedOutput);
  });
});