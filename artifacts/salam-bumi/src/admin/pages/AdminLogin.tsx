import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Lock, Mail, Building2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Catatan: rate limiting di halaman ini HANYA sebagai UX hint (menampilkan pesan).
// Rate limiting yang sesungguhnya diterapkan di server (D1 login_rate_limits table).
// Client-side counter TIDAK digunakan sebagai mekanisme keamanan.

export default function AdminLogin() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cek parameter URL untuk pesan kontekstual (misal: redirect dari inactivity timeout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "inactivity") {
      setError("Sesi Anda telah berakhir karena tidak aktif. Silakan login kembali.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);

    if (result.success) {
      setLocation("/admin/dashboard");
    } else {
      // Tampilkan pesan error dari server (sudah mencantumkan info rate limit jika terkena)
      setError(result.error || "Login gagal. Periksa email dan password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1e4db7] to-[#0f2461] px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/3 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#1F2937] px-8 py-8 text-center">
            <div className="w-16 h-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-2 ring-white/10">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white font-extrabold text-2xl tracking-wide">SALAM BUMI PROPERTY</h1>
            <p className="text-[#F59E0B] text-sm mt-1 font-semibold tracking-wider uppercase">Admin Dashboard</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-gray-900 font-bold text-xl">Masuk ke Dashboard</h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-5 font-medium flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                  Email / Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@salambumi.xyz"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 border-gray-200 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    autoComplete="current-password"
                    minLength={8}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="sr-only"
                      disabled={loading}
                    />
                    <div
                      onClick={() => !loading && setRememberMe(r => !r)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        rememberMe
                          ? "bg-[#1E3A8A] border-[#1E3A8A]"
                          : "border-gray-300 bg-white group-hover:border-[#1E3A8A]"
                      }`}
                    >
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 select-none">Ingat saya <span className="text-gray-400">(7 hari)</span></span>
                </label>
                <button
                  type="button"
                  className="text-sm text-[#1E3A8A] hover:underline font-medium"
                  onClick={() => alert("Hubungi administrator untuk reset password.")}
                >
                  Lupa Password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1E3A8A] hover:bg-[#1e4db7] text-white font-bold h-12 text-base shadow-md transition-all"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memproses...</>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
            <p className="text-gray-400 text-xs">© 2026 Salam Bumi Property. Semua hak dilindungi.</p>
            <p className="text-gray-300 text-xs mt-0.5">Protected by salted SHA-256 + JWT · Rate limited</p>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Akses hanya untuk admin yang berwenang
        </p>
      </div>
    </div>
  );
}
