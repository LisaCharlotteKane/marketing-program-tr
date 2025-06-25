import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StorageErrorHandler({ onRetry }: { onRetry: () => void }) {
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  
  // Listen for storage errors
  React.useEffect(() => {
    const handleStorageError = (event: any) => {
      if (event.detail?.type === "storage" && event.detail?.message) {
        // Don't show GitHub API errors as they're usually just connectivity issues
        if (event.detail.message.includes("GitHub API")) {
          console.warn("GitHub API error suppressed from UI:", event.detail.message);
          return;
        }
        
        // For other storage errors, show a toast instead of a blocking error card
        toast.error("Data loading issue", {
          description: event.detail.message,
          action: {
            label: "Retry",
            onClick: onRetry
          },
          duration: 5000
        });
      }
    };
    
    window.addEventListener("app:error", handleStorageError);
    return () => window.removeEventListener("app:error", handleStorageError);
  }, [onRetry]);
  
  // Component no longer renders an error card
  return null;
}