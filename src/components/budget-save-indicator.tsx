import React from "react";
import { CloudCheck, CloudSlash, CloudArrowUp } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

interface BudgetStatus {
  isSaving: boolean;
  lastSaved?: Date;
  resetToDefaults: () => void;
}

export function BudgetSaveIndicator({ status }: { status: BudgetStatus }) {
  // Format timestamp
  const getTimeString = () => {
    if (!status.lastSaved) return "";
    
    // Format as hours:minutes
    return status.lastSaved.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (status.isSaving) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <CloudArrowUp className="h-4 w-4 mr-1" />
        Saving...
      </Badge>
    );
  }

  if (status.lastSaved) {
    return (
      <Badge variant="outline">
        <CloudCheck className="h-4 w-4 mr-1 text-green-500" />
        Saved at {getTimeString()}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <CloudSlash className="h-4 w-4 mr-1" />
      Not saved
    </Badge>
  );
}