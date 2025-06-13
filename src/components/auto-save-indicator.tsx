import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { FloppyDisk, ClockClockwise } from "@phosphor-icons/react";
import { useAutoSaveStatus } from "@/hooks/useAutoSaveStatus";

interface AutoSaveIndicatorProps {
  className?: string;
}

export function AutoSaveIndicator({ className = "" }: AutoSaveIndicatorProps) {
  // Use the auto-save status hook
  const { isSaving, lastSaved, formattedLastSaved } = useAutoSaveStatus();
  
  // State to control visibility of the indicator
  const [showDetails, setShowDetails] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Show details when saving happens, hide after delay
  useEffect(() => {
    if (isSaving) {
      setShowDetails(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else if (lastSaved && !isSaving) {
      setShowDetails(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide the details after 5 seconds
      timeoutRef.current = setTimeout(() => {
        setShowDetails(false);
      }, 5000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isSaving, lastSaved]);
  
  if (!showDetails) {
    return (
      <Badge 
        variant="outline" 
        className={`text-xs flex items-center gap-1 py-0.5 px-2 ${className}`}
        onClick={() => setShowDetails(true)}
      >
        <FloppyDisk className="h-3 w-3" />
        Auto-save enabled
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant={isSaving ? "secondary" : "outline"} 
      className={`text-xs flex items-center gap-1 py-0.5 px-2 ${className} ${isSaving ? 'animate-pulse' : ''}`}
    >
      {isSaving ? (
        <>
          <FloppyDisk className="h-3 w-3" />
          Saving...
        </>
      ) : (
        <>
          <ClockClockwise className="h-3 w-3" />
          Saved {formattedLastSaved}
        </>
      )}
    </Badge>
  );
}