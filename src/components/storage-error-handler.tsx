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
              
              // Trigger data refresh
              window.dispatchEvent(new CustomEvent("campaign:init"));
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
    
    // Add a button to the UI to manually reload data
    const reloadButton = document.createElement("button");
    reloadButton.className = "fixed bottom-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-colors";
    reloadButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M197.66 186.35a8 8 0 0 1-11.32 11.3C165.78 177.11 128 177.11 107.43 197.65a8 8 0 0 1-11.32-11.3c13.77-13.77 32.05-21.34 50.89-21.34s37.12 7.57 50.66 21.34M148 128a20 20 0 1 1-20-20a20 20 0 0 1 20 20m84-48.28l-36 6.4A8 8 0 0 1 188 80a8 8 0 0 1-1.43-15.89l36-6.4A8 8 0 0 1 232 64a8 8 0 0 1-1.43 15.89M68 88a8 8 0 0 0 8-8a8 8 0 0 0-6.57-7.89l-36-6.4a8 8 0 0 0-2.86 15.75l36 6.4zm164.58 28c.28-.43.42-.89.42-1.37V88a8 8 0 0 0-16 0v16c-3.19-23.17-15.88-45.32-36.24-61.8C158.44 25.76 131.29 16 104 16a153.47 153.47 0 0 0-16.84.93a8 8 0 1 0 1.76 15.9a136.67 136.67 0 0 1 15.08-.83c48.91 0 96 34.69 96 96a8 8 0 0 0 16 0v-16h24a8 8 0 0 0 7.58-10.53zM240 192a8 8 0 0 0-8 8c0 25.59-18.59 40-48 40a102.56 102.56 0 0 1-31.8-4.43a8 8 0 0 0-5 15.22A119.11 119.11 0 0 0 184 256c36.65 0 64-20.09 64-56a8 8 0 0 0-8-8m-192 8c0-25.59 18.59-40 48-40a102.56 102.56 0 0 1 31.8 4.43a8 8 0 0 0 5-15.22A119.11 119.11 0 0 0 96 144c-36.65 0-64 20.09-64 56a8 8 0 0 0 16 0"/></svg>`;
    reloadButton.onclick = () => {
      toast.info("Reloading data...");
      onRetry();
    };
    document.body.appendChild(reloadButton);
    
    return () => {
      window.removeEventListener("app:error", handleStorageError);
      if (document.body.contains(reloadButton)) {
        document.body.removeChild(reloadButton);
      }
    };
  }, [onRetry]);
  
  // Component no longer renders an error card
  return null;
}