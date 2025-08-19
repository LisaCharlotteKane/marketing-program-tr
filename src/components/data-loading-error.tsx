import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Warning, X, ArrowClockwise, TrashSimple, DownloadSimple } from "@phosphor-icons/react";
import { resetAllStorage, exportDataBackup } from "@/services/storage-recovery";
import { Campaign } from "@/types/campaign";
import { useState } from "react";

interface DataLoadingErrorProps {
  error: string | null;
  onRetry?: () => void;
  className?: string;
  campaigns?: Campaign[];
}

export function DataLoadingError({ 
  error, 
  onRetry, 
  className = "",
  campaigns = []
}: DataLoadingErrorProps) {
  const [isResetting, setIsResetting] = useState(false);

  if (!error) {
    return null;
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleReset = async () => {
    if (window.confirm(
      "WARNING: This will delete all saved campaign data and reset the application. " +
      "Please export a backup first if you want to keep your data. Continue?"
    )) {
      setIsResetting(true);
      try {
        await resetAllStorage();
      } catch (error) {
        setIsResetting(false);
      }
    }
  };

  const handleBackup = () => {
    exportDataBackup(campaigns);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <X className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Data Loading Error</AlertTitle>
        <AlertDescription className="text-red-700">
          <p className="mb-3">{error}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="bg-white border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-1"
            >
              <ArrowClockwise className="h-3 w-3" /> Retry Loading
            </Button>
            
            {campaigns && campaigns.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackup}
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-1"
              >
                <DownloadSimple className="h-3 w-3" /> Export Backup
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isResetting}
              className="bg-white border-red-500 text-red-700 hover:bg-red-50 flex items-center gap-1"
            >
              <TrashSimple className="h-3 w-3" /> 
              {isResetting ? "Resetting..." : "Reset All Data"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}