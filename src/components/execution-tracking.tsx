import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Target, FilterX } from "@phosphor-icons/react";
import { Campaign } from "@/components/campaign-table";

interface ExecutionTrackingProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function ExecutionTracking({ campaigns, setCampaigns }: ExecutionTrackingProps) {
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [ownerFilter, setOwnerFilter] = useState<string>("");
  const [quarterFilter, setQuarterFilter] = useState<string>("");

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];
  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (regionFilter && campaign.region !== regionFilter) return false;
    if (ownerFilter && campaign.owner !== ownerFilter) return false;
    if (quarterFilter && campaign.quarterMonth !== quarterFilter) return false;
    return true;
  });

  // Update campaign field
  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id ? { ...campaign, [field]: value } : campaign
    ));
  };

  const clearFilters = () => {
    setRegionFilter("");
    setOwnerFilter("");
    setQuarterFilter("");
  };

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
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Execution Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label>Quarter</Label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
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

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <FilterX className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                          <div>{campaign.campaignName}</div>
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