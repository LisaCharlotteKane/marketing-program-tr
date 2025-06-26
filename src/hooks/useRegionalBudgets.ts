import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";

export interface RegionalBudget {
  assignedBudget: number | "";
  programs: {
    id: string;
    forecastedCost: number;
    actualCost: number;
    owner?: string; // Track owner at the program level
  }[];
  lockedByOwner?: boolean;
  lockedTimestamp?: number;
  ownerName?: string; // Added owner name to track region ownership
}

export interface RegionalBudgets {
  [region: string]: RegionalBudget;
}

interface BudgetStatus {
  isSaving: boolean;
  lastSaved?: Date;
  resetToDefaults: () => void;
}

// Owner to region mapping (updated "North APAC" to "JP & Korea")
export const OWNER_TO_REGION_MAP: Record<string, string> = {
  "Tomoko Tanaka": "JP & Korea",
  "Beverly Leung": "South APAC",
  "Shruti Narang": "SAARC",
  "Giorgia Parham": "Digital Motions"
};

// Default regional budgets - set as per management directive
export const DEFAULT_BUDGETS: RegionalBudgets = {
  "JP & Korea": {
    assignedBudget: 358000,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now(),
    ownerName: "Tomoko Tanaka"
  },
  "South APAC": {
    assignedBudget: 385500,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now(),
    ownerName: "Beverly Leung"
  },
  "SAARC": {
    assignedBudget: 265000,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now(),
    ownerName: "Shruti Narang"
  },
  "Digital Motions": {
    assignedBudget: 68000,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now(),
    ownerName: "Giorgia Parham"
  },
  "X APAC English": {
    assignedBudget: 0,  // No budget assignment needed
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now()
  },
  "X APAC Non English": {
    assignedBudget: 0,  // No budget assignment needed
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now()
  }
};

export function useRegionalBudgets(): [RegionalBudgets, React.Dispatch<React.SetStateAction<RegionalBudgets>>, BudgetStatus] {
  // Use Spark's KV store for shared persistence across users with direct initialization
  const [kvBudgets, setKvBudgets, deleteKvBudgets] = useKV<RegionalBudgets>("regionalBudgets", DEFAULT_BUDGETS);
  
  // Initialize with default budgets
  const [budgets, setBudgets] = useState<RegionalBudgets>(DEFAULT_BUDGETS);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  
  // Load saved budgets on mount
  useEffect(() => {
    try {
      if (kvBudgets) {
        // Data found in KV store
        const mergedBudgets = { ...DEFAULT_BUDGETS };
        
        // Overwrite with saved values, preserving locks
        Object.keys(kvBudgets).forEach(region => {
          if (mergedBudgets[region]) {
            // Preserve the locked status from defaults
            const lockedByOwner = mergedBudgets[region].lockedByOwner;
            const lockedTimestamp = mergedBudgets[region].lockedTimestamp;
            
            mergedBudgets[region] = {
              ...kvBudgets[region],
              lockedByOwner,
              lockedTimestamp
            };
          } else {
            mergedBudgets[region] = kvBudgets[region];
          }
        });
        
        // Only update state if the data is different to prevent loops
        if (JSON.stringify(budgets) !== JSON.stringify(mergedBudgets)) {
          setBudgets(mergedBudgets);
        }
      } else {
        // Fall back to localStorage for backward compatibility
        const savedBudgets = localStorage.getItem("regionalBudgets");
        if (savedBudgets) {
          const parsedBudgets = JSON.parse(savedBudgets);
          
          // Make sure we have entries for all regions from defaults
          const mergedBudgets = { ...DEFAULT_BUDGETS };
          
          // Overwrite with saved values, preserving locks
          Object.keys(parsedBudgets).forEach(region => {
            if (mergedBudgets[region]) {
              // Preserve the locked status from defaults
              const lockedByOwner = mergedBudgets[region].lockedByOwner;
              const lockedTimestamp = mergedBudgets[region].lockedTimestamp;
              
              mergedBudgets[region] = {
                ...parsedBudgets[region],
                lockedByOwner,
                lockedTimestamp
              };
            } else {
              mergedBudgets[region] = parsedBudgets[region];
            }
          });
          
          // Only update state if different to prevent loops
          if (JSON.stringify(budgets) !== JSON.stringify(mergedBudgets)) {
            setBudgets(mergedBudgets);
          }
          
          // Migrate data to KV store, only if different from current KV data
          if (JSON.stringify(kvBudgets) !== JSON.stringify(mergedBudgets)) {
            setKvBudgets(mergedBudgets);
            // Inform user about the migration
            toast.success("Budget data migrated to shared storage");
          }
        } else {
          // Ensure KV has initial data if nothing is found, but only if different
          if (JSON.stringify(kvBudgets) !== JSON.stringify(DEFAULT_BUDGETS)) {
            setKvBudgets(DEFAULT_BUDGETS);
          }
        }
      }
    } catch (error) {
      console.error("Error loading regional budgets:", error);
      // Ensure KV store has the default budgets, but only if different
      if (JSON.stringify(kvBudgets) !== JSON.stringify(DEFAULT_BUDGETS)) {
        setKvBudgets(DEFAULT_BUDGETS);
      }
      // Silently fall back to defaults
    }
  }, [kvBudgets]);
  
  // Custom setter that updates both local state and KV store
  const setBudgetsAndKV = useCallback((newBudgets: React.SetStateAction<RegionalBudgets>) => {
    setBudgets(prev => {
      const nextBudgets = typeof newBudgets === 'function'
        ? (newBudgets as Function)(prev)
        : newBudgets;
      
      // Update KV store when budgets change, but only if they're different
      const currentKvBudgetsString = JSON.stringify(kvBudgets || {});
      const nextBudgetsString = JSON.stringify(nextBudgets);
      
      if (currentKvBudgetsString !== nextBudgetsString) {
        setKvBudgets(nextBudgets);
      }
      
      return nextBudgets;
    });
  }, [setKvBudgets, kvBudgets]);
  
  // Save budgets to localStorage whenever they change (backward compatibility)
  // Use a ref to track if this is the initial render
  const isInitialRender = React.useRef(true);
  const previousBudgetsRef = React.useRef<RegionalBudgets | null>(null);
  
  useEffect(() => {
    // Skip saving on initial render to prevent loop
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousBudgetsRef.current = budgets;
      return;
    }
    
    // Skip if nothing has changed to prevent update loops
    if (previousBudgetsRef.current && 
        JSON.stringify(previousBudgetsRef.current) === JSON.stringify(budgets)) {
      return;
    }
    
    // Update reference for next comparison
    previousBudgetsRef.current = JSON.parse(JSON.stringify(budgets));
    
    const saveData = async () => {
      setIsSaving(true);
      try {
        // Keep localStorage in sync for backward compatibility
        localStorage.setItem("regionalBudgets", JSON.stringify(budgets));
        // KV store is updated directly in setBudgetsAndKV
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving regional budgets:", error);
        toast.error("Failed to save budget data");
      } finally {
        setIsSaving(false);
      }
    };
    
    saveData();
  }, [budgets]);
  
  // Function to reset budgets to defaults
  const resetToDefaults = () => {
    setBudgetsAndKV(DEFAULT_BUDGETS);
    toast.success("Regional budgets reset to defaults");
  };
  
  return [budgets, setBudgetsAndKV, { isSaving, lastSaved, resetToDefaults }];
}