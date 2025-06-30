import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react";
import { toast } from 'sonner';

/**
 * Button component that allows users to refresh data from KV store
 * Should be placed in each tab for easy access
 */
export function RefreshDataButton({ className = "" }) {
  const handleRefresh = () => {
    // Trigger refresh event without page reload
    window.dispatchEvent(new CustomEvent("campaign:refresh"));
    toast.success("Refreshing data from shared storage...");
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      className={`flex items-center gap-1 ${className}`}
      title="Refresh data from shared storage"
    >
      <ArrowClockwise className="h-4 w-4" /> Refresh
    </Button>
  );
}