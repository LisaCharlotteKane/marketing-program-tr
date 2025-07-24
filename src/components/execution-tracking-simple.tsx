import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilterX } from "@phosphor-icons/react";
import { Campaign, CampaignTableProps } from "@/types/campaign";

interface ExecutionTrackingProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function ExecutionTracking({ campaigns = [], setCampaigns }: ExecutionTrackingProps) {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December",
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];
  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"];

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) {
      return [];
    }
    return campaigns.filter(c => {
      if (regionFilter !== 'all' && c.region !== regionFilter) return false;
      if (ownerFilter !== 'all' && c.owner !== ownerFilter) return false;
      if (quarterFilter !== 'all' && c.quarterMonth !== quarterFilter) return false;
      return true;
    });
  }, [campaigns, regionFilter, ownerFilter, quarterFilter]);

  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    if (!Array.isArray(campaigns)) {
      return;
    }
    setCampaigns(campaigns.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const clearFilters = () => {
    setRegionFilter('all');
    setOwnerFilter('all');
    setQuarterFilter('all');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium">Quarter</label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2 w-full">
                <FilterX className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Execution Tracking ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PO Raised?</TableHead>
                  <TableHead>Issue Link</TableHead>
                  <TableHead>Actual Cost</TableHead>
                  <TableHead>Actual Leads</TableHead>
                  <TableHead>Actual MQLs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map(campaign => (
                  <TableRow key={campaign.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate" title={campaign.description}>
                        {campaign.description || "Untitled Campaign"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.campaignType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.region}</Badge>
                    </TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell>
                      <Select
                        value={campaign.status || 'Planning'}
                        onValueChange={(value) => updateCampaign(campaign.id, 'status', value)}
                      >
                        <SelectTrigger className="w-[120px]">
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
                      <Select
                        value={campaign.poRaised ? 'Yes' : 'No'}
                        onValueChange={(value) => updateCampaign(campaign.id, 'poRaised', value === 'Yes')}
                      >
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="url"
                        value={campaign.issueLink || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'issueLink', e.target.value)}
                        placeholder="https://..."
                        className="min-w-[150px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={campaign.actualCost || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'actualCost', Number(e.target.value))}
                        placeholder="0"
                        className="min-w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={campaign.actualLeads || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'actualLeads', Number(e.target.value))}
                        placeholder="0"
                        className="min-w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={campaign.actualMQLs || ''}
                        onChange={(e) => updateCampaign(campaign.id, 'actualMQLs', Number(e.target.value))}
                        placeholder="0"
                        className="min-w-[100px]"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
