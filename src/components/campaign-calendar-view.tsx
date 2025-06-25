import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// Helper to extract month from quarter/month string
const getMonthFromQuarterMonth = (quarterMonth: string): string => {
  if (!quarterMonth) return "";
  
  // Extract month name from strings like "Q1 - July"
  const monthMatch = quarterMonth.match(/- ([A-Za-z]+)/);
  return monthMatch ? monthMatch[1] : "";
};

// Map month names to their number for sorting
const monthToNumber: Record<string, number> = {
  "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
  "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
};

// Get region color class
const getRegionColorClass = (region: string): string => {
  switch (region) {
    case "JP & Korea":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "South APAC":
      return "bg-green-100 text-green-800 border-green-200";
    case "SAARC":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Digital Motions":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "X APAC Non English":
      return "bg-pink-100 text-pink-800 border-pink-200";
    case "X APAC English":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function CampaignCalendarView({ campaigns = [] }) {
  const [regionFilter, setRegionFilter] = useState("_all");
  const [ownerFilter, setOwnerFilter] = useState("_all");
  const [typeFilter, setTypeFilter] = useState("_all");
  const [playFilter, setPlayFilter] = useState("_all");
  const [statusFilter, setStatusFilter] = useState("_all");

  // Get unique values for filters
  const regions = ["_all", ...new Set(campaigns.map(c => c.region))].filter(Boolean);
  const owners = ["_all", ...new Set(campaigns.map(c => c.owner))].filter(Boolean);
  const types = ["_all", ...new Set(campaigns.map(c => c.campaignType))].filter(Boolean);
  const plays = ["_all", ...new Set(campaigns.map(c => c.revenuePlay))].filter(Boolean);
  const statuses = ["_all", "Planning", "On Track", "Shipped", "Cancelled"];

  // Apply filters
  const filteredCampaigns = campaigns.filter(campaign => {
    return (regionFilter === "_all" || campaign.region === regionFilter) &&
           (ownerFilter === "_all" || campaign.owner === ownerFilter) &&
           (typeFilter === "_all" || campaign.campaignType === typeFilter) &&
           (playFilter === "_all" || campaign.revenuePlay === playFilter) &&
           (statusFilter === "_all" || campaign.status === statusFilter);
  });

  // Group campaigns by month
  const campaignsByMonth: Record<string, any[]> = {};
  
  // Initialize all months
  ["January", "February", "March", "April", "May", "June", 
   "July", "August", "September", "October", "November", "December"].forEach(month => {
    campaignsByMonth[month] = [];
  });
  
  // Populate with campaigns
  filteredCampaigns.forEach(campaign => {
    const month = getMonthFromQuarterMonth(campaign.quarterMonth);
    if (month && campaignsByMonth[month]) {
      campaignsByMonth[month].push(campaign);
    }
  });

  // Clear all filters
  const clearFilters = () => {
    setRegionFilter("_all");
    setOwnerFilter("_all");
    setTypeFilter("_all");
    setPlayFilter("_all");
    setStatusFilter("_all");
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5" /> Campaign Calendar View
        </CardTitle>
        <CardDescription>
          View campaigns across the year, organized by month
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="region-filter">Region</Label>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger id="region-filter">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Regions</SelectItem>
                {regions.filter(r => r !== "_all").map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="owner-filter">Owner</Label>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger id="owner-filter">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Owners</SelectItem>
                {owners.filter(o => o !== "_all").map(owner => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type-filter">Campaign Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Types</SelectItem>
                {types.filter(t => t !== "_all").map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="play-filter">Revenue Play</Label>
            <Select value={playFilter} onValueChange={setPlayFilter}>
              <SelectTrigger id="play-filter">
                <SelectValue placeholder="All Plays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Plays</SelectItem>
                {plays.filter(p => p !== "_all").map(play => (
                  <SelectItem key={play} value={play}>{play}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Statuses</SelectItem>
                {statuses.filter(s => s !== "_all").map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Clear filters button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            Clear All Filters
          </button>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(campaignsByMonth)
            .sort(([monthA], [monthB]) => monthToNumber[monthA] - monthToNumber[monthB])
            .map(([month, monthCampaigns]) => (
              <div key={month} className="border rounded-md p-4">
                <h3 className="font-medium text-lg mb-3">{month}</h3>
                {monthCampaigns.length > 0 ? (
                  <div className="space-y-2">
                    {monthCampaigns.map(campaign => (
                      <div key={campaign.id} className="text-sm border rounded-md p-2">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{campaign.description || campaign.campaignType}</span>
                          <Badge variant="outline" className={getRegionColorClass(campaign.region)}>
                            {campaign.region}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <div>Owner: {campaign.owner}</div>
                          {campaign.status && <div>Status: {campaign.status}</div>}
                          {campaign.forecastedCost && (
                            <div>
                              Budget: ${Number(campaign.forecastedCost).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No campaigns scheduled
                  </div>
                )}
              </div>
            ))}
        </div>
        
        {/* Legend */}
        <div className="mt-8 border-t pt-4">
          <h4 className="font-medium mb-2">Region Legend</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              JP & Korea
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              South APAC
            </Badge>
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
              SAARC
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              Digital Motions
            </Badge>
            <Badge variant="outline" className="bg-pink-100 text-pink-800 border-pink-200">
              X APAC Non English
            </Badge>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
              X APAC English
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}