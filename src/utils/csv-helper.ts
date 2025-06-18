/**
 * Utility functions for CSV processing and campaign data handling
 */

import Papa from "papaparse";
import { Campaign } from "@/components/campaign-table";

/**
 * Validates a campaign object against required fields and constraints
 * @param campaign The campaign object to validate
 * @param rowIndex The index of the row in the CSV (for error messages)
 * @returns An array of error messages (empty if no errors)
 */
export function validateCampaign(campaign: Partial<Campaign>, rowIndex: number): string[] {
  const errors: string[] = [];
  const validRegions = ["North APAC", "South APAC", "SAARC", "Digital", "X APAC Non English", "X APAC English"];
  const validStatus = ["Planning", "On Track", "Shipped", "Cancelled"];
  
  // Check required fields
  if (!campaign.campaignType) {
    errors.push(`Row ${rowIndex}: Campaign Type is required.`);
  }
  
  // Validate regions that don't require budget allocation
  if (campaign.region && (campaign.region === "X APAC Non English" || campaign.region === "X APAC English")) {
    // These regions don't need budget allocation - keep for reporting purposes
  } else if (campaign.region) {
    // Validate other regions against the valid list
    if (!validRegions.includes(campaign.region as string)) {
      errors.push(`Row ${rowIndex}: Invalid region "${campaign.region}". Must be one of: ${validRegions.join(", ")}`);
    }
  } else {
    errors.push(`Row ${rowIndex}: Region is required.`);
  }
  
  if (!campaign.country) {
    errors.push(`Row ${rowIndex}: Country is required.`);
  }
  
  if (!campaign.owner) {
    errors.push(`Row ${rowIndex}: Owner is required.`);
  }
  
  // Validate status if provided
  if (campaign.status && !validStatus.includes(campaign.status)) {
    errors.push(`Row ${rowIndex}: Invalid status "${campaign.status}". Must be one of: ${validStatus.join(", ")}`);
  }
  
  // Validate numeric fields
  if (campaign.forecastedCost !== "" && typeof campaign.forecastedCost === 'string' && isNaN(Number(campaign.forecastedCost))) {
    errors.push(`Row ${rowIndex}: Forecasted Cost must be a number.`);
  }
  
  if (campaign.expectedLeads !== "" && typeof campaign.expectedLeads === 'string' && isNaN(Number(campaign.expectedLeads))) {
    errors.push(`Row ${rowIndex}: Expected Leads must be a number.`);
  }
  
  return errors;
}

/**
 * Calculate derived fields for a campaign based on its input data
 * @param campaign The campaign to update with calculated fields
 */
export function calculateDerivedFields(campaign: Partial<Campaign>): Partial<Campaign> {
  const updatedCampaign = { ...campaign };
  
  if (campaign.campaignType === "In-Account Events (1:1)") {
    // Special logic for "In-Account Events (1:1)" campaigns
    if (typeof campaign.expectedLeads === 'number' && !isNaN(campaign.expectedLeads) && campaign.expectedLeads > 0) {
      // Standard calculation if leads are provided
      const leads = campaign.expectedLeads;
      updatedCampaign.mql = Math.round(leads * 0.1);
      updatedCampaign.sql = Math.round(leads * 0.06);
      updatedCampaign.opportunities = Math.round((updatedCampaign.sql as number) * 0.8);
      updatedCampaign.pipelineForecast = (updatedCampaign.opportunities as number) * 50000;
    } 
    // If no leads but cost exists, use 20:1 ROI calculation
    else if (typeof campaign.forecastedCost === 'number' && !isNaN(campaign.forecastedCost) && campaign.forecastedCost > 0) {
      const cost = campaign.forecastedCost;
      updatedCampaign.pipelineForecast = cost * 20; // 20:1 ROI based on cost
      updatedCampaign.mql = 0;
      updatedCampaign.sql = 0;
      updatedCampaign.opportunities = 0;
    } else {
      // Reset calculated values if input is invalid
      updatedCampaign.mql = 0;
      updatedCampaign.sql = 0;
      updatedCampaign.opportunities = 0;
      updatedCampaign.pipelineForecast = 0;
    }
  } 
  // Standard calculation for all other campaign types
  else if (typeof campaign.expectedLeads === 'number' && !isNaN(campaign.expectedLeads) && campaign.expectedLeads > 0) {
    const leads = campaign.expectedLeads;
    updatedCampaign.mql = Math.round(leads * 0.1);
    updatedCampaign.sql = Math.round(leads * 0.06);
    updatedCampaign.opportunities = Math.round((updatedCampaign.sql as number) * 0.8);
    updatedCampaign.pipelineForecast = (updatedCampaign.opportunities as number) * 50000;
  } else {
    // Reset calculated values if input is invalid
    updatedCampaign.mql = 0;
    updatedCampaign.sql = 0;
    updatedCampaign.opportunities = 0;
    updatedCampaign.pipelineForecast = 0;
  }
  
  return updatedCampaign;
}

/**
 * Converts raw CSV data to campaign objects with validation
 * @param csvData The raw CSV data as string
 * @returns Object containing imported campaigns, errors, and warnings
 */
export function processCsvData(csvData: string): { 
  campaigns: Campaign[], 
  errors: string[], 
  warnings: string[] 
} {
  const result = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  
  const importedCampaigns: Campaign[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Owner to region mapping for budget purposes
  const ownerToRegionMap = {
    "Tomoko Tanaka": "North APAC",
    "Beverly Leung": "South APAC",
    "Shruti Narang": "SAARC",
    "Giorgia Parham": "Digital",
  };

  // Budget pool tracking by region owner
  const budgetPoolByRegionOwner = {
    "North APAC": { owner: "Tomoko Tanaka", budget: 358000 },
    "South APAC": { owner: "Beverly Leung", budget: 385500 },
    "SAARC": { owner: "Shruti Narang", budget: 265000 },
    "Digital": { owner: "Giorgia Parham", budget: 68000 },
  };
  
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(error => {
      errors.push(`CSV parsing error: ${error.message} at row ${error.row}`);
    });
  }
  
  // Check for critical missing headers
  const requiredHeaders = ["campaignType", "region", "country", "owner"];
  const missingHeaders = requiredHeaders.filter(header => 
    !result.meta.fields?.includes(header)
  );
  
  if (missingHeaders.length > 0) {
    missingHeaders.forEach(header => {
      errors.push(`CSV is missing required column: "${header}"`);
    });
    return { campaigns: [], errors, warnings };
  }
  
  // Process each row
  result.data.forEach((row: any, index: number) => {
    try {
      // Skip completely empty rows
      if (Object.keys(row).filter(key => row[key]?.toString().trim()).length === 0) return;
      
      // Generate an ID if not provided
      const campaignId = row.id || Math.random().toString(36).substring(2, 9);
      
      // Process strategic pillars with error handling
      let strategicPillars: string[] = [];
      try {
        if (row.strategicPillars) {
          strategicPillars = row.strategicPillars
            .split(",")
            .map((p: string) => p.trim())
            .filter(Boolean);
        }
      } catch (e) {
        warnings.push(`Row ${index + 2}: Could not parse strategic pillars. Using empty array instead.`);
      }
      
      // Process impacted regions with error handling
      let impactedRegions: string[] = [];
      try {
        if (row.impactedRegions) {
          impactedRegions = row.impactedRegions
            .split(",")
            .map((r: string) => r.trim())
            .filter(Boolean);
        }
      } catch (e) {
        warnings.push(`Row ${index + 2}: Could not parse impacted regions. Using empty array instead.`);
      }
      
      // Parse boolean values
      const poRaised = row.poRaised === "true" || row.poRaised === true || row.poRaised === "yes" || row.poRaised === "Yes";
      
      // Build the campaign object
      let campaign: Partial<Campaign> = {
        id: campaignId,
        campaignName: row.campaignName?.toString().trim() || "",
        campaignType: row.campaignType?.toString().trim() || "",
        strategicPillars: strategicPillars,
        revenuePlay: row.revenuePlay?.toString().trim() || "",
        fiscalYear: row.fiscalYear?.toString().trim() || "",
        quarterMonth: row.quarterMonth?.toString().trim() || "",
        region: row.region?.toString().trim() || "",
        country: row.country?.toString().trim() || "",
        owner: row.owner?.toString().trim() || "",
        description: row.description?.toString().trim() || "",
        forecastedCost: row.forecastedCost ? Number(row.forecastedCost) : "",
        expectedLeads: row.expectedLeads ? Number(row.expectedLeads) : "",
        impactedRegions: impactedRegions,
        status: row.status?.toString().trim() || "Planning",
        poRaised: poRaised,
        campaignCode: row.campaignCode?.toString().trim() || "",
        issueLink: row.issueLink?.toString().trim() || "",
        actualCost: row.actualCost ? Number(row.actualCost) : "",
        actualLeads: row.actualLeads ? Number(row.actualLeads) : "",
        actualMQLs: row.actualMQLs ? Number(row.actualMQLs) : "",
        mql: 0,
        sql: 0,
        opportunities: 0,
        pipelineForecast: 0
      };
      
      // Validate the campaign
      const validationErrors = validateCampaign(campaign, index + 2);
      
      // Check budget pool for owner
      const owner = campaign.owner;
      const cost = typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : parseFloat(campaign.forecastedCost as string || "0");
      
      if (owner && cost > 0) {
        // Get the appropriate region for budget tracking based on owner
        const budgetRegion = ownerToRegionMap[owner];
        
        // Only check budget allocation for owners with a region mapping
        if (budgetRegion && budgetPoolByRegionOwner[budgetRegion]) {
          budgetPoolByRegionOwner[budgetRegion].budget -= cost;
          
          // Add warning if budget pool is exceeded
          if (budgetPoolByRegionOwner[budgetRegion].budget < 0) {
            warnings.push(`Row ${index + 2}: ${owner} has exceeded their ${budgetRegion} budget pool by ${formatCurrency(-budgetPoolByRegionOwner[budgetRegion].budget)}`);
          }
        } else if (!budgetRegion) {
          errors.push(`Row ${index + 2}: Unknown owner or no region mapping for: ${owner}`);
        }
      }
      
      if (validationErrors.length === 0) {
        // Calculate derived fields
        campaign = calculateDerivedFields(campaign);
        importedCampaigns.push(campaign as Campaign);
      } else {
        errors.push(...validationErrors);
      }
    } catch (error) {
      console.error('Error processing row:', error);
      errors.push(`Row ${index + 2}: ${(error as Error).message}`);
    }
  });
  
  // Format currency for user-friendly messages
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }
  
  return {
    campaigns: importedCampaigns,
    errors,
    warnings
  };
}

/**
 * Exports campaigns to CSV format
 * @param campaigns The campaigns to export
 * @returns CSV string data
 */
export function exportCampaignsToCsv(campaigns: Campaign[]): string {
  // Flatten the campaigns for CSV export with proper field formatting
  const flattenedCampaigns = campaigns.map(c => ({
    id: c.id,
    campaignName: c.campaignName || "",
    campaignType: c.campaignType || "",
    strategicPillars: Array.isArray(c.strategicPillars) ? c.strategicPillars.join(", ") : "",
    revenuePlay: c.revenuePlay || "",
    fiscalYear: c.fiscalYear || "",
    quarterMonth: c.quarterMonth || "",
    region: c.region || "",
    country: c.country || "",
    owner: c.owner || "",
    description: c.description || "",
    forecastedCost: typeof c.forecastedCost === 'number' ? c.forecastedCost : "",
    expectedLeads: typeof c.expectedLeads === 'number' ? c.expectedLeads : "",
    impactedRegions: Array.isArray(c.impactedRegions) ? c.impactedRegions.join(", ") : "",
    status: c.status || "Planning",
    poRaised: c.poRaised ? "true" : "false",
    campaignCode: c.campaignCode || "",
    issueLink: c.issueLink || "",
    actualCost: typeof c.actualCost === 'number' ? c.actualCost : "",
    actualLeads: typeof c.actualLeads === 'number' ? c.actualLeads : "",
    actualMQLs: typeof c.actualMQLs === 'number' ? c.actualMQLs : "",
    mql: c.mql,
    sql: c.sql,
    opportunities: c.opportunities,
    pipelineForecast: c.pipelineForecast
  }));
  
  // Generate CSV content
  return Papa.unparse(flattenedCampaigns);
}