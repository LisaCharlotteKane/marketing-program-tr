import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

/**
 * This component ensures campaign data is properly shared between users
 * by verifying KV store contains the most up-to-date data
 */
export function DataSharingService({ campaigns }) {
  // Create a direct reference to the KV store for verification
  const [kvCampaigns, setKvCampaigns] = useKV('campaignData', []);
  const lastSyncAttemptRef = useRef(0);
  const syncCountRef = useRef(0);
  
  // Effect to periodically check if KV store has the latest data
  useEffect(() => {
    if (!campaigns || !campaigns.length) return;
    
    // Only run this check when we have campaigns to verify
    const verifySharedData = () => {
      try {
        // Avoid too many syncs in a short period
        const now = Date.now();
        if (now - lastSyncAttemptRef.current < 5000 && syncCountRef.current > 5) {
          console.log("Throttling data sharing checks");
          return;
        }
        
        lastSyncAttemptRef.current = now;
        syncCountRef.current += 1;
        
        // Compare KV data with current campaigns
        const kvLength = Array.isArray(kvCampaigns) ? kvCampaigns.length : 0;
        const localLength = campaigns.length;
        
        console.log(`Data sharing check: KV=${kvLength} campaigns, Local=${localLength} campaigns`);
        
        // If KV store is missing data that we have locally, update it
        if (kvLength < localLength) {
          console.log("Local campaigns not fully reflected in KV store, updating shared data");
          
          // Make a clean copy to avoid reference issues
          const cleanCopy = JSON.parse(JSON.stringify(campaigns));
          setKvCampaigns(cleanCopy);
          
          // Also update localStorage as a backup
          localStorage.setItem('campaignData', JSON.stringify(cleanCopy));
          
          toast.success(`Shared ${localLength} campaigns with other users`);
        } else if (kvLength > localLength && localLength === 0) {
          // This is a case where KV has data but local state is empty
          // This could happen if someone cleared localStorage or is a new user
          console.log("KV store has campaigns that local state doesn't, updating local state");
          
          // Dispatch an event to trigger reload from KV
          window.dispatchEvent(new CustomEvent('campaign:init'));
        }
        
        // Reset sync counter periodically
        if (syncCountRef.current > 10) {
          setTimeout(() => {
            syncCountRef.current = 0;
          }, 60000);
        }
      } catch (error) {
        console.error("Error verifying shared data:", error);
      }
    };
    
    // Run verification once on mount
    verifySharedData();
    
    // Set up periodic verification (every 15 seconds)
    const intervalId = setInterval(verifySharedData, 15000);
    
    // Listen for manual force sync events from other components
    const handleForceSync = (event) => {
      if (event.detail?.campaigns) {
        console.log("Force sync requested with campaigns:", event.detail.campaigns.length);
        setKvCampaigns(event.detail.campaigns);
        
        // Also update localStorage
        localStorage.setItem('campaignData', JSON.stringify(event.detail.campaigns));
      }
    };
    
    window.addEventListener('campaign:force-sync', handleForceSync);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('campaign:force-sync', handleForceSync);
    };
  }, [campaigns, kvCampaigns, setKvCampaigns]);
  
  // This is a service component that doesn't render anything
  return null;
}