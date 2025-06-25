import { RegionalBudgets } from "@/hooks/useRegionalBudgets";
import { OWNER_TO_REGION_MAP } from "@/hooks/useRegionalBudgets";

export function getOwnerInfo(owner: string) {
  // Find the region associated with this owner
  const ownerRegion = Object.entries(OWNER_TO_REGION_MAP)
    .find(([ownerName]) => ownerName === owner)?.[1];
    
  return {
    region: ownerRegion,
    budget: ownerRegion ? getBudgetByRegion(ownerRegion) : 0,
  };
}

export function getBudgetByRegion(region: string): number {
  const budgetMap: Record<string, number> = {
    "JP & Korea": 358000,
    "South APAC": 385500,
    "SAARC": 265000,
    "Digital Motions": 68000
  };
  
  return budgetMap[region] || 0;
}

export function calculateRegionalMetrics(regionalBudgets: RegionalBudgets, region: string) {
  const regionData = regionalBudgets[region] || { programs: [], assignedBudget: "" };
  
  // Filter out non-budget impacting programs (only count programs by the region owner)
  const budgetPrograms = regionData.programs.filter(program => !program.nonBudgetImpacting);
  
  // Calculate total forecasted cost for budget-impacting programs
  const totalForecasted = budgetPrograms.reduce(
    (total, program) => total + (program.forecastedCost || 0),
    0
  );
  
  // Calculate total actual cost for budget-impacting programs
  const totalActual = budgetPrograms.reduce(
    (total, program) => total + (program.actualCost || 0),
    0
  );
  
  // Get assigned budget (may be a number or empty string)
  const assignedBudget = regionData.assignedBudget;
  
  // Calculate percentages if budget is assigned
  const forecastedPercent = typeof assignedBudget === "number" && assignedBudget > 0 
    ? (totalForecasted / assignedBudget) * 100
    : 0;
    
  const actualPercent = typeof assignedBudget === "number" && assignedBudget > 0
    ? (totalActual / assignedBudget) * 100
    : 0;
  
  // Determine if forecasted or actual costs exceed budget
  const forecastedOverage = typeof assignedBudget === "number" ? Math.max(0, totalForecasted - assignedBudget) : 0;
  const actualOverage = typeof assignedBudget === "number" ? Math.max(0, totalActual - assignedBudget) : 0;
  
  // Only flag as exceeded if overage is greater than $500
  const forecastedExceedsBudget = forecastedOverage > 500;
  const actualExceedsBudget = actualOverage > 500;
  
  return {
    totalForecasted,
    totalActual,
    assignedBudget,
    forecastedPercent,
    actualPercent,
    forecastedExceedsBudget,
    actualExceedsBudget,
    forecastedOverage,
    actualOverage
  };
}