import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Users, ArrowClockwise } from "@phosphor-icons/react";
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

export function CampaignSharingStatus({ campaigns, className = "" }) {
  const [kvCampaigns] = useKV('campaignData', []);
  const [status, setStatus] = useState<'synced'|'syncing'|'error'>('syncing');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  
  useEffect(() => {
    const checkSyncStatus = () => {
      try {
        if (!campaigns || !Array.isArray(campaigns)) {
          setStatus('error');
          return;
        }
        
        const localCount = campaigns.length;
        const kvCount = Array.isArray(kvCampaigns) ? kvCampaigns.length : 0;
        
        // Consider synced if either both are empty or counts match
        const isSynced = (localCount === 0 && kvCount === 0) || localCount === kvCount;
        
        setStatus(isSynced ? 'synced' : 'syncing');
        setLastCheck(new Date());
      } catch (error) {
        console.error("Error checking campaign sync status:", error);
        setStatus('error');
      }
    };
    
    // Check on component mount and when dependencies change
    checkSyncStatus();
    
    // Set up periodic checks
    const interval = setInterval(checkSyncStatus, 15000);
    return () => clearInterval(interval);
  }, [campaigns, kvCampaigns]);
  
  // Format time since last check
  const getTimeSince = () => {
    const seconds = Math.floor((new Date().getTime() - lastCheck.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };
  
  // Handle manual check/refresh
  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    window.location.reload();
    toast.info("Refreshing data...");
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={status === 'synced' ? "default" : status === 'syncing' ? "outline" : "destructive"}
        className="flex items-center gap-1 cursor-help"
        title={`Campaign data sharing status: ${status}. Last checked ${getTimeSince()}`}
      >
        <Users className="h-3 w-3" />
        {status === 'synced' 
          ? 'Campaigns Synced' 
          : status === 'syncing' 
            ? 'Syncing...' 
            : 'Sync Error'}
      </Badge>
      
      <button 
        onClick={handleRefresh}
        className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Refresh data now"
      >
        <ArrowClockwise className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}