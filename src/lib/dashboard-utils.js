// Dashboard utilities for data processing and filtering

import campaigns from '../data/campaigns.json';
import countries from '../data/countries.json';

// Available quarters for filtering
export const quarters = ["Q1", "Q2", "Q3", "Q4"];

// Available regions
export const regions = Object.keys(countries);

// Get countries for a specific region
export const getCountriesByRegion = (region) => {
  return countries[region] || [];
};

// Filter campaigns by region, country, and quarter
export const filterCampaigns = (selectedRegion, selectedCountry, selectedQuarter) => {
  return campaigns.filter(campaign => {
    const regionMatch = !selectedRegion || campaign.region === selectedRegion;
    const countryMatch = !selectedCountry || campaign.country === selectedCountry;
    const quarterMatch = !selectedQuarter || campaign.quarter === selectedQuarter;
    
    return regionMatch && countryMatch && quarterMatch;
  });
};

// Calculate summary metrics for filtered campaigns
export const calculateSummaryMetrics = (filteredCampaigns) => {
  return {
    totalForecastedSpend: filteredCampaigns.reduce((sum, camp) => sum + camp.forecastedCost, 0),
    totalActualSpend: filteredCampaigns.reduce((sum, camp) => sum + camp.actualCost, 0),
    totalPipelineForecast: filteredCampaigns.reduce((sum, camp) => sum + camp.pipeline, 0),
    totalMQLs: filteredCampaigns.reduce((sum, camp) => sum + camp.mql, 0),
    totalSQLs: filteredCampaigns.reduce((sum, camp) => sum + camp.sql, 0),
    totalActualMQLs: filteredCampaigns.reduce((sum, camp) => sum + (camp.actualMql || 0), 0),
    totalActualSQLs: filteredCampaigns.reduce((sum, camp) => sum + (camp.actualSql || 0), 0)
  };
};

// Prepare data for forecasted vs actual cost comparison by region
export const prepareRegionalCostData = (filteredCampaigns) => {
  const regionalData = {};

  filteredCampaigns.forEach(campaign => {
    if (!regionalData[campaign.region]) {
      regionalData[campaign.region] = {
        region: campaign.region,
        forecastedCost: 0,
        actualCost: 0
      };
    }
    
    regionalData[campaign.region].forecastedCost += campaign.forecastedCost;
    regionalData[campaign.region].actualCost += campaign.actualCost;
  });

  return Object.values(regionalData);
};

// Prepare data for leads comparison (forecasted vs actual)
export const prepareLeadsComparisonData = (filteredCampaigns) => {
  // Sum up all leads data for comparison
  const totalForecasted = {
    name: "Forecasted",
    Leads: filteredCampaigns.reduce((sum, camp) => sum + camp.expectedLeads, 0),
    MQLs: filteredCampaigns.reduce((sum, camp) => sum + camp.mql, 0),
    SQLs: filteredCampaigns.reduce((sum, camp) => sum + camp.sql, 0)
  };

  const totalActual = {
    name: "Actual",
    Leads: filteredCampaigns.reduce((sum, camp) => sum + (camp.actualLeads || 0), 0),
    MQLs: filteredCampaigns.reduce((sum, camp) => sum + (camp.actualMql || 0), 0),
    SQLs: filteredCampaigns.reduce((sum, camp) => sum + (camp.actualSql || 0), 0)
  };

  return [totalForecasted, totalActual];
};

// Export campaign data to CSV
export const exportToCSV = (filteredCampaigns) => {
  // Define headers for the CSV
  const headers = [
    "ID", "Region", "Country", "Quarter", "Campaign Owner", "Program Type",
    "Strategic Pillars", "Revenue Play", "Forecasted Cost", "Forecasted Leads",
    "MQL", "SQL", "Opportunities", "Pipeline", "Status", "PO Raised",
    "Campaign Code", "Issue Link", "Actual Cost", "Actual Leads",
    "Actual MQL", "Actual SQL", "Actual Opportunities", "Actual Pipeline"
  ];

  // Format campaign data for CSV
  const csvData = filteredCampaigns.map(campaign => [
    campaign.id,
    campaign.region,
    campaign.country,
    campaign.quarter,
    campaign.campaignOwner,
    campaign.programType,
    campaign.strategicPillars.join(", "),
    campaign.revenuePlay,
    campaign.forecastedCost,
    campaign.expectedLeads,
    campaign.mql,
    campaign.sql,
    campaign.opportunities,
    campaign.pipeline,
    campaign.status,
    campaign.poRaised ? "Yes" : "No",
    campaign.campaignCode,
    campaign.issueLink,
    campaign.actualCost,
    campaign.actualLeads || 0,
    campaign.actualMql || 0,
    campaign.actualSql || 0,
    campaign.actualOpportunities || 0,
    campaign.actualPipeline || 0
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...csvData.map(row => row.join(","))
  ].join("\n");

  // Create download link
  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `marketing_campaigns_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};