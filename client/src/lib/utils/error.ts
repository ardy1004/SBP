// Standardized error handling utilities

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  originalError?: unknown;
}

// Create standardized error object
export function createAppError(
  message: string,
  code?: string,
  statusCode?: number,
  originalError?: unknown
): AppError {
  return {
    message,
    code,
    statusCode,
    originalError
  };
}

// Handle API errors consistently
export function handleApiError(error: unknown, context: string): AppError {
  if (error instanceof Error) {
    // Network or other errors
    if (error.message.includes('fetch')) {
      return createAppError(
        `Gagal terhubung ke server. Periksa koneksi internet Anda.`,
        'NETWORK_ERROR',
        0,
        error
      );
    }

    // API response errors
    if (error.message.includes('API error')) {
      const statusMatch = error.message.match(/API error: (\d+)/);
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500;

      let userMessage = 'Terjadi kesalahan pada server.';
      if (statusCode === 404) {
        userMessage = 'Data tidak ditemukan.';
      } else if (statusCode === 403) {
        userMessage = 'Akses ditolak.';
      } else if (statusCode === 429) {
        userMessage = 'Terlalu banyak permintaan. Coba lagi nanti.';
      }

      return createAppError(userMessage, 'API_ERROR', statusCode, error);
    }

    return createAppError(
      `Terjadi kesalahan: ${error.message}`,
      'UNKNOWN_ERROR',
      500,
      error
    );
  }

  // Handle non-Error objects
  return createAppError(
    'Terjadi kesalahan yang tidak diketahui.',
    'UNKNOWN_ERROR',
    500,
    error
  );
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = handleApiError(error, context);
    return { data: null, error: appError };
  }
}

// Log error for debugging (only in development)
export function logError(error: AppError, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[${context || 'App'}] Error:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      originalError: error.originalError
    });
  }
}

// Handle React Query errors
export function handleQueryError(error: unknown): string {
  const appError = handleApiError(error, 'query');
  return appError.message;
}