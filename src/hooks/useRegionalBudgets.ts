import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { saveBudgetAssignments, loadBudgetAssignments, resetBudgetAssignments, BUDGET_STORAGE_KEY } from '@/services/budget-service';
import { syncBudgetsToGitHub, isAutoGitHubSyncAvailable } from '@/services/auto-github-sync';

// Define regional budget data type
export interface RegionalBudget {
  assignedBudget: number | "";
  lockedByOwner?: boolean;
  lockedValue?: number;
  lastLockedBy?: string;
  programs: {
    id: string;
    forecastedCost: number;
    actualCost: number;
  }[];
}

export interface RegionalBudgets {
  [key: string]: RegionalBudget;
}

// Default regions
const DEFAULT_REGIONS = ["North APAC", "South APAC", "SAARC", "Digital"];

/**
 * Custom hook to manage and persist regional budget data
 * 
 * @param initialValue Default budget structure if nothing is in storage
 * @returns Regional budgets state, setter, and status info
 */
export function useRegionalBudgets(
  initialValue: RegionalBudgets = DEFAULT_REGIONS.reduce((acc, region) => {
    acc[region] = { assignedBudget: "", programs: [] };
    return acc;
  }, {} as RegionalBudgets)
): [
  RegionalBudgets,                          // Budget data
  React.Dispatch<React.SetStateAction<RegionalBudgets>>, // Setter function
  {                                        // Status object
    isSaving: boolean,                     // Whether saving is in progress
    lastSaved: Date | null,                // When last save completed
    resetToDefaults: () => void            // Function to reset budgets to defaults
  }
] {
  // State to store budgets
  const [budgets, setBudgets] = useState<RegionalBudgets>(initialValue);
  
  // Save status tracking
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Data loaded flag - prevents overwriting with initialValue after loading
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // State to track GitHub sync status
  const [githubSyncEnabled, setGithubSyncEnabled] = useState(false);
  
  // Ref for debounce handling
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize GitHub sync check
  useEffect(() => {
    setGithubSyncEnabled(isAutoGitHubSyncAvailable());
  }, []);
  
  // Load initial data from storage
  useEffect(() => {
    const loadInitialData = () => {
      try {
        // Load from storage with default regions
        const loadedData = loadBudgetAssignments(DEFAULT_REGIONS);
        setBudgets(loadedData);
        
        // Try to get last saved timestamp
        const statusStr = localStorage.getItem('budgetSaveStatus');
        if (statusStr) {
          try {
            const status = JSON.parse(statusStr);
            if (status.timestamp) {
              setLastSaved(new Date(status.timestamp));
            }
          } catch (e) {
            console.error('Error parsing budget save timestamp:', e);
          }
        }
      } catch (e) {
        console.error('Error loading regional budget data:', e);
        toast.error('Error loading saved budget data');
      } finally {
        setDataLoaded(true);
      }
    };
    
    loadInitialData();
  }, []);

  // Save function
  const saveBudgets = useCallback(async (data: RegionalBudgets) => {
    setIsSaving(true);
    
    try {
      const success = saveBudgetAssignments(data);
      
      if (success) {
        setLastSaved(new Date());
        
        // Attempt to sync to GitHub if enabled
        if (githubSyncEnabled) {
          syncBudgetsToGitHub(data).catch(error => {
            console.error("GitHub budget sync error:", error);
            // Silent failure for auto-sync
          });
        }
      } else {
        toast.error('Error saving budget data');
      }
    } catch (e) {
      console.error('Error saving budget data:', e);
      toast.error('Error saving budget data');
    } finally {
      setIsSaving(false);
    }
  }, [githubSyncEnabled]);

  // Reset to defaults function
  const resetToDefaults = useCallback(() => {
    const defaultData = resetBudgetAssignments(DEFAULT_REGIONS);
    setBudgets(defaultData);
    setLastSaved(new Date());
    
    // Sync reset to GitHub if enabled
    if (githubSyncEnabled) {
      syncBudgetsToGitHub(defaultData).catch(error => {
        console.error("GitHub budget sync error on reset:", error);
      });
    }
    
    toast.success('Budget values reset to defaults');
  }, [githubSyncEnabled]);

  // Auto-save effect when budgets change
  useEffect(() => {
    // Don't save until initial data is loaded
    if (!dataLoaded) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save (500ms)
    saveTimeoutRef.current = setTimeout(() => {
      saveBudgets(budgets);
    }, 500);
    
    // Clean up timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [budgets, dataLoaded, saveBudgets]);

  // Handle beforeunload to ensure data is saved
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        
        // Synchronous localStorage save as a fallback
        try {
          localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
          localStorage.setItem('budgetSaveStatus', JSON.stringify({
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          console.error('Error in emergency budget save:', e);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [budgets]);

  return [
    budgets,
    setBudgets,
    {
      isSaving,
      lastSaved,
      resetToDefaults
    }
  ];
}