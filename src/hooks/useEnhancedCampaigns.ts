import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Campaign } from "@/components/campaign-table";
import { useKV } from "@github/spark/hooks";

interface SaveStatus {
  isSaving: boolean;
  lastSaved?: Date;
  forceSave: () => void;
}

// Helper function to ensure campaigns have all required fields
function ensureCampaignIntegrity(campaigns: Campaign[]): Campaign[] {
  return campaigns.map(campaign => {
    // Make a copy with all required fields initialized
    return {
      id: campaign.id || Math.random().toString(36).substring(2, 9),
      campaignName: campaign.campaignName || "",
      campaignType: campaign.campaignType || "In-Account Events (1:1)",
      strategicPillars: Array.isArray(campaign.strategicPillars) ? campaign.strategicPillars : [],
      revenuePlay: campaign.revenuePlay || "All",
      fiscalYear: campaign.fiscalYear || "FY25",
      quarterMonth: campaign.quarterMonth || "Q1 - July",
      region: campaign.region || "JP & Korea",
      country: campaign.country || "",
      owner: campaign.owner || "",
      description: campaign.description || "",
      forecastedCost: campaign.forecastedCost !== undefined ? campaign.forecastedCost : "",
      expectedLeads: campaign.expectedLeads !== undefined ? campaign.expectedLeads : "",
      impactedRegions: campaign.impactedRegions || [],
      
      // Execution tracking fields
      status: campaign.status || "Planning",
      poRaised: Boolean(campaign.poRaised),
      campaignCode: campaign.campaignCode || "",
      issueLink: campaign.issueLink || "",
      actualCost: typeof campaign.actualCost !== 'undefined' ? campaign.actualCost : "",
      actualLeads: typeof campaign.actualLeads !== 'undefined' ? campaign.actualLeads : "",
      actualMQLs: typeof campaign.actualMQLs !== 'undefined' ? campaign.actualMQLs : "",
      
      // Calculated fields
      mql: typeof campaign.mql === 'number' ? campaign.mql : 0,
      sql: typeof campaign.sql === 'number' ? campaign.sql : 0,
      opportunities: typeof campaign.opportunities === 'number' ? campaign.opportunities : 0,
      pipelineForecast: typeof campaign.pipelineForecast === 'number' ? campaign.pipelineForecast : 0
    };
  });
}

export function useEnhancedCampaigns<T extends Campaign[]>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, SaveStatus] {
  // Use Spark's KV store for shared persistence across users
  const [kvData, setKvData] = useKV<T>(key, initialValue);
  const [data, setData] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);
  const loadAttemptCountRef = useRef(0);
  const kvUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // This effect handles the initial loading of data
  useEffect(() => {
    if (initialLoadRef.current) return; // Only run on first load
    
    const loadData = async () => {
      try {
        console.log("Attempting to load campaign data from KV store...");
        
        // First check if KV data exists and is valid
        if (kvData && Array.isArray(kvData) && kvData.length > 0) {
          console.log(`Found ${kvData.length} campaigns in KV store`);
          
          // Valid data found in KV store
          const validatedData = ensureCampaignIntegrity(kvData) as T;
          setData(validatedData);
          localStorage.setItem(key, JSON.stringify(validatedData));
          
          toast.success(`Loaded ${validatedData.length} campaigns from shared storage`);
          initialLoadRef.current = true;
          setIsLoaded(true);
          return;
        } 
        
        // If KV store is empty, check localStorage as fallback
        console.log("KV store empty or invalid, checking localStorage");
        const savedData = localStorage.getItem(key);
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log(`Found ${parsedData.length} campaigns in localStorage`);
              
              const validatedData = ensureCampaignIntegrity(parsedData) as T;
              setData(validatedData);
              
              // Important: Update KV store so other users can see this data
              setKvData(validatedData);
              
              toast.success(`Loaded ${validatedData.length} campaigns from local storage`);
              initialLoadRef.current = true;
              setIsLoaded(true);
              return;
            }
          } catch (error) {
            console.error("Error parsing localStorage data:", error);
          }
        }
        
        // If we reach here, both KV and localStorage were empty
        console.log("No campaign data found, starting with empty state");
        setData(initialValue);
        initialLoadRef.current = true;
        setIsLoaded(true);
        
      } catch (error) {
        console.error("Error loading campaign data:", error);
        toast.error("Failed to load campaign data. Starting with empty state.");
        setData(initialValue);
        initialLoadRef.current = true;
        setIsLoaded(true);
      }
    };
    
    // Start loading process
    loadData();
  }, [key, initialValue, kvData, setKvData]);
  
  // Enhanced effect to check for KV store updates from other users
  useEffect(() => {
    if (!isLoaded) return;
    
    const checkForKvUpdates = () => {
      // Only run if we've completed initial loading
      if (!initialLoadRef.current) return;
      
      try {
        // Skip if KV data is invalid
        if (!kvData || !Array.isArray(kvData)) return;
        
        // Compare local data with KV data
        const localLength = data.length;
        const kvLength = kvData.length;
        
        // Log sync status for debugging
        console.log(`KV sync check - Local: ${localLength} campaigns, KV: ${kvLength} campaigns`);
        
        // Check if KV has more data than local state
        if (kvLength > localLength) {
          console.log(`KV store has more campaigns (${kvLength}) than local state (${localLength})`);
          
          // KV has more data, likely updated by another user
          const validatedData = ensureCampaignIntegrity(kvData) as T;
          
          // Update local state
          setData(validatedData);
          localStorage.setItem(key, JSON.stringify(validatedData));
          
          toast.info(`Updated with ${kvLength - localLength} new campaigns from other users`);
          return;
        }
        
        // Check if local and KV have same count but different data
        if (kvLength === localLength && localLength > 0) {
          // Check for campaigns that exist in KV but not in local
          const localIds = new Set(data.map(c => c.id));
          const kvIds = new Set(kvData.map(c => c.id));
          
          // Find IDs that are in KV but not in local
          const onlyInKv = [...kvIds].filter(id => !localIds.has(id));
          
          // Find IDs that are in local but not in KV
          const onlyInLocal = [...localIds].filter(id => !kvIds.has(id));
          
          if (onlyInKv.length > 0 || onlyInLocal.length > 0) {
            console.log(`Found data differences - Only in KV: ${onlyInKv.length}, Only in local: ${onlyInLocal.length}`);
            
            // If there are differences, we need to merge the data
            const mergedData = [...data];
            
            // Add campaigns from KV that don't exist locally
            kvData.forEach(kvCampaign => {
              if (!localIds.has(kvCampaign.id)) {
                mergedData.push(kvCampaign);
              }
            });
            
            const validatedData = ensureCampaignIntegrity(mergedData) as T;
            
            // Update local state with merged data
            setData(validatedData);
            localStorage.setItem(key, JSON.stringify(validatedData));
            
            // Update KV store with merged data if there are local-only campaigns
            if (onlyInLocal.length > 0) {
              setKvData(validatedData);
            }
            
            toast.info(`Synchronized ${onlyInKv.length + onlyInLocal.length} campaigns with shared storage`);
          }
        }
        
        // If local has more data than KV, ensure KV is updated
        if (localLength > kvLength) {
          console.log(`Local has more campaigns (${localLength}) than KV store (${kvLength}) - updating shared storage`);
          setKvData(data);
          toast.success(`Shared ${localLength} campaigns with all users`);
        }
      } catch (error) {
        console.error("Error checking for KV updates:", error);
      }
    };
    
    // Run initial check after a short delay
    const initialCheck = setTimeout(checkForKvUpdates, 3000);
    
    // Set up periodic checks for KV updates (every 10 seconds)
    const intervalId = setInterval(checkForKvUpdates, 10000);
    
    return () => {
      clearTimeout(initialCheck);
      clearInterval(intervalId);
    };
  }, [isLoaded, data, kvData, key, setKvData]);
  
  // Custom setter that updates both local state and KV store
  const setDataAndKV = useCallback((newData: React.SetStateAction<T>) => {
    setData(prev => {
      // Calculate next data state
      const nextData = typeof newData === 'function' 
        ? (newData as Function)(prev) 
        : newData;
      
      // Schedule KV store update with debouncing
      if (kvUpdateTimeoutRef.current) {
        clearTimeout(kvUpdateTimeoutRef.current);
      }
      
      kvUpdateTimeoutRef.current = setTimeout(() => {
        try {
          console.log(`Updating KV store with ${nextData.length} campaigns`);
          
          // Make a clean copy to prevent reference issues
          const cleanCopy = JSON.parse(JSON.stringify(nextData));
          
          // Ensure all campaigns have valid fields before saving
          const validatedData = ensureCampaignIntegrity(cleanCopy) as T;
          
          // Update KV store with validated data
          setKvData(validatedData);
          localStorage.setItem(key, JSON.stringify(validatedData));
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent("campaign:updated", { 
            detail: { count: validatedData.length } 
          }));
          
          toast.success(`Saved and shared ${validatedData.length} campaigns with all users`);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Error updating KV store:", error);
          toast.error("Failed to share campaign data with other users");
        }
      }, 500); // Short debounce for responsive updates
      
      return nextData;
    });
  }, [setKvData, key]);
  
  // This is for UI feedback on save operations
  useEffect(() => {
    if (!isLoaded) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      
      try {
        // Set lastSaved timestamp for UI feedback
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
      }
    }, 500);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, isLoaded]);
  
  // Force save function for manual sync
  const forceSave = useCallback(async () => {
    setIsSaving(true);
    
    try {
      // Create a clean copy to avoid reference issues
      const cleanCopy = JSON.parse(JSON.stringify(data));
      const validatedData = ensureCampaignIntegrity(cleanCopy) as T;
      
      // Update both storage methods
      localStorage.setItem(key, JSON.stringify(validatedData));
      
      // Use a direct, non-async call first to immediately update
      setKvData(validatedData);
      
      // Double-check after a short delay that KV store was updated
      setTimeout(async () => {
        try {
          // Get current KV data
          const currentKvData = await window.spark?.kv?.get(key);
          
          // Check if current KV data matches what we expect
          if (!currentKvData || 
              !Array.isArray(currentKvData) || 
              currentKvData.length !== validatedData.length) {
            console.log("KV store sync check failed - retrying update");
            // Try again with direct API call
            await window.spark?.kv?.set(key, validatedData);
          }
        } catch (error) {
          console.error("Error in KV store verification:", error);
        }
      }, 1000);
      
      // Notify other components
      window.dispatchEvent(new CustomEvent("campaign:force-sync", {
        detail: { campaigns: validatedData }
      }));
      
      setLastSaved(new Date());
      toast.success(`${validatedData.length} campaigns saved and shared with all users`);
    } catch (error) {
      console.error("Error force saving data:", error);
      toast.error("Failed to share campaign data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [data, key, setKvData]);
  
  // Listen for forced data refresh events
  useEffect(() => {
    const handleForcedRefresh = () => {
      // Only refresh if KV data is valid and different from local data
      if (kvData && Array.isArray(kvData) && kvData.length > 0) {
        const validatedData = ensureCampaignIntegrity(kvData) as T;
        setData(validatedData);
        localStorage.setItem(key, JSON.stringify(validatedData));
        toast.success(`Refreshed with ${validatedData.length} campaigns from shared storage`);
      }
    };
    
    window.addEventListener("campaign:refresh", handleForcedRefresh);
    return () => window.removeEventListener("campaign:refresh", handleForcedRefresh);
  }, [kvData, key]);
  
  return [data, setDataAndKV, { isSaving, lastSaved, forceSave }];
}