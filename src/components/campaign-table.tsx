import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, TrashSimple, Calculator } from "@phosphor-icons/react";
import { toast } from "sonner";

// Campaign type interface
export interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  strategicPillars: string[];
  revenuePlay: string;
  fiscalYear: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number | string;
  expectedLeads: number | string;
  
  // Calculated fields
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  
  // Execution tracking fields
  status: string;
  poRaised: boolean;
  campaignCode: string;
  issueLink: string;
  actualCost: number | string;
  actualLeads: number | string;
  actualMQLs: number | string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function CampaignTable({ campaigns, setCampaigns }: CampaignTableProps) {
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [quarterFilter, setQuarterFilter] = useState<string>("");

  // Campaign form state
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    campaignName: "",
    campaignType: "",
    strategicPillars: [],
    revenuePlay: "",
    fiscalYear: "FY26",
    quarterMonth: "",
    region: "",
    country: "",
    owner: "",
    description: "",
    forecastedCost: "",
    expectedLeads: "",
    status: "Planning",
    poRaised: false,
    campaignCode: "",
    issueLink: "",
    actualCost: "",
    actualLeads: "",
    actualMQLs: ""
  });

  // Options
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

  const strategicPillarOptions = [
    "Account Growth and Product Adoption",
    "Pipeline Acceleration & Executive Engagement", 
    "Brand Awareness & Top of Funnel Demand Generation",
    "New Logo Acquisition"
  ];

  const revenuePlayOptions = [
    "Accelerate developer productivity with Copilot in VS Code and GitHub",
    "Secure all developer workloads with the power of AI",
    "All"
  ];

  const fiscalYears = ["FY25", "FY26"];

  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];

  const countries = [
    "Afghanistan", "ASEAN", "Australia", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", 
    "GCR", "Hong Kong", "India", "Indonesia", "Japan", "Laos", "Malaysia", "Maldives", 
    "Myanmar", "Nepal", "New Zealand", "Pakistan", "Philippines", "Singapore", "South Korea", 
    "Sri Lanka", "Taiwan", "Thailand", "Vietnam", "X APAC English", "X APAC Non English", 
    "X South APAC", "X SAARC"
  ].sort();

  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];

  // Calculate derived metrics
  const calculateMetrics = (expectedLeads: number | string) => {
    const leads = typeof expectedLeads === 'number' ? expectedLeads : parseFloat(expectedLeads.toString()) || 0;
    const mql = Math.round(leads * 0.1);
    const sql = Math.round(leads * 0.06);
    const opportunities = Math.round(sql * 0.8);
    const pipelineForecast = opportunities * 50000;
    
    return { mql, sql, opportunities, pipelineForecast };
  };

  // Handle strategic pillar toggle
  const togglePillar = (pillar: string) => {
    const current = newCampaign.strategicPillars || [];
    const updated = current.includes(pillar) 
      ? current.filter(p => p !== pillar)
      : [...current, pillar];
    
    setNewCampaign(prev => ({ ...prev, strategicPillars: updated }));
  };

  // Add new campaign
  const addCampaign = () => {
    if (!newCampaign.campaignName || !newCampaign.campaignType || !newCampaign.owner) {
      toast.error("Please fill in required fields");
      return;
    }

    const metrics = calculateMetrics(newCampaign.expectedLeads || 0);
    
    const campaign: Campaign = {
      id: Date.now().toString(),
      campaignName: newCampaign.campaignName || "",
      campaignType: newCampaign.campaignType || "",
      strategicPillars: newCampaign.strategicPillars || [],
      revenuePlay: newCampaign.revenuePlay || "",
      fiscalYear: newCampaign.fiscalYear || "FY26",
      quarterMonth: newCampaign.quarterMonth || "",
      region: newCampaign.region || "",
      country: newCampaign.country || "",
      owner: newCampaign.owner || "",
      description: newCampaign.description || "",
      forecastedCost: parseFloat(newCampaign.forecastedCost?.toString() || "0") || 0,
      expectedLeads: parseFloat(newCampaign.expectedLeads?.toString() || "0") || 0,
      ...metrics,
      status: newCampaign.status || "Planning",
      poRaised: newCampaign.poRaised || false,
      campaignCode: newCampaign.campaignCode || "",
      issueLink: newCampaign.issueLink || "",
      actualCost: parseFloat(newCampaign.actualCost?.toString() || "0") || 0,
      actualLeads: parseFloat(newCampaign.actualLeads?.toString() || "0") || 0,
      actualMQLs: parseFloat(newCampaign.actualMQLs?.toString() || "0") || 0
    };

    setCampaigns([...campaigns, campaign]);
    
    // Reset form
    setNewCampaign({
      campaignName: "",
      campaignType: "",
      strategicPillars: [],
      revenuePlay: "",
      fiscalYear: "FY26",
      quarterMonth: "",
      region: "",
      country: "",
      owner: "",
      description: "",
      forecastedCost: "",
      expectedLeads: "",
      status: "Planning",
      poRaised: false,
      campaignCode: "",
      issueLink: "",
      actualCost: "",
      actualLeads: "",
      actualMQLs: ""
    });

    toast.success("Campaign added successfully");
  };

  // Remove campaign
  const removeCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast.success("Campaign removed");
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (regionFilter && campaign.region !== regionFilter) return false;
    if (quarterFilter && campaign.quarterMonth !== quarterFilter) return false;
    return true;
  });

  // Calculate totals
  const totalForecastedCost = filteredCampaigns.reduce((sum, campaign) => {
    return sum + (typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : parseFloat(campaign.forecastedCost.toString()) || 0);
  }, 0);

  const totalPipeline = filteredCampaigns.reduce((sum, campaign) => sum + campaign.pipelineForecast, 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Quarter/Month</Label>
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setRegionFilter("");
                  setQuarterFilter("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Campaign Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Campaign</CardTitle>
          <CardDescription>Create a new marketing campaign entry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                value={newCampaign.campaignName || ""}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, campaignName: e.target.value }))}
                placeholder="Enter campaign name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignType">Campaign Type *</Label>
              <Select 
                value={newCampaign.campaignType || ""} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, campaignType: value }))}
              >
                <SelectTrigger id="campaignType">
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Campaign Owner *</Label>
              <Select 
                value={newCampaign.owner || ""} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, owner: value }))}
              >
                <SelectTrigger id="owner">
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
                value={newCampaign.region || ""} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger id="region">
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
                value={newCampaign.country || ""} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger id="country">
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
                value={newCampaign.quarterMonth || ""} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, quarterMonth: value }))}
              >
                <SelectTrigger id="quarterMonth">
                  <SelectValue placeholder="Select quarter/month" />
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
                value={newCampaign.forecastedCost || ""}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, forecastedCost: e.target.value }))}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedLeads">Expected Leads</Label>
              <Input
                id="expectedLeads"
                type="number"
                value={newCampaign.expectedLeads || ""}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, expectedLeads: e.target.value }))}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Strategic Pillars */}
          <div className="space-y-2">
            <Label>Strategic Pillars</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {strategicPillarOptions.map(pillar => (
                <div key={pillar} className="flex items-center space-x-2">
                  <Checkbox 
                    id={pillar}
                    checked={(newCampaign.strategicPillars || []).includes(pillar)}
                    onCheckedChange={() => togglePillar(pillar)}
                  />
                  <Label htmlFor={pillar} className="text-sm">{pillar}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newCampaign.description || ""}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Campaign description..."
              rows={3}
            />
          </div>

          <Button onClick={addCampaign} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </CardContent>
      </Card>

      {/* Campaign Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
          <CardDescription>
            {filteredCampaigns.length} campaign(s) • Total Cost: ${totalForecastedCost.toLocaleString()} • Total Pipeline: ${totalPipeline.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No campaigns found. Add your first campaign above.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{campaign.campaignName}</div>
                          {campaign.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {campaign.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{campaign.campaignType}</TableCell>
                      <TableCell className="text-sm">{campaign.owner}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {campaign.region}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{campaign.quarterMonth}</TableCell>
                      <TableCell className="text-sm font-mono">
                        ${typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost.toLocaleString() : campaign.forecastedCost}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads.toLocaleString() : campaign.expectedLeads}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        ${campaign.pipelineForecast.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCampaign(campaign.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashSimple className="h-4 w-4" />
                        </Button>
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