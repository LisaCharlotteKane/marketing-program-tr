import Papa from "papaparse";
import { Campaign } from "@/components/campaign-table";
import { OWNER_TO_REGION_MAP } from "@/hooks/useRegionalBudgets";
import { getOwnerInfo, getBudgetByRegion } from "@/services/budget-service";

/**
 * Validates a campaign object against required fields and constraints
 * @param campaign The campaign object to validate
 * @param rowIndex The index of the row in the CSV (for error messages)
 * @returns An array of error messages (empty if no errors)
 */
export function validateCampaign(campaign: Partial<Campaign>, rowIndex: number): string[] {
  const errors: string[] = [];
  const validRegions = ["JP & Korea", "South APAC", "SAARC", "Digital Motions", "X APAC Non English", "X APAC English"];
  const validStatus = ["Planning", "On Track", "Shipped", "Cancelled"];
  const validPillars = [
    "Account Growth and Product Adoption",
    "Pipeline Acceleration & Executive Engagement",
    "Brand Awareness & Top of Funnel Demand Generation",
    "New Logo Acquisition"
  ];
  
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
  
  // Validate strategic pillars
  if (campaign.strategicPillars && Array.isArray(campaign.strategicPillars)) {
    // Check if it's empty
    if (campaign.strategicPillars.length === 0) {
      errors.push(`Row ${rowIndex}: No Strategic Pillars provided. At least one is recommended.`);
    } else {
      // Check if all pillars are valid
      const invalidPillars = campaign.strategicPillars.filter(pillar => !validPillars.includes(pillar));
      if (invalidPillars.length > 0) {
        errors.push(`Row ${rowIndex}: Some Strategic Pillars may be invalid: ${invalidPillars.join(", ")}. 
        Valid options are: ${validPillars.join(", ")}`);
      }
    }
  }
  
  // Validate numeric fields
  if (campaign.forecastedCost !== undefined && campaign.forecastedCost !== "") {
    // Check if it's already a number type
    if (typeof campaign.forecastedCost === 'number') {
      if (isNaN(campaign.forecastedCost)) {
        errors.push(`Row ${rowIndex}: Forecasted Cost is not a valid number.`);
      } else if (campaign.forecastedCost < 0) {
        errors.push(`Row ${rowIndex}: Forecasted Cost cannot be negative.`);
      }
    } 
    // If it's a string, try to parse it
    else if (typeof campaign.forecastedCost === 'string') {
      // Clean the string first
      const cleanValue = campaign.forecastedCost.replace(/[$,]/g, '').trim();
      if (isNaN(Number(cleanValue))) {
        errors.push(`Row ${rowIndex}: Forecasted Cost must be a number. Found: "${campaign.forecastedCost}"`);
      }
    }
  }
  
  if (campaign.expectedLeads !== undefined && campaign.expectedLeads !== "") {
    // Check if it's already a number type
    if (typeof campaign.expectedLeads === 'number') {
      if (isNaN(campaign.expectedLeads)) {
        errors.push(`Row ${rowIndex}: Forecasted Leads is not a valid number.`);
      } else if (campaign.expectedLeads < 0) {
        errors.push(`Row ${rowIndex}: Forecasted Leads cannot be negative.`);
      }
    } 
    // If it's a string, try to parse it
    else if (typeof campaign.expectedLeads === 'string') {
      // Clean the string first
      const cleanValue = campaign.expectedLeads.replace(/,/g, '').trim();
      if (isNaN(Number(cleanValue))) {
        errors.push(`Row ${rowIndex}: Forecasted Leads must be a number. Found: "${campaign.expectedLeads}"`);
      }
    }
  }
  
  return errors;
}

/**
 * Calculate derived fields for a campaign based on its input data
 * @param campaign The campaign to update with calculated fields
 */
export function calculateDerivedFields(campaign: Partial<Campaign>): Partial<Campaign> {
  const updatedCampaign = { ...campaign };
  let expectedLeads = 0;
  let forecastedCost = 0;
  
  // Normalize numeric inputs with more robust error handling
  if (typeof campaign.expectedLeads === 'number' && !isNaN(campaign.expectedLeads)) {
    expectedLeads = campaign.expectedLeads;
  } else if (typeof campaign.expectedLeads === 'string' && campaign.expectedLeads !== "") {
    // Try to clean the string before parsing
    const cleanValue = campaign.expectedLeads.replace(/[,\s]/g, '').trim();
    const parsedLeads = parseFloat(cleanValue);
    if (!isNaN(parsedLeads)) {
      expectedLeads = parsedLeads;
      // Convert the string to a number in the campaign object
      updatedCampaign.expectedLeads = parsedLeads;
    }
  }
  
  if (typeof campaign.forecastedCost === 'number' && !isNaN(campaign.forecastedCost)) {
    forecastedCost = campaign.forecastedCost;
  } else if (typeof campaign.forecastedCost === 'string' && campaign.forecastedCost !== "") {
    // Try to clean the string before parsing
    const cleanValue = campaign.forecastedCost.replace(/[$,\s]/g, '').trim();
    const parsedCost = parseFloat(cleanValue);
    if (!isNaN(parsedCost)) {
      forecastedCost = parsedCost;
      // Convert the string to a number in the campaign object
      updatedCampaign.forecastedCost = parsedCost;
    }
  }
  
  console.log("Calculating derived fields:", { 
    campaignName: campaign.campaignName,
    campaignType: campaign.campaignType,
    expectedLeads,
    forecastedCost,
    originalExpectedLeads: campaign.expectedLeads,
    originalForecastedCost: campaign.forecastedCost,
    expectedLeadsType: typeof expectedLeads,
    forecastedCostType: typeof forecastedCost
  });
  
  // Check for In-Account programs (various naming variations)
  const isInAccountEvent = campaign.campaignType?.includes("In-Account") || 
                         campaign.campaignType?.includes("In Account") ||
                         campaign.campaignType === "In-Account Events (1:1)";
  
  if (isInAccountEvent) {
    // Special logic for In-Account programs
    if (expectedLeads > 0) {
      // Standard calculation if leads are provided
      updatedCampaign.mql = Math.round(expectedLeads * 0.1);
      updatedCampaign.sql = Math.round((updatedCampaign.mql as number) * 0.06); // 6% of MQLs, not leads
      updatedCampaign.opportunities = Math.round((updatedCampaign.sql as number) * 0.8);
      updatedCampaign.pipelineForecast = (updatedCampaign.opportunities as number) * 50000;
      console.log(`Standard calculation for In-Account Events with leads: MQL=${updatedCampaign.mql}, SQL=${updatedCampaign.sql}, Opps=${updatedCampaign.opportunities}, Pipeline=${updatedCampaign.pipelineForecast}`);
    } 
    // If no leads but cost exists, use 20:1 ROI calculation
    else if (forecastedCost > 0) {
      updatedCampaign.pipelineForecast = forecastedCost * 20; // 20:1 ROI based on cost
      updatedCampaign.mql = 0;
      updatedCampaign.sql = 0;
      updatedCampaign.opportunities = 0;
      console.log(`Special 20:1 ROI calculation for In-Account Events: Cost=${forecastedCost}, Pipeline=${updatedCampaign.pipelineForecast}`);
    } else {
      // Reset calculated values if input is invalid
      updatedCampaign.mql = 0;
      updatedCampaign.sql = 0;
      updatedCampaign.opportunities = 0;
      updatedCampaign.pipelineForecast = 0;
      console.log(`Reset values for In-Account Events with no leads or cost`);
    }
  } 
  // Standard calculation for all other campaign types
  else if (expectedLeads > 0) {
    updatedCampaign.mql = Math.round(expectedLeads * 0.1);
    updatedCampaign.sql = Math.round((updatedCampaign.mql as number) * 0.06); // 6% of MQLs, not leads
    updatedCampaign.opportunities = Math.round((updatedCampaign.sql as number) * 0.8);
    updatedCampaign.pipelineForecast = (updatedCampaign.opportunities as number) * 50000;
    console.log(`Standard calculation for other campaign types: MQL=${updatedCampaign.mql}, SQL=${updatedCampaign.sql}, Opps=${updatedCampaign.opportunities}, Pipeline=${updatedCampaign.pipelineForecast}`);
  } else {
    // Reset calculated values if input is invalid
    updatedCampaign.mql = 0;
    updatedCampaign.sql = 0;
    updatedCampaign.opportunities = 0;
    updatedCampaign.pipelineForecast = 0;
    console.log(`Reset values for campaign with no leads`);
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
  // Add debug information
  console.log("Beginning CSV import process");
  
  // Improved CSV parsing configuration
  const result = Papa.parse(csvData, { 
    header: true, 
    skipEmptyLines: true,
    dynamicTyping: false, // Keep as strings for our custom processing
    transformHeader: (header) => header.trim(), // Trim whitespace from headers
    transform: (value, field) => {
      // Trim all string values
      if (typeof value === 'string') {
        return value.trim();
      }
      return value;
    },
    // Prevent PapaParse from dropping fields with empty values
    keepEmptyRows: true,
    fastMode: false, // Disable fast mode to ensure accurate parsing
    comments: "#", // Ignore lines that start with #
    error: (error) => {
      console.error("CSV parsing error:", error);
    }
  });
  console.log("CSV Parsing result headers:", result.meta.fields);
  console.log("CSV Parsing sample rows:", result.data.slice(0, 2));
  
  const importedCampaigns: Campaign[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Budget pool tracking by region owner with used budget and overage tracking
  const budgetPoolByRegionOwner = {
    "JP & Korea": { owner: "Tomoko Tanaka", budget: getBudgetByRegion("JP & Korea"), used: 0, overage: 0 },
    "South APAC": { owner: "Beverly Leung", budget: getBudgetByRegion("South APAC"), used: 0, overage: 0 },
    "SAARC": { owner: "Shruti Narang", budget: getBudgetByRegion("SAARC"), used: 0, overage: 0 },
    "Digital Motions": { owner: "Giorgia Parham", budget: getBudgetByRegion("Digital Motions"), used: 0, overage: 0 },
  };
  
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(error => {
      errors.push(`CSV parsing error: ${error.message} at row ${error.row}`);
    });
  }
  
  // Check for critical missing headers (strategic pillars is no longer required)
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
      
      // Add debug log for this row
      console.log(`Processing row ${index + 2}`, row);
      
      // Generate an ID if not provided
      const campaignId = row.id || Math.random().toString(36).substring(2, 9);
      
      // Process strategic pillars with error handling
      let strategicPillars: string[] = [];
      try {
        console.log(`strategicPillars raw value: "${row.strategicPillars}"`);
        if (row.strategicPillars) {
          // Check if it's already an array (from previous parsing)
          if (Array.isArray(row.strategicPillars)) {
            strategicPillars = row.strategicPillars.filter(Boolean);
          } else {
            // Parse from comma-separated string
            strategicPillars = row.strategicPillars
              .split(",")
              .map((p: string) => p.trim())
              .filter(Boolean);
          }
          
          // Normalize pillar names to match expected values
          const validPillars = [
            "Account Growth and Product Adoption",
            "Pipeline Acceleration & Executive Engagement",
            "Brand Awareness & Top of Funnel Demand Generation",
            "New Logo Acquisition"
          ];
          
          // Try to match pillars even if they're not exact matches
          strategicPillars = strategicPillars.map((pillar: string) => {
            // Try exact match first
            if (validPillars.includes(pillar)) {
              return pillar;
            }
            
            // Try case-insensitive match
            const lowerPillar = pillar.toLowerCase();
            for (const validPillar of validPillars) {
              if (validPillar.toLowerCase() === lowerPillar) {
                return validPillar; // Return the correctly cased version
              }
            }
            
            // If no match, return as is and validation will catch it
            return pillar;
          });
          
          console.log(`Parsed strategic pillars for row ${index + 2}:`, strategicPillars);
        } else {
          warnings.push(`Row ${index + 2}: No Strategic Pillars provided. Default pillar will be added.`);
          // Add a default pillar rather than failing
          strategicPillars = ["Account Growth and Product Adoption"];
        }
      } catch (e) {
        console.error(`Error parsing strategic pillars for row ${index + 2}:`, e, row.strategicPillars);
        warnings.push(`Row ${index + 2}: Could not parse strategic pillars. Default pillar will be added.`);
        // Add a default pillar rather than failing
        strategicPillars = ["Account Growth and Product Adoption"];
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
      
      // Log numeric field processing
      console.log(`Row ${index + 2} numeric fields:`, {
        forecastedCost: {
          rawValue: row.forecastedCost,
          processedValue: row.forecastedCost !== undefined && row.forecastedCost !== "" ? Number(row.forecastedCost) : ""
        },
        expectedLeads: {
          rawValue: row.expectedLeads,
          processedValue: row.expectedLeads !== undefined && row.expectedLeads !== "" ? Number(row.expectedLeads) : ""
        }
      });
      
      // Process numeric fields with better error handling
      let forecastedCost: number | string = "";
      let expectedLeads: number | string = "";
      let actualCost: number | string = "";
      let actualLeads: number | string = "";
      let actualMQLs: number | string = "";
      
      // Helper function to clean and parse numeric values
      const parseNumericValue = (value: any, fieldName: string): number | string => {
        if (value === undefined || value === null || value === "") {
          return "";
        }
        
        // Convert to string first to ensure we can apply cleaning
        const strValue = String(value);
        
        // More aggressive cleaning - remove currency symbols, commas, spaces, and any other non-numeric characters
        // except for decimal point
        const cleanValue = strValue.replace(/[^0-9.-]/g, '').trim();
        console.log(`Cleaned ${fieldName} value: "${cleanValue}" (from original "${strValue}")`);
        
        if (cleanValue === "" || cleanValue === "-" || cleanValue === ".") {
          return "";
        }
        
        const parsedValue = Number(cleanValue);
        if (!isNaN(parsedValue)) {
          console.log(`Successfully parsed ${fieldName}: ${parsedValue}`);
          return parsedValue;
        } else {
          warnings.push(`Row ${index + 2}: ${fieldName} "${strValue}" could not be parsed as a number after cleaning.`);
          return "";
        }
      };
      
      // Process all numeric fields with the helper function
      forecastedCost = parseNumericValue(row.forecastedCost, "Forecasted Cost");
      expectedLeads = parseNumericValue(row.expectedLeads, "Forecasted Leads");
      actualCost = parseNumericValue(row.actualCost, "Actual Cost");
      actualLeads = parseNumericValue(row.actualLeads, "Actual Leads");
      actualMQLs = parseNumericValue(row.actualMQLs, "Actual MQLs");
      
      // Process the Quarter - Month field using regex
      let quarterMonth = "";
      if (row.quarterMonth) {
        quarterMonth = row.quarterMonth?.toString().trim() || "";
      } else if (row["Quarter - Month"] || row["Quarter/Month"]) {
        // Try alternative column names
        quarterMonth = (row["Quarter - Month"] || row["Quarter/Month"])?.toString().trim() || "";
      } else {
        // Try to parse from separate Quarter and Month columns if they exist
        const quarter = row.Quarter?.toString().trim();
        const month = row.Month?.toString().trim();
        
        if (quarter && month) {
          // Attempt to format as "Q1 - July" style
          const quarterMatch = quarter.match(/q([1-4])/i);
          if (quarterMatch) {
            quarterMonth = `Q${quarterMatch[1]} - ${month}`;
          }
        }
      }
      
      // If we couldn't parse a proper quarterMonth format, try regex extraction
      if (quarterMonth && !quarterMonth.match(/^Q[1-4]\s*-\s*[A-Za-z]+$/)) {
        // Extract quarter and month with regex
        const qMatch = quarterMonth.match(/[Qq]([1-4])/);
        const monthMatch = quarterMonth.match(/([A-Za-z]+)/);
        
        if (qMatch && monthMatch) {
          quarterMonth = `Q${qMatch[1]} - ${monthMatch[1]}`;
        } else {
          warnings.push(`Row ${index + 2}: Could not parse Quarter/Month value "${quarterMonth}" into standard format. Using as-is.`);
        }
      }

      // Build the campaign object
      let campaign: Partial<Campaign> = {
        id: campaignId,
        campaignName: row.campaignName?.toString().trim() || "",
        campaignType: row.campaignType?.toString().trim() || "",
        strategicPillars: strategicPillars,
        revenuePlay: row.revenuePlay?.toString().trim() || "",
        fiscalYear: row.fiscalYear?.toString().trim() || "",
        quarterMonth: quarterMonth,
        region: row.region?.toString().trim() || "",
        country: row.country?.toString().trim() || "",
        owner: row.owner?.toString().trim() || "",
        description: row.description?.toString().trim() || "",
        forecastedCost: forecastedCost,
        expectedLeads: expectedLeads,
        impactedRegions: impactedRegions,
        status: row.status?.toString().trim() || "Planning",
        poRaised: poRaised,
        campaignCode: row.campaignCode?.toString().trim() || "",
        issueLink: row.issueLink?.toString().trim() || "",
        actualCost: actualCost,
        actualLeads: actualLeads,
        actualMQLs: actualMQLs,
        // Initialize calculated fields - will be updated by calculateDerivedFields
        mql: 0,
        sql: 0,
        opportunities: 0,
        pipelineForecast: 0
      };
      
      // Log the full campaign object before validation for debugging
      console.log(`Campaign object built for row ${index + 2}:`, {
        id: campaign.id,
        campaignName: campaign.campaignName,
        forecastedCost: campaign.forecastedCost,
        forecastedCostType: typeof campaign.forecastedCost,
        expectedLeads: campaign.expectedLeads,
        expectedLeadsType: typeof campaign.expectedLeads,
        strategicPillars: campaign.strategicPillars
      });
      
      // Validate the campaign
      const validationErrors = validateCampaign(campaign, index + 2);
      
      // Check budget pool for owner
      const owner = campaign.owner;
      let cost = 0;
      
      // Handle different ways the cost might be present
      if (typeof campaign.forecastedCost === 'number' && !isNaN(campaign.forecastedCost)) {
        cost = campaign.forecastedCost;
      } else if (typeof campaign.forecastedCost === 'string' && campaign.forecastedCost !== "") {
        const parsedCost = parseFloat(campaign.forecastedCost);
        if (!isNaN(parsedCost)) {
          cost = parsedCost;
        }
      }
      
      console.log(`Row ${index + 2} owner budget check:`, { 
        owner, 
        cost, 
        forecastedCost: campaign.forecastedCost,
        forecastedCostType: typeof campaign.forecastedCost
      });
      
      if (owner && cost > 0) {
        // Get the appropriate region for budget tracking based on owner
        const budgetRegion = OWNER_TO_REGION_MAP[owner];
        
        // Only check budget allocation for owners with a region mapping
        if (budgetRegion && budgetPoolByRegionOwner[budgetRegion]) {
          budgetPoolByRegionOwner[budgetRegion].used += cost;
          const remaining = budgetPoolByRegionOwner[budgetRegion].budget - budgetPoolByRegionOwner[budgetRegion].used;
          
          if (remaining < 0) {
            budgetPoolByRegionOwner[budgetRegion].overage = Math.abs(remaining);
            
            // Only add a warning if overage is greater than $500
            if (budgetPoolByRegionOwner[budgetRegion].overage > 500) {
              warnings.push(`Row ${index + 2}: ${owner} has exceeded their ${budgetRegion} budget pool by ${formatCurrency(budgetPoolByRegionOwner[budgetRegion].overage)}`);
            }
          }
        } else if (!budgetRegion) {
          warnings.push(`Row ${index + 2}: Owner "${owner}" doesn't have a primary budget region assigned.`);
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
  
  // Log final results
  console.log(`CSV import completed: ${importedCampaigns.length} campaigns imported, ${errors.length} errors, ${warnings.length} warnings`);
  
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