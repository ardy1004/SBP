import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface ErrorState {
  error: Error | null;
  errorInfo: string | null;
}

interface UseErrorHandlerReturn extends ErrorState {
  /**
   * Set error secara manual
   */
  setError: (error: Error | string) => void;
  
  /**
   * Clear error state
   */
  clearError: () => void;
  
  /**
   * Handle error dengan logging otomatis
   */
  handleError: (error: unknown, context?: Record<string, unknown>) => void;
  
  /**
   * Wrap async function dengan error handling
   */
  withErrorHandling: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: Record<string, unknown>
  ) => (...args: Parameters<T>) => Promise<ReturnType<T> | undefined>;
  
  /**
   * Boolean flag jika ada error
   */
  hasError: boolean;
}

/**
 * useErrorHandler Hook
 * 
 * Hook untuk menangani error di komponen dengan logging otomatis
 * 
 * @example
 * const { error, handleError, clearError, withErrorHandling } = useErrorHandler();
 * 
 * // Handle error manual
 * try {
 *   await riskyOperation();
 * } catch (err) {
 *   handleError(err, { operation: 'riskyOperation' });
 * }
 * 
 * // Wrap async function
 * const fetchData = withErrorHandling(async () => {
 *   const response = await api.get('/data');
 *   return response.data;
 * });
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    errorInfo: null,
  });

  const errorRef = useRef<ErrorState>(errorState);
  
  // Sync ref dengan state untuk access terbaru
  errorRef.current = errorState;

  const setError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    const errorInfo = errorObj.stack || null;
    
    setErrorState({
      error: errorObj,
      errorInfo,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      errorInfo: null,
    });
  }, []);

  const handleError = useCallback((error: unknown, context?: Record<string, unknown>) => {
    let errorObj: Error;
    
    if (error instanceof Error) {
      errorObj = error;
    } else if (typeof error === 'string') {
      errorObj = new Error(error);
    } else {
      errorObj = new Error('Unknown error occurred');
    }

    // Log error
    logger.error('Error handled by useErrorHandler', errorObj, context);

    // Update state
    setErrorState({
      error: errorObj,
      errorInfo: errorObj.stack || null,
    });

    // Send to analytics jika ada
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `${errorObj.name}: ${errorObj.message}`,
        fatal: false,
        ...context,
      });
    }
  }, []);

  const withErrorHandling = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      fn: T,
      context?: Record<string, unknown>
    ): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
        try {
          clearError();
          return await fn(...args);
        } catch (error) {
          handleError(error, {
            functionName: fn.name,
            args,
            ...context,
          });
          return undefined;
        }
      };
    },
    [clearError, handleError]
  );

  return {
    ...errorState,
    setError,
    clearError,
    handleError,
    withErrorHandling,
    hasError: errorState.error !== null,
  };
}

/**
 * useAsyncError Handler
 * 
 * Khusus untuk handle async operation errors dengan loading state
 */
interface UseAsyncErrorOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  resetOnSuccess?: boolean;
}

interface UseAsyncErrorReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  execute: (...args: any[]) => Promise<T | undefined>;
  reset: () => void;
}

export function useAsyncError<T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncErrorOptions = {}
): UseAsyncErrorReturn<T> {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const { onError, onSuccess, resetOnSuccess = true } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFn(...args);
        
        setState({
          data: result,
          error: null,
          isLoading: false,
        });

        if (onSuccess) {
          onSuccess();
        }

        if (resetOnSuccess) {
          // Optional: reset data setelah beberapa waktu
          setTimeout(() => {
            setState((prev) => ({ ...prev, data: null }));
          }, 3000);
        }

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        logger.error('Async operation failed', errorObj, { functionName: asyncFn.name });

        setState({
          data: null,
          error: errorObj,
          isLoading: false,
        });

        if (onError) {
          onError(errorObj);
        }

        return undefined;
      }
    },
    [asyncFn, onError, onSuccess, resetOnSuccess]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isError: state.error !== null,
    execute,
    reset,
  };
}

export default useErrorHandler;
