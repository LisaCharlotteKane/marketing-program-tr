import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

/**
 * This component ensures campaign data is properly shared between users
 * by verifying KV store contains the most up-to-date data
 */
export function DataSharingService({ campaigns }) {
  // Create a direct reference to the KV store for verification
  const [kvCampaigns, setKvCampaigns] = useKV('campaignData', []);
  
  // Effect to periodically check if KV store has the latest data
  useEffect(() => {
    if (!campaigns || !campaigns.length) return;
    
    // Only run this check when we have campaigns to verify
    const verifySharedData = () => {
      try {
        // Compare KV data with current campaigns
        const kvLength = Array.isArray(kvCampaigns) ? kvCampaigns.length : 0;
        const localLength = campaigns.length;
        
        console.log(`Data sharing check: KV=${kvLength} campaigns, Local=${localLength} campaigns`);
        
        // If KV store is missing data that we have locally, update it
        if (kvLength < localLength) {
          console.log("Local campaigns not fully reflected in KV store, updating shared data");
          setKvCampaigns(campaigns);
          toast.success(`Shared ${localLength} campaigns with other users`);
        }
        
        // If KV has data we don't have locally, that would be handled by the main hook
      } catch (error) {
        console.error("Error verifying shared data:", error);
      }
    };
    
    // Run verification once on mount
    verifySharedData();
    
    // Set up periodic verification (every 30 seconds)
    const intervalId = setInterval(verifySharedData, 30000);
    
    // Listen for manual force sync events from other components
    const handleForceSync = (event) => {
      if (event.detail?.campaigns) {
        console.log("Force sync requested with campaigns:", event.detail.campaigns.length);
        setKvCampaigns(event.detail.campaigns);
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