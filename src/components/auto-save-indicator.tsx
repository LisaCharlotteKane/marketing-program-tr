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
  const [showDetails, setShowDetails] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle manual save click
  const handleForceSave = async () => {
    if (forceSave) {
      try {
        await forceSave();
      } catch (error) {
        toast.error("Failed to save data");
      }
    }
  };
  
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
  
  // Simple indicator mode
  if (!showDetails) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Badge 
          variant="outline" 
          className="text-xs flex items-center gap-1 py-0.5 px-2"
          onClick={() => setShowDetails(true)}
        >
          <FloppyDisk className="h-3 w-3" />
          Auto-save enabled
        </Badge>
        
        {forceSave && (
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
  
  // Detailed indicator mode
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
            Saved {formattedLastSaved}
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