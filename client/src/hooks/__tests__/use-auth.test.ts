import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../use-auth';
import { authService } from '../../lib/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock auth service
jest.mock('@/lib/auth', () => ({
  authService: {
    init: jest.fn(),
    onAuthStateChange: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    isAuthenticated: jest.fn(),
    isAdmin: jest.fn(),
  },
}));

describe('useAuth Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  it('should initialize with loading state', () => {
    // Mock init to return null (no user)
    (authService.init as jest.Mock).mockResolvedValue(null);
    (authService.onAuthStateChange as jest.Mock).mockReturnValue(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle successful sign-in', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin'
    };

    // Mock init and signIn
    (authService.init as jest.Mock).mockResolvedValue(null);
    (authService.signIn as jest.Mock).mockResolvedValue(mockUser);
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.isAdmin as jest.Mock).mockReturnValue(true);
    (authService.onAuthStateChange as jest.Mock).mockReturnValue(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for init to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Perform sign-in
    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('should handle sign-out', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user'
    };

    // Mock init with user, then signOut
    (authService.init as jest.Mock).mockResolvedValue(mockUser);
    (authService.signOut as jest.Mock).mockResolvedValue(undefined);
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
    (authService.isAdmin as jest.Mock).mockReturnValue(false);
    (authService.onAuthStateChange as jest.Mock).mockReturnValue(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for init to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Perform sign-out
    await act(async () => {
      await result.current.signOut();
    });

    expect(authService.signOut).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should throw error when used outside AuthProvider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    try {
      const { result } = renderHook(() => useAuth());
      expect(result.error).toBeDefined();
    } finally {
      console.error = originalError;
    }
  });

  it('should handle auth state changes', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin'
    };

    let authStateChangeCallback: (user: any) => void = () => {};

    // Mock init and onAuthStateChange
    (authService.init as jest.Mock).mockResolvedValue(null);
    (authService.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return () => {};
    });
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.isAdmin as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for init to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Simulate auth state change
    await act(async () => {
      authStateChangeCallback(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});