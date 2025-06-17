import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PresentationChart, Download, ChartLine, ChartPie, ChartBar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { type Campaign } from "@/components/campaign-table";

export function ReportingDashboard({ campaigns }: { campaigns: Campaign[] }) {
  // Filters
  const [regionFilter, setRegionFilter] = useState("_all");
  const [countryFilter, setCountryFilter] = useState("_all");
  const [quarterFilter, setQuarterFilter] = useState("_all");
  
  // Get unique filter options from campaigns
  const regions = ["_all", ...new Set(campaigns.map(c => c.region))].filter(Boolean);
  const countries = ["_all", ...new Set(campaigns.map(c => c.country))].filter(Boolean);
  const quarters = ["_all", ...new Set(campaigns.map(c => c.quarter))].filter(Boolean);
  
  // Filter campaigns based on selected filters
  const filteredCampaigns = campaigns.filter(campaign => {
    // Apply region filter
    if (regionFilter !== "_all" && campaign.region !== regionFilter) return false;
    
    // Apply country filter
    if (countryFilter !== "_all" && campaign.country !== countryFilter) return false;
    
    // Apply quarter filter
    if (quarterFilter !== "_all" && campaign.quarter !== quarterFilter) return false;
    
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
  const totalPipelineForecast = totalOpportunities * 50000; // $50K per opportunity
  
  // Data for charts
  const costComparisonData = filteredCampaigns.map(campaign => ({
    name: campaign.description?.substring(0, 20) || "Untitled",
    forecastedCost: typeof campaign.forecastedCost === "number" ? campaign.forecastedCost : 0,
    actualCost: typeof campaign.actualCost === "number" ? campaign.actualCost : 0
  }));
  
  // Aggregate by region for region-based chart
  const regionData = regions
    .filter(region => region !== "_all")
    .map(region => {
      const regionCampaigns = filteredCampaigns.filter(c => c.region === region);
      const forecastedCost = regionCampaigns.reduce((sum, c) => sum + (typeof c.forecastedCost === "number" ? c.forecastedCost : 0), 0);
      const actualCost = regionCampaigns.reduce((sum, c) => sum + (typeof c.actualCost === "number" ? c.actualCost : 0), 0);
      
      return {
        name: region,
        forecastedCost,
        actualCost
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
      "Campaign Type",
      "Strategic Pillar",
      "Revenue Play",
      "FY",
      "Quarter",
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
      const pillars = Array.isArray(campaign.strategicPillar) 
        ? `"${campaign.strategicPillar.join("; ")}"` 
        : campaign.strategicPillar || "";
      
      return [
        campaign.campaignType || "",
        pillars,
        campaign.revenuePlay || "",
        campaign.fy || "",
        campaign.quarter || "",
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4" /> Export to CSV
          </Button>
        </CardTitle>
        <CardDescription>Analyze campaign performance metrics</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-md">
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
        </div>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-5 gap-4">
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
        <div className="grid grid-cols-2 gap-6">
          {/* Region Cost Comparison Chart */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ChartBar className="h-4 w-4" /> Cost Comparison by Region
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Region: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="forecastedCost" 
                      name="Forecasted Cost"
                      fill="var(--chart-1)" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="actualCost" 
                      name="Actual Cost"
                      fill="var(--chart-2)" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Leads Pipeline Chart */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ChartLine className="h-4 w-4" /> Lead Generation Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pipelineData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), undefined]} />
                    <Bar 
                      dataKey="value" 
                      name="Count"
                      fill="var(--chart-3)" 
                      radius={[4, 4, 0, 0]} 
                    />
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