import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrashSimple } from "@phosphor-icons/react";
import { toast } from "sonner";

export interface SimpleCampaign {
  id: string;
  campaignName: string;
  region: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
}

interface SimpleCampaignTableProps {
  campaigns: SimpleCampaign[];
  setCampaigns: (campaigns: SimpleCampaign[]) => void;
}

export function SimpleCampaignTable({ campaigns, setCampaigns }: SimpleCampaignTableProps) {
  const [formData, setFormData] = useState({
    campaignName: '',
    region: '',
    owner: '',
    forecastedCost: '',
    expectedLeads: '',
  });

  const regionOptions = ["JP & Korea", "South APAC", "SAARC", "Digital"];
  const ownerOptions = ["Tomoko Tanaka", "Beverly Leung", "Shruti Narang", "Giorgia Parham"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.campaignName || !formData.region || !formData.owner) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newCampaign: SimpleCampaign = {
      id: Date.now().toString(),
      campaignName: formData.campaignName,
      region: formData.region,
      owner: formData.owner,
      forecastedCost: parseFloat(formData.forecastedCost) || 0,
      expectedLeads: parseInt(formData.expectedLeads) || 0,
    };

    setCampaigns([...campaigns, newCampaign]);
    setFormData({
      campaignName: '',
      region: '',
      owner: '',
      forecastedCost: '',
      expectedLeads: '',
    });
    toast.success("Campaign added successfully");
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast.success("Campaign deleted");
  };

  const calculateMetrics = (expectedLeads: number, forecastedCost: number, campaignType?: string) => {
    // Check for In-Account programs (various naming variations)
    const isInAccountEvent = campaignType?.includes("In-Account") || 
                           campaignType?.includes("In Account") ||
                           campaignType === "In-Account Events (1:1)";
    
    if (isInAccountEvent && expectedLeads === 0) {
      // Special 20:1 ROI calculation for In-Account Events without leads
      return { mql: 0, sql: 0, opportunities: 0, pipeline: forecastedCost * 20 };
    }
    
    const mql = Math.round(expectedLeads * 0.1);
    const sql = Math.round(mql * 0.06); // 6% of MQLs, not leads
    const opportunities = Math.round(sql * 0.8);
    const pipeline = opportunities * 50000;
    return { mql, sql, opportunities, pipeline };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input
                  id="campaignName"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
                  placeholder="Enter campaign name"
                />
              </div>
              
              <div>
                <Label>Region *</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => setFormData({...formData, region: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Owner *</Label>
                <Select 
                  value={formData.owner} 
                  onValueChange={(value) => setFormData({...formData, owner: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerOptions.map(owner => (
                      <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="forecastedCost">Forecasted Cost ($)</Label>
                <Input
                  id="forecastedCost"
                  type="number"
                  value={formData.forecastedCost}
                  onChange={(e) => setFormData({...formData, forecastedCost: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="expectedLeads">Expected Leads</Label>
                <Input
                  id="expectedLeads"
                  type="number"
                  value={formData.expectedLeads}
                  onChange={(e) => setFormData({...formData, expectedLeads: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>MQLs</TableHead>
                <TableHead>SQLs</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const metrics = calculateMetrics(campaign.expectedLeads, campaign.forecastedCost, campaign.campaignType);
                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                    <TableCell>{campaign.region}</TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell>${campaign.forecastedCost.toLocaleString()}</TableCell>
                    <TableCell>{campaign.expectedLeads}</TableCell>
                    <TableCell>{metrics.mql}</TableCell>
                    <TableCell>{metrics.sql}</TableCell>
                    <TableCell>${metrics.pipeline.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCampaign(campaign.id)}
                      >
                        <TrashSimple className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    No campaigns yet. Add your first campaign above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  ${campaigns.reduce((sum, c) => sum + c.forecastedCost, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {campaigns.reduce((sum, c) => sum + c.expectedLeads, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {campaigns.reduce((sum, c) => sum + calculateMetrics(c.expectedLeads, c.forecastedCost, c.campaignType).mql, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total MQLs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  ${campaigns.reduce((sum, c) => sum + calculateMetrics(c.expectedLeads, c.forecastedCost, c.campaignType).pipeline, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Pipeline</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}