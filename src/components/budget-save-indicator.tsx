import React from "react";
import { FloppyDisk, Check } from "@phosphor-icons/react";

export function BudgetSaveIndicator({ 
  className = "", 
  lastSaved,
  isSaving
}: { 
  className?: string;
  lastSaved?: Date;
  isSaving?: boolean;
}) {
  if (isSaving) {
    return (
      <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
        <FloppyDisk className="h-3 w-3 mr-1 animate-pulse" />
        Saving...
      </div>
    );
  }
  
  if (lastSaved) {
    return (
      <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
        <Check className="h-3 w-3 mr-1 text-green-500" />
        Saved
      </div>
    );
  }
  
  return null;
}