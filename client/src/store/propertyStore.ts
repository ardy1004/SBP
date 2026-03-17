import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { logger } from '@/lib/logger'

export interface PropertyFilters {
  status?: 'dijual' | 'disewakan'
  type?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  minLandArea?: number
  maxLandArea?: number
  legalStatus?: string
  province?: string
  regency?: string
  keyword?: string
}

export interface RecentView {
  id: string
  title: string
  imageUrl: string
  viewedAt: Date
}

export interface ComparisonItem {
  id: string
  title: string
  imageUrl: string
  price: string
  location: string
  addedAt: Date
}

interface PropertyState {
  // Favorites
  favorites: string[]

  // Recent views
  recentViews: RecentView[]
  maxRecentViews: number

  // Comparisons
  comparisons: ComparisonItem[]
  maxComparisons: number

  // Filters
  savedFilters: Record<string, PropertyFilters>
  currentFilterPreset: string | null

  // UI State
  isFiltersOpen: boolean
  searchQuery: string

  // Actions
  addFavorite: (propertyId: string) => void
  removeFavorite: (propertyId: string) => void
  toggleFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
  clearFavorites: () => void

  addRecentView: (property: Omit<RecentView, 'viewedAt'>) => void
  clearRecentViews: () => void

  addToComparison: (property: Omit<ComparisonItem, 'addedAt'>) => void
  removeFromComparison: (propertyId: string) => void
  clearComparisons: () => void
  isInComparison: (propertyId: string) => boolean

  saveFilterPreset: (name: string, filters: PropertyFilters) => void
  loadFilterPreset: (name: string) => PropertyFilters | null
  deleteFilterPreset: (name: string) => void
  setCurrentFilterPreset: (name: string | null) => void

  setFiltersOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      // Initial state
      favorites: [],
      recentViews: [],
      maxRecentViews: 10,
      comparisons: [],
      maxComparisons: 4,
      savedFilters: {},
      currentFilterPreset: null,
      isFiltersOpen: false,
      searchQuery: '',

      // Favorites actions
      addFavorite: (propertyId: string) => {
        set((state) => {
          if (!state.favorites.includes(propertyId)) {
            logger.info('Added property to favorites', { propertyId })
            return { favorites: [...state.favorites, propertyId] }
          }
          return state
        })
      },

      removeFavorite: (propertyId: string) => {
        set((state) => {
          logger.info('Removed property from favorites', { propertyId })
          return { favorites: state.favorites.filter(id => id !== propertyId) }
        })
      },

      toggleFavorite: (propertyId: string) => {
        const state = get()
        if (state.isFavorite(propertyId)) {
          state.removeFavorite(propertyId)
        } else {
          state.addFavorite(propertyId)
        }
      },

      isFavorite: (propertyId: string) => {
        return get().favorites.includes(propertyId)
      },

      clearFavorites: () => {
        logger.info('Cleared all favorites')
        set({ favorites: [] })
      },

      // Recent views actions
      addRecentView: (property) => {
        set((state) => {
          const newView: RecentView = {
            ...property,
            viewedAt: new Date(),
          }

          // Remove if already exists, then add to front
          const filteredViews = state.recentViews.filter(view => view.id !== property.id)
          const updatedViews = [newView, ...filteredViews].slice(0, state.maxRecentViews)

          logger.debug('Added recent view', { propertyId: property.id })
          return { recentViews: updatedViews }
        })
      },

      clearRecentViews: () => {
        logger.info('Cleared recent views')
        set({ recentViews: [] })
      },

      // Comparison actions
      addToComparison: (property) => {
        set((state) => {
          if (state.comparisons.length >= state.maxComparisons) {
            logger.warn('Cannot add to comparison: maximum limit reached', {
              current: state.comparisons.length,
              max: state.maxComparisons
            })
            return state
          }

          if (state.isInComparison(property.id)) {
            logger.warn('Property already in comparison', { propertyId: property.id })
            return state
          }

          const newItem: ComparisonItem = {
            ...property,
            addedAt: new Date(),
          }

          logger.info('Added property to comparison', { propertyId: property.id })
          return { comparisons: [...state.comparisons, newItem] }
        })
      },

      removeFromComparison: (propertyId: string) => {
        set((state) => {
          logger.info('Removed property from comparison', { propertyId })
          return { comparisons: state.comparisons.filter(item => item.id !== propertyId) }
        })
      },

      clearComparisons: () => {
        logger.info('Cleared all comparisons')
        set({ comparisons: [] })
      },

      isInComparison: (propertyId: string) => {
        return get().comparisons.some(item => item.id === propertyId)
      },

      // Filter preset actions
      saveFilterPreset: (name: string, filters: PropertyFilters) => {
        set((state) => {
          logger.info('Saved filter preset', { name })
          return {
            savedFilters: { ...state.savedFilters, [name]: filters }
          }
        })
      },

      loadFilterPreset: (name: string) => {
        const state = get()
        return state.savedFilters[name] || null
      },

      deleteFilterPreset: (name: string) => {
        set((state) => {
          const newFilters = { ...state.savedFilters }
          delete newFilters[name]
          logger.info('Deleted filter preset', { name })
          return { savedFilters: newFilters }
        })
      },

      setCurrentFilterPreset: (name: string | null) => {
        logger.debug('Set current filter preset', { name })
        set({ currentFilterPreset: name })
      },

      // UI actions
      setFiltersOpen: (open: boolean) => {
        set({ isFiltersOpen: open })
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },
    }),
    {
      name: 'property-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        recentViews: state.recentViews,
        comparisons: state.comparisons,
        savedFilters: state.savedFilters,
        currentFilterPreset: state.currentFilterPreset,
      }),
    }
  )
)

// Selectors for better performance
export const useFavorites = () => usePropertyStore((state) => state.favorites)
export const useIsFavorite = (propertyId: string) =>
  usePropertyStore((state) => state.isFavorite(propertyId))
export const useRecentViews = () => usePropertyStore((state) => state.recentViews)
export const useComparisons = () => usePropertyStore((state) => state.comparisons)
export const useSavedFilters = () => usePropertyStore((state) => state.savedFilters)
export const useSearchQuery = () => usePropertyStore((state) => state.searchQuery)
export const useFiltersOpen = () => usePropertyStore((state) => state.isFiltersOpen)