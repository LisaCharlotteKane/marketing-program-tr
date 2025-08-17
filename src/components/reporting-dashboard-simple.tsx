import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Campaign, CampaignDisplayProps } from "@/types/campaign";

interface ReportingDashboardProps {
  campaigns: Campaign[];
}

export function ReportingDashboard({ campaigns = [] }: ReportingDashboardProps) {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December",
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const clearFilters = () => {
    setRegionFilter('all');
    setOwnerFilter('all');
    setQuarterFilter('all');
  };

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) {
      return [];
    }
    return campaigns.filter(campaign => {
      if (regionFilter !== 'all' && campaign.region !== regionFilter) return false;
      if (ownerFilter !== 'all' && campaign.owner !== ownerFilter) return false;
      if (quarterFilter !== 'all' && campaign.quarterMonth !== quarterFilter) return false;
      return true;
    });
  }, [campaigns, regionFilter, ownerFilter, quarterFilter]);

  const summaryMetrics = useMemo(() => {
    const totalForecastedCost = filteredCampaigns.reduce((sum, c) => sum + (c.forecastedCost || 0), 0);
    const totalActualCost = filteredCampaigns.reduce((sum, c) => sum + (c.actualCost || 0), 0);
    const totalForecastedLeads = filteredCampaigns.reduce((sum, c) => sum + (c.expectedLeads || 0), 0);
    const totalActualLeads = filteredCampaigns.reduce((sum, c) => sum + (c.actualLeads || 0), 0);
    const totalForecastedMQLs = filteredCampaigns.reduce((sum, c) => sum + (c.mql || 0), 0);
    const totalActualMQLs = filteredCampaigns.reduce((sum, c) => sum + (c.actualMQLs || 0), 0);
    const totalForecastedPipeline = filteredCampaigns.reduce((sum, c) => sum + (c.pipelineForecast || 0), 0);

    return {
      totalForecastedCost,
      totalActualCost,
      totalForecastedLeads,
      totalActualLeads,
      totalForecastedMQLs,
      totalActualMQLs,
      totalForecastedPipeline
    };
  }, [filteredCampaigns]);

  const regionalData = useMemo(() => {
    const regionMap = new Map();

    filteredCampaigns.forEach(campaign => {
      const region = campaign.region;
      if (!regionMap.has(region)) {
        regionMap.set(region, {
          region,
          forecastedCost: 0,
          actualCost: 0,
          forecastedLeads: 0,
          actualLeads: 0,
          forecastedMQLs: 0,
          actualMQLs: 0,
          forecastedPipeline: 0,
          campaignCount: 0
        });
      }

      const data = regionMap.get(region);
      data.forecastedCost += campaign.forecastedCost || 0;
      data.actualCost += campaign.actualCost || 0;
      data.forecastedLeads += campaign.expectedLeads || 0;
      data.actualLeads += campaign.actualLeads || 0;
      data.forecastedMQLs += campaign.mql || 0;
      data.actualMQLs += campaign.actualMQLs || 0;
      data.forecastedPipeline += campaign.pipelineForecast || 0;
      data.campaignCount += 1;
    });

    return Array.from(regionMap.values());
  }, [filteredCampaigns]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Owner</label>
              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {owners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quarter</label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2 w-full"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Forecasted Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryMetrics.totalForecastedCost.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actual Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryMetrics.totalActualCost.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Forecasted Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryMetrics.totalForecastedPipeline.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campaign Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredCampaigns.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Forecasted Cost</TableHead>
                  <TableHead>Actual Cost</TableHead>
                  <TableHead>Forecasted Leads</TableHead>
                  <TableHead>Actual Leads</TableHead>
                  <TableHead>Forecasted MQLs</TableHead>
                  <TableHead>Actual MQLs</TableHead>
                  <TableHead>Forecasted Pipeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionalData.map((region) => (
                  <TableRow key={region.region}>
                    <TableCell>
                      <Badge variant="outline">{region.region}</Badge>
                    </TableCell>
                    <TableCell>{region.campaignCount}</TableCell>
                    <TableCell>${region.forecastedCost.toLocaleString()}</TableCell>
                    <TableCell>${region.actualCost.toLocaleString()}</TableCell>
                    <TableCell>{region.forecastedLeads.toLocaleString()}</TableCell>
                    <TableCell>{region.actualLeads.toLocaleString()}</TableCell>
                    <TableCell>{region.forecastedMQLs.toLocaleString()}</TableCell>
                    <TableCell>{region.actualMQLs.toLocaleString()}</TableCell>
                    <TableCell>${region.forecastedPipeline.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Forecasted Cost</TableHead>
                  <TableHead>Actual Cost</TableHead>
                  <TableHead>Forecasted Leads</TableHead>
                  <TableHead>Actual Leads</TableHead>
                  <TableHead>Pipeline Forecast</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate" title={campaign.description}>
                        {campaign.description || "Untitled Campaign"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.campaignType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.region}</Badge>
                    </TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell>${(campaign.forecastedCost || 0).toLocaleString()}</TableCell>
                    <TableCell>${(campaign.actualCost || 0).toLocaleString()}</TableCell>
                    <TableCell>{(campaign.expectedLeads || 0).toLocaleString()}</TableCell>
                    <TableCell>{(campaign.actualLeads || 0).toLocaleString()}</TableCell>
                    <TableCell>${(campaign.pipelineForecast || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
