import React, { Component, ErrorInfo, ReactNode } from 'react';
import { isValidElement } from '@/utils/refs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  silent?: boolean; // Whether to show the error UI or just suppress the error
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch React component errors
 * and prevent them from crashing the entire application
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // For DOM or ref related errors, don't show error UI but log them
    if (error instanceof TypeError && 
        (error.message.includes('getComputedStyle') || 
         error.message.includes('not of type \'Element\'') ||
         error.message.includes('read property') ||
         error.message.includes('undefined') ||
         error.message.includes('null'))) {
      // We still return an error state, but with a special flag for silent handling
      console.warn('Non-critical UI error suppressed:', error.message);
      return {
        hasError: true,
        error: error
      };
    }
    
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    if (!this.props.silent) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Record error in our custom error logger if available
    if (window.__safeErrorReport) {
      window.__safeErrorReport('react-boundary', error.message, {
        componentStack: errorInfo.componentStack
      });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // For DOM-related errors in silent mode, render children anyway
      if (this.props.silent || 
          (this.state.error instanceof TypeError && 
           (this.state.error.message.includes('getComputedStyle') || 
            this.state.error.message.includes('not of type \'Element\'') ||
            this.state.error.message.includes('read property') ||
            this.state.error.message.includes('undefined') ||
            this.state.error.message.includes('null')))) {
        // For these common React DOM errors, try to continue rendering
        // to avoid completely breaking the UI
        return this.props.children;
      }
      
      // Render fallback UI if provided, otherwise render default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 rounded bg-red-50 border border-red-200">
          <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
          <p className="mt-1 text-sm text-red-600">
            An error occurred in a UI component. Try refreshing the page.
          </p>
          <button
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

/**
 * Silent error boundary component that doesn't show errors
 * Useful for components that might have transient/non-critical errors
 */
export function SilentErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary silent>{children}</ErrorBoundary>;
}

export default ErrorBoundary; 