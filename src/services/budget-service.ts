import { RegionalBudgets } from "@/hooks/useRegionalBudgets";
import { OWNER_TO_REGION_MAP } from "@/hooks/useRegionalBudgets";
import { isContractorCampaign } from "@/lib/utils";

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
 * Allocate budget to campaigns based on owner's budget limit
 * @param campaigns Array of campaigns to allocate budget to
 * @returns Object with updated campaigns, allocations, and budget status
 */
export function allocateBudgetToCampaigns(campaigns: any[] = []) {
  // Group campaigns by owner
  const campaignsByOwner: Record<string, any[]> = {};
  
  campaigns.forEach(campaign => {
    if (!campaign.owner) return;
    
    // Ensure campaign type is valid
    if (!campaign.campaignType) {
      return;
    }
    
    if (!campaignsByOwner[campaign.owner]) {
      campaignsByOwner[campaign.owner] = [];
    }
    
    campaignsByOwner[campaign.owner].push(campaign);
  });
  
  // Process each owner's campaigns
  const allocations: Record<string, Record<string, {
    allocated: number;
    forecasted: number;
    actual: number;
    remaining: number;
  }>> = {};
  
  const updatedCampaigns = [...campaigns];
  
  // For each owner
  Object.entries(campaignsByOwner).forEach(([owner, ownerCampaigns]) => {
    // Get owner's budget
    const ownerInfo = getOwnerInfo(owner);
    let remainingBudget = ownerInfo.budget;
    
    allocations[owner] = {};
    
    // Sort campaigns by priority (could be enhanced with actual priority field)
    ownerCampaigns.sort((a, b) => {
      // Default sort by forecasted cost (higher first)
      const costA = parseFloat(a.forecastedCost) || 0;
      const costB = parseFloat(b.forecastedCost) || 0;
      return costB - costA;
    });
    
    // Allocate budget to each campaign
    ownerCampaigns.forEach(campaign => {
      // Get forecasted cost
      let forecastedCost = 0;
      if (typeof campaign.forecastedCost === 'number') {
        forecastedCost = campaign.forecastedCost;
      } else if (typeof campaign.forecastedCost === 'string') {
        const cleanedValue = String(campaign.forecastedCost)
          .replace(/[$,]/g, '')
          .trim();
        forecastedCost = parseFloat(cleanedValue) || 0;
      }
      
      // Get actual cost
      let actualCost = 0;
      if (typeof campaign.actualCost === 'number') {
        actualCost = campaign.actualCost;
      } else if (typeof campaign.actualCost === 'string') {
        const cleanedValue = String(campaign.actualCost)
          .replace(/[$,]/g, '')
          .trim();
        actualCost = parseFloat(cleanedValue) || 0;
      }
      
      // Allocate budget from remaining budget
      const allocated = Math.min(forecastedCost, remainingBudget);
      remainingBudget = Math.max(0, remainingBudget - forecastedCost);
      
      // Store allocation
      if (campaign.id) {
        allocations[owner][campaign.id] = {
          allocated,
          forecasted: forecastedCost,
          actual: actualCost,
          remaining: allocated - forecastedCost
        };
        
        // Update campaign with budget info
        const campaignIndex = updatedCampaigns.findIndex(c => c.id === campaign.id);
        if (campaignIndex >= 0) {
          updatedCampaigns[campaignIndex] = {
            ...updatedCampaigns[campaignIndex],
            allocatedBudget: allocated,
            budgetStatus: allocated < forecastedCost ? 'over-budget' : 'within-budget'
          };
        }
      }
    });
  });
  
  return {
    campaigns: updatedCampaigns,
    allocations,
    ownerBudgets: Object.fromEntries(
      Object.entries(campaignsByOwner).map(([owner, _]) => {
        const ownerInfo = getOwnerInfo(owner);
        const ownerCampaigns = campaigns.filter(c => c.owner === owner);
        const metrics = getOwnerBudgetSummary(owner, ownerCampaigns);
        return [owner, {
          assigned: ownerInfo.budget,
          used: metrics.totalForecasted,
          remaining: ownerInfo.budget - metrics.totalForecasted,
          status: metrics.forecastedExceedsBudget ? 'over-budget' : 'within-budget'
        }];
      })
    )
  };
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
 * - Budget data is pulled directly from the Planning tab campaigns
 * 
 * @param regionalBudgets - All regional budget data
 * @param region - The region to calculate metrics for
 * @returns Budget metrics for the specified region
 */
export function calculateRegionalMetrics(regionalBudgets: RegionalBudgets, region: string) {
  const regionData = regionalBudgets[region] || { programs: [], assignedBudget: "" };
  
  // For budget tracking, we only count programs associated with this region
  const budgetPrograms = regionData.programs.filter(program => {
    // Ensure campaign type is valid
    if (!program.campaignType) {
      return false;
    }
    
    // A program is budget-impacting for this region if:
    // 1. It belongs to the owner of this region
    return true;
  });
  
  // Get assigned budget (may be a number or empty string)
  const assignedBudget = regionData.assignedBudget;
  
  // Track budget allocation per campaign
  const campaignBudgetAllocations: Record<string, { 
    allocated: number, 
    forecasted: number, 
    actual: number, 
    remaining: number 
  }> = {};
  
  // Prepare budget tracking object
  let remainingBudget = typeof assignedBudget === "number" ? assignedBudget : 0;
  
  // Calculate total forecasted cost with budget tracking per campaign
  const totalForecasted = budgetPrograms.reduce(
    (total, program) => {
      // Parse forecastedCost more robustly
      let cost = 0;
      if (typeof program.forecastedCost === 'number') {
        cost = program.forecastedCost;
      } else if (typeof program.forecastedCost === 'string') {
        cost = parseFloat(program.forecastedCost) || 0;
      }
      
      // Calculate allocation for this campaign
      // Each campaign gets allocated its forecasted cost from the remaining budget
      const allocation = Math.min(cost, remainingBudget);
      remainingBudget = Math.max(0, remainingBudget - cost);
      
      // Store allocation details for this campaign
      if (program.id) {
        campaignBudgetAllocations[program.id] = {
          allocated: allocation,
          forecasted: cost,
          actual: 0, // Will be set below
          remaining: allocation - cost
        };
      }
      
      return total + cost;
    },
    0
  );
  
  // Reset remaining budget for actual cost calculation
  remainingBudget = typeof assignedBudget === "number" ? assignedBudget : 0;
  
  // Calculate total actual cost for budget-impacting programs
  const totalActual = budgetPrograms.reduce(
    (total, program) => {
      // Parse actualCost more robustly
      let cost = 0;
      if (typeof program.actualCost === 'number') {
        cost = program.actualCost;
      } else if (typeof program.actualCost === 'string') {
        cost = parseFloat(program.actualCost) || 0;
      }
      
      // Deduct actual cost from remaining budget
      remainingBudget = Math.max(0, remainingBudget - cost);
      
      // Update allocation details for this campaign
      if (program.id && campaignBudgetAllocations[program.id]) {
        campaignBudgetAllocations[program.id].actual = cost;
        campaignBudgetAllocations[program.id].remaining = 
          campaignBudgetAllocations[program.id].allocated - cost;
      }
      
      return total + cost;
    },
    0
  );
  
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
  
  // Calculate final remaining budget after all deductions
  const finalRemainingBudget = typeof assignedBudget === "number" 
    ? Math.max(0, assignedBudget - totalForecasted) 
    : 0;
  
  return {
    totalForecasted,
    totalActual,
    assignedBudget,
    forecastedPercent,
    actualPercent,
    forecastedExceedsBudget,
    actualExceedsBudget,
    forecastedOverage,
    actualOverage,
    campaignAllocations: campaignBudgetAllocations,
    remainingBudget: finalRemainingBudget
  };
}

/**
 * Calculate budget metrics for a specific owner
 * 
 * @param owner - The owner name to calculate budget metrics for
 * @param campaigns - Array of campaign objects to calculate metrics from
 * @returns Budget metrics for the specified owner including allocation per campaign
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
  const ownerCampaigns = campaigns.filter(campaign => {
    // Must be owned by this owner
    if (campaign.owner !== owner) return false;
    
    // Ensure campaign type is valid
    if (!campaign.campaignType) {
      return false;
    }
    
    return true;
  });
  
  // Track budget allocation per campaign
  const campaignBudgetAllocations: Record<string, { 
    allocated: number, 
    forecasted: number, 
    actual: number, 
    remaining: number 
  }> = {};
  
  // Prepare budget tracking object
  let remainingBudget = assignedBudget;
  
  // Calculate totals from filtered campaigns with budget tracking per campaign
  const totalForecasted = ownerCampaigns.reduce(
    (total, campaign) => {
      // Parse forecastedCost more robustly
      let cost = 0;
      if (typeof campaign.forecastedCost === 'number') {
        cost = campaign.forecastedCost;
      } else if (typeof campaign.forecastedCost === 'string') {
        // Handle various string formats, including currency symbols and commas
        const cleanedValue = String(campaign.forecastedCost)
          .replace(/[$,]/g, '') // Remove $ and commas
          .trim();
        cost = parseFloat(cleanedValue) || 0;
      }
      
      // Calculate allocation for this campaign
      // Each campaign gets allocated its forecasted cost from the remaining budget
      const allocation = Math.min(cost, remainingBudget);
      remainingBudget = Math.max(0, remainingBudget - cost);
      
      // Store allocation details for this campaign
      if (campaign.id) {
        campaignBudgetAllocations[campaign.id] = {
          allocated: allocation,
          forecasted: cost,
          actual: 0, // Will be set below
          remaining: allocation - cost
        };
      }
      
      return total + cost;
    }, 
    0
  );
  
  // Reset remaining budget for actual cost calculation
  remainingBudget = assignedBudget;
  
  const totalActual = ownerCampaigns.reduce(
    (total, campaign) => {
      // Parse actualCost more robustly
      let cost = 0;
      if (typeof campaign.actualCost === 'number') {
        cost = campaign.actualCost;
      } else if (typeof campaign.actualCost === 'string') {
        // Handle various string formats, including currency symbols and commas
        const cleanedValue = String(campaign.actualCost)
          .replace(/[$,]/g, '') // Remove $ and commas
          .trim();
        cost = parseFloat(cleanedValue) || 0;
      }
      
      // Deduct actual cost from remaining budget
      remainingBudget = Math.max(0, remainingBudget - cost);
      
      // Update allocation details for this campaign
      if (campaign.id && campaignBudgetAllocations[campaign.id]) {
        campaignBudgetAllocations[campaign.id].actual = cost;
        campaignBudgetAllocations[campaign.id].remaining = 
          campaignBudgetAllocations[campaign.id].allocated - cost;
      }
      
      return total + cost;
    }, 
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
  
  // Calculate final remaining budget after all deductions
  const finalRemainingBudget = Math.max(0, assignedBudget - totalForecasted);
  
  return {
    totalForecasted,
    totalActual,
    assignedBudget,
    forecastedPercent,
    actualPercent,
    forecastedExceedsBudget,
    actualExceedsBudget,
    forecastedOverage,
    actualOverage,
    campaignAllocations: campaignBudgetAllocations,
    remainingBudget: finalRemainingBudget
  };
}