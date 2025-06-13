import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { FloppyDisk, ClockClockwise, ArrowClockwise, GithubLogo } from "@phosphor-icons/react";
import { useAutoSaveStatus } from "@/hooks/useAutoSaveStatus";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isAutoGitHubSyncAvailable } from "@/services/auto-github-sync";

interface AutoSaveIndicatorProps {
  className?: string;
  forceSave?: () => Promise<void>;
}

export function AutoSaveIndicator({ className = "", forceSave }: AutoSaveIndicatorProps) {
  // Use the auto-save status hook
  const { isSaving, lastSaved, formattedLastSaved } = useAutoSaveStatus();
  
  // State to control visibility of the indicator
  const [showDetails, setShowDetails] = useState(true); // Always show details
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if GitHub sync is available
  const [isGitHubSyncActive, setIsGitHubSyncActive] = useState(false);
  
  useEffect(() => {
    setIsGitHubSyncActive(isAutoGitHubSyncAvailable());
    
    // Check periodically if GitHub sync status changes
    const interval = setInterval(() => {
      setIsGitHubSyncActive(isAutoGitHubSyncAvailable());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle manual save click
  const handleForceSave = async () => {
    if (forceSave) {
      try {
        await forceSave();
        // Toast is handled in the forceSave function
      } catch (error) {
        toast.error("Failed to save data");
      }
    }
  };
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Badge 
        variant={isSaving ? "secondary" : "outline"} 
        className={`text-xs flex items-center gap-1 py-0.5 px-2 ${isSaving ? 'animate-pulse' : ''}`}
      >
        {isSaving ? (
          <>
            <FloppyDisk className="h-3 w-3" />
            Saving...
          </>
        ) : (
          <>
            {isGitHubSyncActive ? (
              <GithubLogo className="h-3 w-3 text-black" />
            ) : (
              <ClockClockwise className="h-3 w-3" />
            )}
            {lastSaved ? `Saved ${formattedLastSaved}` : "Auto-save ready"}
          </>
        )}
      </Badge>
      
      {forceSave && !isSaving && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs"
          onClick={handleForceSave}
          title="Save now"
        >
          <ArrowClockwise className="h-3 w-3 mr-1" />
          Save
        </Button>
      )}
    </div>
  );
}