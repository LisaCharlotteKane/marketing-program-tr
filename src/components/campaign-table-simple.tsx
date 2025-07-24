import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "@phosphor-icons/react";
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
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export function CampaignTable({ campaigns, setCampaigns }: CampaignTableProps) {
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    campaignName: '',
    campaignType: '',
    strategicPillar: [],
    revenuePlay: '',
    fy: '',
    quarterMonth: '',
    region: '',
    country: '',
    owner: '',
    description: '',
    forecastedCost: 0,
    expectedLeads: 0,
  });

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

  const strategicPillars = [
    "Account Growth and Product Adoption",
    "Pipeline Acceleration & Executive Engagement", 
    "Brand Awareness & Top of Funnel Demand Generation",
    "New Logo Acquisition"
  ];

  const revenuePlays = [
    "Accelerate developer productivity with Copilot in VS Code and GitHub",
    "Secure all developer workloads with the power of AI",
    "All"
  ];

  const owners = [
    "Giorgia Parham",
    "Tomoko Tanaka", 
    "Beverly Leung",
    "Shruti Narang"
  ];

  const regions = [
    "JP & Korea",
    "South APAC",
    "SAARC", 
    "Digital",
    "X APAC English",
    "X APAC Non English"
  ];

  const countries = [
    "Afghanistan", "Australia", "Bangladesh", "Bhutan", "Brunei", "Cambodia",
    "China", "Hong Kong", "India", "Indonesia", "Japan", "Laos", "Malaysia",
    "Maldives", "Myanmar", "Nepal", "New Zealand", "Pakistan", "Philippines",
    "Singapore", "South Korea", "Sri Lanka", "Taiwan", "Thailand", "Vietnam",
    "X Apac", "ASEAN", "GCR"
  ];

  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const calculateMetrics = (expectedLeads: number, campaignType: string, forecastedCost: number) => {
    if (campaignType === "In-Account Events (1:1)" && (!expectedLeads || expectedLeads === 0)) {
      // Special ROI logic for in-account events with no leads
      const pipeline = forecastedCost * 20;
      return {
        mql: 0,
        sql: 0,
        opportunities: 0,
        pipelineForecast: pipeline
      };
    }

    const mql = Math.round(expectedLeads * 0.1);
    const sql = Math.round(expectedLeads * 0.06);
    const opportunities = Math.round(sql * 0.8);
    const pipelineForecast = opportunities * 50000;

    return { mql, sql, opportunities, pipelineForecast };
  };

  const addCampaign = () => {
    if (!newCampaign.campaignName || !newCampaign.campaignType || !newCampaign.owner) {
      toast.error("Please fill in required fields");
      return;
    }

    const metrics = calculateMetrics(
      newCampaign.expectedLeads || 0,
      newCampaign.campaignType || '',
      newCampaign.forecastedCost || 0
    );

    const campaign: Campaign = {
      id: crypto.randomUUID(),
      campaignName: newCampaign.campaignName || '',
      campaignType: newCampaign.campaignType || '',
      strategicPillar: newCampaign.strategicPillar || [],
      revenuePlay: newCampaign.revenuePlay || '',
      fy: newCampaign.fy || 'FY25',
      quarterMonth: newCampaign.quarterMonth || '',
      region: newCampaign.region || '',
      country: newCampaign.country || '',
      owner: newCampaign.owner || '',
      description: newCampaign.description || '',
      forecastedCost: newCampaign.forecastedCost || 0,
      expectedLeads: newCampaign.expectedLeads || 0,
      ...metrics
    };

    setCampaigns(prev => [...prev, campaign]);
    setNewCampaign({
      campaignName: '',
      campaignType: '',
      strategicPillar: [],
      revenuePlay: '',
      fy: '',
      quarterMonth: '',
      region: '',
      country: '',
      owner: '',
      description: '',
      forecastedCost: 0,
      expectedLeads: 0,
    });

    toast.success("Campaign added successfully");
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success("Campaign deleted");
  };

  return (
    <div className="space-y-6">
      {/* Add Campaign Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                value={newCampaign.campaignName || ''}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, campaignName: e.target.value }))}
                placeholder="Enter campaign name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignType">Campaign Type *</Label>
              <Select 
                value={newCampaign.campaignType || ''} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, campaignType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner *</Label>
              <Select 
                value={newCampaign.owner || ''} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, owner: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select 
                value={newCampaign.region || ''} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={newCampaign.country || ''} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quarterMonth">Quarter/Month</Label>
              <Select 
                value={newCampaign.quarterMonth || ''} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, quarterMonth: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecastedCost">Forecasted Cost ($)</Label>
              <Input
                id="forecastedCost"
                type="number"
                value={newCampaign.forecastedCost || ''}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, forecastedCost: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedLeads">Expected Leads</Label>
              <Input
                id="expectedLeads"
                type="number"
                value={newCampaign.expectedLeads || ''}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, expectedLeads: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newCampaign.description || ''}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Campaign description"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={addCampaign} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns added yet. Add your first campaign above.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.campaignName}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCampaign(campaign.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{campaign.campaignType}</Badge>
                    <Badge variant="outline">{campaign.owner}</Badge>
                    <Badge variant="outline">{campaign.region}</Badge>
                    <Badge variant="outline">{campaign.quarterMonth}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Forecasted Cost</div>
                      <div className="text-muted-foreground">${campaign.forecastedCost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Expected Leads</div>
                      <div className="text-muted-foreground">{campaign.expectedLeads}</div>
                    </div>
                    <div>
                      <div className="font-medium">MQLs</div>
                      <div className="text-muted-foreground">{campaign.mql}</div>
                    </div>
                    <div>
                      <div className="font-medium">Pipeline Forecast</div>
                      <div className="text-muted-foreground">${campaign.pipelineForecast.toLocaleString()}</div>
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