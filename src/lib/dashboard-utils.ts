// Sample data
const campaignData = [
  {
    id: "camp-001",
    region: "SAARC",
    country: "India",
    quarter: "Q1 2023",
    campaignOwner: "John Smith",
    programType: "Event",
    status: "Shipped",
    forecastedCost: 50000,
    actualCost: 48500,
    expectedLeads: 200,
    actualLeads: 180,
    actualMQLs: 20,
    actualSQLs: 12
  },
  {
    id: "camp-002",
    region: "North Asia",
    country: "Japan",
    quarter: "Q1 2023",
    campaignOwner: "Sarah Kim",
    programType: "Webinar",
    status: "Shipped",
    forecastedCost: 25000,
    actualCost: 23000,
    expectedLeads: 150,
    actualLeads: 145,
    actualMQLs: 16,
    actualSQLs: 9
  },
  {
    id: "camp-003",
    region: "South Asia",
    country: "Singapore",
    quarter: "Q2 2023",
    campaignOwner: "Alex Chen",
    programType: "Content",
    status: "On Track",
    forecastedCost: 15000,
    actualCost: 12000,
    expectedLeads: 120,
    actualLeads: 90,
    actualMQLs: 10,
    actualSQLs: 6
  },
  {
    id: "camp-004",
    region: "SAARC",
    country: "Pakistan",
    quarter: "Q2 2023",
    campaignOwner: "Maria Khan",
    programType: "Paid Media",
    status: "Planning",
    forecastedCost: 30000,
    actualCost: 0,
    expectedLeads: 180,
    actualLeads: 0,
    actualMQLs: 0,
    actualSQLs: 0
  },
  {
    id: "camp-005",
    region: "North Asia",
    country: "China",
    quarter: "Q3 2023",
    campaignOwner: "Li Wei",
    programType: "Partner",
    status: "Cancelled",
    forecastedCost: 45000,
    actualCost: 10000,
    expectedLeads: 200,
    actualLeads: 0,
    actualMQLs: 0,
    actualSQLs: 0
  },
  {
    id: "camp-006",
    region: "South Asia",
    country: "Malaysia",
    quarter: "Q3 2023",
    campaignOwner: "David Tan",
    programType: "Event",
    status: "On Track",
    forecastedCost: 60000,
    actualCost: 30000,
    expectedLeads: 250,
    actualLeads: 120,
    actualMQLs: 14,
    actualSQLs: 8
  },
  {
    id: "camp-007",
    region: "Digital",
    country: "Multiple Regions",
    quarter: "Q2 2023",
    campaignOwner: "Jennifer Lee",
    programType: "Targeted Paid Ads & Content Syndication",
    status: "On Track",
    forecastedCost: 75000,
    actualCost: 40000,
    expectedLeads: 300,
    actualLeads: 150,
    actualMQLs: 18,
    actualSQLs: 10,
    impactedRegions: ["SAARC", "North Asia", "South Asia"]
  }
];

// Define quarters
export const quarters = ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023"];

// Define regions
export const regions = ["SAARC", "North Asia", "South Asia", "Digital"];

// Define countries by region
const countriesByRegion = {
  "SAARC": ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal"],
  "North Asia": ["Japan", "China", "South Korea", "Taiwan"],
  "South Asia": ["Singapore", "Malaysia", "Indonesia", "Thailand", "Philippines", "Vietnam"],
  "Digital": ["Multiple Regions"] // Digital is cross-regional
};

// Get countries by region
export const getCountriesByRegion = (region) => {
  return countriesByRegion[region] || [];
};

// Filter campaigns based on selected filters
export const filterCampaigns = (region, country, quarter) => {
  return campaignData.filter(campaign => {
    // Apply region filter
    if (region && region !== "_all" && campaign.region !== region) {
      return false;
    }
    
    // Apply country filter
    if (country && country !== "_all" && campaign.country !== country) {
      return false;
    }
    
    // Apply quarter filter
    if (quarter && quarter !== "_all" && campaign.quarter !== quarter) {
      return false;
    }
    
    return true;
  });
};

// Calculate summary metrics
export const calculateSummaryMetrics = (campaigns) => {
  return campaigns.reduce((metrics, campaign) => {
    // Add forecasted cost
    metrics.totalForecastedSpend += campaign.forecastedCost || 0;
    
    // Add actual cost
    metrics.totalActualSpend += campaign.actualCost || 0;
    
    // Calculate and add pipeline forecast based on expected leads
    const mql = Math.round((campaign.expectedLeads || 0) * 0.1); // 10%
    const sql = Math.round((campaign.expectedLeads || 0) * 0.06); // 6%
    const opps = Math.round(sql * 0.8); // 80% of SQLs
    const pipeline = opps * 50000; // $50K per opportunity
    
    metrics.totalPipelineForecast += pipeline;
    metrics.totalMQLs += mql;
    metrics.totalSQLs += sql;
    
    // Add actual MQLs and SQLs
    metrics.totalActualMQLs += campaign.actualMQLs || 0;
    metrics.totalActualSQLs += campaign.actualSQLs || 0;
    
    return metrics;
  }, {
    totalForecastedSpend: 0,
    totalActualSpend: 0,
    totalPipelineForecast: 0,
    totalMQLs: 0,
    totalSQLs: 0,
    totalActualMQLs: 0,
    totalActualSQLs: 0
  });
};

// Prepare data for regional cost chart
export const prepareRegionalCostData = (campaigns) => {
  const regionData = {};
  
  // Aggregate data by region
  campaigns.forEach(campaign => {
    if (!regionData[campaign.region]) {
      regionData[campaign.region] = {
        forecastedCost: 0,
        actualCost: 0
      };
    }
    
    regionData[campaign.region].forecastedCost += campaign.forecastedCost || 0;
    regionData[campaign.region].actualCost += campaign.actualCost || 0;
  });
  
  // Convert to array format for chart
  return Object.entries(regionData).map(([region, data]) => ({
    region,
    forecastedCost: data.forecastedCost,
    actualCost: data.actualCost
  }));
};

// Prepare data for leads comparison chart
export const prepareLeadsComparisonData = (campaigns) => {
  // Aggregate all forecasted and actual leads data
  const totalExpectedLeads = campaigns.reduce((sum, campaign) => sum + (campaign.expectedLeads || 0), 0);
  const totalActualLeads = campaigns.reduce((sum, campaign) => sum + (campaign.actualLeads || 0), 0);
  const totalExpectedMQLs = Math.round(totalExpectedLeads * 0.1); // 10% of expected leads
  const totalActualMQLs = campaigns.reduce((sum, campaign) => sum + (campaign.actualMQLs || 0), 0);
  const totalExpectedSQLs = Math.round(totalExpectedLeads * 0.06); // 6% of expected leads
  const totalActualSQLs = campaigns.reduce((sum, campaign) => sum + (campaign.actualSQLs || 0), 0);
  
  return [
    {
      name: "Forecasted",
      Leads: totalExpectedLeads,
      MQLs: totalExpectedMQLs,
      SQLs: totalExpectedSQLs
    },
    {
      name: "Actual",
      Leads: totalActualLeads,
      MQLs: totalActualMQLs,
      SQLs: totalActualSQLs
    }
  ];
};

// Export to CSV function
export const exportToCSV = (campaigns) => {
  if (campaigns.length === 0) {
    alert("No data to export");
    return;
  }
  
  // Create CSV header
  const headers = [
    "Region",
    "Country",
    "Impacted Regions",
    "Quarter",
    "Campaign Owner",
    "Program Type",
    "Status",
    "Forecasted Cost",
    "Actual Cost",
    "Expected Leads",
    "Actual Leads",
    "Actual MQLs",
    "Actual SQLs"
  ];
  
  // Create CSV rows
  const rows = campaigns.map(campaign => [
    campaign.region,
    campaign.country,
    campaign.impactedRegions ? campaign.impactedRegions.join(', ') : '',
    campaign.quarter,
    campaign.campaignOwner,
    campaign.programType,
    campaign.status,
    campaign.forecastedCost,
    campaign.actualCost,
    campaign.expectedLeads,
    campaign.actualLeads,
    campaign.actualMQLs,
    campaign.actualSQLs
  ]);
  
  // Combine header and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "marketing_campaigns.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};