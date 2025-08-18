import { processCsvData, exportCampaignsToCsv } from "@/utils/csv-helper";
import { Campaign } from "@/types/campaign";

// Define a minimal sample campaign for testing
const sampleCampaign: Campaign = {
  id: "test123",
  campaignName: "Test Campaign",
  campaignType: "Webinars",
  strategicPillar: ["Account Growth and Product Adoption"], // Fixed: renamed from strategicPillars
  revenuePlay: "All",
  fy: "FY25", // Fixed: renamed from fiscalYear
  quarterMonth: "Q1 - July",
  region: "JP & Korea",
  country: "Japan",
  owner: "Tomoko Tanaka",
  description: "Test description",
  forecastedCost: 10000,
  expectedLeads: 100,
  status: "Planning", // Fixed: proper typing
  poRaised: false,
  salesforceCampaignCode: "", // Fixed: renamed from campaignCode
  issueLink: "",
  actualCost: 0, // Fixed: number instead of string
  actualLeads: 0, // Fixed: number instead of string
  actualMqls: 0, // Fixed: number instead of string
  mql: 10,
  sql: 6,
  opportunities: 5,
  pipelineForecast: 250000
};

// Test CSV processing
describe("CSV Processing", () => {
  test("should export a campaign to CSV and then re-import it correctly", () => {
    // Export campaign to CSV
    const csv = exportCampaignsToCsv([sampleCampaign]);
    
    // Import the CSV back 
    const { campaigns, errors, warnings } = processCsvData(csv);
    
    // Verify there were no errors or warnings
    expect(errors.length).toBe(0);
    expect(warnings.length).toBe(0);
    
    // Verify the imported campaign matches the original
    expect(campaigns.length).toBe(1);
    
    // Check key fields (not checking id as it might be regenerated)
    const imported = campaigns[0];
    expect(imported.campaignName).toBe(sampleCampaign.campaignName);
    expect(imported.campaignType).toBe(sampleCampaign.campaignType);
    expect(imported.region).toBe(sampleCampaign.region);
    expect(imported.country).toBe(sampleCampaign.country);
    expect(imported.owner).toBe(sampleCampaign.owner);
    expect(imported.forecastedCost).toBe(sampleCampaign.forecastedCost);
    expect(imported.expectedLeads).toBe(sampleCampaign.expectedLeads);
    
    // Check calculated fields are computed correctly
    expect(imported.mql).toBe(10); // 10% of 100 leads
    expect(imported.sql).toBe(6);  // 6% of 100 leads
    expect(imported.opportunities).toBe(5); // 80% of 6 SQLs (rounded)
    expect(imported.pipelineForecast).toBe(250000); // 5 opps × $50K
  });
  
  test("should handle validation errors correctly", () => {
    // Invalid CSV with missing required fields
    const invalidCsv = `campaignName,campaignType,expectedLeads
Invalid Campaign,Webinars,100`;
    
    const { campaigns, errors, warnings } = processCsvData(invalidCsv);
    
    // Should have validation errors
    expect(errors.length).toBeGreaterThan(0);
    // Should not return any campaigns
    expect(campaigns.length).toBe(0);
  });
  
  test("should handle In-Account Events special calculation", () => {
    // CSV with In-Account Events but no leads (only cost)
    const inAccountEventsCsv = `campaignName,campaignType,region,country,owner,forecastedCost
Special Event,In-Account Events (1:1),JP & Korea,Japan,Tomoko Tanaka,10000`;
    
    const { campaigns, errors, warnings } = processCsvData(inAccountEventsCsv);
    
    // Should be no errors
    expect(errors.length).toBe(0);
    // Should return the campaign
    expect(campaigns.length).toBe(1);
    
    const campaign = campaigns[0];
    // Check special 20:1 ROI calculation
    expect(campaign.mql).toBe(0);
    expect(campaign.sql).toBe(0);
    expect(campaign.opportunities).toBe(0);
    expect(campaign.pipelineForecast).toBe(200000); // 10000 × 20
  });
});