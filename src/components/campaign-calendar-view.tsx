import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";
import { 
  MultiSelectFilters, 
  getStandardFilterConfigs, 
  applyFilters 
} from "@/components/multi-select-filters";

interface CampaignCalendarViewProps {
  campaigns: Campaign[];
}

export function CampaignCalendarView({ campaigns }: CampaignCalendarViewProps) {
  const [filters, setFilters] = useState<Record<string, string[]>>({
    owner: [],
    campaignType: [],
    strategicPillar: [],
    revenuePlay: [],
    quarterMonth: [],
    region: [],
    country: [],
    status: []
  });

  // Filter campaigns (exclude Contractor/Infrastructure from calendar) and apply multi-select filters
  const filteredCampaigns = applyFilters(campaigns, filters).filter(campaign => {
    if (campaign.campaignType?.includes("Contractor") || campaign.campaignType?.includes("Infrastructure")) {
      return false;
    }
    return true;
  });

  // Get filter configurations
  const filterConfigs = getStandardFilterConfigs(campaigns);

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

  return (
    <div className="space-y-6">
      {/* Multi-Select Filters */}
      <MultiSelectFilters
        filters={filters}
        onFiltersChange={setFilters}
        filterConfigs={filterConfigs}
        title="Calendar Filters"
        icon={<Calendar className="h-5 w-5" />}
      />

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Region Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"].map(region => (
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