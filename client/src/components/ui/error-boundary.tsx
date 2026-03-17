import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { ErrorHandler } from '@/utils/errorHandler';
import { errorTracker } from '@/utils/errorTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | undefined;
  errorInfo: ErrorInfo | undefined;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined, errorInfo: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: undefined };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle with our error system
    const appError = ErrorHandler.handle(error, 'React Error Boundary');

    // Track the error
    errorTracker.trackError(appError, {
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log in development
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700">Terjadi Kesalahan</CardTitle>
            </div>
            <CardDescription>
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
              <strong>Error:</strong> {this.state.error?.message}
            </div>

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Halaman
              </Button>
            </div>

            {typeof window !== 'undefined' && (window as any).__DEV__ && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {this.state.error?.stack}
                  {'\n\nComponent Stack:\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);

    // Could integrate with error reporting service
    // reportError(error, errorInfo);
  };
};

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}