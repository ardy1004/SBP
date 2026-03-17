import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useDebounce Hook
 * 
 * Debounce value changes untuk mengurangi frekuensi update
 * Berguna untuk search input, resize handlers, dsb.
 * 
 * @param value - Value yang akan di-debounce
 * @param delay - Delay dalam milliseconds (default: 500ms)
 * @returns Debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // Hanya dipanggil setelah user berhenti mengetik selama 300ms
 *   fetchResults(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout untuk update debounced value
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout jika value berubah sebelum delay selesai
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback Hook
 * 
 * Debounce function calls untuk mengurangi frekuensi eksekusi
 * Berguna untuk event handlers seperti onChange, onScroll, onResize
 * 
 * @param callback - Function yang akan di-debounce
 * @param delay - Delay dalam milliseconds (default: 500ms)
 * @returns Debounced callback function
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 * 
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear timeout sebelumnya jika ada
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout baru
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup timeout saat unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * useDebounceLeading Hook
 * 
 * Debounce dengan leading execution (jalankan segera, lalu debounce)
 * Berguna untuk tombol submit, tombol aksi, dsb.
 * 
 * @param callback - Function yang akan di-debounce
 * @param delay - Delay dalam milliseconds (default: 500ms)
 * @returns Debounced callback function dengan leading execution
 * 
 * @example
 * const debouncedClick = useDebounceLeading(() => {
 *   handleSubmit();
 * }, 1000);
 * 
 * <button onClick={debouncedClick}>Submit</button>
 */
export function useDebounceLeading<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLeadingRef = useRef<boolean>(true);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Jika leading, jalankan segera
      if (isLeadingRef.current) {
        isLeadingRef.current = false;
        callback(...args);
      }

      // Clear timeout sebelumnya
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset leading flag setelah delay
      timeoutRef.current = setTimeout(() => {
        isLeadingRef.current = true;
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup timeout saat unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * useThrottle Hook
 * 
 * Throttle value updates untuk membatasi frekuensi update
 * Berbeda dengan debounce, throttle akan tetap update pada interval tetap
 * Berguna untuk scroll events, resize events, mouse move, dsb.
 * 
 * @param value - Value yang akan di-throttle
 * @param limit - Interval limit dalam milliseconds (default: 100ms)
 * @returns Throttled value
 * 
 * @example
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 * 
 * useEffect(() => {
 *   const handleScroll = () => setScrollY(window.scrollY);
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 */
export function useThrottle<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRanRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRanRef.current;

    if (timeSinceLastRun >= limit) {
      // Jika sudah melewati limit, update segera
      lastRanRef.current = now;
      setThrottledValue(value);
    } else {
      // Jika belum, set timeout untuk update nanti
      const timeoutId = setTimeout(() => {
        lastRanRef.current = Date.now();
        setThrottledValue(value);
      }, limit - timeSinceLastRun);

      return () => clearTimeout(timeoutId);
    }
  }, [value, limit]);

  return throttledValue;
}

/**
 * useThrottledCallback Hook
 * 
 * Throttle function calls untuk membatasi frekuensi eksekusi
 * Berguna untuk event handlers yang sering dipicu
 * 
 * @param callback - Function yang akan di-throttle
 * @param limit - Interval limit dalam milliseconds (default: 100ms)
 * @returns Throttled callback function
 * 
 * @example
 * const throttledScroll = useThrottledCallback(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  const lastRanRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRanRef.current;

      const runCallback = () => {
        lastRanRef.current = now;
        callback(...args);
      };

      if (timeSinceLastRun >= limit) {
        // Jalankan segera jika sudah melewati limit
        runCallback();
      } else if (!timeoutRef.current) {
        // Set timeout untuk eksekusi nanti
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          runCallback();
        }, limit - timeSinceLastRun);
      }
    },
    [callback, limit]
  );

  // Cleanup timeout saat unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

export default useDebounce;
