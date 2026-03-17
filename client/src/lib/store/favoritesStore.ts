import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites
            : [...state.favorites, id]
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((favId) => favId !== id)
        })),

      toggleFavorite: (id) => {
        const state = get();
        if (state.favorites.includes(id)) {
          state.removeFavorite(id);
        } else {
          state.addFavorite(id);
        }
      },

      isFavorite: (id) => get().favorites.includes(id),

      clearFavorites: () => set({ favorites: [] }),

      getFavoritesCount: () => get().favorites.length,
    }),
    {
      name: 'favorites-store',
    }
  )
);