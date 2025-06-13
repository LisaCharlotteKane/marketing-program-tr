import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { FloppyDisk, ClockClockwise, ArrowClockwise } from "@phosphor-icons/react";
import { useAutoSaveStatus } from "@/hooks/useAutoSaveStatus";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  
  // Handle manual save click
  const handleForceSave = async () => {
    if (forceSave) {
      try {
        await forceSave();
        toast.success("Data saved successfully to browser storage");
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
            <ClockClockwise className="h-3 w-3" />
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