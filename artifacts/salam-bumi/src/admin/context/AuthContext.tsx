import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { logActivity } from "../utils/activityLog";
import { authApi, setToken, clearToken, getToken } from "@/lib/api-client";
import type { AdminUser } from "@/lib/api-client";

interface AuthUser {
  email: string;
  name: string;
  role: string;
  photo: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 menit

const DEFAULT_PHOTO = "https://images.salambumi.xyz/monic%20sbp.webp";

// ---------------------------------------------------------------------------
// Auth Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
  }, [inactivityTimer]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    clearTimer();
    logActivity("Logout", "Admin logged out");
    window.location.href = "/admin/login";
  }, [clearTimer]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    const timer = setTimeout(() => {
      logActivity("Auto Logout", "Session expired due to inactivity");
      clearToken();
      setUser(null);
      window.location.href = "/admin/login?reason=inactivity";
    }, INACTIVITY_TIMEOUT);
    setInactivityTimer(timer);
  }, [inactivityTimer]);

  // Restore session saat mount — verifikasi token ke API
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await authApi.verify();
        if (result.valid && result.admin) {
          setUser({
            email: result.admin.email,
            name: result.admin.name,
            role: result.admin.role,
            photo: (result.admin as AdminUser).photo || DEFAULT_PHOTO,
          });
          resetInactivityTimer();
        } else {
          // Token tidak valid → hapus dan redirect ke login
          clearToken();
        }
      } catch {
        // Jika API error (network/server), hapus token — tidak ada fallback.
        // Lebih aman paksa re-login daripada allow akses tanpa verifikasi.
        clearToken();
      }

      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (
    email: string,
    password: string,
    _rememberMe = false // parameter dipertahankan untuk kompatibilitas API, sesi diatur server-side
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await authApi.login(normalizedEmail, password);
      if (result.success && result.token) {
        setToken(result.token);
        setUser({
          email: result.admin.email,
          name: result.admin.name,
          role: result.admin.role,
          photo: result.admin.photo || DEFAULT_PHOTO,
        });
        resetInactivityTimer();
        logActivity("Login", `Admin login berhasil: ${normalizedEmail}`);
        return { success: true };
      }
      // API mengembalikan success: false tanpa throw
      return { success: false, error: "Login gagal. Periksa email dan password." };
    } catch (apiError: unknown) {
      const err = apiError as { status?: number; message?: string };
      const errorStatus = err?.status;

      if (errorStatus === 401) {
        logActivity("Login Failed", `Kredensial salah: ${normalizedEmail}`);
        return { success: false, error: "Email atau password salah." };
      }

      if (errorStatus === 403) {
        logActivity("Login Failed", `Akun tidak aktif: ${normalizedEmail}`);
        return { success: false, error: "Akun tidak aktif. Hubungi administrator." };
      }

      if (errorStatus === 429) {
        logActivity("Login Failed", `Rate limit tercapai: ${normalizedEmail}`);
        return { success: false, error: err?.message || "Terlalu banyak percobaan login. Coba lagi nanti." };
      }

      // Network error atau server error (5xx) — tidak ada fallback auth.
      // Tampilkan pesan error yang jelas kepada user.
      console.error("[Auth] Login API error:", apiError);
      logActivity("Login Failed", `API error saat login: ${normalizedEmail}`);
      return {
        success: false,
        error: "Tidak dapat terhubung ke server. Periksa koneksi internet dan coba lagi.",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
