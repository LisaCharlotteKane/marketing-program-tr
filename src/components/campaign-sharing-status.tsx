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
        
        // Handle empty states
        if (!kvCampaigns || !Array.isArray(kvCampaigns)) {
          setStatus('syncing');
          return;
        }
        
        const localCount = campaigns.length;
        const kvCount = kvCampaigns.length;
        
        // If counts are different, we're not in sync
        if (localCount !== kvCount) {
          setStatus('syncing');
          return;
        }
        
        // If we have campaigns, do a sample check on a few IDs
        if (localCount > 0) {
          // Check a sample of campaigns (up to 3)
          const samplesToCheck = Math.min(3, localCount);
          for (let i = 0; i < samplesToCheck; i++) {
            const localCampaign = campaigns[i];
            const matchInKv = kvCampaigns.some(c => c.id === localCampaign.id);
            
            if (!matchInKv) {
              setStatus('syncing');
              return;
            }
          }
        }
        
        // If we got here, everything seems in sync
        setStatus('synced');
        setLastCheck(new Date());
      } catch (error) {
        console.error("Error checking campaign sync status:", error);
        setStatus('error');
      }
    };
    
    // Check on mount and when dependencies change
    checkSyncStatus();
    
    // Set up periodic checks every 15 seconds
    const interval = setInterval(checkSyncStatus, 15000);
    return () => clearInterval(interval);
  }, [campaigns, kvCampaigns]);
  
  // Format time since last check
  const getTimeSince = () => {
    const seconds = Math.floor((new Date().getTime() - lastCheck.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };
  
  // Handle manual sync
  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast.info("Refreshing campaign data...");
    
    // Fire a global refresh event
    window.dispatchEvent(new CustomEvent("campaign:refresh"));
    
    // If we have campaigns locally, ensure they're in the KV store
    if (campaigns && campaigns.length > 0) {
      window.dispatchEvent(new CustomEvent("campaign:force-sync", {
        detail: { campaigns }
      }));
    }
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
          ? 'Data Synced' 
          : status === 'syncing' 
            ? 'Syncing Data...' 
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