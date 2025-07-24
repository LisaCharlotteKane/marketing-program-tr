import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterX } from "@phosphor-icons/react";

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
  status?: string;
}

interface CampaignCalendarViewProps {
  campaigns: Campaign[];
}

export function CampaignCalendarView({ campaigns }: CampaignCalendarViewProps) {
  const [filters, setFilters] = useState({
    region: '',
    owner: '',
    campaignType: '',
    revenuePlay: '',
    status: ''
  });

  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
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

  const revenuePlays = [
    "Accelerate developer productivity with Copilot in VS Code and GitHub",
    "Secure all developer workloads with the power of AI",
    "All"
  ];

  const statuses = ["Planning", "On Track", "Shipped", "Cancelled"];

  // Fiscal year months mapping
  const fiscalMonths = [
    { month: "July", quarter: "Q1", order: 1 },
    { month: "August", quarter: "Q1", order: 2 },
    { month: "September", quarter: "Q1", order: 3 },
    { month: "October", quarter: "Q2", order: 4 },
    { month: "November", quarter: "Q2", order: 5 },
    { month: "December", quarter: "Q2", order: 6 },
    { month: "January", quarter: "Q3", order: 7 },
    { month: "February", quarter: "Q3", order: 8 },
    { month: "March", quarter: "Q3", order: 9 },
    { month: "April", quarter: "Q4", order: 10 },
    { month: "May", quarter: "Q4", order: 11 },
    { month: "June", quarter: "Q4", order: 12 },
  ];

  // Filter campaigns (exclude Contractor/Infrastructure from calendar)
  const filteredCampaigns = campaigns.filter(campaign => {
    // Exclude contractor campaigns from calendar display
    if (campaign.campaignType === "Contractor/Infrastructure" || 
        campaign.campaignType === "Contractor") {
      return false;
    }

    return (
      (!filters.region || campaign.region === filters.region) &&
      (!filters.owner || campaign.owner === filters.owner) &&
      (!filters.campaignType || campaign.campaignType === filters.campaignType) &&
      (!filters.revenuePlay || campaign.revenuePlay === filters.revenuePlay) &&
      (!filters.status || campaign.status === filters.status)
    );
  });

  // Parse quarter-month to extract month
  const getMonthFromQuarter = (quarterMonth: string): string => {
    if (!quarterMonth) return '';
    const parts = quarterMonth.split(' - ');
    return parts.length > 1 ? parts[1] : '';
  };

  // Group campaigns by month
  const campaignsByMonth = fiscalMonths.reduce((acc, { month }) => {
    acc[month] = filteredCampaigns.filter(campaign => 
      getMonthFromQuarter(campaign.quarterMonth) === month
    );
    return acc;
  }, {} as Record<string, Campaign[]>);

  // Get region color
  const getRegionColor = (region: string) => {
    switch (region) {
      case "JP & Korea":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "South APAC":
        return "bg-green-100 text-green-800 border-green-200";
      case "SAARC":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Digital":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Planning":
        return "bg-gray-100 text-gray-800";
      case "On Track":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      owner: '',
      campaignType: '',
      revenuePlay: '',
      status: ''
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

            <Select value={filters.campaignType} onValueChange={(value) => setFilters(prev => ({ ...prev, campaignType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {campaignTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.revenuePlay} onValueChange={(value) => setFilters(prev => ({ ...prev, revenuePlay: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Revenue Plays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Revenue Plays</SelectItem>
                {revenuePlays.map(play => (
                  <SelectItem key={play} value={play}>{play}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Region Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {regions.map(region => (
              <Badge key={region} className={getRegionColor(region)}>
                {region}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {fiscalMonths.map(({ month, quarter }) => (
          <Card key={month} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {month}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {quarter}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsByMonth[month].length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No campaigns
                </div>
              ) : (
                <div className="space-y-2">
                  {campaignsByMonth[month].map((campaign) => (
                    <div
                      key={campaign.id}
                      className={`p-3 rounded-lg border text-sm ${getRegionColor(campaign.region)}`}
                    >
                      <div className="font-medium mb-1 line-clamp-2">
                        {campaign.description || campaign.campaignName}
                      </div>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="font-medium">Country:</span> {campaign.country}
                        </div>
                        <div>
                          <span className="font-medium">Owner:</span> {campaign.owner}
                        </div>
                        {campaign.status && (
                          <div className="mt-2">
                            <Badge size="sm" className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredCampaigns.length}</div>
              <div className="text-muted-foreground">Total Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Object.values(campaignsByMonth).filter(campaigns => campaigns.length > 0).length}
              </div>
              <div className="text-muted-foreground">Active Months</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${filteredCampaigns.reduce((sum, c) => sum + (c.forecastedCost || 0), 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {filteredCampaigns.reduce((sum, c) => sum + (c.expectedLeads || 0), 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Leads</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}