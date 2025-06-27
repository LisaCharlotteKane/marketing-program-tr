import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudArrowUp } from "@phosphor-icons/react";
import { toast } from 'sonner';

export function RefreshCampaignsButton({ campaigns, className = "" }) {
  const handleRefresh = () => {
    if (!campaigns || !Array.isArray(campaigns)) {
      toast.error("No campaign data available to sync");
      return;
    }
    
    try {
      // First try to update localStorage 
      localStorage.setItem('campaignData', JSON.stringify(campaigns));
      
      // Then trigger the force sync event
      window.dispatchEvent(new CustomEvent('campaign:force-sync', { 
        detail: { campaigns }
      }));
      
      // Notify user
      toast.success(`Shared ${campaigns.length} campaigns with other users`);
      
      // After a short delay, trigger a page reload to ensure all data is fresh
      setTimeout(() => {
        toast.info("Refreshing page to ensure data consistency...");
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error forcing campaign sync:", error);
      toast.error("Failed to sync campaign data");
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className={`flex items-center gap-1 ${className}`}
      title="Share your campaigns with all users"
    >
      <CloudArrowUp className="h-4 w-4" />
      <span className="hidden sm:inline">Share Campaigns</span>
    </Button>
  );
}