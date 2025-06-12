import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ChartBar, ChartLine, ChartPie } from "@phosphor-icons/react";
import { Campaign } from "./campaign-table";

interface ROIDashboardProps {
  campaigns: Campaign[];
}

export const ROIDashboard: React.FC<ROIDashboardProps> = ({ campaigns }) => {
  // Filters
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedQuarter, setSelectedQuarter] = useState("all");

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
    let filtered = [...campaigns];

    if (selectedRegion !== "all") {
      filtered = filtered.filter(campaign => campaign.region === selectedRegion);
    }

    if (selectedQuarter !== "all") {
      // Extract quarter from quarterMonth field (e.g., "Q1 - July" => "Q1")
      filtered = filtered.filter(campaign => {
        if (!campaign.quarterMonth) return false;
        const quarter = campaign.quarterMonth.split(" ")[0]; // "Q1 - July" => "Q1"
        return quarter === selectedQuarter;
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
    const totalPipelineForecast = totalOpportunities * 50000; // $50K per opportunity

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
  const regions = ["all", ...new Set(campaigns.map(c => c.region).filter(Boolean))];

  // Quarters for filter
  const quarters = ["all", "Q1", "Q2", "Q3", "Q4"];

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
          ROI Dashboard
        </CardTitle>
        <CardDescription>Visualize campaign performance and return on investment</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
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
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Spend</div>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalActualSpend > 0 ? metrics.totalActualSpend : metrics.totalForecastedSpend)}</div>
            {metrics.totalActualSpend > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                {metrics.totalActualSpend > metrics.totalForecastedSpend ? 'Over budget' : 'Under budget'}
              </div>
            )}
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Pipeline</div>
            <div className="text-2xl font-bold">{formatCurrency(metrics.actualPipeline > 0 ? metrics.actualPipeline : metrics.totalPipelineForecast)}</div>
            {metrics.actualPipeline > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                Based on actual performance
              </div>
            )}
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-sm font-medium text-muted-foreground mb-1">Return on Investment</div>
            <div className="text-2xl font-bold text-primary">{metrics.roi}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {metrics.roi < 100 ? 'Low' : metrics.roi < 300 ? 'Moderate' : 'High'} ROI
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Leads</div>
            <div className="text-lg font-semibold">
              {metrics.totalActualLeads > 0 
                ? metrics.totalActualLeads.toLocaleString() 
                : metrics.totalExpectedLeads.toLocaleString()}
            </div>
            {metrics.totalActualLeads > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.round((metrics.totalActualLeads / metrics.totalExpectedLeads) * 100)}% of target
              </div>
            )}
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">MQLs</div>
            <div className="text-lg font-semibold">
              {metrics.totalActualMQLs > 0 
                ? metrics.totalActualMQLs.toLocaleString() 
                : metrics.totalMQLs.toLocaleString()}
            </div>
            {metrics.totalActualMQLs > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.round((metrics.totalActualMQLs / metrics.totalMQLs) * 100)}% of target
              </div>
            )}
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">SQLs</div>
            <div className="text-lg font-semibold">
              {metrics.actualSQLs > 0 
                ? metrics.actualSQLs.toLocaleString() 
                : metrics.totalSQLs.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Opportunities</div>
            <div className="text-lg font-semibold">
              {metrics.actualOpportunities > 0 
                ? metrics.actualOpportunities.toLocaleString() 
                : metrics.totalOpportunities.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="funnel" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="funnel" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" /> Lead Funnel
            </TabsTrigger>
            <TabsTrigger value="spend" className="flex items-center gap-2">
              <ChartLine className="h-4 w-4" /> Spend Analysis
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <ChartPie className="h-4 w-4" /> ROI Gauge
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
                    labelFormatter={() => 'Spend Comparison'}
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-4">
              {metrics.roi < 100 ? (
                <span className="text-red-500">Low ROI: Consider optimizing campaign strategy</span>
              ) : metrics.roi < 300 ? (
                <span className="text-yellow-500">Moderate ROI: On track for positive returns</span>
              ) : (
                <span className="text-green-500">High ROI: Excellent campaign performance</span>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};