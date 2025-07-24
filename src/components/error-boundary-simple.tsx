import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Warning className="h-5 w-5" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  The app encountered an error and needs to be restarted. 
                  This might be related to corrupted data or storage issues.
                </AlertDescription>
              </Alert>

              {this.state.error && (
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Error details:</strong><br />
                  {this.state.error.message}
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  onClick={this.handleReset} 
                  className="w-full"
                  variant="default"
                >
                  <ArrowClockwise className="h-4 w-4 mr-2" />
                  Reset App & Clear Data
                </Button>

                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  variant="outline"
                >
                  Reload Page
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                If the error persists after reset, it may be related to browser storage limits 
                or the HTTP 431 "Request Header Fields Too Large" issue. Try accessing the app 
                in an incognito/private window.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
