import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export interface RegionalBudget {
  assignedBudget: number | "";
  programs: {
    id: string;
    forecastedCost: number;
    actualCost: number;
  }[];
  lockedByOwner?: boolean;
  lockedTimestamp?: number;
}

export interface RegionalBudgets {
  [region: string]: RegionalBudget;
}

interface BudgetStatus {
  isSaving: boolean;
  lastSaved?: Date;
  resetToDefaults: () => void;
}

// Default regional budgets - set as per management directive
const DEFAULT_BUDGETS: RegionalBudgets = {
  "North APAC": {
    assignedBudget: 358000,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now()
  },
  "South APAC": {
    assignedBudget: 385500,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now()
  },
  "SAARC": {
    assignedBudget: 265000,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now()
  },
  "Digital": {
    assignedBudget: 68000,
    programs: [],
    lockedByOwner: true,
    lockedTimestamp: Date.now()
  }
};

export function useRegionalBudgets(): [RegionalBudgets, React.Dispatch<React.SetStateAction<RegionalBudgets>>, BudgetStatus] {
  // Initialize with default budgets
  const [budgets, setBudgets] = useState<RegionalBudgets>(DEFAULT_BUDGETS);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  
  // Load saved budgets from localStorage on mount
  useEffect(() => {
    try {
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
        
        setBudgets(mergedBudgets);
      }
    } catch (error) {
      console.error("Error loading regional budgets:", error);
      // Silently fall back to defaults
    }
  }, []);
  
  // Save budgets to localStorage whenever they change
  useEffect(() => {
    const saveData = async () => {
      setIsSaving(true);
      try {
        localStorage.setItem("regionalBudgets", JSON.stringify(budgets));
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
    setBudgets(DEFAULT_BUDGETS);
    toast.success("Regional budgets reset to defaults");
  };
  
  return [budgets, setBudgets, { isSaving, lastSaved, resetToDefaults }];
}