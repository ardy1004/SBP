import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, type AuthUser } from '../lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  try {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state
    authService.init().then((initialUser) => {
      setUser(initialUser)
      setLoading(false)
    })

    // Listen to auth changes
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      setUser(newUser)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await authService.signIn(email, password)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  } catch (error) {
    console.error('AuthProvider: Hook called outside React context', error);
    // Fallback: return children without auth context
    return <>{children}</>;
  }
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
