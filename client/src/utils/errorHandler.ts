import type { AppError } from '@shared/types/errors';
import { ValidationError, DatabaseError, AuthenticationError, AuthorizationError, NotFoundError, NetworkError } from '@shared/types/errors';

export class ErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    if (error instanceof ValidationError ||
        error instanceof DatabaseError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError ||
        error instanceof NetworkError) {
      return error;
    }

    if (error instanceof Error) {
      // Convert to DatabaseError for unknown errors
      const appError = new DatabaseError(error.message);
      appError.details = { originalError: error.message, stack: error.stack };
      return appError;
    }

    // Unknown error type
    const dbError = new DatabaseError('An unexpected error occurred');
    dbError.details = { originalError: error };
    return dbError;
  }

  static log(error: AppError, context?: string): void {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      context,
      details: error.details,
      stack: error.stack
    };

    // Log to console in development
    if (process.env['NODE_ENV'] === 'development') {
      console.error('Error logged:', logData);
    }

    // In production, send to error reporting service
    // Example: Sentry, LogRocket, etc.
    // errorReporting.captureException(error, { extra: logData });
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof ValidationError ||
        error instanceof DatabaseError ||
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError ||
        error instanceof NetworkError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred';
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'AUTHENTICATION_ERROR':
        return 'Please log in to continue.';
      case 'AUTHORIZATION_ERROR':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND_ERROR':
        return 'The requested resource was not found.';
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'DATABASE_ERROR':
      default:
        return 'Something went wrong. Please try again later.';
    }
  }

  static isRetryable(error: AppError): boolean {
    return error.code === 'NETWORK_ERROR' || error.statusCode >= 500;
  }

  static getRetryDelay(error: AppError, attempt: number): number {
    if (!this.isRetryable(error)) return 0;

    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd

    return baseDelay + jitter;
  }
}