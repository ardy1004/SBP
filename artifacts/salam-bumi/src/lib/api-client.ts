/**
 * Salam Bumi Property - API Client
 * Centralized client untuk semua API calls
 * 
 * Menggunakan fetch API dengan auto token injection
 * dan error handling yang konsisten
 */

const TOKEN_KEY = "sbp_admin_token";
const API_BASE = import.meta.env.VITE_API_URL || "";

// ---------------------------------------------------------------------------
// Token Management
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Base Fetch Wrapper
// ---------------------------------------------------------------------------

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { auth = false, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);
  headers.set("Content-Type", "application/json");

  // Inject auth token jika diperlukan
  if (auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...rest,
    headers,
  });

  // Handle 401 - token expired atau tidak valid → auto logout
  if (response.status === 401 && auth) {
    clearToken();
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const rawText = await response.text();
  const data = rawText
    ? (isJson ? JSON.parse(rawText) : { success: false, error: rawText })
    : { success: false, error: `HTTP ${response.status}` };

  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ success: boolean; token: string; admin: AdminUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  verify: () =>
    apiFetch<{ valid: boolean; admin: AdminUser }>("/api/auth/verify", {
      auth: true,
    }),
};

// ---------------------------------------------------------------------------
// Properties API
// ---------------------------------------------------------------------------

export const propertiesApi = {
  getAll: (params?: PropertyQueryParams) => {
    const query = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return apiFetch<{ success: boolean; data: Property[]; pagination: Pagination }>(`/api/properties${query}`);
  },

  getBySlug: (slug: string) =>
    apiFetch<{ success: boolean; data: PropertyDetail }>(`/api/properties/${slug}`),

  getById: (id: string) =>
    apiFetch<{ success: boolean; data: PropertyDetail }>(`/api/properties/${id}`),

  getRelated: (excludeId: string, type?: string, city?: string, limit: number = 4) => {
    const params = new URLSearchParams({ exclude: excludeId, limit: String(limit) });
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    return apiFetch<{ success: boolean; data: Property[] }>(`/api/properties/related?${params}`);
  },

  create: (data: Record<string, unknown>) =>
    apiFetch<{ success: boolean; id: string; slug: string }>("/api/properties", {
      method: "POST",
      auth: true,
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ success: boolean; message: string }>(`/api/properties/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/properties/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${API_BASE}/api/properties/upload-image`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Upload gagal");
    }

    return response.json() as Promise<{ success: boolean; url: string; filename: string }>;
  },
};

// ---------------------------------------------------------------------------
// Leads API
// ---------------------------------------------------------------------------

export const leadsApi = {
  create: (data: Record<string, unknown>) =>
    apiFetch<{ success: boolean; id: string; message: string }>("/api/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (params?: LeadQueryParams) => {
    const query = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return apiFetch<{ success: boolean; data: Lead[]; pagination: Pagination }>(`/api/leads${query}`, {
      auth: true,
    });
  },

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ success: boolean; message: string }>(`/api/leads/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    }),
};

// ---------------------------------------------------------------------------
// Contracts API
// ---------------------------------------------------------------------------

export const contractsApi = {
  getAll: (params?: { status?: string; type?: string }) => {
    const query = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return apiFetch<{ success: boolean; data: Contract[] }>(`/api/contracts${query}`, {
      auth: true,
    });
  },

  create: (data: Record<string, unknown>) =>
    apiFetch<{ success: boolean; id: string; contract_number: string }>("/api/contracts", {
      method: "POST",
      auth: true,
      body: JSON.stringify(data),
    }),
};

// ---------------------------------------------------------------------------
// Analytics API
// ---------------------------------------------------------------------------

export const analyticsApi = {
  getOverview: () =>
    apiFetch<{ success: boolean; data: AnalyticsData }>("/api/analytics", {
      auth: true,
    }),
};

// ---------------------------------------------------------------------------
// Health API
// ---------------------------------------------------------------------------

export const healthApi = {
  check: () =>
    apiFetch<{ status: string; timestamp: string }>("/api/healthz"),
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  photo?: string;
  whatsapp?: string;
}

export interface Property {
  id: string;
  listing_code: string;
  title: string;
  slug: string;
  purpose: string;
  property_type: string;
  price: number;
  price_rent?: number;
  old_price?: number;
  location: string;
  city: string;
  district?: string;
  province: string;
  address?: string;
  land_area: number;
  building_area: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  description?: string;
  facilities: string[];
  image?: string;
  image_count: number;
  is_premium: boolean;
  is_featured: boolean;
  is_hot: boolean;
  is_sold: boolean;
  is_choice: boolean;
  views_count: number;
  created_at: string;
}

export interface PropertyDetail extends Property {
  listing_code: string;
  slug: string;
  front_width?: number;
  legal_status?: string;
  ownership_status?: string;
  bank_name?: string;
  outstanding_amount?: number;
  environmental_status?: string;
  road_width?: number;
  selling_reason?: string;
  images: { id: string; url: string; is_primary: boolean; sort_order: number }[];
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  origin?: string;
  role: string;
  property_interest?: string;
  budget?: string;
  payment_plan?: string;
  message?: string;
  source: string;
  status: string;
  priority: string;
  notes?: string;
  last_contact?: string;
  next_followup?: string;
  created_at: string;
}

export interface Contract {
  id: string;
  contract_number: string;
  owner_name: string;
  property_title?: string;
  contract_type: string;
  fee_percent: number;
  status: string;
  signed_date?: string;
  expiry_date?: string;
  created_at: string;
}

export interface AnalyticsData {
  properties: { total: number; active: number; sold: number; by_type: { name: string; count: number }[] };
  leads: { total: number; new_today: number; by_status: Record<string, number>; by_source: { source: string; leads: number }[] };
  contracts: { by_status: { status: string; count: number }[] };
  recent_activities: { action: string; detail: string; created_at: string }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  purpose?: string;
  type?: string;
  city?: string;
  district?: string;
  province?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  status?: string;
  is_sold?: string;
  is_choice?: string;
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  source?: string;
  search?: string;
}

// Default export untuk convenience
export default {
  auth: authApi,
  properties: propertiesApi,
  leads: leadsApi,
  contracts: contractsApi,
  analytics: analyticsApi,
  health: healthApi,
};
