import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, WarningCircle, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StorageErrorHandler({ onRetry }: { onRetry: () => void }) {
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  
  // Force refresh data on component mount
  React.useEffect(() => {
    // Try to initialize app data manually
    const initializeAppData = () => {
      try {
        // Verify localStorage access
        localStorage.setItem("_test_key", "test_value");
        localStorage.removeItem("_test_key");
        
        // Check for any existing campaign data
        const localData = localStorage.getItem("campaignData");
        if (localData) {
          console.log("Found campaign data in localStorage during initialization");
          
          try {
            // Parse and validate the data
            const parsedData = JSON.parse(localData);
            if (Array.isArray(parsedData)) {
              console.log(`Verified ${parsedData.length} campaigns in localStorage`);
              
              // Don't trigger campaign:init since it causes refresh loops
              console.log(`No need to trigger campaign:init for ${parsedData.length} campaigns`);
              // Just indicate data is found
              toast.success(`Found ${parsedData.length} campaigns in local storage`);
            }
          } catch (parseError) {
            console.error("Could not parse localStorage data:", parseError);
          }
        } else {
          console.log("No campaign data found in localStorage during initialization");
        }
      } catch (error) {
        console.error("Storage initialization error:", error);
      }
    };
    
    // Run initialization after a short delay
    setTimeout(initializeAppData, 500);
  }, []);
  
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
          duration: 10000 // Longer duration to ensure users see it
        });
      }
    };
    
    window.addEventListener("app:error", handleStorageError);
    
    // Don't add a dynamic button to the UI - this can confuse users
    // and may contribute to refresh issues
    
    return () => {
      window.removeEventListener("app:error", handleStorageError);
    };
  }, [onRetry]);
  
  // Component no longer renders an error card
  return null;
}