import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, WarningCircle, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StorageErrorHandlerProps {
  onRetry?: () => void;
}

export function StorageErrorHandler({ onRetry }: StorageErrorHandlerProps) {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Reset any error state
    setShowError(false);
    
    // Listen for storage error events but don't actually show them
    const handleStorageError = (event: any) => {
      // Intentionally not showing errors
      console.log("Storage error received but suppressed:", event.detail?.message);
      // Do not set showError to true to avoid displaying the error UI
    };

    window.addEventListener('storageError', handleStorageError as EventListener);
    
    return () => {
      window.removeEventListener('storageError', handleStorageError as EventListener);
    };
  }, []);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry action: reload the page
      window.location.reload();
    }
    setShowError(false);
  };

  const handleDismiss = () => {
    setShowError(false);
  };

  if (!showError) {
    return null;
  }

  return (
    <Card className="border border-red-300 shadow-sm mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <WarningCircle className="h-5 w-5" /> Storage Error Detected
        </CardTitle>
        <CardDescription className="text-red-600">
          There was a problem loading your saved data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <WarningCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error Details</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage || "Failed to load saved data. This may be due to corrupted local storage."}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Dismiss
          </Button>
          <Button 
            onClick={handleRetry}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
          >
            <ArrowClockwise className="h-4 w-4" /> Retry Loading
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}