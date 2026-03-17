import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Menangkap error di child components dan menampilkan fallback UI
 * Mencegah crash aplikasi pada kesalahan runtime
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state untuk menampilkan fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error ke logger
    logger.error('Error caught by ErrorBoundary', error, {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Update state dengan error info
    this.setState({ errorInfo });

    // Call onError callback jika disediakan
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to analytics atau error tracking service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `${error.name}: ${error.message}`,
        fatal: false,
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state jika props children berubah dan resetOnPropsChange diaktifkan
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Jika custom fallback disediakan, gunakan itu
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h2>
            
            <p className="text-gray-600 mb-6">
              Maaf, halaman yang Anda akses mengalami masalah. Silakan coba muat ulang halaman.
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <div className="text-left bg-gray-100 rounded p-4 mb-6 overflow-auto max-h-48">
                <p className="text-sm font-mono text-red-600 mb-2">
                  <strong>Error:</strong> {error.message}
                </p>
                {errorInfo && (
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.resetError}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
              <Button
                onClick={this.handleReload}
                className="flex-1"
              >
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * withErrorBoundary HOC
 * 
 * Higher-order component untuk menambahkan Error Boundary pada component
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}

/**
 * AsyncErrorBoundary
 * 
 * Error Boundary khusus untuk komponen dengan operasi async
 */
export class AsyncErrorBoundary extends ErrorBoundary {
  static defaultProps = {
    resetOnPropsChange: true,
  };
}

export default ErrorBoundary;
