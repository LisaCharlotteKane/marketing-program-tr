import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "@phosphor-icons/react";
import { Campaign } from "@/components/campaign-table";

interface CampaignCalendarViewProps {
  campaigns: Campaign[];
}

export function CampaignCalendarView({ campaigns }: CampaignCalendarViewProps) {
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"];

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

  // Filter campaigns (exclude Contractor/Infrastructure from calendar)
  const filteredCampaigns = campaigns.filter(campaign => {
    if (campaign.campaignType?.includes("Contractor") || campaign.campaignType?.includes("Infrastructure")) {
      return false;
    }
    if (regionFilter && campaign.region !== regionFilter) return false;
    if (ownerFilter && campaign.owner !== ownerFilter) return false;
    if (typeFilter && campaign.campaignType !== typeFilter) return false;
    if (statusFilter && campaign.status !== statusFilter) return false;
    return true;
  });

  const months = [
    "July", "August", "September", "October", "November", "December",
    "January", "February", "March", "April", "May", "June"
  ];

  // Group campaigns by month
  const campaignsByMonth = months.map(month => {
    const monthCampaigns = filteredCampaigns.filter(campaign => 
      campaign.quarterMonth?.includes(month)
    );
    return { month, campaigns: monthCampaigns };
  });

  const getRegionColor = (region: string) => {
    switch (region) {
      case "JP & Korea": return "bg-blue-100 text-blue-800 border-blue-200";
      case "South APAC": return "bg-green-100 text-green-800 border-green-200";
      case "SAARC": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Digital": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning": return "bg-gray-500";
      case "On Track": return "bg-green-500";
      case "Shipped": return "bg-blue-500";
      case "Cancelled": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const clearFilters = () => {
    setRegionFilter("");
    setOwnerFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Region Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {regions.map(region => (
              <Badge key={region} className={getRegionColor(region)}>
                {region}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fiscal Year Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>FY26 Campaign Calendar</CardTitle>
          <CardDescription>
            Showing {filteredCampaigns.length} campaign(s) across fiscal year months (July - June)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {campaignsByMonth.map(({ month, campaigns: monthCampaigns }) => (
              <div key={month} className="border rounded-lg p-4 bg-card">
                <div className="font-semibold text-lg mb-3 text-center border-b pb-2">
                  {month}
                </div>
                <div className="space-y-2 min-h-[120px]">
                  {monthCampaigns.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No campaigns
                    </div>
                  ) : (
                    monthCampaigns.map(campaign => (
                      <div
                        key={campaign.id}
                        className={`p-2 rounded-md border text-xs ${getRegionColor(campaign.region)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium truncate">
                            {campaign.campaignName || campaign.description}
                          </div>
                          <div 
                            className={`w-2 h-2 rounded-full ${getStatusColor(campaign.status)}`}
                            title={campaign.status}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {campaign.country}
                        </div>
                        <div className="text-xs font-medium">
                          {campaign.owner}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}