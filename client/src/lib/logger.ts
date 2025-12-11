/**
 * Production-safe logger utility
 * Only logs in development mode, sends errors to monitoring in production
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

class ProductionLogger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    // In production, only log errors and warnings
    return level === 'error' || level === 'warn';
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
    }

    // Send to error monitoring service in production
    if (this.isProduction && typeof window !== 'undefined') {
      this.sendToMonitoring('error', message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Send critical errors to monitoring service
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext): void {
    try {
      // Check if Sentry is available (it's in dependencies)
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        const Sentry = (window as any).Sentry;

        if (level === 'error') {
          Sentry.captureException(new Error(message), {
            tags: { logger: 'ProductionLogger' },
            extra: context || {}
          });
        } else {
          Sentry.captureMessage(message, level as any, {
            tags: { logger: 'ProductionLogger' },
            extra: context || {}
          });
        }
      }

      // Fallback: could send to other monitoring services
      // Example: send to custom endpoint
      // this.sendToCustomEndpoint(level, message, context);
    } catch (error) {
      // Prevent logging errors from crashing the app
      console.error('Logger monitoring error:', error);
    }
  }

  // Utility method for logging API errors
  apiError(operation: string, error: any, context?: LogContext): void {
    const errorMessage = error?.message || error?.toString() || 'Unknown API error';
    this.error(`API ${operation} failed: ${errorMessage}`, {
      operation,
      ...context,
      error: {
        name: error?.name,
        message: error?.message,
        stack: this.isDevelopment ? error?.stack : undefined
      }
    });
  }

  // Utility method for logging user actions (for analytics)
  userAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, context);
  }

  // Utility method for performance logging
  performance(metric: string, value: number, context?: LogContext): void {
    this.info(`Performance: ${metric}`, { value, ...context });
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Export types for TypeScript
export type { LogLevel, LogContext };