export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details: Record<string, unknown>;
  timestamp: Date;
  name: string;
  stack?: string;
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR';
  statusCode = 400;
  timestamp = new Date();
  details: Record<string, unknown> = {};

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class DatabaseError extends Error implements AppError {
  code = 'DATABASE_ERROR';
  statusCode = 500;
  timestamp = new Date();
  details: Record<string, unknown> = {};

  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
    if (originalError) {
      this.details = { originalError: originalError.message };
    }
  }
}

export class AuthenticationError extends Error implements AppError {
  code = 'AUTHENTICATION_ERROR';
  statusCode = 401;
  timestamp = new Date();
  details: Record<string, unknown> = {};

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements AppError {
  code = 'AUTHORIZATION_ERROR';
  statusCode = 403;
  timestamp = new Date();
  details: Record<string, unknown> = {};

  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements AppError {
  code = 'NOT_FOUND_ERROR';
  statusCode = 404;
  timestamp = new Date();
  details: Record<string, unknown> = {};

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends Error implements AppError {
  code = 'NETWORK_ERROR';
  statusCode = 0;
  timestamp = new Date();
  details: Record<string, unknown> = {};

  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}