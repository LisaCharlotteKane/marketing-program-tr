import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Campaign } from "@/components/campaign-table";

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
      region: campaign.region || "North APAC",
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
  const [data, setData] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        // Parse saved data and ensure campaign integrity
        const parsedData = JSON.parse(savedData);
        const validatedData = ensureCampaignIntegrity(parsedData) as T;
        setData(validatedData);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error(`Error loading ${key} data:`, error);
      // Instead of showing error, just use default data and log the error
      console.warn(`Using default ${key} data due to loading error`);
      // Only show error if it's not a GitHub API error
      if (!(error instanceof Error) || !error.message.includes("GitHub API")) {
        window.dispatchEvent(
          new CustomEvent("app:error", {
            detail: {
              type: "storage",
              message: `Error loading saved ${key} data. Using defaults.`
            }
          })
        );
      }
      setIsLoaded(true);
    }
  }, [key]);
  
  // Save data when it changes, with debounce
  useEffect(() => {
    // Skip initial render
    if (!isLoaded) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      const saveData = async () => {
        setIsSaving(true);
        try {
          localStorage.setItem(key, JSON.stringify(data));
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
    }, 500); // 500ms debounce
    
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
      localStorage.setItem(key, JSON.stringify(data));
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
  }, [data, key]);
  
  return [data, setData, { isSaving, lastSaved, forceSave }];
}