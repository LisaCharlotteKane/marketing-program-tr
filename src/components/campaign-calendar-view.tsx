import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ClearFiltersButton } from "@/components/clear-filters-button";
import { Calendar } from "@phosphor-icons/react";
import { Campaign } from "./campaign-table";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface CampaignCalendarViewProps {
  campaigns: Campaign[];
}

// Define month names
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Quarter to Month mapping
const QUARTER_MONTH_MAP: Record<string, number> = {
  "Q1 - July": 6, // July (0-indexed)
  "Q1 - August": 7,
  "Q1 - September": 8,
  "Q2 - October": 9,
  "Q2 - November": 10,
  "Q2 - December": 11,
  "Q3 - January": 0,
  "Q3 - February": 1,
  "Q3 - March": 2,
  "Q4 - April": 3,
  "Q4 - May": 4,
  "Q4 - June": 5
};

// Region color mapping
const REGION_COLORS: Record<string, { bg: string, text: string }> = {
  "North APAC": { bg: "bg-blue-100", text: "text-blue-800" },
  "South APAC": { bg: "bg-green-100", text: "text-green-800" },
  "SAARC": { bg: "bg-orange-100", text: "text-orange-800" },
  "Digital Motions": { bg: "bg-purple-100", text: "text-purple-800" },
  "X APAC Non English": { bg: "bg-gray-100", text: "text-gray-800" },
  "X APAC English": { bg: "bg-slate-100", text: "text-slate-800" }
};

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  "Planning": "bg-gray-100 text-gray-800 border-gray-200",
  "On Track": "bg-green-100 text-green-800 border-green-200",
  "Shipped": "bg-blue-100 text-blue-800 border-blue-200",
  "Cancelled": "bg-red-100 text-red-800 border-red-200"
};

export function CampaignCalendarView({ campaigns }: CampaignCalendarViewProps) {
  const [regionFilter, setRegionFilter] = useState<string>("_all");
  const [ownerFilter, setOwnerFilter] = useState<string>("_all");
  const [typeFilter, setTypeFilter] = useState<string>("_all");
  const [revenuePlayFilter, setRevenuePlayFilter] = useState<string>("_all");
  const [statusFilter, setStatusFilter] = useState<string>("_all");
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Extract unique values for filters
  const regions = useMemo(() => ["_all", ...new Set(campaigns.map(c => c.region))].filter(Boolean), [campaigns]);
  const owners = useMemo(() => ["_all", ...new Set(campaigns.map(c => c.owner))].filter(Boolean), [campaigns]);
  const types = useMemo(() => ["_all", ...new Set(campaigns.map(c => c.campaignType))].filter(Boolean), [campaigns]);
  const revenuePlays = useMemo(() => ["_all", ...new Set(campaigns.map(c => c.revenuePlay))].filter(Boolean), [campaigns]);
  const statuses = useMemo(() => ["_all", ...new Set(campaigns.map(c => c.status))].filter(Boolean), [campaigns]);

  // Filter campaigns based on selected filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      return (regionFilter === "_all" || campaign.region === regionFilter) &&
             (ownerFilter === "_all" || campaign.owner === ownerFilter) &&
             (typeFilter === "_all" || campaign.campaignType === typeFilter) &&
             (revenuePlayFilter === "_all" || campaign.revenuePlay === revenuePlayFilter) &&
             (statusFilter === "_all" || campaign.status === statusFilter);
    });
  }, [campaigns, regionFilter, ownerFilter, typeFilter, revenuePlayFilter, statusFilter]);

  // Group campaigns by month
  const campaignsByMonth = useMemo(() => {
    const monthMap: Record<number, Campaign[]> = {};
    
    // Initialize with empty arrays for all months
    MONTHS.forEach((_, index) => {
      monthMap[index] = [];
    });
    
    // Add campaigns to their respective months
    filteredCampaigns.forEach(campaign => {
      const quarterMonth = campaign.quarterMonth;
      if (quarterMonth && QUARTER_MONTH_MAP[quarterMonth] !== undefined) {
        const monthIndex = QUARTER_MONTH_MAP[quarterMonth];
        monthMap[monthIndex].push(campaign);
      }
    });
    
    return monthMap;
  }, [filteredCampaigns]);

  // Handle filter clearing
  const handleClearFilters = () => {
    setRegionFilter("_all");
    setOwnerFilter("_all");
    setTypeFilter("_all");
    setRevenuePlayFilter("_all");
    setStatusFilter("_all");
  };

  // Helper function to get region color
  const getRegionColor = (region: string) => {
    return REGION_COLORS[region] || { bg: "bg-gray-100", text: "text-gray-800" };
  };

  // Render month grid
  const renderMonthGrid = () => {
    // For desktop: 4x3 grid
    // For mobile: 12x1 vertical list
    return (
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-4 md:grid-cols-3 lg:grid-cols-4"
      )}>
        {MONTHS.map((month, index) => (
          <Card key={month} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {month}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {campaignsByMonth[index].length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">No campaigns</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {campaignsByMonth[index].map(campaign => {
                    const regionColor = getRegionColor(campaign.region);
                    return (
                      <div
                        key={campaign.id}
                        className={cn(
                          "rounded-md p-2 border text-sm",
                          regionColor.bg,
                          regionColor.text,
                          "hover:opacity-90 transition-opacity cursor-default"
                        )}
                        title={`${campaign.campaignName || campaign.description} (${campaign.owner})`}
                      >
                        <div className="font-medium truncate">
                          {campaign.campaignName || campaign.description.substring(0, 30)}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {campaign.region}
                          </Badge>
                          {campaign.status && (
                            <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[campaign.status] || "")}>
                              {campaign.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5" /> Campaign Calendar
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
              <div className="w-full md:w-auto">
                <Label htmlFor="region-filter">Region</Label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger id="region-filter" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Regions</SelectItem>
                    {regions.filter(r => r !== "_all").map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <Label htmlFor="owner-filter">Owner</Label>
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger id="owner-filter" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Owners</SelectItem>
                    {owners.filter(o => o !== "_all").map(owner => (
                      <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <Label htmlFor="type-filter">Campaign Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Types</SelectItem>
                    {types.filter(t => t !== "_all").map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <Label htmlFor="revenue-play-filter">Revenue Play</Label>
                <Select value={revenuePlayFilter} onValueChange={setRevenuePlayFilter}>
                  <SelectTrigger id="revenue-play-filter" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by revenue play" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Revenue Plays</SelectItem>
                    {revenuePlays.filter(r => r !== "_all").map(play => (
                      <SelectItem key={play} value={play}>{play}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Statuses</SelectItem>
                    {statuses.filter(s => s !== "_all" && s).map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-auto self-end">
                <ClearFiltersButton onClick={handleClearFilters} />
              </div>
            </div>
            
            {/* Color Legend */}
            <div className="border rounded-md p-3 bg-card/50">
              <h3 className="text-sm font-medium mb-2">Region Color Legend</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(REGION_COLORS).map(([region, colors]) => (
                  <Badge 
                    key={region} 
                    variant="outline" 
                    className={cn("text-xs", colors.bg, colors.text)}
                  >
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Calendar Grid */}
            {renderMonthGrid()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}