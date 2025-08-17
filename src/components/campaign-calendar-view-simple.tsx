import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { Campaign, CampaignDisplayProps } from "@/types/campaign";

interface CampaignCalendarViewProps {
  campaigns: Campaign[];
}

const REGION_COLORS = {
  "JP & Korea": "bg-blue-100 text-blue-800 border-blue-200",
  "South APAC": "bg-green-100 text-green-800 border-green-200",
  "SAARC": "bg-orange-100 text-orange-800 border-orange-200",
  "Digital": "bg-purple-100 text-purple-800 border-purple-200",
  "X APAC English": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "X APAC Non English": "bg-pink-100 text-pink-800 border-pink-200"
};

const STATUS_COLORS = {
  "Planning": "bg-gray-100 text-gray-800",
  "On Track": "bg-green-100 text-green-800",
  "Shipped": "bg-blue-100 text-blue-800",
  "Cancelled": "bg-red-100 text-red-800"
};

const MONTHS = [
  "July", "August", "September", "October", "November", "December",
  "January", "February", "March", "April", "May", "June"
];

export function CampaignCalendarView({ campaigns = [] }: CampaignCalendarViewProps) {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const types = [...new Set(campaigns.map(c => c.campaignType).filter(Boolean))];
  const statuses = ["Planning", "On Track", "Shipped", "Cancelled"];

  const getMonthFromQuarter = (quarterMonth: string): string => {
    if (!quarterMonth) return '';
    const match = quarterMonth.match(/- (.+)$/);
    return match ? match[1] : '';
  };

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) {
      return [];
    }
    return campaigns.filter(campaign => {
      if (campaign.campaignType === "Contractor/Infrastructure" || campaign.campaignType === "Contractor") return false;
      if (regionFilter !== 'all' && campaign.region !== regionFilter) return false;
      if (ownerFilter !== 'all' && campaign.owner !== ownerFilter) return false;
      if (typeFilter !== 'all' && campaign.campaignType !== typeFilter) return false;
      if (statusFilter !== 'all' && (campaign.status || 'Planning') !== statusFilter) return false;
      return true;
    });
  }, [campaigns, regionFilter, ownerFilter, typeFilter, statusFilter]);

  const campaignsByMonth = useMemo(() => {
    const monthMap = new Map<string, Campaign[]>();
    MONTHS.forEach(month => monthMap.set(month, []));
    filteredCampaigns.forEach(campaign => {
      const month = getMonthFromQuarter(campaign.quarterMonth);
      if (month && monthMap.has(month)) {
        monthMap.get(month)!.push(campaign);
      }
    });
    return monthMap;
  }, [filteredCampaigns]);

  const clearFilters = () => {
    setRegionFilter('all');
    setOwnerFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
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

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Region Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(REGION_COLORS).map(([region, colorClass]) => (
              <div key={region} className={`px-3 py-1 rounded-md border text-sm ${colorClass}`}>
                {region}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map(month => {
          const monthCampaigns = campaignsByMonth.get(month) || [];

          return (
            <Card key={month} className="min-h-[300px]">
              <CardHeader>
                <CardTitle className="text-lg">{month}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {monthCampaigns.length} campaign(s)
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthCampaigns.map(campaign => {
                    const regionColor = REGION_COLORS[campaign.region as keyof typeof REGION_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";
                    const statusColor = STATUS_COLORS[(campaign.status || 'Planning') as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800";

                    return (
                      <div
                        key={campaign.id}
                        className={`p-3 rounded-lg border ${regionColor} space-y-2`}
                      >
                        <div className="font-medium text-sm leading-tight">
                          {campaign.description || "Untitled Campaign"}
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs opacity-80">{campaign.country}</div>
                          <div className="text-xs font-medium">{campaign.owner}</div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${statusColor}`}
                          >
                            {campaign.status || 'Planning'}
                          </Badge>
                          <div className="text-xs font-medium">
                            ${(campaign.forecastedCost || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {monthCampaigns.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No campaigns scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
