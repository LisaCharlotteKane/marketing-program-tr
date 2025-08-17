import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";
import { clearAllAppData } from "@/lib/cookie-cleanup";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  lastErrorTime: number | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const now = Date.now();
    return {
      hasError: true,
      error,
      errorCount: 1,
      lastErrorTime: now
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Track error frequency
    const now = Date.now();
    const timeSinceLastError = this.state.lastErrorTime ? now - this.state.lastErrorTime : Infinity;
    
    // If errors are happening frequently (within 30 seconds), increase error count
    if (timeSinceLastError < 30000) {
      this.setState(prevState => ({
        errorCount: prevState.errorCount + 1,
        lastErrorTime: now
      }));
    } else {
      this.setState({
        errorCount: 1,
        lastErrorTime: now
      });
    }
    
    // If too many errors, suggest storage cleanup
    if (this.state.errorCount >= 3) {
      console.warn('Multiple errors detected - storage corruption may be causing issues');
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: null
    });
  };

  handleClearStorageAndReset = async (): Promise<void> => {
    try {
      // Clear all app data to recover from potential storage corruption
      const result = clearAllAppData();
      if (result.success || !result.error) {
        // Reset error boundary state
        this.resetErrorBoundary();
        // Reload the page to start fresh
        window.location.reload();
      } else {
        console.error('Storage cleanup failed:', result.message);
      }
    } catch (error) {
      console.error('Error during storage cleanup:', error);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isFrequentError = this.state.errorCount >= 3;

      return (
        <Alert variant="destructive" className="my-8">
          <WarningCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p className="text-sm text-destructive/80 mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              
              {isFrequentError && (
                <div className="mb-4 p-3 bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive/90 mb-2">
                    Multiple errors detected. This might be caused by corrupted storage data.
                  </p>
                  <p className="text-xs text-destructive/70">
                    Consider clearing app data to resolve persistent issues.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={this.resetErrorBoundary}
                  className="flex items-center gap-2"
                >
                  <ArrowClockwise className="h-4 w-4" />
                  Try Again
                </Button>
                
                {isFrequentError && (
                  <Button 
                    variant="destructive" 
                    onClick={this.handleClearStorageAndReset}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    Clear Data & Restart
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}