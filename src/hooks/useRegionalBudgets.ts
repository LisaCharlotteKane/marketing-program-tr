import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface RegionalBudget {
  assignedBudget: number | "";
  programs: {
    id: string;
    forecastedCost: number;
    actualCost: number;
    owner?: string; // Track owner at the program level
    nonBudgetImpacting?: boolean; // Flag for programs that don't impact budget
    campaignType?: string; // Store campaign type to filter out contractor campaigns
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

// Owner to region mapping
export const OWNER_TO_REGION_MAP = {
  "Tomoko Tanaka": "JP & Korea",
  "Beverly Leung": "South APAC", 
  "Shruti Narang": "SAARC",
  "Giorgia Parham": "Digital Motions"
};

// Default budget allocations with locked states
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
  const [budgets, setBudgets] = useState<RegionalBudgets>(DEFAULT_BUDGETS);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  
  // Load saved budgets on mount
  useEffect(() => {
    try {
      const savedBudgets = localStorage.getItem("regionalBudgets");
      if (savedBudgets) {
        const parsedBudgets = JSON.parse(savedBudgets);
        const mergedBudgets = { ...DEFAULT_BUDGETS };
        
        // Merge saved data with defaults
        Object.keys(parsedBudgets).forEach(region => {
          if (mergedBudgets[region]) {
            mergedBudgets[region] = {
              ...mergedBudgets[region],
              ...parsedBudgets[region]
            };
          } else {
            mergedBudgets[region] = parsedBudgets[region];
          }
        });
        
        setBudgets(mergedBudgets);
      }
    } catch (error) {
      console.error("Error loading regional budgets:", error);
      setBudgets(DEFAULT_BUDGETS);
    }
  }, []);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      try {
        localStorage.setItem("regionalBudgets", JSON.stringify(budgets));
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving regional budgets:", error);
        toast.error("Failed to save budget changes");
      } finally {
        setIsSaving(false);
      }
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [budgets]);

  const resetToDefaults = useCallback(() => {
    setBudgets(DEFAULT_BUDGETS);
    localStorage.removeItem("regionalBudgets");
    toast.success("Budget settings reset to defaults");
  }, []);

  const budgetStatus: BudgetStatus = {
    isSaving,
    lastSaved,
    resetToDefaults
  };

  return [budgets, setBudgets, budgetStatus];
}