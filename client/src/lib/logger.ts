/**
 * Logger Utility
 * 
 * Menggantikan console.log dengan logging yang lebih terstruktur
 * dan aman untuk production. Di production, log akan dikirim ke
 * service monitoring atau disimpan secara lokal.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isProduction: boolean;
  private logQueue: LogEntry[] = [];
  private readonly maxQueueSize = 100;

  constructor() {
    this.isProduction = import.meta.env.PROD || false;
  }

  private shouldLog(level: LogLevel): boolean {
    // Di development, log semua level
    // Di production, hanya log warn dan error
    if (!this.isProduction) return true;
    return level === 'warn' || level === 'error';
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    return `${prefix} ${message}`;
  }

  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);
    
    // Batasi ukuran queue
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift();
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    // TODO: Implementasi pengiriman log ke monitoring service
    // Contoh: Sentry, LogRocket, atau custom endpoint
    if (this.isProduction && entry.level === 'error') {
      // Kirim error ke monitoring service
      try {
        // await fetch('/api/log', { method: 'POST', body: JSON.stringify(entry) });
      } catch {
        // Silent fail - jangan infinite loop
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    
    const entry: LogEntry = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.addToQueue(entry);
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.addToQueue(entry);
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.addToQueue(entry);
    console.warn(this.formatMessage('warn', message, context));
    this.sendToMonitoring(entry);
  }

  error(message: string, errorOrContext?: Error | Record<string, unknown>, context?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    
    let error: Error | undefined;
    let ctx: Record<string, unknown> | undefined;
    
    // Handle overload: error(message, error) atau error(message, context) atau error(message, error, context)
    if (errorOrContext instanceof Error) {
      error = errorOrContext;
      ctx = context;
    } else if (errorOrContext) {
      ctx = errorOrContext;
    }
    
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context: ctx,
      error,
    };
    
    this.addToQueue(entry);
    console.error(this.formatMessage('error', message, ctx), error);
    this.sendToMonitoring(entry);
  }

  // Mendapatkan recent logs untuk debugging
  getRecentLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logQueue.filter(log => log.level === level);
    }
    return [...this.logQueue];
  }

  // Clear log queue
  clearLogs(): void {
    this.logQueue = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class untuk testing
export { Logger };
