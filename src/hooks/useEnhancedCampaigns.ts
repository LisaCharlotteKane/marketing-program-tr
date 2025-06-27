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
  // Use Spark's KV store for shared persistence across users with direct initialization
  // Set the default value directly to ensure data is shared immediately
  const [kvData, setKvData, deleteKvData] = useKV<T>(key, initialValue);
  const [data, setData] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);
  
  // Load data on mount
  useEffect(() => {
    if (initialLoadRef.current) return; // Only run on first load
    
    try {
      // First, check if we have data in KV store
      if (kvData && Array.isArray(kvData) && kvData.length > 0) {
        console.log("Loading data from KV store", kvData.length, "campaigns");
        
        // Data found in KV store
        const validatedData = ensureCampaignIntegrity(kvData) as T;
        setData(validatedData);
        
        // Also save to localStorage as backup
        localStorage.setItem(key, JSON.stringify(validatedData));
        
        toast.success(`Loaded ${validatedData.length} campaigns from shared storage`);
      } else {
        // Fall back to localStorage for backward compatibility
        console.log("No KV data found, checking localStorage");
        const savedData = localStorage.getItem(key);
        
        if (savedData) {
          console.log("Found data in localStorage, migrating to KV");
          try {
            const parsedData = JSON.parse(savedData);
            const validatedData = ensureCampaignIntegrity(parsedData) as T;
            
            // Migrate to KV store
            setKvData(validatedData);
            setData(validatedData);
            
            toast.success(`Migrated ${validatedData.length} campaigns to shared storage`);
          } catch (parseError) {
            console.error("Error parsing localStorage data:", parseError);
            
            // If localStorage data is corrupt, initialize with empty array
            setKvData(initialValue);
            setData(initialValue);
          }
        } else {
          // No data anywhere, initialize KV store with empty array
          console.log("No data found, initializing empty storage");
          setKvData(initialValue);
          setData(initialValue);
        }
      }
      
      initialLoadRef.current = true;
      setIsLoaded(true);
    } catch (error) {
      console.error(`Error loading ${key} data:`, error);
      console.warn(`Using default ${key} data due to loading error`);
      
      // Fall back to empty array rather than showing error
      setData(initialValue);
      setIsLoaded(true);
      
      toast.error(`Error loading saved campaign data. Starting with empty list.`);
    }
  }, [key, initialValue, kvData, setKvData]);
  
  // Custom setter that updates both local state and KV store
  const setDataAndKV = useCallback((newData: React.SetStateAction<T>) => {
    setData(prev => {
      const nextData = typeof newData === 'function' 
        ? (newData as Function)(prev) 
        : newData;
      
      // Always update KV store immediately to ensure data is shared
      // This is critical for multi-user scenarios
      setKvData(nextData);
      
      return nextData;
    });
  }, [setKvData]);
  
  // Create prevDataRef outside useEffect
  const prevDataRef = useRef("");
  
  // Save data when it changes, with debounce (maintains backward compatibility)
  useEffect(() => {
    // Skip initial render
    if (!isLoaded) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Compare current data with previous data to avoid unnecessary saves
    const dataStr = JSON.stringify(data);
    
    if (prevDataRef.current === dataStr) {
      return; // Skip save if data hasn't changed
    }
    
    prevDataRef.current = dataStr;
    
    saveTimeoutRef.current = setTimeout(() => {
      const saveData = async () => {
        setIsSaving(true);
        try {
          // Keep localStorage in sync for backward compatibility
          localStorage.setItem(key, dataStr);
          
          // We already updated KV store in setDataAndKV, but this ensures
          // we have a consistent save pattern and UI feedback
          setLastSaved(new Date());
        } catch (error) {
          console.error(`Error saving ${key} data:`, error);
          toast.error(`Failed to save ${key} data`);
        } finally {
          setIsSaving(false);
        }
      };
      
      saveData().then(() => {
        // Dispatch custom event to trigger GitHub sync
        window.dispatchEvent(new CustomEvent("campaign:updated"));
      });
    }, 2000); // Increased debounce to 2000ms to reduce saves
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, key, isLoaded]);
  
  // Force save function
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);
    try {
      // Save to both localStorage and KV store
      localStorage.setItem(key, JSON.stringify(data));
      setKvData(data);
      setLastSaved(new Date());
      
      // Trigger GitHub sync
      window.dispatchEvent(new CustomEvent("campaign:updated"));
      
      toast.success("Data saved successfully");
    } catch (error) {
      console.error(`Error force saving ${key} data:`, error);
      toast.error(`Failed to save ${key} data`);
    } finally {
      setIsSaving(false);
    }
  }, [data, key, setKvData]);
  
  return [data, setDataAndKV, { isSaving, lastSaved, forceSave }];
}