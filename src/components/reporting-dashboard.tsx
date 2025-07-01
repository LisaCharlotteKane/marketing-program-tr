import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PresentationChart, Download, ChartLine, ChartPie, ChartBar, FunnelSimple, Sliders, FilterX } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { type Campaign } from "@/components/campaign-table";
import { toast } from "sonner";
import { ClearFiltersButton } from "@/components/clear-filters-button";
import { normalizeRegionName } from "@/lib/utils";

export function ReportingDashboard({ campaigns }: { campaigns: Campaign[] }) {
  // Filters
  const [regionFilter, setRegionFilter] = useState("_all");
  const [countryFilter, setCountryFilter] = useState("_all");
  const [quarterFilter, setQuarterFilter] = useState("_all");
  const [monthFilter, setMonthFilter] = useState("_all");
  const [pillarFilter, setPillarFilter] = useState("_all");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("_all");
  const [revenuePlayFilter, setRevenuePlayFilter] = useState("_all");
  const [ownerFilter, setOwnerFilter] = useState("_all");
  
  // Get unique filter options from campaigns
  const regions = ["_all", ...new Set(campaigns.map(c => normalizeRegionName(c.region)))].filter(Boolean);
  const countries = ["_all", ...new Set(campaigns.map(c => c.country))].filter(Boolean);
  
  // Extract quarter and month from quarterMonth field
  const quarterMonths = [...new Set(campaigns.map(c => c.quarterMonth))].filter(Boolean);
  const quarters = ["_all", ...new Set(quarterMonths.map(qm => qm?.split(' - ')[0]))].filter(Boolean);
  const months = ["_all", ...new Set(quarterMonths.map(qm => {
    const parts = qm?.split(' - ');
    return parts && parts.length > 1 ? parts[1] : null;
  }))].filter(Boolean);
  
  // Extract strategic pillars (flattened from arrays)
  const allPillars = campaigns.reduce((acc, campaign) => {
    if (Array.isArray(campaign.strategicPillars)) {
      acc.push(...campaign.strategicPillars);
    }
    return acc;
  }, [] as string[]);
  const pillars = ["_all", ...new Set(allPillars)].filter(Boolean);
  
  // Campaign types, revenue plays, and owners
  const campaignTypes = ["_all", ...new Set(campaigns.map(c => c.campaignType))].filter(Boolean);
  const revenuePlays = ["_all", ...new Set(campaigns.map(c => c.revenuePlay))].filter(Boolean);
  const owners = ["_all", ...new Set(campaigns.map(c => c.owner))].filter(Boolean);
  
  // Reset all filters
  const resetFilters = () => {
    // Reset all filters to their default values
    setRegionFilter("_all");
    setCountryFilter("_all");
    setQuarterFilter("_all");
    setMonthFilter("_all");
    setPillarFilter("_all");
    setCampaignTypeFilter("_all");
    setRevenuePlayFilter("_all");
    setOwnerFilter("_all");
  };
  
  // Filter campaigns based on selected filters
  const filteredCampaigns = campaigns.filter(campaign => {
    // Apply region filter
    if (regionFilter !== "_all" && normalizeRegionName(campaign.region) !== regionFilter) return false;
    
    // Apply country filter
    if (countryFilter !== "_all" && campaign.country !== countryFilter) return false;
    
    // Apply quarter filter
    if (quarterFilter !== "_all") {
      const campaignQuarter = campaign.quarterMonth?.split(' - ')[0];
      if (campaignQuarter !== quarterFilter) return false;
    }
    
    // Apply month filter
    if (monthFilter !== "_all") {
      const campaignMonth = campaign.quarterMonth?.split(' - ')[1];
      if (campaignMonth !== monthFilter) return false;
    }
    
    // Apply strategic pillar filter (check if any pillar matches)
    if (pillarFilter !== "_all") {
      if (!Array.isArray(campaign.strategicPillars) || 
          !campaign.strategicPillars.includes(pillarFilter)) {
        return false;
      }
    }
    
    // Apply campaign type filter
    if (campaignTypeFilter !== "_all" && campaign.campaignType !== campaignTypeFilter) return false;
    
    // Apply revenue play filter
    if (revenuePlayFilter !== "_all" && campaign.revenuePlay !== revenuePlayFilter) return false;
    
    // Apply owner filter
    if (ownerFilter !== "_all" && campaign.owner !== ownerFilter) return false;
    
    return true;
  });
  
  // Calculate summary metrics
  const totalForecastedSpend = filteredCampaigns.reduce(
    (total, campaign) => total + (typeof campaign.forecastedCost === "number" ? campaign.forecastedCost : 0),
    0
  );
  
  const totalActualSpend = filteredCampaigns.reduce(
    (total, campaign) => total + (typeof campaign.actualCost === "number" ? campaign.actualCost : 0),
    0
  );
  
  const totalExpectedLeads = filteredCampaigns.reduce(
    (total, campaign) => total + (typeof campaign.expectedLeads === "number" ? campaign.expectedLeads : 0),
    0
  );
  
  const totalActualLeads = filteredCampaigns.reduce(
    (total, campaign) => total + (typeof campaign.actualLeads === "number" ? campaign.actualLeads : 0),
    0
  );
  
  const totalMQLs = Math.round(totalExpectedLeads * 0.1); // 10% of Expected Leads
  const totalSQLs = Math.round(totalExpectedLeads * 0.06); // 6% of Expected Leads
  const totalOpportunities = Math.round(totalSQLs * 0.8); // 80% of SQLs
  
  // Calculate pipeline with special logic for In-Account Events
  let totalPipelineForecast = 0;
  
  filteredCampaigns.forEach(campaign => {
    const forecastedCost = typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0;
    const expectedLeads = typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : 0;
    
    if (campaign.campaignType === "In-Account Events (1:1)" && 
        (!expectedLeads || expectedLeads <= 0) && 
        forecastedCost > 0) {
      // Special 20:1 ROI calculation for In-Account Events without leads
      totalPipelineForecast += forecastedCost * 20;
    } else if (expectedLeads > 0) {
      // Standard calculation based on leads
      const mqlValue = Math.round(expectedLeads * 0.1);
      const sqlValue = Math.round(expectedLeads * 0.06);
      const oppsValue = Math.round(sqlValue * 0.8);
      totalPipelineForecast += oppsValue * 50000;
    }
    // If neither condition is met, no pipeline is added
  });
  
  // Data for charts
  const costComparisonData = filteredCampaigns.map(campaign => ({
    name: campaign.campaignName || campaign.description?.substring(0, 20) || "Untitled",
    forecastedCost: typeof campaign.forecastedCost === "number" ? campaign.forecastedCost : 0,
    actualCost: typeof campaign.actualCost === "number" ? campaign.actualCost : 0
  }));
  
  // Aggregate by region for region-based chart - calculating pipeline forecast instead of cost
  const regionData = regions
    .filter(region => region !== "_all")
    .map(region => {
      const regionCampaigns = filteredCampaigns.filter(c => normalizeRegionName(c.region) === region);
      
      // Calculate pipeline forecast per region
      let regionPipelineForecast = 0;
      
      regionCampaigns.forEach(campaign => {
        const forecastedCost = typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0;
        const expectedLeads = typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : 0;
        
        if (campaign.campaignType === "In-Account Events (1:1)" && 
            (!expectedLeads || expectedLeads <= 0) && 
            forecastedCost > 0) {
          // Special 20:1 ROI calculation for In-Account Events without leads
          regionPipelineForecast += forecastedCost * 20;
        } else if (expectedLeads > 0) {
          // Standard calculation based on leads
          const mqlValue = Math.round(expectedLeads * 0.1);
          const sqlValue = Math.round(expectedLeads * 0.06);
          const oppsValue = Math.round(sqlValue * 0.8);
          regionPipelineForecast += oppsValue * 50000;
        }
      });
      
      return {
        name: region,
        pipelineForecast: regionPipelineForecast
      };
    });
  
  // Data for leads pipeline chart
  const pipelineData = [
    { name: "Expected Leads", value: totalExpectedLeads },
    { name: "MQLs (10%)", value: totalMQLs },
    { name: "SQLs (6%)", value: totalSQLs },
    { name: "Opps (80% of SQL)", value: totalOpportunities }
  ];
  
  // Export to CSV function
  const exportToCSV = () => {
    if (filteredCampaigns.length === 0) {
      return;
    }
    
    // Create CSV header
    const headers = [
      "Campaign Name",
      "Campaign Type",
      "Strategic Pillar",
      "Revenue Play",
      "FY",
      "Quarter/Month",
      "Region",
      "Country",
      "Owner",
      "Description",
      "Forecasted Cost",
      "Expected Leads",
      "MQLs",
      "SQLs",
      "Opportunities",
      "Pipeline Forecast",
      "Status",
      "PO Raised",
      "Campaign Code",
      "Issue Link",
      "Actual Cost",
      "Actual Leads",
      "Actual MQLs"
    ].join(",");
    
    // Create CSV rows
    const rows = filteredCampaigns.map(campaign => {
      // Format multi-select fields (like strategic pillars)
      const pillars = Array.isArray(campaign.strategicPillars) 
        ? `"${campaign.strategicPillars.join("; ")}"` 
        : "";
      
      return [
        `"${(campaign.campaignName || "").replace(/"/g, '""')}"`,
        campaign.campaignType || "",
        pillars,
        campaign.revenuePlay || "",
        campaign.fiscalYear || "",
        campaign.quarterMonth || "",
        campaign.region || "",
        campaign.country || "",
        campaign.owner || "",
        `"${(campaign.description || "").replace(/"/g, '""')}"`, // Escape quotes in description
        typeof campaign.forecastedCost === "number" ? campaign.forecastedCost : "",
        typeof campaign.expectedLeads === "number" ? campaign.expectedLeads : "",
        campaign.mql || "",
        campaign.sql || "",
        campaign.opportunities || "",
        campaign.pipelineForecast || "",
        campaign.status || "",
        campaign.poRaised ? "Yes" : "No",
        campaign.campaignCode || "",
        campaign.issueLink || "",
        typeof campaign.actualCost === "number" ? campaign.actualCost : "",
        typeof campaign.actualLeads === "number" ? campaign.actualLeads : "",
        typeof campaign.actualMQLs === "number" ? campaign.actualMQLs : ""
      ].join(",");
    });
    
    // Combine header and rows
    const csv = [headers, ...rows].join("\n");
    
    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "campaign_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PresentationChart className="h-5 w-5" /> Campaign Reporting Dashboard
          </div>
        </CardTitle>
        <CardDescription>Analyze campaign performance metrics</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4" /> Filter Controls
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <ClearFiltersButton onClick={resetFilters} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="region-filter">Region</Label>
                <Select 
                  value={regionFilter}
                  onValueChange={setRegionFilter}
                >
                  <SelectTrigger id="region-filter" className="mt-1">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Regions</SelectItem>
                    {regions.filter(r => r !== "_all").map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="country-filter">Country</Label>
                <Select 
                  value={countryFilter}
                  onValueChange={setCountryFilter}
                >
                  <SelectTrigger id="country-filter" className="mt-1">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Countries</SelectItem>
                    {countries.filter(c => c !== "_all").map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quarter-filter">Quarter</Label>
                <Select 
                  value={quarterFilter}
                  onValueChange={setQuarterFilter}
                >
                  <SelectTrigger id="quarter-filter" className="mt-1">
                    <SelectValue placeholder="All Quarters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Quarters</SelectItem>
                    {quarters.filter(q => q !== "_all").map((quarter) => (
                      <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="month-filter">Month</Label>
                <Select 
                  value={monthFilter}
                  onValueChange={setMonthFilter}
                >
                  <SelectTrigger id="month-filter" className="mt-1">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Months</SelectItem>
                    {months.filter(m => m !== "_all").map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="pillar-filter">Strategic Pillar</Label>
                <Select 
                  value={pillarFilter}
                  onValueChange={setPillarFilter}
                >
                  <SelectTrigger id="pillar-filter" className="mt-1">
                    <SelectValue placeholder="All Pillars" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Pillars</SelectItem>
                    {pillars.filter(p => p !== "_all").map((pillar) => (
                      <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="campaign-type-filter">Campaign Type</Label>
                <Select 
                  value={campaignTypeFilter}
                  onValueChange={setCampaignTypeFilter}
                >
                  <SelectTrigger id="campaign-type-filter" className="mt-1">
                    <SelectValue placeholder="All Campaign Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Campaign Types</SelectItem>
                    {campaignTypes.filter(t => t !== "_all").map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="revenue-play-filter">Revenue Play</Label>
                <Select 
                  value={revenuePlayFilter}
                  onValueChange={setRevenuePlayFilter}
                >
                  <SelectTrigger id="revenue-play-filter" className="mt-1">
                    <SelectValue placeholder="All Revenue Plays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Revenue Plays</SelectItem>
                    {revenuePlays.filter(p => p !== "_all").map((play) => (
                      <SelectItem key={play} value={play}>{play}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="owner-filter">Owner</Label>
                <Select 
                  value={ownerFilter}
                  onValueChange={setOwnerFilter}
                >
                  <SelectTrigger id="owner-filter" className="mt-1">
                    <SelectValue placeholder="All Owners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Owners</SelectItem>
                    {owners.filter(o => o !== "_all").map((owner) => (
                      <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border shadow-sm bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Forecasted Spend</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(totalForecastedSpend)}</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Actual Spend</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(totalActualSpend)}</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Pipeline Forecast</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(totalPipelineForecast)}</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total MQLs (10%)</div>
              <div className="text-2xl font-bold mt-1">{totalMQLs.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm bg-primary/5">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total SQLs (6%)</div>
              <div className="text-2xl font-bold mt-1">{totalSQLs.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Region Cost Comparison Chart */}
          <Card className="border shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ChartBar className="h-4 w-4" /> Region Pipeline Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    barGap={10}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      tickMargin={10}
                      height={60}
                      interval={0}
                      textAnchor="middle"
                    />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, "Pipeline Forecast"]}
                      labelFormatter={(label) => `Region: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ padding: '4px 0' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="pipelineForecast" 
                      name="Pipeline Forecast"
                      fill="var(--chart-1)" 
                      radius={[4, 4, 0, 0]}
                    >
                      {regionData.map((entry, index) => {
                        // Different colors based on region
                        let color = "var(--chart-1)"; // Default
                        if (entry.name === "JP & Korea") color = "var(--chart-1)";
                        else if (entry.name === "South APAC") color = "var(--chart-2)";
                        else if (entry.name === "SAARC") color = "var(--chart-3)";
                        else if (entry.name === "Digital") color = "var(--chart-4)";
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Leads Pipeline Chart */}
          <Card className="border shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FunnelSimple className="h-4 w-4" /> Lead Generation Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pipelineData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    barGap={10}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name"
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      tickMargin={10}
                      height={60}
                      interval={0}
                      textAnchor="middle"
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value.toLocaleString(), "Count"]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ padding: '4px 0' }}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Count"
                      fill="var(--chart-3)" 
                      radius={[4, 4, 0, 0]}
                    >
                      {pipelineData.map((entry, index) => {
                        // Different color for each stage of the pipeline
                        const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    }
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}