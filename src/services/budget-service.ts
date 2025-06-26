import { RegionalBudgets } from "@/hooks/useRegionalBudgets";
import { OWNER_TO_REGION_MAP } from "@/hooks/useRegionalBudgets";

/**
 * Gets the budget region and amount for a specific owner
 * @param owner The campaign owner's name
 * @returns Object with region and budget amount
 */
export function getOwnerInfo(owner: string) {
  // Find the region associated with this owner
  const ownerRegion = OWNER_TO_REGION_MAP[owner];
    
  return {
    region: ownerRegion,
    budget: ownerRegion ? getBudgetByRegion(ownerRegion) : 0,
  };
}

/**
 * Gets the assigned budget amount for a given region
 * @param region The region name
 * @returns The budget amount assigned to this region
 */
export function getBudgetByRegion(region: string): number {
  const budgetMap: Record<string, number> = {
    "JP & Korea": 358000,
    "South APAC": 385500,
    "SAARC": 265000,
    "Digital Motions": 68000,
    "X APAC English": 0,
    "X APAC Non English": 0
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
 * - Contractor/Infrastructure campaigns are excluded from budget calculations
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
    // Skip if explicitly marked as non-budget impacting
    if (program.nonBudgetImpacting) return false;
    
    // Skip contractor/infrastructure programs
    if (program.campaignType === "Contractor" || program.campaignType === "Contractor/Infrastructure") {
      return false;
    }
    
    // A program is budget-impacting if it belongs to the region's owner
    return true;
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

/**
 * Calculate budget metrics for a specific owner
 * 
 * @param owner - The owner name to calculate budget metrics for
 * @param campaigns - Array of campaign objects to calculate metrics from
 * @returns Budget metrics for the specified owner
 */
export function getOwnerBudgetSummary(owner: string, campaigns: any[] = []) {
  // Get the owner's budget region and assigned budget
  const ownerBudgets: Record<string, number> = {
    "Tomoko Tanaka": 358000,
    "Beverly Leung": 385500,
    "Shruti Narang": 265000,
    "Giorgia Parham": 68000
  };

  const assignedBudget = ownerBudgets[owner] || 0;
  
  // Filter campaigns by owner, excluding contractor/infrastructure campaigns
  const ownerCampaigns = campaigns.filter(campaign => 
    campaign.owner === owner && 
    campaign.campaignType !== "Contractor" && 
    campaign.campaignType !== "Contractor/Infrastructure"
  );
  
  // Calculate totals from filtered campaigns
  const totalForecasted = ownerCampaigns.reduce(
    (total, campaign) => total + (parseFloat(campaign.forecastedCost) || 0), 
    0
  );
  
  const totalActual = ownerCampaigns.reduce(
    (total, campaign) => total + (parseFloat(campaign.actualCost) || 0), 
    0
  );
  
  // Calculate percentages if budget is assigned
  const forecastedPercent = assignedBudget > 0 
    ? (totalForecasted / assignedBudget) * 100
    : 0;
    
  const actualPercent = assignedBudget > 0
    ? (totalActual / assignedBudget) * 100
    : 0;
  
  // Determine if forecasted or actual costs exceed budget
  const forecastedOverage = Math.max(0, totalForecasted - assignedBudget);
  const actualOverage = Math.max(0, totalActual - assignedBudget);
  
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