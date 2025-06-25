import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, ArrowsClockwise, FunnelSimple, X } from "@phosphor-icons/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Fiscal year months (July to June)
const FISCAL_YEAR_MONTHS = [
  "July", "August", "September", "October", "November", "December",
  "January", "February", "March", "April", "May", "June"
];

// Helper to extract month from quarter/month string
const getMonthFromQuarterMonth = (quarterMonth: string): string => {
  if (!quarterMonth) return "";
  
  // Extract month name from strings like "Q1 - July"
  const monthMatch = quarterMonth.match(/- ([A-Za-z]+)/);
  return monthMatch ? monthMatch[1] : "";
};

// Map month names to their fiscal year order for sorting (starting with July = 1)
const monthToFiscalOrder: Record<string, number> = {
  "July": 1, "August": 2, "September": 3, "October": 4, "November": 5, "December": 6,
  "January": 7, "February": 8, "March": 9, "April": 10, "May": 11, "June": 12
};

// Get region color value for border
const getRegionBorderColor = (region: string): string => {
  switch (region) {
    case "JP & Korea":
      return "border-blue-500";
    case "South APAC":
      return "border-green-500";
    case "SAARC":
      return "border-orange-500";
    case "Digital Motions":
      return "border-purple-500";
    case "X APAC Non English":
      return "border-pink-500";
    case "X APAC English":
      return "border-indigo-500";
    default:
      return "border-gray-300";
  }
};

// Get region color class for badges
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

// Get status badge class
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "Planning":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "On Track":
      return "bg-green-100 text-green-800 border-green-200";
    case "Shipped":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
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
  const [fiscalYearFilter, setFiscalYearFilter] = useState("_all");

  // Get unique values for filters
  const regions = ["_all", ...new Set(campaigns.map(c => c.region))].filter(Boolean);
  const owners = ["_all", ...new Set(campaigns.map(c => c.owner))].filter(Boolean);
  const types = ["_all", ...new Set(campaigns.map(c => c.campaignType))].filter(Boolean);
  const plays = ["_all", ...new Set(campaigns.map(c => c.revenuePlay))].filter(Boolean);
  const statuses = ["_all", "Planning", "On Track", "Shipped", "Cancelled"];
  const fiscalYears = ["_all", "FY24", "FY25", "FY26", "FY27"];

  // Apply filters
  const filteredCampaigns = campaigns.filter(campaign => {
    return (regionFilter === "_all" || campaign.region === regionFilter) &&
           (ownerFilter === "_all" || campaign.owner === ownerFilter) &&
           (typeFilter === "_all" || campaign.campaignType === typeFilter) &&
           (playFilter === "_all" || campaign.revenuePlay === playFilter) &&
           (statusFilter === "_all" || campaign.status === statusFilter) &&
           (fiscalYearFilter === "_all" || campaign.fiscalYear === fiscalYearFilter);
  });

  // Group campaigns by month within the selected fiscal year
  const campaignsByMonth: Record<string, any[]> = {};
  
  // Initialize all fiscal year months
  FISCAL_YEAR_MONTHS.forEach(month => {
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

  // Helper function to render a month card
  const renderMonthCard = (month) => {
    const monthCampaigns = campaignsByMonth[month] || [];
    return (
      <div key={month} className="border rounded-md p-4 h-full">
        <h3 className="font-medium text-lg mb-2">
          <span>{month}</span>
        </h3>
        
        {monthCampaigns.length > 0 ? (
          <div className="space-y-3 mt-3">
            {monthCampaigns.map(campaign => (
              <div 
                key={campaign.id} 
                className={`text-sm border rounded-md p-3 shadow-sm ${getRegionBorderColor(campaign.region)}`}
                style={{ borderLeftWidth: '4px' }}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-medium leading-tight">{campaign.description || campaign.campaignName || campaign.campaignType}</h4>
                  <Badge variant="outline" className={getRegionColorClass(campaign.region)}>
                    {campaign.region}
                  </Badge>
                </div>
                
                <div className="space-y-1 border-t pt-2 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium">{campaign.country}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">{campaign.owner}</span>
                  </div>
                  
                  {campaign.status && (
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusBadgeClass(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-md mt-3">
            No campaigns scheduled
          </div>
        )}
      </div>
    );
  };

  // Helper function to check if a quarter has any campaigns
  const hasQuarterCampaigns = (startIdx, endIdx) => {
    const quarterMonths = FISCAL_YEAR_MONTHS.slice(startIdx, endIdx);
    return quarterMonths.some(month => (campaignsByMonth[month] || []).length > 0);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5" /> Campaign Calendar View
        </CardTitle>
        <CardDescription>
          View campaigns organized by {fiscalYearFilter === "_all" ? "fiscal year" : `${fiscalYearFilter} (July to June)`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Fiscal Year Selector */}
        <div className="mb-6">
          <Label htmlFor="fiscal-year-filter" className="mb-2 block">Fiscal Year</Label>
          <div className="flex gap-2 flex-wrap">
            {fiscalYears.map(fy => (
              <Button 
                key={fy}
                variant={fiscalYearFilter === fy ? "default" : "outline"}
                onClick={() => setFiscalYearFilter(fy)}
                className="px-4"
              >
                {fy === "_all" ? "All Years" : fy}
              </Button>
            ))}
          </div>
        </div>
        
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
        
        {/* Active filters and clear button */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <FunnelSimple className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
          
          {regionFilter !== "_all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Region: {regionFilter}
              <button onClick={() => setRegionFilter("_all")} className="ml-1 hover:bg-muted rounded-full">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {ownerFilter !== "_all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Owner: {ownerFilter}
              <button onClick={() => setOwnerFilter("_all")} className="ml-1 hover:bg-muted rounded-full">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {typeFilter !== "_all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Type: {typeFilter}
              <button onClick={() => setTypeFilter("_all")} className="ml-1 hover:bg-muted rounded-full">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {playFilter !== "_all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Play: {playFilter}
              <button onClick={() => setPlayFilter("_all")} className="ml-1 hover:bg-muted rounded-full">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {statusFilter !== "_all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("_all")} className="ml-1 hover:bg-muted rounded-full">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {(regionFilter !== "_all" || ownerFilter !== "_all" || typeFilter !== "_all" || 
            playFilter !== "_all" || statusFilter !== "_all") && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1"
            >
              <ArrowsClockwise className="h-3.5 w-3.5" />
              Clear All Filters
            </Button>
          )}
        </div>
        
        {/* Calendar grid - fiscal year layout by quarter (July to June) */}
        <div className="space-y-8">
          {/* Q1 */}
          {(fiscalYearFilter === "_all" || hasQuarterCampaigns(0, 3)) && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center">
                <Badge variant="outline" className="mr-2 bg-primary/10">Q1</Badge>
                {fiscalYearFilter !== "_all" ? fiscalYearFilter : ""} 
                <span className="ml-2 text-sm text-muted-foreground">(July - September)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FISCAL_YEAR_MONTHS.slice(0, 3).map(month => renderMonthCard(month))}
              </div>
            </div>
          )}
          
          {/* Q2 */}
          {(fiscalYearFilter === "_all" || hasQuarterCampaigns(3, 6)) && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center">
                <Badge variant="outline" className="mr-2 bg-primary/10">Q2</Badge>
                {fiscalYearFilter !== "_all" ? fiscalYearFilter : ""}
                <span className="ml-2 text-sm text-muted-foreground">(October - December)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FISCAL_YEAR_MONTHS.slice(3, 6).map(month => renderMonthCard(month))}
              </div>
            </div>
          )}
          
          {/* Q3 */}
          {(fiscalYearFilter === "_all" || hasQuarterCampaigns(6, 9)) && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center">
                <Badge variant="outline" className="mr-2 bg-primary/10">Q3</Badge>
                {fiscalYearFilter !== "_all" ? fiscalYearFilter : ""}
                <span className="ml-2 text-sm text-muted-foreground">(January - March)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FISCAL_YEAR_MONTHS.slice(6, 9).map(month => renderMonthCard(month))}
              </div>
            </div>
          )}
          
          {/* Q4 */}
          {(fiscalYearFilter === "_all" || hasQuarterCampaigns(9, 12)) && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium border-b pb-2 flex items-center">
                <Badge variant="outline" className="mr-2 bg-primary/10">Q4</Badge>
                {fiscalYearFilter !== "_all" ? fiscalYearFilter : ""}
                <span className="ml-2 text-sm text-muted-foreground">(April - June)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FISCAL_YEAR_MONTHS.slice(9, 12).map(month => renderMonthCard(month))}
              </div>
            </div>
          )}
          
          {/* No data message */}
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12 border border-dashed rounded-md">
              <h3 className="text-lg text-muted-foreground">No campaigns match the selected filters</h3>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                <ArrowsClockwise className="h-4 w-4 mr-2" /> Clear All Filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-8 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Region Color Legend</h4>
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
            
            <div>
              <h4 className="font-medium mb-2">Status Legend</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  Planning
                </Badge>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  On Track
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Shipped
                </Badge>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  Cancelled
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}