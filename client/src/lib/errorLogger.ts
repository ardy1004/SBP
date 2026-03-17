/**
 * Error Logging Utility
 * 
 * Centralized error logging with support for:
 * - Console logging (development)
 * - External services (Sentry, LogRocket, etc.)
 * - Error categorization
 * - User context tracking
 * - Breadcrumb trails
 */

import { logger } from './logger';

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// Error category for grouping similar errors
export type ErrorCategory = 
  | 'api'           // API/Network errors
  | 'auth'          // Authentication errors
  | 'database'      // Database errors
  | 'validation'    // Form validation errors
  | 'render'        // React render errors
  | 'runtime'       // Runtime JavaScript errors
  | 'business'      // Business logic errors
  | 'unknown';      // Uncategorized errors

// Error context for debugging
export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  component?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

// Error report structure
interface ErrorReport {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context: ErrorContext;
  breadcrumbs: Breadcrumb[];
}

// Breadcrumb for tracking user actions
interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

// Configuration
interface ErrorLoggerConfig {
  enableConsole: boolean;
  enableExternal: boolean;
  environment: 'development' | 'production';
  maxBreadcrumbs: number;
  sentryDsn?: string;
  filterDuplicates: boolean;
}

// Default configuration
const defaultConfig: ErrorLoggerConfig = {
  enableConsole: true,
  enableExternal: import.meta.env.PROD,
  environment: import.meta.env.PROD ? 'production' : 'development',
  maxBreadcrumbs: 20,
  filterDuplicates: true,
};

class ErrorLogger {
  private config: ErrorLoggerConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private errorCache: Set<string> = new Set();
  private userContext: ErrorContext = {};

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        error: event.reason,
        severity: 'error',
        category: 'runtime',
        message: 'Unhandled Promise Rejection',
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.logError({
        error: event.error,
        severity: 'critical',
        category: 'runtime',
        message: event.message,
      });
    });
  }

  /**
   * Set user context for all subsequent error reports
   */
  setUserContext(context: Partial<ErrorContext>): void {
    this.userContext = { ...this.userContext, ...context };
  }

  /**
   * Clear user context (e.g., on logout)
   */
  clearUserContext(): void {
    this.userContext = {};
  }

  /**
   * Add a breadcrumb
   */
  addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }
  }

  /**
   * Log an error
   */
  logError({
    error,
    severity = 'error',
    category = 'unknown',
    message,
    context = {},
  }: {
    error?: Error | unknown;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    message: string;
    context?: Partial<ErrorContext>;
  }): void {
    const errorId = this.generateErrorId();
    
    // Extract error details
    const errorDetails = this.extractErrorDetails(error);
    
    // Create error report
    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      severity,
      category,
      message,
      stack: errorDetails.stack,
      context: {
        ...this.userContext,
        ...context,
      },
      breadcrumbs: [...this.breadcrumbs],
    };

    // Check for duplicates
    if (this.config.filterDuplicates) {
      const errorKey = `${category}:${message}:${errorDetails.stack}`;
      if (this.errorCache.has(errorKey)) {
        return;
      }
      this.errorCache.add(errorKey);
      
      // Clear cache after 5 minutes
      setTimeout(() => this.errorCache.delete(errorKey), 5 * 60 * 1000);
    }

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(report, errorDetails);
    }

    // Log to external service
    if (this.config.enableExternal) {
      this.logToExternal(report);
    }

    // Use existing logger as fallback
    logger.error(message, {
      error: errorDetails,
      category,
      severity,
      context: report.context,
    });
  }

  /**
   * Log API error
   */
  logApiError(error: Error, endpoint: string, method: string, statusCode?: number): void {
    this.logError({
      error,
      severity: statusCode && statusCode >= 500 ? 'critical' : 'error',
      category: 'api',
      message: `API Error: ${method} ${endpoint}`,
      context: {
        action: 'api_request',
        metadata: {
          endpoint,
          method,
          statusCode,
        },
      },
    });
  }

  /**
   * Log authentication error
   */
  logAuthError(error: Error, action: string): void {
    this.logError({
      error,
      severity: 'warning',
      category: 'auth',
      message: `Auth Error: ${action}`,
      context: {
        action,
      },
    });
  }

  /**
   * Log validation error
   */
  logValidationError(errors: Record<string, string>, formName: string): void {
    this.logError({
      severity: 'info',
      category: 'validation',
      message: `Validation Error: ${formName}`,
      context: {
        action: 'form_validation',
        metadata: { errors, formName },
      },
    });
  }

  /**
   * Log React component error
   */
  logComponentError(error: Error, componentName: string, errorInfo?: { componentStack: string }): void {
    this.logError({
      error,
      severity: 'error',
      category: 'render',
      message: `Component Error: ${componentName}`,
      context: {
        component: componentName,
        metadata: {
          componentStack: errorInfo?.componentStack,
        },
      },
    });
  }

  /**
   * Extract error details
   */
  private extractErrorDetails(error: unknown): { message: string; stack?: string; name?: string } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'string') {
      return { message: error };
    }

    if (typeof error === 'object' && error !== null) {
      return {
        message: (error as { message?: string }).message || 'Unknown error object',
      };
    }

    return { message: 'Unknown error' };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log to console
   */
  private logToConsole(report: ErrorReport, errorDetails: { message: string; stack?: string }): void {
    const styles = {
      info: 'color: #3b82f6',
      warning: 'color: #f59e0b',
      error: 'color: #ef4444',
      critical: 'color: #dc2626; font-weight: bold',
    };

    console.group(`%c[${report.severity.toUpperCase()}] ${report.category}`, styles[report.severity]);
    console.log('Error ID:', report.id);
    console.log('Message:', report.message);
    console.log('Error:', errorDetails.message);
    if (errorDetails.stack) {
      console.log('Stack:', errorDetails.stack);
    }
    console.log('Context:', report.context);
    console.log('Breadcrumbs:', report.breadcrumbs);
    console.groupEnd();
  }

  /**
   * Log to external service (placeholder for Sentry, LogRocket, etc.)
   */
  private logToExternal(report: ErrorReport): void {
    // TODO: Integrate with Sentry
    // Sentry.captureException(new Error(report.message), {
    //   level: report.severity,
    //   tags: { category: report.category },
    //   user: report.context.userId ? { id: report.context.userId } : undefined,
    //   extra: {
    //     breadcrumbs: report.breadcrumbs,
    //     ...report.context.metadata,
    //   },
    // });

    // TODO: Send to custom logging endpoint
    // fetch('/api/log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report),
    // }).catch(() => {});
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// React error boundary handler
export function captureReactError(error: Error, errorInfo: { componentStack: string }): void {
  // Extract component name from stack trace
  const componentMatch = error.stack?.match(/at ([A-Za-z0-9_]+) \(/);
  const componentName = componentMatch?.[1] || 'Unknown Component';
  
  errorLogger.logComponentError(error, componentName, errorInfo);
}

// API error handler
export function captureApiError(error: unknown, endpoint: string, method: string, statusCode?: number): void {
  if (error instanceof Error) {
    errorLogger.logApiError(error, endpoint, method, statusCode);
  } else {
    errorLogger.logError({
      message: `API Error: ${method} ${endpoint}`,
      severity: 'error',
      category: 'api',
      context: {
        metadata: {
          endpoint,
          method,
          statusCode,
          error,
        },
      },
    });
  }
}

// Export default
export default errorLogger;