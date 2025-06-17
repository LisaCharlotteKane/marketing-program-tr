import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function StorageErrorHandler({ onRetry }: { onRetry: () => void }) {
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  
  // Listen for storage errors
  React.useEffect(() => {
    const handleStorageError = (event: any) => {
      if (event.detail?.type === "storage" && event.detail?.message) {
        setHasError(true);
        
        // Simplify error message to avoid showing GitHub API errors
        if (event.detail.message.includes("GitHub API")) {
          setErrorMessage("There was an error with the GitHub integration. The application will use local storage only.");
        } else {
          setErrorMessage(event.detail.message);
        }
      }
    };
    
    window.addEventListener("app:error", handleStorageError);
    return () => window.removeEventListener("app:error", handleStorageError);
  }, []);
  
  // If no errors, don't render anything
  if (!hasError) return null;
  
  return (
    <Card className="border border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-700 flex items-center gap-2">
          <Info className="h-5 w-5" />
          Storage Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 mb-4">{errorMessage || "There was an error loading saved data"}</p>
        <Button variant="outline" onClick={() => {
          setHasError(false);
          onRetry();
        }}>
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}