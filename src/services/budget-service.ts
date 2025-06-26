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

/**
 * Calculate budget metrics for a region
 * 
 * Important: Budget deduction is based on campaign owner, not the campaign's region.
 * This means:
 * - A campaign's cost impacts the budget of the owner's assigned region
 * - Each region has a designated owner:
 *   - "Tomoko Tanaka" → "JP & Korea" = $358,000
 *   - "Beverly Leung" → "South APAC" = $385,500
 *   - "Shruti Narang" → "SAARC" = $265,000
 *   - "Giorgia Parham" → "Digital Motions" = $68,000
 * - All campaigns are flagged as either budgetImpacting or nonBudgetImpacting in App.tsx
 * 
 * @param regionalBudgets - All regional budget data
 * @param region - The region to calculate metrics for
 * @returns Budget metrics for the specified region
 */
export function calculateRegionalMetrics(regionalBudgets: RegionalBudgets, region: string) {
  const regionData = regionalBudgets[region] || { programs: [], assignedBudget: "" };
  
  // Budget deduction logic is now based strictly on owner, not region
  // For budget tracking, we only count programs owned by the region's owner
  // The nonBudgetImpacting flag is set in App.tsx when programs are assigned to regions
  const budgetPrograms = regionData.programs.filter(program => {
    // A program is budget-impacting if it belongs to the region's owner
    return !program.nonBudgetImpacting;
  });
  
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