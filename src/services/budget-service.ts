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
 * Loads regional budget data from localStorage
 * 
 * @param defaultRegions Default regions to ensure exist in the result
 * @returns The loaded budget data or an empty object with default regions
 */
export function loadBudgetAssignments(defaultRegions: string[] = []): RegionalBudgets {
  try {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as RegionalBudgets;
      
      // Ensure all default regions exist
      if (defaultRegions.length > 0) {
        const result = { ...parsed };
        
        defaultRegions.forEach(region => {
          if (!result[region]) {
            result[region] = { assignedBudget: "", programs: [] };
          }
        });
        
        return result;
      }
      
      return parsed;
    }
  } catch (e) {
    console.error('Error loading budget data:', e);
  }
  
  // Return empty object with default regions if loading fails
  return defaultRegions.reduce((acc, region) => {
    acc[region] = { assignedBudget: "", programs: [] };
    return acc;
  }, {} as RegionalBudgets);
}

/**
 * Reset all budget values to defaults
 * 
 * @param defaultRegions The regions to include in the reset
 * @returns A fresh budget object with empty values
 */
export function resetBudgetAssignments(defaultRegions: string[] = []): RegionalBudgets {
  const resetBudgets = defaultRegions.reduce((acc, region) => {
    acc[region] = { assignedBudget: "", programs: [] };
    return acc;
  }, {} as RegionalBudgets);
  
  // Save the reset values
  saveBudgetAssignments(resetBudgets);
  
  return resetBudgets;
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
  const totalActual = budgetData.programs.reduce((sum, program) => sum + (typeof program.actualCost === 'number' ? program.actualCost : 0), 0);
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