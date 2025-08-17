import React from "react";
import { FloppyDisk, Check } from "@phosphor-icons/react";

export function AutoSaveIndicator({ 
  className = "", 
  forceSave
}: { 
  className?: string;
  forceSave?: () => void;
}) {
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [lastSaveTime, setLastSaveTime] = React.useState<Date | null>(null);
  
  // Reset to idle after showing saved status
  React.useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);
  
  // Listen for campaign data save events
  React.useEffect(() => {
    const handleDataSaved = (event: CustomEvent) => {
      if (event.detail?.timestamp) {
        setLastSaveTime(new Date(event.detail.timestamp));
        setSaveStatus("saved");
      }
    };
    
    window.addEventListener('campaignDataSaved' as any, handleDataSaved as any);
    
    return () => {
      window.removeEventListener('campaignDataSaved' as any, handleDataSaved as any);
    };
  }, []);
  
  // Show saving indicator when triggered by parent
  React.useEffect(() => {
    if (forceSave) {
      setSaveStatus("saving");
      setTimeout(() => {
        setSaveStatus("saved");
        setLastSaveTime(new Date());
      }, 800);
    }
  }, [forceSave]);
  
  if (saveStatus === "saving") {
    return (
      <div className={`flex items-center text-xs font-medium bg-primary/10 text-primary rounded px-2 py-1 ${className}`}>
        <FloppyDisk className="h-3 w-3 mr-1 animate-pulse" />
        Saving changes...
      </div>
    );
  }
  
  if (saveStatus === "saved") {
    return (
      <div className={`flex items-center text-xs font-medium bg-green-100 text-green-800 rounded px-2 py-1 ${className}`}>
        <Check className="h-3 w-3 mr-1" />
        Changes saved
      </div>
    );
  }
  
  // Show last save time if available
  if (lastSaveTime) {
    const timeAgo = getTimeAgo(lastSaveTime);
    return (
      <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
        <Check className="h-3 w-3 mr-1 text-muted-foreground" />
        Saved {timeAgo}
      </div>
    );
  }
  
  return null;
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  } else if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffSec / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}