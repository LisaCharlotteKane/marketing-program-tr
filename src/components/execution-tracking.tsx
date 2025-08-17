import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Target, X } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";
import { 
  MultiSelectFilters, 
  getStandardFilterConfigs, 
  applyFilters 
} from "@/components/multi-select-filters";

interface ExecutionTrackingProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function ExecutionTracking({ campaigns, setCampaigns }: ExecutionTrackingProps) {
  // Ensure campaigns is always an array
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  
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

  // Filter campaigns using multi-select filters
  const filteredCampaigns = applyFilters(safeCampaigns, filters);

  // Get filter configurations
  const filterConfigs = getStandardFilterConfigs(safeCampaigns);

  // Update campaign field
  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(safeCampaigns.map(campaign => 
      campaign.id === id ? { ...campaign, [field]: value } : campaign
    ));
  };

  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning": return "bg-blue-100 text-blue-800";
      case "On Track": return "bg-green-100 text-green-800";
      case "Shipped": return "bg-purple-100 text-purple-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Multi-Select Filters */}
      <MultiSelectFilters
        filters={filters}
        onFiltersChange={setFilters}
        filterConfigs={filterConfigs}
        title="Execution Tracking Filters"
        icon={<Target className="h-5 w-5" />}
      />

      {/* Execution Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Execution Status</CardTitle>
          <CardDescription>
            Track execution status and performance for {filteredCampaigns.length} campaign(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PO Raised</TableHead>
                  <TableHead>Issue Link</TableHead>
                  <TableHead>Actual Cost</TableHead>
                  <TableHead>Actual Leads</TableHead>
                  <TableHead>Actual MQLs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No campaigns found matching the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{campaign.campaignName || campaign.description}</div>
                          <div className="text-xs text-muted-foreground">{campaign.campaignType}</div>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.owner}</TableCell>
                      <TableCell>
                        <Select 
                          value={campaign.status || ""} 
                          onValueChange={(value) => updateCampaign(campaign.id, 'status', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={campaign.poRaised || false}
                          onCheckedChange={(checked) => updateCampaign(campaign.id, 'poRaised', checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={campaign.issueLink || ""}
                          onChange={(e) => updateCampaign(campaign.id, 'issueLink', e.target.value)}
                          placeholder="https://..."
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualCost || ""}
                          onChange={(e) => updateCampaign(campaign.id, 'actualCost', e.target.value)}
                          placeholder="0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualLeads || ""}
                          onChange={(e) => updateCampaign(campaign.id, 'actualLeads', e.target.value)}
                          placeholder="0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualMQLs || ""}
                          onChange={(e) => updateCampaign(campaign.id, 'actualMQLs', e.target.value)}
                          placeholder="0"
                          className="w-24"
                        />
                      </TableCell>
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