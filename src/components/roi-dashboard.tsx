import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChartBar, ChartLine, ChartPie, Table, TrendUp, X } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";
import { toast } from "sonner";
import { ClearFiltersButton } from "./clear-filters-button";
import { normalizeRegionName, isContractorCampaign } from "@/lib/utils";

interface ROIDashboardProps {
  campaigns: Campaign[];
}

export const ROIDashboard: React.FC<ROIDashboardProps> = ({ campaigns }) => {
  // Filters
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedQuarter, setSelectedQuarter] = useState("all");

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedRegion("all");
    setSelectedQuarter("all");
  };

  // Derived metrics
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState({
    totalForecastedSpend: 0,
    totalActualSpend: 0,
    totalExpectedLeads: 0,
    totalMQLs: 0,
    totalSQLs: 0,
    totalOpportunities: 0,
    totalPipelineForecast: 0,
    totalActualLeads: 0,
    totalActualMQLs: 0,
    actualSQLs: 0,
    actualOpportunities: 0,
    actualPipeline: 0,
    roi: 0
  });

  // Filtering campaigns based on selected filters
  useEffect(() => {
    // First, exclude all Contractor/Infrastructure campaigns from ROI reporting
    let filtered = campaigns.filter(campaign => !isContractorCampaign(campaign));

    if (selectedRegion !== "all") {
      filtered = filtered.filter(campaign => normalizeRegionName(campaign.region) === selectedRegion);
    }

    if (selectedQuarter !== "all") {
      // Check both quarter and quarterMonth fields for compatibility
      filtered = filtered.filter(campaign => {
        if (campaign.quarter) {
          return campaign.quarter === selectedQuarter;
        } else if (campaign.quarterMonth) {
          const quarter = campaign.quarterMonth.split(" ")[0]; // "Q1 - July" => "Q1"
          return quarter === selectedQuarter;
        }
        return false;
      });
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, selectedRegion, selectedQuarter]);

  // Calculate metrics based on filtered campaigns
  useEffect(() => {
    // Initialize metrics
    const totalForecastedSpend = filteredCampaigns.reduce(
      (sum, campaign) => sum + (typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0),
      0
    );

    const totalActualSpend = filteredCampaigns.reduce(
      (sum, campaign) => sum + (typeof campaign.actualCost === 'number' ? campaign.actualCost : 0),
      0
    );

    const totalExpectedLeads = filteredCampaigns.reduce(
      (sum, campaign) => sum + (typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : 0),
      0
    );

    const totalActualLeads = filteredCampaigns.reduce(
      (sum, campaign) => sum + (typeof campaign.actualLeads === 'number' ? campaign.actualLeads : 0),
      0
    );

    const totalActualMQLs = filteredCampaigns.reduce(
      (sum, campaign) => sum + (typeof campaign.actualMQLs === 'number' ? campaign.actualMQLs : 0),
      0
    );

    // Calculate forecasted metrics
    const totalMQLs = Math.round(totalExpectedLeads * 0.1); // 10% of leads
    const totalSQLs = Math.round(totalExpectedLeads * 0.06); // 6% of leads
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

    // Calculate actual SQLs and Opportunities (if we have actual MQLs)
    const actualSQLs = totalActualMQLs > 0 ? Math.round(totalActualMQLs * 0.6) : 0; // 60% of actual MQLs
    const actualOpportunities = actualSQLs > 0 ? Math.round(actualSQLs * 0.8) : 0; // 80% of actual SQLs
    const actualPipeline = actualOpportunities * 50000; // $50K per opportunity

    // Calculate ROI - use actual data if available, otherwise use forecasts
    const calculatedROI = totalForecastedSpend > 0 
      ? Math.round((totalPipelineForecast / totalForecastedSpend) * 100) 
      : 0;
    
    const actualROI = totalActualSpend > 0 && actualPipeline > 0
      ? Math.round((actualPipeline / totalActualSpend) * 100)
      : 0;

    const roi = actualROI > 0 ? actualROI : calculatedROI;

    setMetrics({
      totalForecastedSpend,
      totalActualSpend,
      totalExpectedLeads,
      totalMQLs,
      totalSQLs,
      totalOpportunities,
      totalPipelineForecast,
      totalActualLeads,
      totalActualMQLs,
      actualSQLs,
      actualOpportunities,
      actualPipeline,
      roi
    });
  }, [filteredCampaigns]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Unique regions for filter
  const regions = ["all", ...new Set(campaigns.map(c => normalizeRegionName(c.region)).filter(Boolean))];

  // Get unique quarters from campaign data
  const availableQuarters = new Set<string>();
  campaigns.forEach(campaign => {
    if (campaign.quarter) {
      // If it's already in Q1, Q2, etc. format
      if (campaign.quarter.startsWith('Q')) {
        availableQuarters.add(campaign.quarter.split(' ')[0]); // Get just the Q part
      }
    } else if (campaign.quarterMonth) {
      // Extract from quarterMonth format (e.g., "Q1 - July")
      const quarter = campaign.quarterMonth.split(' ')[0];
      if (quarter.startsWith('Q')) {
        availableQuarters.add(quarter);
      }
    }
  });
  
  // Add standard quarters if not already present
  ["Q1", "Q2", "Q3", "Q4"].forEach(q => availableQuarters.add(q));
  
  // Sort and prepare for dropdown
  const quarters = ["all", ...Array.from(availableQuarters).sort()];

  // Data for the funnel chart
  const funnelData = [
    { 
      name: "Leads", 
      Expected: metrics.totalExpectedLeads,
      Actual: metrics.totalActualLeads 
    },
    { 
      name: "MQLs", 
      Expected: metrics.totalMQLs,
      Actual: metrics.totalActualMQLs 
    },
    { 
      name: "SQLs", 
      Expected: metrics.totalSQLs,
      Actual: metrics.actualSQLs 
    },
    { 
      name: "Opps", 
      Expected: metrics.totalOpportunities,
      Actual: metrics.actualOpportunities 
    },
  ];

  // Data for spend comparison chart
  const spendData = [
    {
      name: "Spend",
      Forecasted: metrics.totalForecastedSpend,
      Actual: metrics.totalActualSpend,
    },
    {
      name: "Pipeline",
      Forecasted: metrics.totalPipelineForecast,
      Actual: metrics.actualPipeline,
    }
  ];

  // ROI gauge segments
  const roiGaugeData = [
    { name: "ROI", value: metrics.roi },
    { name: "Buffer", value: Math.max(0, 1000 - metrics.roi) } // Cap at 1000% for visual clarity
  ];

  // Define ROI gauge colors based on value
  const roiColor = metrics.roi < 100 ? "#f87171" : metrics.roi < 300 ? "#facc15" : "#4ade80";

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendUp className="h-5 w-5" /> ROI Performance Dashboard
        </CardTitle>
        <CardDescription>
          Visualize campaign performance and return on investment
          <span className="block text-xs mt-1">
            Note: Contractor/Infrastructure campaigns are excluded from ROI reporting
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="region-filter">Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger id="region-filter" className="w-[150px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.filter(r => r !== "all").map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quarter-filter">Quarter</Label>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger id="quarter-filter" className="w-[150px]">
                <SelectValue placeholder="All Quarters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quarters</SelectItem>
                {quarters.filter(q => q !== "all").map(quarter => (
                  <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <ClearFiltersButton onClick={clearAllFilters} />
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Spend</div>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalActualSpend > 0 ? metrics.totalActualSpend : metrics.totalForecastedSpend)}</div>
            {metrics.totalActualSpend > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                {metrics.totalActualSpend > metrics.totalForecastedSpend ? 'Over budget' : 'Under budget'}
              </div>
            )}
          </div>
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Pipeline</div>
            <div className="text-2xl font-bold">{formatCurrency(metrics.actualPipeline > 0 ? metrics.actualPipeline : metrics.totalPipelineForecast)}</div>
            {metrics.actualPipeline > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                Based on actual performance
              </div>
            )}
          </div>
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Return on Investment</div>
            <div className="text-2xl font-bold" style={{ color: metrics.roi < 100 ? '#f87171' : metrics.roi < 300 ? '#facc15' : '#4ade80' }}>
              {metrics.roi}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.roi < 100 ? 'Low' : metrics.roi < 300 ? 'Moderate' : 'High'} ROI
            </div>
          </div>
        </div>

        {/* ROI Explanation */}
        <div className="bg-muted/20 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium mb-2">Understanding ROI Metrics</h3>
          <p className="text-sm text-muted-foreground">
            ROI is calculated as (Pipeline Value ÷ Total Spend) × 100%. An ROI of 300% or higher indicates high-performing campaigns, 
            while below 100% suggests campaigns that may need optimization.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="font-medium">Special Logic for In-Account Events (1:1):</span> These campaigns use a default 20:1 ROI 
            calculation (Pipeline = Cost × 20) when no leads are provided, reflecting their strategic account value.
          </p>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card/80 rounded-lg p-3 border shadow-sm">
            <div className="text-xs font-medium text-muted-foreground mb-1">Leads</div>
            <div className="text-lg font-semibold">
              {metrics.totalActualLeads > 0 
                ? metrics.totalActualLeads.toLocaleString() 
                : metrics.totalExpectedLeads.toLocaleString()}
            </div>
            {metrics.totalActualLeads > 0 && metrics.totalExpectedLeads > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.round((metrics.totalActualLeads / metrics.totalExpectedLeads) * 100)}% of target
              </div>
            )}
          </div>
          <div className="bg-card/80 rounded-lg p-3 border shadow-sm">
            <div className="text-xs font-medium text-muted-foreground mb-1">MQLs</div>
            <div className="text-lg font-semibold">
              {metrics.totalActualMQLs > 0 
                ? metrics.totalActualMQLs.toLocaleString() 
                : metrics.totalMQLs.toLocaleString()}
            </div>
            {metrics.totalActualMQLs > 0 && metrics.totalMQLs > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.round((metrics.totalActualMQLs / metrics.totalMQLs) * 100)}% of target
              </div>
            )}
          </div>
          <div className="bg-card/80 rounded-lg p-3 border shadow-sm">
            <div className="text-xs font-medium text-muted-foreground mb-1">SQLs</div>
            <div className="text-lg font-semibold">
              {metrics.actualSQLs > 0 
                ? metrics.actualSQLs.toLocaleString() 
                : metrics.totalSQLs.toLocaleString()}
            </div>
            {metrics.actualSQLs > 0 && metrics.totalSQLs > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.round((metrics.actualSQLs / metrics.totalSQLs) * 100)}% of target
              </div>
            )}
          </div>
          <div className="bg-card/80 rounded-lg p-3 border shadow-sm">
            <div className="text-xs font-medium text-muted-foreground mb-1">Opportunities</div>
            <div className="text-lg font-semibold">
              {metrics.actualOpportunities > 0 
                ? metrics.actualOpportunities.toLocaleString() 
                : metrics.totalOpportunities.toLocaleString()}
            </div>
            {metrics.actualOpportunities > 0 && metrics.totalOpportunities > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.round((metrics.actualOpportunities / metrics.totalOpportunities) * 100)}% of target
              </div>
            )}
          </div>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="funnel" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="funnel" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" /> Lead Funnel
            </TabsTrigger>
            <TabsTrigger value="spend" className="flex items-center gap-2">
              <ChartLine className="h-4 w-4" /> Spend Analysis
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <ChartPie className="h-4 w-4" /> ROI Gauge
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Table className="h-4 w-4" /> Campaign Performance
            </TabsTrigger>
          </TabsList>

          {/* Lead Funnel Chart */}
          <TabsContent value="funnel">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString(), undefined]} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="Expected" 
                    fill="var(--primary)" 
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="Actual" 
                    fill="var(--accent)" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Spend Analysis Chart */}
          <TabsContent value="spend">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                    labelFormatter={() => 'Forecasted Impact'}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Forecasted" 
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]} 
                    barSize={100}
                  />
                  <Bar 
                    dataKey="Actual" 
                    fill="var(--accent)"
                    radius={[4, 4, 0, 0]} 
                    barSize={100}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* ROI Gauge */}
          <TabsContent value="roi">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roiGaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell key="roi" fill={roiColor} />
                    <Cell key="buffer" fill="#e5e7eb" />
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-3xl font-bold"
                    fill="var(--foreground)"
                  >
                    {metrics.roi}%
                  </text>
                  <text
                    x="50%"
                    y="65%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm"
                    fill="var(--muted-foreground)"
                  >
                    ROI
                  </text>
                  {/* Add gauge markers */}
                  <text x="15%" y="85%" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">0%</text>
                  <text x="50%" y="10%" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">500%</text>
                  <text x="85%" y="85%" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">1000%</text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center p-4 mt-4 bg-card/50 rounded-lg border">
              <h4 className="font-semibold mb-2">ROI Analysis</h4>
              {metrics.roi < 100 ? (
                <div className="text-red-500 flex items-center justify-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Low ROI: Consider optimizing campaign strategy and budget allocation</span>
                </div>
              ) : metrics.roi < 300 ? (
                <div className="text-yellow-500 flex items-center justify-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span>Moderate ROI: On track but potential for improved returns with targeted adjustments</span>
                </div>
              ) : (
                <div className="text-green-500 flex items-center justify-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  <span>High ROI: Excellent campaign performance - consider scaling successful approaches</span>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Campaign Performance Table */}
          <TabsContent value="performance">
            <div className="overflow-auto max-h-96 border rounded-md">
              <table className="w-full min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground tracking-wider">Campaign</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground tracking-wider">Forecasted Cost</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground tracking-wider">Actual Cost</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground tracking-wider">Forecasted Leads</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground tracking-wider">Actual Leads</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground tracking-wider">Pipeline Value</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground tracking-wider">ROI</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredCampaigns.map((campaign, idx) => {
                    // Calculate campaign-specific metrics
                    const forecastedCost = typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0;
                    const actualCost = typeof campaign.actualCost === 'number' ? campaign.actualCost : 0;
                    const expectedLeads = typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : 0;
                    const actualLeads = typeof campaign.actualLeads === 'number' ? campaign.actualLeads : 0;
                    
                    // Calculate pipeline value with special logic for In-Account Events
                    let pipelineValue = 0;
                    
                    if (campaign.campaignType === "In-Account Events (1:1)" && 
                        (!expectedLeads || expectedLeads <= 0) && 
                        forecastedCost > 0) {
                      // Special 20:1 ROI calculation for In-Account Events without leads
                      pipelineValue = forecastedCost * 20;
                    } else {
                      // Standard calculation
                      const expectedMQLs = Math.round(expectedLeads * 0.1);
                      const expectedSQLs = Math.round(expectedLeads * 0.06);
                      const expectedOpps = Math.round(expectedSQLs * 0.8);
                      pipelineValue = expectedOpps * 50000;
                    }
                    
                    // Calculate ROI
                    const roi = forecastedCost > 0 ? Math.round((pipelineValue / forecastedCost) * 100) : 0;
                    
                    // Determine ROI color
                    const roiColor = roi < 100 ? 'text-red-500' : roi < 300 ? 'text-yellow-500' : 'text-green-500';
                    
                    return (
                      <tr key={campaign.id || idx} className={idx % 2 === 0 ? 'bg-card/50' : 'bg-background'}>
                        <td className="px-3 py-2 text-sm font-medium">
                          {campaign.description || 'Untitled Campaign'}
                          <div className="text-xs text-muted-foreground">{campaign.campaignType || 'No type'}</div>
                        </td>
                        <td className="px-3 py-2 text-sm text-right">{formatCurrency(forecastedCost)}</td>
                        <td className="px-3 py-2 text-sm text-right">{actualCost > 0 ? formatCurrency(actualCost) : '-'}</td>
                        <td className="px-3 py-2 text-sm text-right">{expectedLeads.toLocaleString()}</td>
                        <td className="px-3 py-2 text-sm text-right">{actualLeads > 0 ? actualLeads.toLocaleString() : '-'}</td>
                        <td className="px-3 py-2 text-sm text-right">{formatCurrency(pipelineValue)}</td>
                        <td className={`px-3 py-2 text-sm text-right font-semibold ${roiColor}`}>{roi}%</td>
                      </tr>
                    );
                  })}
                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-sm text-center text-muted-foreground">
                        No campaigns match the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};