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
      forecastedCost: campaign.forecastedCost || "",
      expectedLeads: campaign.expectedLeads || "",
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
  
  // This effect periodically checks for KV store updates from other users
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
        
        if (kvLength > localLength) {
          console.log(`KV store has more campaigns (${kvLength}) than local state (${localLength})`);
          
          // KV has more data, likely updated by another user
          const validatedData = ensureCampaignIntegrity(kvData) as T;
          
          // Update local state
          setData(validatedData);
          localStorage.setItem(key, JSON.stringify(validatedData));
          
          toast.info(`Updated with ${kvLength - localLength} new campaigns from other users`);
        }
        // We don't handle the case where KV has fewer items than local state here
        // That's handled in the update logic below
      } catch (error) {
        console.error("Error checking for KV updates:", error);
      }
    };
    
    // Set up periodic checks for KV updates (every 15 seconds)
    const intervalId = setInterval(checkForKvUpdates, 15000);
    
    return () => clearInterval(intervalId);
  }, [isLoaded, data.length, kvData, key]);
  
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
          setKvData(nextData);
          localStorage.setItem(key, JSON.stringify(nextData));
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent("campaign:updated", { 
            detail: { count: nextData.length } 
          }));
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
      // Clean copy to avoid reference issues
      const cleanCopy = JSON.parse(JSON.stringify(data));
      
      // Update both storage methods
      localStorage.setItem(key, JSON.stringify(cleanCopy));
      await setKvData(cleanCopy);
      
      // Notify other components
      window.dispatchEvent(new CustomEvent("campaign:force-sync", {
        detail: { campaigns: cleanCopy }
      }));
      
      setLastSaved(new Date());
      toast.success("Campaign data saved and shared with all users");
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