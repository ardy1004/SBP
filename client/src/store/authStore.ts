import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { logger } from '@/lib/logger'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

interface AuthState {
  // User state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Tokens
  tokens: AuthTokens | null

  // Admin state
  isAdmin: boolean

  // Actions
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  refreshToken: (newTokens: AuthTokens) => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void

  // Computed properties
  hasValidToken: () => boolean
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      tokens: null,
      isAdmin: false,

      // Actions
      login: (user: User, tokens: AuthTokens) => {
        logger.info('User logged in', { userId: user.id, role: user.role })
        set({
          user,
          tokens,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isLoading: false,
        })
      },

      logout: () => {
        const state = get()
        logger.info('User logged out', { userId: state.user?.id })
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        })
      },

      refreshToken: (newTokens: AuthTokens) => {
        logger.debug('Token refreshed')
        set((state) => ({
          tokens: newTokens,
          // Update user if needed
          ...(state.user && { user: { ...state.user, updatedAt: new Date() } }),
        }))
      },

      updateUser: (userUpdate: Partial<User>) => {
        set((state) => {
          if (!state.user) return state

          const updatedUser = { ...state.user, ...userUpdate, updatedAt: new Date() }
          logger.info('User updated', { userId: updatedUser.id })
          return {
            user: updatedUser,
            isAdmin: updatedUser.role === 'admin',
          }
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Computed properties
      hasValidToken: () => {
        const state = get()
        if (!state.tokens) return false

        // Check if token is expired (with 5 minute buffer)
        const now = Date.now()
        const expiresAt = state.tokens.expiresAt * 1000 // Convert to milliseconds
        return now < (expiresAt - 5 * 60 * 1000) // 5 minutes before expiry
      },

      isTokenExpired: () => {
        const state = get()
        if (!state.tokens) return true

        const now = Date.now()
        const expiresAt = state.tokens.expiresAt * 1000
        return now >= expiresAt
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
)

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthTokens = () => useAuthStore((state) => state.tokens)

// Auth actions
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  refreshToken: state.refreshToken,
  updateUser: state.updateUser,
  setLoading: state.setLoading,
}))

// Auth utilities
export const useAuthUtils = () => useAuthStore((state) => ({
  hasValidToken: state.hasValidToken,
  isTokenExpired: state.isTokenExpired,
}))

// Initialize auth state on app start
export const initializeAuth = () => {
  const store = useAuthStore.getState()

  // Check if we have a valid token
  if (store.hasValidToken()) {
    logger.debug('Valid token found, user is authenticated')
  } else if (store.isTokenExpired()) {
    logger.info('Token expired, logging out')
    store.logout()
  }

  return store
}