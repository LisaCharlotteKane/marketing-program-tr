import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";

interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  strategicPillar: string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number;
  expectedLeads: number;
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  status?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;
}

interface ReportingDashboardProps {
  campaigns: Campaign[];
}

export function ReportingDashboard({ campaigns }: ReportingDashboardProps) {
  const [filters, setFilters] = useState({
    region: '',
    owner: '',
    quarter: '',
    campaignType: ''
  });

  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const campaignTypes = [
    "In-Account Events (1:1)",
    "Exec Engagement Programs", 
    "CxO Events (1:Few)",
    "Localized Events",
    "Localized Programs",
    "Lunch & Learns and Workshops (1:Few)",
    "Microsoft",
    "Partners",
    "Webinars",
    "3P Sponsored Events",
    "Flagship Events (Galaxy, Universe Recaps) (1:Many)",
    "Targeted Paid Ads & Content Syndication",
    "User Groups",
    "Contractor/Infrastructure"
  ];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    return (
      (!filters.region || campaign.region === filters.region) &&
      (!filters.owner || campaign.owner === filters.owner) &&
      (!filters.quarter || campaign.quarterMonth === filters.quarter) &&
      (!filters.campaignType || campaign.campaignType === filters.campaignType)
    );
  });

  // Calculate totals
  const totals = filteredCampaigns.reduce((acc, campaign) => {
    acc.forecastedCost += campaign.forecastedCost || 0;
    acc.actualCost += campaign.actualCost || 0;
    acc.expectedLeads += campaign.expectedLeads || 0;
    acc.actualLeads += campaign.actualLeads || 0;
    acc.forecastedMqls += campaign.mql || 0;
    acc.actualMqls += campaign.actualMqls || 0;
    acc.pipelineForecast += campaign.pipelineForecast || 0;
    return acc;
  }, {
    forecastedCost: 0,
    actualCost: 0,
    expectedLeads: 0,
    actualLeads: 0,
    forecastedMqls: 0,
    actualMqls: 0,
    pipelineForecast: 0
  });

  // Calculate metrics by region
  const regionMetrics = regions.reduce((acc, region) => {
    const regionCampaigns = filteredCampaigns.filter(c => c.region === region);
    acc[region] = regionCampaigns.reduce((regionAcc, campaign) => {
      regionAcc.forecastedCost += campaign.forecastedCost || 0;
      regionAcc.actualCost += campaign.actualCost || 0;
      regionAcc.expectedLeads += campaign.expectedLeads || 0;
      regionAcc.actualLeads += campaign.actualLeads || 0;
      regionAcc.pipelineForecast += campaign.pipelineForecast || 0;
      return regionAcc;
    }, {
      forecastedCost: 0,
      actualCost: 0,
      expectedLeads: 0,
      actualLeads: 0,
      pipelineForecast: 0
    });
    return acc;
  }, {} as Record<string, any>);

  const clearFilters = () => {
    setFilters({
      region: '',
      owner: '',
      quarter: '',
      campaignType: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
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
              <Select value={filters.owner} onValueChange={(value) => setFilters(prev => ({ ...prev, owner: value }))}>
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

            <div className="space-y-2">
              <Select value={filters.quarter} onValueChange={(value) => setFilters(prev => ({ ...prev, quarter: value }))}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasted Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.forecastedCost.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actual Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.actualCost.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.pipelineForecast.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campaign ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.forecastedCost > 0 
                ? `${Math.round((totals.pipelineForecast / totals.forecastedCost) * 100)}%`
                : '0%'
              }
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
          <div className="space-y-4">
            {regions.map(region => {
              const metrics = regionMetrics[region];
              if (!metrics || metrics.forecastedCost === 0) return null;
              
              return (
                <div key={region} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">{region}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Forecasted Cost</div>
                      <div className="text-muted-foreground">${metrics.forecastedCost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Actual Cost</div>
                      <div className="text-muted-foreground">${metrics.actualCost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Expected Leads</div>
                      <div className="text-muted-foreground">{metrics.expectedLeads.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Pipeline Forecast</div>
                      <div className="text-muted-foreground">${metrics.pipelineForecast.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance: Forecasted */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance: Forecasted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{totals.expectedLeads.toLocaleString()}</div>
              <div className="text-muted-foreground">Forecasted Leads</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{totals.forecastedMqls.toLocaleString()}</div>
              <div className="text-muted-foreground">Forecasted MQLs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">${totals.pipelineForecast.toLocaleString()}</div>
              <div className="text-muted-foreground">Forecasted Pipeline</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtered Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Data ({filteredCampaigns.length} campaigns)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns match the selected filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{campaign.campaignName}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">${campaign.forecastedCost.toLocaleString()}</div>
                      <div className="text-muted-foreground">Forecasted</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                    <div>Owner: {campaign.owner}</div>
                    <div>Region: {campaign.region}</div>
                    <div>Quarter: {campaign.quarterMonth}</div>
                    <div>Pipeline: ${campaign.pipelineForecast.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}