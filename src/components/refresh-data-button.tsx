import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react";
import { toast } from 'sonner';

interface RefreshDataButtonProps {
  /**
   * CSS class to apply to the button
   */
  className?: string;
  
  /**
   * Button variant
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  /**
   * Button size
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * A reusable button component for refreshing data from shared storage
 */
export function RefreshDataButton({ 
  className = "", 
  variant = "outline",
  size = "sm"
}: RefreshDataButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={() => {
        // Dispatch refresh event to trigger data reload from KV store
        window.dispatchEvent(new CustomEvent("campaign:refresh"));
        toast.success("Refreshing data from shared storage...");
      }}
      className={`flex items-center gap-1 ${className}`}
      title="Refresh data from shared storage"
    >
      <ArrowClockwise className="h-4 w-4" /> Refresh Data
    </Button>
  );
}