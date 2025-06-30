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
  const loadAttemptCountRef = useRef(0);
  
  // Load data on mount with improved KV store handling
  useEffect(() => {
    if (initialLoadRef.current) return; // Only run on first load
    
    // Define an async function to handle data loading
    const loadData = async () => {
      try {
        // Log the current KV data state to help debugging
        console.log("Current KV data state:", kvData);
        
        // First, check if we have data in KV store - with explicit validity check
        if (kvData && Array.isArray(kvData) && kvData.length > 0) {
          console.log("Loading data from KV store", kvData.length, "campaigns");
          
          // Data found in KV store
          const validatedData = ensureCampaignIntegrity(kvData) as T;
          setData(validatedData);
          
          // Also save to localStorage as backup
          localStorage.setItem(key, JSON.stringify(validatedData));
          
          toast.success(`Loaded ${validatedData.length} campaigns from shared storage`);
          
          // Successfully loaded, mark as complete
          initialLoadRef.current = true;
          setIsLoaded(true);
          return;
        } else if (kvData && Array.isArray(kvData) && kvData.length === 0) {
          console.log("KV store contained an empty array, checking localStorage for potential data");
          // Even though KV has empty array, we still check localStorage for backward compatibility
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log("Found data in localStorage, migrating to KV");
                const localValidatedData = ensureCampaignIntegrity(parsedData) as T;
                
                // Migrate to KV store - this is crucial for sharing with other users
                setKvData(localValidatedData);
                setData(localValidatedData);
                
                toast.success(`Migrated ${localValidatedData.length} campaigns to shared storage`);
                
                // Successfully loaded, mark as complete
                initialLoadRef.current = true;
                setIsLoaded(true);
                return;
              }
            } catch (parseError) {
              console.error("Error parsing localStorage data:", parseError);
            }
          }
          
          // If we reach here, KV was empty and localStorage had no valid data
          // Initialize KV store with empty array
          console.log("No data found, initializing empty storage");
          setKvData(initialValue);
          setData(initialValue);
          initialLoadRef.current = true;
          setIsLoaded(true);
          return;
        } else {
          // KV data is not a valid array, try one more time after a short delay
          // This helps with potential race conditions in KV store initialization
          loadAttemptCountRef.current += 1;
          
          if (loadAttemptCountRef.current <= 3) {
            console.log(`Attempt ${loadAttemptCountRef.current}: KV data not valid yet, retrying in 1 second...`);
            setTimeout(loadData, 1000);
            return;
          }
          
          // If we've tried multiple times and still no data, fall back to localStorage
          console.log("No valid KV data found after multiple attempts, checking localStorage");
          const savedData = localStorage.getItem(key);
          
          if (savedData) {
            console.log("Found data in localStorage, migrating to KV");
            try {
              const parsedData = JSON.parse(savedData);
              const validatedData = ensureCampaignIntegrity(parsedData) as T;
              
              // Migrate to KV store - this is crucial for sharing with other users
              setKvData(validatedData);
              setData(validatedData);
              
              toast.success(`Migrated ${validatedData.length} campaigns to shared storage`);
              initialLoadRef.current = true;
              setIsLoaded(true);
              return;
            } catch (parseError) {
              console.error("Error parsing localStorage data:", parseError);
              
              // If localStorage data is corrupt, initialize with empty array
              setKvData(initialValue);
              setData(initialValue);
              initialLoadRef.current = true;
              setIsLoaded(true);
              return;
            }
          } else {
            // No data anywhere, initialize KV store with empty array
            console.log("No data found, initializing empty storage");
            setKvData(initialValue);
            setData(initialValue);
            initialLoadRef.current = true;
            setIsLoaded(true);
            return;
          }
        }
      } catch (error) {
        console.error(`Error loading ${key} data:`, error);
        console.warn(`Using default ${key} data due to loading error`);
        
        // Fall back to empty array rather than showing error
        setData(initialValue);
        initialLoadRef.current = true;
        setIsLoaded(true);
        
        toast.error(`Error loading saved campaign data. Starting with empty list.`);
      }
    };
    
    // Start the loading process
    loadData();
  }, [key, initialValue, kvData, setKvData]);
  
  // Custom setter that updates both local state and KV store
  const setDataAndKV = useCallback((newData: React.SetStateAction<T>) => {
    setData(prev => {
      const nextData = typeof newData === 'function' 
        ? (newData as Function)(prev) 
        : newData;
      
      // Always update KV store immediately to ensure data is shared
      // This is critical for multi-user scenarios
      try {
        // Log the update operation for debugging
        console.log(`Updating KV store with ${Array.isArray(nextData) ? nextData.length : 0} campaigns`);
        setKvData(nextData);
        
        // Also update localStorage as a backup
        localStorage.setItem(key, JSON.stringify(nextData));
        
        // Dispatch an event that can be captured by other components
        window.dispatchEvent(new CustomEvent("campaign:updated", { 
          detail: { count: Array.isArray(nextData) ? nextData.length : 0 } 
        }));
      } catch (error) {
        console.error("Error updating KV store:", error);
        toast.error("Failed to sync campaign data. Please try again.");
      }
      
      return nextData;
    });
  }, [setKvData, key]);
  
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
        // Using a setTimeout to prevent immediate processing
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("campaign:updated"));
        }, 500);
      });
    }, 3000); // Increased debounce to 3000ms to reduce saves frequency
    
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
      // Create a clean copy of the data to avoid reference issues
      const cleanCopy = JSON.parse(JSON.stringify(data));
      
      // Save to both localStorage and KV store
      localStorage.setItem(key, JSON.stringify(cleanCopy));
      
      // Explicitly call setKvData with clean copy
      await setKvData(cleanCopy);
      
      // Force sync to other components
      window.dispatchEvent(new CustomEvent("campaign:force-sync", {
        detail: { campaigns: cleanCopy }
      }));
      
      // Trigger GitHub sync
      window.dispatchEvent(new CustomEvent("campaign:updated"));
      
      setLastSaved(new Date());
      toast.success("Campaign data saved and shared successfully");
    } catch (error) {
      console.error(`Error force saving ${key} data:`, error);
      toast.error(`Failed to save campaign data. Please try again.`);
      
      // Try one more time after a delay
      setTimeout(() => {
        try {
          // Last resort, try to save to localStorage only
          localStorage.setItem(key, JSON.stringify(data));
          toast.info("Data saved to local storage only. Refresh the page to try sharing again.");
        } catch (secondError) {
          console.error("Second save attempt failed:", secondError);
        }
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  }, [data, key, setKvData]);
  
  // Add a global event listener for manual KV data refreshes
  useEffect(() => {
    const handleForcedDataLoad = async () => {
      console.log("Forced data load requested");
      
      try {
        // Check if we have data in KV store
        if (kvData && Array.isArray(kvData) && kvData.length > 0) {
          console.log("Loading data from KV store on forced load", kvData.length, "campaigns");
          
          // Data found in KV store
          const validatedData = ensureCampaignIntegrity(kvData) as T;
          setData(validatedData);
          
          // Also save to localStorage as backup
          localStorage.setItem(key, JSON.stringify(validatedData));
          
          toast.success(`Loaded ${validatedData.length} campaigns from shared storage`);
        } else {
          // Trigger a direct KV refresh to ensure we have the latest data
          console.log("No KV data found on forced load, directly accessing KV store");
          
          // Force rerender of the component by toggling isLoaded state
          setIsLoaded(false);
          setTimeout(() => {
            setIsLoaded(true);
            
            // Force a browser refresh as a last resort
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        console.error("Error during forced data load:", error);
        toast.error("Failed to refresh campaign data. Trying again...");
        
        // Force a browser refresh as a fallback
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };
    
    window.addEventListener("campaign:init", handleForcedDataLoad);
    
    return () => {
      window.removeEventListener("campaign:init", handleForcedDataLoad);
    };
  }, [key, kvData]);
  
  return [data, setDataAndKV, { isSaving, lastSaved, forceSave }];
}