import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartBar, Download } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";

interface ReportingDashboardProps {
  campaigns: Campaign[];
}

export function ReportingDashboard({ campaigns }: ReportingDashboardProps) {
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [quarterFilter, setQuarterFilter] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>("");

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (regionFilter && campaign.region !== regionFilter) return false;
    if (quarterFilter && campaign.quarterMonth !== quarterFilter) return false;
    if (ownerFilter && campaign.owner !== ownerFilter) return false;
    return true;
  });

  // Calculate metrics
  const totalForecastedSpend = filteredCampaigns.reduce((sum, campaign) => {
    return sum + (typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : parseFloat(campaign.forecastedCost.toString()) || 0);
  }, 0);

  const totalActualSpend = filteredCampaigns.reduce((sum, campaign) => {
    return sum + (typeof campaign.actualCost === 'number' ? campaign.actualCost : parseFloat(campaign.actualCost.toString()) || 0);
  }, 0);

  const totalForecastedLeads = filteredCampaigns.reduce((sum, campaign) => {
    return sum + (typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : parseFloat(campaign.expectedLeads.toString()) || 0);
  }, 0);

  const totalActualLeads = filteredCampaigns.reduce((sum, campaign) => {
    return sum + (typeof campaign.actualLeads === 'number' ? campaign.actualLeads : parseFloat(campaign.actualLeads.toString()) || 0);
  }, 0);

  const totalPipelineForecast = filteredCampaigns.reduce((sum, campaign) => sum + campaign.pipelineForecast, 0);
  const totalMQLs = filteredCampaigns.reduce((sum, campaign) => sum + campaign.mql, 0);
  const totalSQLs = filteredCampaigns.reduce((sum, campaign) => sum + campaign.sql, 0);

  // Prepare chart data
  const chartData = regions.map(region => {
    const regionCampaigns = filteredCampaigns.filter(c => c.region === region);
    const forecastedPipeline = regionCampaigns.reduce((sum, c) => sum + c.pipelineForecast, 0);
    const forecastedLeads = regionCampaigns.reduce((sum, c) => {
      return sum + (typeof c.expectedLeads === 'number' ? c.expectedLeads : parseFloat(c.expectedLeads.toString()) || 0);
    }, 0);
    const forecastedMQLs = regionCampaigns.reduce((sum, c) => sum + c.mql, 0);

    return {
      region,
      forecastedPipeline,
      forecastedLeads,
      forecastedMQLs
    };
  }).filter(d => d.forecastedPipeline > 0 || d.forecastedLeads > 0);

  const clearFilters = () => {
    setRegionFilter("");
    setQuarterFilter("");
    setOwnerFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quarter</Label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Quarters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Quarters</SelectItem>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Owners</SelectItem>
                  {owners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasted Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalForecastedSpend.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPipelineForecast.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasted Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalForecastedLeads.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total MQLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMQLs.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Forecasted Impact by Region</CardTitle>
          <CardDescription>Pipeline forecast distribution across regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Pipeline']} />
                <Bar dataKey="forecastedPipeline" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance: Forecasted */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance: Forecasted</CardTitle>
          <CardDescription>Detailed breakdown of forecasted metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Forecasted Pipeline</TableHead>
                  <TableHead>Forecasted Leads</TableHead>
                  <TableHead>Forecasted MQLs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No campaigns found matching the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                      <TableCell>{campaign.owner}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {campaign.region}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">${campaign.pipelineForecast.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">
                        {typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads.toLocaleString() : campaign.expectedLeads}
                      </TableCell>
                      <TableCell className="font-mono">{campaign.mql.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}