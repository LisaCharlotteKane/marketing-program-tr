import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowClockwise, Warning } from "@phosphor-icons/react";

interface DataErrorProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  hideRetry?: boolean;
}

/**
 * Component to display when there's an error loading or saving data
 */
export function DataError({
  message = "Unable to load campaign data",
  onRetry,
  retryLabel = "Try Again",
  hideRetry = false
}: DataErrorProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <Warning className="h-4 w-4" />
      <AlertTitle>Data Error</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{message}</p>
        {!hideRetry && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="flex items-center gap-2 mt-2"
          >
            <ArrowClockwise className="h-4 w-4" /> {retryLabel}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Component to show when sync is in progress
 */
export function SyncingIndicator({
  message = "Syncing campaign data with other users..."
}) {
  return (
    <Alert className="my-4 bg-blue-50 border-blue-200">
      <ArrowClockwise className="h-4 w-4 text-blue-500 animate-spin" />
      <AlertTitle className="text-blue-700">Syncing Data</AlertTitle>
      <AlertDescription className="text-blue-600">
        {message}
      </AlertDescription>
    </Alert>
  );
}