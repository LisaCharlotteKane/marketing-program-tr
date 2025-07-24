import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "@phosphor-icons/react";
import { toast } from "sonner";

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
  poRaised?: boolean;
  salesforceCampaignCode?: string;
  issueLink?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;
}

interface ExecutionTrackingProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export function ExecutionTracking({ campaigns, setCampaigns }: ExecutionTrackingProps) {
  const [filters, setFilters] = useState({
    region: '',
    owner: '',
    quarter: '',
    status: ''
  });

  const statuses = ["Planning", "On Track", "Shipped", "Cancelled"];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  // Filter campaigns based on selected filters
  const filteredCampaigns = campaigns.filter(campaign => {
    return (
      (!filters.region || campaign.region === filters.region) &&
      (!filters.owner || campaign.owner === filters.owner) &&
      (!filters.quarter || campaign.quarterMonth === filters.quarter) &&
      (!filters.status || campaign.status === filters.status)
    );
  });

  const updateCampaign = (campaignId: string, field: string, value: any) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, [field]: value }
        : campaign
    ));
    toast.success("Campaign updated");
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      owner: '',
      quarter: '',
      status: ''
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Planning":
        return <Badge variant="secondary">Planning</Badge>;
      case "On Track":
        return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
      case "Shipped":
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Not Set</Badge>;
    }
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
              <Label>Region</Label>
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
              <Label>Owner</Label>
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
              <Label>Quarter</Label>
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

            <div className="space-y-2 flex items-end">
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

      {/* Execution Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Tracking ({filteredCampaigns.length} campaigns)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns match the selected filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.campaignName}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{campaign.owner}</Badge>
                        <Badge variant="outline">{campaign.region}</Badge>
                        <Badge variant="outline">{campaign.quarterMonth}</Badge>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  {/* Execution Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={campaign.status || ''} 
                        onValueChange={(value) => updateCampaign(campaign.id, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>PO Raised?</Label>
                      <Select 
                        value={campaign.poRaised ? 'yes' : 'no'} 
                        onValueChange={(value) => updateCampaign(campaign.id, 'poRaised', value === 'yes')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Issue Link</Label>
                      <Input
                        value={campaign.issueLink || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'issueLink', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Actual Cost ($)</Label>
                      <Input
                        type="number"
                        value={campaign.actualCost || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'actualCost', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Actual Leads</Label>
                      <Input
                        type="number"
                        value={campaign.actualLeads || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'actualLeads', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Actual MQLs</Label>
                      <Input
                        type="number"
                        value={campaign.actualMqls || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'actualMqls', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm font-medium">Forecasted Cost</div>
                      <div className="text-sm text-muted-foreground">${campaign.forecastedCost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Actual Cost</div>
                      <div className="text-sm text-muted-foreground">${(campaign.actualCost || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Expected Leads</div>
                      <div className="text-sm text-muted-foreground">{campaign.expectedLeads}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Actual Leads</div>
                      <div className="text-sm text-muted-foreground">{campaign.actualLeads || 0}</div>
                    </div>
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