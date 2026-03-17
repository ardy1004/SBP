import type { AppError } from '@shared/types/errors';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

export class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errors: Array<{ error: AppError; context: ErrorContext }> = [];
  private maxErrors = 100;

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  trackError(error: AppError, context?: Partial<ErrorContext>) {
    const fullContext: ErrorContext = {
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: Date.now(),
      ...context
    };

    // Add to local buffer
    this.errors.push({ error, context: fullContext });

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Send to external service
    this.sendToExternalService(error, fullContext);

    // Send to internal API
    this.sendToInternalAPI(error, fullContext);
  }

  private sendToExternalService(error: AppError, context: ErrorContext) {
    // Sentry integration (if available)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.withScope((scope: any) => {
        scope.setTag('error_code', error.code);
        scope.setTag('status_code', error.statusCode.toString());
        scope.setContext('error_details', error.details);
        scope.setContext('error_context', context);
        (window as any).Sentry.captureException(new Error(error.message));
      });
    }

    // LogRocket integration (if available)
    if (typeof window !== 'undefined' && (window as any).LogRocket) {
      (window as any).LogRocket.captureException(new Error(error.message), {
        tags: {
          error_code: error.code,
          status_code: error.statusCode
        },
        extra: {
          details: error.details,
          context
        }
      });
    }
  }

  private sendToInternalAPI(error: AppError, context: ErrorContext) {
    if (typeof fetch === 'undefined') return;

    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          details: error.details,
          stack: error.stack
        },
        context
      })
    }).catch(err => {
      console.warn('Failed to send error to internal API:', err);
    });
  }

  getRecentErrors(limit = 10) {
    return this.errors.slice(-limit);
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byCode: {} as Record<string, number>,
      byStatusCode: {} as Record<number, number>,
      recent: this.errors.slice(-5)
    };

    this.errors.forEach(({ error }) => {
      stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1;
      stats.byStatusCode[error.statusCode] = (stats.byStatusCode[error.statusCode] || 0) + 1;
    });

    return stats;
  }
}

export const errorTracker = ErrorTrackingService.getInstance();