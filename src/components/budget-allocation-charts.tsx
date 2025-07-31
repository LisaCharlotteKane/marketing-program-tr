import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartPie, TrendUp, DollarSign, Users } from "@phosphor-icons/react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ComposedChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Campaign } from "@/types/campaign";

interface BudgetAllocationChartsProps {
  campaigns: Campaign[];
  budgetData: any[];
  ownerToRegion: Record<string, string>;
}

export function BudgetAllocationCharts({ campaigns, budgetData, ownerToRegion }: BudgetAllocationChartsProps) {
  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  // Chart data preparation
  const pieChartData = budgetData.map((data) => ({
    name: ownerToRegion[data.owner as keyof typeof ownerToRegion],
    value: data.used,
    assigned: data.assigned,
    remaining: data.remaining,
    overage: data.overage,
    owner: data.owner
  }));

  const barChartData = budgetData.map((data) => ({
    region: ownerToRegion[data.owner as keyof typeof ownerToRegion],
    assigned: data.assigned,
    used: data.used,
    remaining: data.remaining,
    utilizationPercent: ((data.used / data.assigned) * 100).toFixed(1)
  }));

  const utilizationData = budgetData.map((data) => ({
    region: ownerToRegion[data.owner as keyof typeof ownerToRegion],
    utilization: (data.used / data.assigned) * 100,
    campaigns: data.campaigns.length,
    efficiency: data.campaigns.length > 0 ? data.used / data.campaigns.length : 0
  }));

  // Budget trend analysis by quarter
  const quarterlyData = React.useMemo(() => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters.map(quarter => {
      const quarterCampaigns = campaigns.filter(c => c.quarterMonth?.includes(quarter));
      const totalSpend = quarterCampaigns.reduce((sum, c) => sum + (Number(c.forecastedCost) || 0), 0);
      const campaignCount = quarterCampaigns.length;
      
      return {
        quarter,
        spend: totalSpend,
        campaigns: campaignCount,
        avgCost: campaignCount > 0 ? totalSpend / campaignCount : 0
      };
    });
  }, [campaigns]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {
                entry.dataKey.includes('percent') || entry.dataKey === 'utilization' 
                  ? `${entry.value}%` 
                  : typeof entry.value === 'number' && entry.value > 1000
                    ? `$${entry.value?.toLocaleString()}`
                    : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Budget Allocation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Budget Usage by Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartPie className="h-5 w-5" />
              Budget Usage by Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Used Budget']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Assigned vs Used Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp className="h-5 w-5" />
              Assigned vs Used Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis tickFormatter={(value) => `$${(value / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="assigned" fill="#3b82f6" name="Assigned Budget" />
                <Bar dataKey="used" fill="#f59e0b" name="Used Budget" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Budget Utilization & Campaign Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="utilization" fill="#10b981" name="Utilization %" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="campaigns" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                name="Campaign Count"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quarterly Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Quarterly Spending Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000)}k`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                yAxisId="left" 
                type="monotone" 
                dataKey="spend" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Total Spend"
              />
              <Bar yAxisId="right" dataKey="campaigns" fill="#10b981" name="Campaign Count" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Efficiency Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {budgetData.map((data) => {
              const region = ownerToRegion[data.owner as keyof typeof ownerToRegion];
              const efficiency = data.campaigns.length > 0 ? data.used / data.campaigns.length : 0;
              const utilizationPercent = (data.used / data.assigned) * 100;
              
              return (
                <div key={data.owner} className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-primary">{region}</div>
                  <div className="text-2xl font-bold mt-2">
                    ${efficiency.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Cost per Campaign</div>
                  <div className="mt-2">
                    <Badge variant={utilizationPercent > 90 ? "destructive" : utilizationPercent > 70 ? "default" : "secondary"}>
                      {utilizationPercent.toFixed(1)}% utilized
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {data.campaigns.length} campaigns
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}