import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { authService } from "./auth";
import { logger } from "./logger";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const session = authService.getCurrentSession();
  const supabaseToken = session?.access_token;
  const adminToken = localStorage.getItem('adminToken');

  // Use absolute URL for production, relative for development
  const isProduction = typeof window !== 'undefined' && window.location.hostname === 'salambumi.xyz';
  const baseUrl = isProduction ? 'https://salambumi.xyz' : (import.meta.env['VITE_API_BASE_URL'] as string || '');
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const headers: HeadersInit = data instanceof FormData ? {} : (data ? { "Content-Type": "application/json" } : {});

  // Use admin token for admin endpoints, supabase token for others
  if (url.includes('/api/admin/') && adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  } else if (supabaseToken) {
    headers["Authorization"] = `Bearer ${supabaseToken}`;
  }

  logger.debug('API Request', { method, url: fullUrl, hasData: !!data });

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    credentials: "same-origin",
  });

  logger.debug('API Response', { status: res.status, url: fullUrl });

  await throwIfResNotOk(res);

  // Handle empty response body
  const contentLength = res.headers.get('content-length');
  const contentType = res.headers.get('content-type');

  // For PUT requests that return empty body, return success indicator
  if (method === 'PUT' && (!contentLength || contentLength === '0')) {
    logger.debug('PUT request with empty response body - assuming success', { url: fullUrl });
    return { success: true };
  }

  // Check if response is JSON by content-type, not content-length (which can be null)
  if (!contentType?.includes('application/json')) {
    logger.debug('Non-JSON response, returning empty object', { contentType, url: fullUrl });
    return {};
  }

  const responseText = await res.text();

  if (!responseText.trim()) {
    logger.debug('Empty response text, returning empty object', { url: fullUrl });
    return {};
  }

  try {
    const jsonResponse = JSON.parse(responseText);
    logger.debug('API Response parsed successfully', { url: fullUrl, hasData: !!jsonResponse });
    return jsonResponse;
  } catch (error) {
    logger.apiError('JSON parsing failed', error as Error, { url: fullUrl, responseText: responseText.substring(0, 100) });
    throw new Error(`Invalid JSON response: ${responseText}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const session = authService.getCurrentSession();
    const supabaseToken = session?.access_token;
    const adminToken = localStorage.getItem('adminToken');
    const headers: HeadersInit = {};

    // If queryKey has a single item, use it as-is (it's a complete URL)
    // Otherwise join with "/" for hierarchical paths
    const url = queryKey.length === 1 ? queryKey[0] as string : queryKey.join("/") as string;

    // Use absolute URL for production, relative for development
    const isProduction = typeof window !== 'undefined' && window.location.hostname === 'salambumi.xyz';
    const baseUrl = isProduction ? 'https://salambumi.xyz' : (import.meta.env['VITE_API_BASE_URL'] as string || '');
    logger.debug('Environment detection', { hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR', isProduction, baseUrl });
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // Use admin token for admin endpoints, supabase token for others
    if (url.includes('/api/admin/') && adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    } else if (supabaseToken) {
      headers["Authorization"] = `Bearer ${supabaseToken}`;
    }

    const res = await fetch(fullUrl, {
      credentials: "same-origin",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
