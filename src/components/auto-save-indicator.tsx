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
  
  // Reset to idle after showing saved status
  React.useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);
  
  // Show saving indicator when triggered by parent
  React.useEffect(() => {
    if (forceSave) {
      setSaveStatus("saving");
      setTimeout(() => {
        setSaveStatus("saved");
      }, 800);
    }
  }, [forceSave]);
  
  if (saveStatus === "saving") {
    return (
      <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
        <FloppyDisk className="h-3 w-3 mr-1 animate-pulse" />
        Auto-saving...
      </div>
    );
  }
  
  if (saveStatus === "saved") {
    return (
      <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
        <Check className="h-3 w-3 mr-1 text-green-500" />
        Changes saved
      </div>
    );
  }
  
  return null;
}