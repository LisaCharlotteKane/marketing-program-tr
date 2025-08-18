import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { Badge } from "@/components/ui/badge";
import { ArrowsClockwise } from "@phosphor-icons/react";

/**
 * This component ensures campaign data is properly shared between users
 * by monitoring KV store updates and syncing data across clients
 */
export function DataSharingService({ campaigns }) {
  // Direct reference to the KV store for verification
  const [kvCampaigns, setKvCampaigns] = useKV('campaignData', []);
  const lastSyncRef = useRef(Date.now());
  const syncAttemptsRef = useRef(0);
  const [syncStatus, setSyncStatus] = useState<'synced'|'syncing'|'error'>('syncing');
  const lastSuccessfulSyncRef = useRef<number | null>(null);
  
  // Effect to periodically check for KV store changes
  useEffect(() => {
    // Skip if we don't have any campaigns to check
    if (!campaigns) return;
    
    const checkForKvUpdates = () => {
      try {
        // Throttle sync attempts to prevent excessive processing
        const now = Date.now();
        if (now - lastSyncRef.current < 5000 && syncAttemptsRef.current > 3) {
          // Skip this check if we've done several recent checks
          return; 
        }
        
        lastSyncRef.current = now;
        syncAttemptsRef.current += 1;
        
        // Handle the case where campaigns or KV data is invalid
        if (!Array.isArray(campaigns) || !Array.isArray(kvCampaigns)) {
          console.warn("Campaign data format is invalid, skipping sync check");
          setSyncStatus('error');
          return;
        }
        
        // Compare sizes first as a quick check
        const localLength = campaigns.length;
        const kvLength = kvCampaigns.length;
        
        // Log current state for debugging
        console.log(`Data sync check - Local: ${localLength} campaigns, KV: ${kvLength} campaigns`);
        
        // Simple check if we have an exact match
        if (localLength === kvLength && localLength > 0) {
          setSyncStatus('synced');
          lastSuccessfulSyncRef.current = now;
        } else {
          setSyncStatus('syncing');
        }
        
        // If KV store has more campaigns than local state, it likely means another user added campaigns
        if (kvLength > localLength) {
          console.log("KV store has more campaigns than local state - potential external update");
          
          // Check if the campaigns are actually different
          // We can't do a full deep comparison, but we can check campaign IDs
          const localIds = new Set(campaigns.map(c => c.id));
          const hasNewCampaigns = kvCampaigns.some(c => !localIds.has(c.id));
          
          if (hasNewCampaigns) {
            console.log("Found new campaigns in KV store from other users");
            
            // Trigger a refresh event that will be handled by useEnhancedCampaigns
            window.dispatchEvent(new CustomEvent("campaign:refresh"));
            
            // Notify the user only if we haven't done so recently
            if (!lastSuccessfulSyncRef.current || now - lastSuccessfulSyncRef.current > 60000) {
              toast.info("New campaign data available from other users");
            }
          }
        }
        
        // If local has more campaigns than KV, we need to ensure KV is updated
        if (localLength > kvLength) {
          console.log("Local has more campaigns than KV store - updating shared storage");
          
          // Force an update to KV store to ensure all users can see the data
          setKvCampaigns(campaigns);
          
          // Only show toast for significant changes
          if (localLength - kvLength > 1) {
            toast.success(`Shared ${localLength} campaigns with all users`);
          }
        }
        
        // Reset sync counter after a period of inactivity
        if (syncAttemptsRef.current > 10) {
          setTimeout(() => {
            syncAttemptsRef.current = 0;
          }, 30000);
        }
      } catch (error) {
        console.error("Error during data sync check:", error);
        setSyncStatus('error');
      }
    };
    
    // Run check immediately 
    checkForKvUpdates();
    
    // Run another check after a short delay
    const initialCheckTimeout = setTimeout(checkForKvUpdates, 2000);
    
    // Set up periodic checks every 10 seconds
    const intervalId = setInterval(checkForKvUpdates, 10000);
    
    // Listen for manual force sync events
    const handleForceSync = (event) => {
      if (event.detail?.campaigns) {
        console.log("Force sync requested with campaigns:", event.detail.campaigns.length);
        setKvCampaigns(event.detail.campaigns);
        setSyncStatus('synced');
        lastSuccessfulSyncRef.current = Date.now();
      }
    };
    
    window.addEventListener('campaign:force-sync', handleForceSync);
    
    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
      window.removeEventListener('campaign:force-sync', handleForceSync);
    };
  }, [campaigns, kvCampaigns, setKvCampaigns]);
  
  // This component shows a small sync indicator in the bottom corner
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant={syncStatus === 'synced' ? "default" : syncStatus === 'syncing' ? "outline" : "destructive"}
        className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-help"
        title={`Data sharing status: ${syncStatus}`}
      >
        <ArrowsClockwise className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        {syncStatus === 'synced' 
          ? 'Data Synced' 
          : syncStatus === 'syncing' 
            ? 'Syncing...' 
            : 'Sync Error'}
      </Badge>
    </div>
  );
}