import { RegionalBudgets } from "@/hooks/useRegionalBudgets";

// LocalStorage key for budget data
export const BUDGET_STORAGE_KEY = 'regionalBudgets';

/**
 * Saves regional budget data to localStorage
 * 
 * @param budgets The budget data to save
 * @returns true if save was successful, false otherwise
 */
export function saveBudgetAssignments(budgets: RegionalBudgets): boolean {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
    
    // Save timestamp
    localStorage.setItem('budgetSaveStatus', JSON.stringify({
      timestamp: new Date().toISOString()
    }));
    
    return true;
  } catch (e) {
    console.error('Error saving budget data:', e);
    return false;
  }
}

/**
 * Loads regional budget data from localStorage with predefined locked values
 * 
 * @param defaultRegions Default regions to ensure exist in the result
 * @returns The loaded budget data or an object with predefined budget values
 */
export function loadBudgetAssignments(defaultRegions: string[] = []): RegionalBudgets {
  // Predefined locked budget values
  const predefinedBudgets = {
    "North APAC": 358000,
    "South APAC": 385500,
    "SAARC": 265000,
    "Digital": 68000
  };
  
  try {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as RegionalBudgets;
      
      // Always enforce predefined locked values
      const result = { ...parsed };
      
      // Ensure all regions exist and have predefined locked values where applicable
      defaultRegions.forEach(region => {
        const predefinedValue = predefinedBudgets[region as keyof typeof predefinedBudgets];
        
        if (predefinedValue) {
          // Always enforce predefined values with locked status
          result[region] = { 
            assignedBudget: predefinedValue, 
            lockedByOwner: true,
            lockedValue: predefinedValue,
            lastLockedBy: "admin",
            // Preserve existing programs if any
            programs: result[region]?.programs || [] 
          };
        } else if (!result[region]) {
          // Create empty non-predefined regions
          result[region] = { assignedBudget: "", programs: [] };
        }
      });
      
      return result;
    }
  } catch (e) {
    console.error('Error loading budget data:', e);
  }
  
  // Return object with predefined budget values if loading fails
  return defaultRegions.reduce((acc, region) => {
    const predefinedValue = predefinedBudgets[region as keyof typeof predefinedBudgets] || "";
    acc[region] = { 
      assignedBudget: predefinedValue, 
      lockedByOwner: true,
      lockedValue: predefinedValue as number,
      lastLockedBy: "admin",
      programs: [] 
    };
    return acc;
  }, {} as RegionalBudgets);
}

/**
 * Reset all budget values to defaults, preserving locked values
 * 
 * @param defaultRegions The regions to include in the reset
 * @returns A fresh budget object with empty or locked values
 */
export function resetBudgetAssignments(defaultRegions: string[] = []): RegionalBudgets {
  // Predefined locked budget values
  const predefinedBudgets = {
    "North APAC": 358000,
    "South APAC": 385500,
    "SAARC": 265000,
    "Digital": 68000
  };
  
  // Ensure all predefined budgets are strictly enforced
  localStorage.removeItem(BUDGET_STORAGE_KEY);
  
  const resetBudgets = defaultRegions.reduce((acc, region) => {
    // Always use predefined values where available
    const predefinedValue = predefinedBudgets[region as keyof typeof predefinedBudgets];
    
    if (predefinedValue) {
      // Create locked region with predefined value
      acc[region] = { 
        assignedBudget: predefinedValue,
        lockedByOwner: true,
        lockedValue: predefinedValue,
        lastLockedBy: "admin",
        programs: [] 
      };
    } else {
      // Default empty for regions without predefined values
      acc[region] = { assignedBudget: "", programs: [] };
    }
    
    return acc;
  }, {} as RegionalBudgets);
  
  // Save the reset values
  saveBudgetAssignments(resetBudgets);
  
  return resetBudgets;
}

/**
 * Ensure that the predefined budget values are strictly enforced
 * regardless of what's saved in storage
 */
export function forceDefaultBudgetValues(): RegionalBudgets {
  // Predefined locked budget values
  const predefinedBudgets = {
    "North APAC": 358000,
    "South APAC": 385500,
    "SAARC": 265000,
    "Digital": 68000
  };
  
  const defaultRegions = Object.keys(predefinedBudgets);
  
  const forcedBudgets = defaultRegions.reduce((acc, region) => {
    const predefinedValue = predefinedBudgets[region as keyof typeof predefinedBudgets];
    
    acc[region] = { 
      assignedBudget: predefinedValue, 
      lockedByOwner: true,
      lockedValue: predefinedValue,
      lastLockedBy: "admin",
      programs: [] 
    };
    
    return acc;
  }, {} as RegionalBudgets);
  
  // Save to storage
  saveBudgetAssignments(forcedBudgets);
  
  return forcedBudgets;
}
/**
 * Calculate totals for a region's budget
 * 
 * @param budgets The full budget data
 * @param region The region to calculate for
 * @returns Object with calculated totals
 */
export function calculateRegionalMetrics(
  budgets: RegionalBudgets, 
  region: string
): { 
  totalForecasted: number; 
  totalActual: number;
  assignedBudget: number | "";
  forecastedPercent: number;
  actualPercent: number;
  forecastedExceedsBudget: boolean;
  actualExceedsBudget: boolean;
} {
  const budgetData = budgets[region];
  
  if (!budgetData) {
    return { 
      totalForecasted: 0, 
      totalActual: 0,
      assignedBudget: "",
      forecastedPercent: 0,
      actualPercent: 0,
      forecastedExceedsBudget: false,
      actualExceedsBudget: false
    };
  }

  const totalForecasted = budgetData.programs.reduce((sum, program) => sum + (program.forecastedCost || 0), 0);
  const totalActual = budgetData.programs.reduce((sum, program) => sum + (program.actualCost || 0), 0);
  const assignedBudget = budgetData.assignedBudget;
  
  const hasAssignedBudget = typeof assignedBudget === "number";
  const forecastedPercent = hasAssignedBudget ? Math.min(100, (totalForecasted / assignedBudget) * 100) : 0;
  const actualPercent = hasAssignedBudget ? Math.min(100, (totalActual / assignedBudget) * 100) : 0;
  
  const forecastedExceedsBudget = hasAssignedBudget && totalForecasted > assignedBudget;
  const actualExceedsBudget = hasAssignedBudget && totalActual > assignedBudget;

  return { 
    totalForecasted, 
    totalActual,
    assignedBudget,
    forecastedPercent,
    actualPercent,
    forecastedExceedsBudget,
    actualExceedsBudget
  };
}