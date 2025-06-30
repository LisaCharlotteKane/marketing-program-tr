import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

/**
 * This component ensures campaign data is properly shared between users
 * by monitoring KV store updates and syncing data across clients
 */
export function DataSharingService({ campaigns }) {
  // Direct reference to the KV store for verification
  const [kvCampaigns, setKvCampaigns] = useKV('campaignData', []);
  const lastSyncRef = useRef(Date.now());
  const syncAttemptsRef = useRef(0);
  
  // Effect to periodically check for KV store changes
  useEffect(() => {
    // Skip if we don't have any campaigns to check
    if (!campaigns || !campaigns.length) return;
    
    const checkForKvUpdates = () => {
      try {
        // Throttle sync attempts to prevent excessive processing
        const now = Date.now();
        if (now - lastSyncRef.current < 10000 && syncAttemptsRef.current > 2) {
          return; // Skip this check if we've done several recent checks
        }
        
        lastSyncRef.current = now;
        syncAttemptsRef.current += 1;
        
        // Skip if KV data is invalid
        if (!kvCampaigns || !Array.isArray(kvCampaigns)) {
          console.warn("KV campaigns data is invalid, skipping sync check");
          return;
        }
        
        // Compare sizes first as a quick check
        const localLength = campaigns.length;
        const kvLength = kvCampaigns.length;
        
        // Log current state for debugging
        console.log(`Data sync check - Local: ${localLength} campaigns, KV: ${kvLength} campaigns`);
        
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
            
            // Notify the user
            toast.info("New campaign data available from other users");
          }
        }
        // If local has more campaigns than KV, our useEnhancedCampaigns hook should handle the update
        
        // Reset sync counter after a long period of inactivity
        if (syncAttemptsRef.current > 5) {
          setTimeout(() => {
            syncAttemptsRef.current = 0;
          }, 60000);
        }
      } catch (error) {
        console.error("Error during data sync check:", error);
      }
    };
    
    // Run check initially after a short delay
    const initialCheckTimeout = setTimeout(checkForKvUpdates, 5000);
    
    // Set up periodic checks every 30 seconds
    const intervalId = setInterval(checkForKvUpdates, 30000);
    
    // Listen for manual force sync events
    const handleForceSync = (event) => {
      if (event.detail?.campaigns) {
        console.log("Force sync requested with campaigns:", event.detail.campaigns.length);
        setKvCampaigns(event.detail.campaigns);
      }
    };
    
    window.addEventListener('campaign:force-sync', handleForceSync);
    
    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
      window.removeEventListener('campaign:force-sync', handleForceSync);
    };
  }, [campaigns, kvCampaigns, setKvCampaigns]);
  
  // This is a service component that doesn't render anything
  return null;
}