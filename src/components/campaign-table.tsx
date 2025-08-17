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
import { Plus, Trash, Calculator, FunnelX } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Campaign, CampaignTableProps } from "@/types/campaign";
import { CSVUploader } from "@/components/csv-uploader";

export function CampaignTable({ campaigns, setCampaigns }: CampaignTableProps) {
  // Ensure campaigns is always an array
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [quarterFilter, setQuarterFilter] = useState<string>("all");

  // Campaign form state
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    description: "",
    campaignType: "",
    strategicPillar: [],
    revenuePlay: "",
    fy: "FY26",
    quarterMonth: "Q1 - July",
    region: "JP & Korea",
    country: "",
    owner: "",
    forecastedCost: 0,
    expectedLeads: 0,
    status: "Planning",
    poRaised: false,
    campaignCode: "",
    issueLink: "",
    actualCost: 0,
    actualLeads: 0,
    actualMQLs: 0
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
    "Sri Lanka", "Taiwan", "Thailand", "Vietnam", "X South APAC", "X SAARC"
  ].sort();

  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];

  // Calculate derived metrics
  const calculateMetrics = (expectedLeads: number | string, forecastedCost?: number | string, campaignType?: string) => {
    const leads = typeof expectedLeads === 'number' ? expectedLeads : parseFloat(expectedLeads.toString()) || 0;
    const cost = typeof forecastedCost === 'number' ? forecastedCost : parseFloat(forecastedCost?.toString() || "0") || 0;
    
    // Check for In-Account programs (various naming variations)
    const isInAccountEvent = campaignType?.includes("In-Account") || 
                           campaignType?.includes("In Account") ||
                           campaignType === "In-Account Events (1:1)";
    
    if (isInAccountEvent && leads === 0) {
      // Special 20:1 ROI calculation for In-Account Events without leads
      return { mql: 0, sql: 0, opportunities: 0, pipelineForecast: cost * 20 };
    }
    
    const mql = Math.round(leads * 0.1);
    const sql = Math.round(expectedLeads * 0.06); // 6% of Expected Leads
    const opportunities = Math.round(sql * 0.8);
    const pipelineForecast = opportunities * 50000;
    
    return { mql, sql, opportunities, pipelineForecast };
  };

  // Handle strategic pillar toggle
  const togglePillar = (pillar: string) => {
    const current = newCampaign.strategicPillar || [];
    const updated = current.includes(pillar) 
      ? current.filter(p => p !== pillar)
      : [...current, pillar];
    
    setNewCampaign(prev => ({ ...prev, strategicPillar: updated }));
  };

  // Add new campaign
  const addCampaign = () => {
    if (!newCampaign.campaignType || !newCampaign.owner) {
      toast.error("Please fill in required fields: Campaign Type and Owner");
      return;
    }

    const metrics = calculateMetrics(
      newCampaign.expectedLeads || 0,
      newCampaign.forecastedCost || 0,
      newCampaign.campaignType
    );
    
    const campaign: Campaign = {
      id: Date.now().toString(),
      description: newCampaign.description || `${newCampaign.campaignType} Campaign`,
      campaignType: newCampaign.campaignType || "",
      strategicPillar: newCampaign.strategicPillar || [],
      revenuePlay: newCampaign.revenuePlay || "",
      fy: newCampaign.fy || "FY26",
      quarterMonth: newCampaign.quarterMonth || "Q1 - July",
      region: newCampaign.region || "JP & Korea",
      country: newCampaign.country || "",
      owner: newCampaign.owner || "",
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

    setCampaigns([...safeCampaigns, campaign]);
    
    // Reset form
    setNewCampaign({
      description: "",
      campaignType: "",
      strategicPillar: [],
      revenuePlay: "",
      fy: "FY26",
      quarterMonth: "Q1 - July",
      region: "JP & Korea",
      country: "",
      owner: "",
      forecastedCost: 0,
      expectedLeads: 0,
      status: "Planning",
      poRaised: false,
      campaignCode: "",
      issueLink: "",
      actualCost: 0,
      actualLeads: 0,
      actualMQLs: 0
    });

    toast.success("Campaign added successfully");
  };

  // Remove campaign
  const removeCampaign = (id: string) => {
    setCampaigns(safeCampaigns.filter(c => c.id !== id));
    toast.success("Campaign removed");
  };

  // Filter campaigns
  const filteredCampaigns = safeCampaigns.filter(campaign => {
    if (regionFilter !== "all" && campaign.region !== regionFilter) return false;
    if (quarterFilter !== "all" && campaign.quarterMonth !== quarterFilter) return false;
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
                  <SelectItem value="all">All Regions</SelectItem>
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
                  <SelectItem value="all">All Quarters</SelectItem>
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
                  setRegionFilter("all");
                  setQuarterFilter("all");
                }}
                className="w-full"
              >
                <FunnelX className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import</CardTitle>
          <CardDescription>
            Upload a CSV file to import multiple campaigns at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CSVUploader 
            onCampaignsImported={(newCampaigns) => {
              setCampaigns([...safeCampaigns, ...newCampaigns]);
              toast.success(`Imported ${newCampaigns.length} campaigns successfully`);
            }}
          />
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
              <Label htmlFor="description">Campaign Description</Label>
              <Input
                id="description"
                value={newCampaign.description || ""}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter campaign description (optional)"
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
              <Label htmlFor="fy">Fiscal Year</Label>
              <Select 
                value={newCampaign.fy || ""} 
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, fy: value }))}
              >
                <SelectTrigger id="fy">
                  <SelectValue placeholder="Select fiscal year" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map(fy => (
                    <SelectItem key={fy} value={fy}>{fy}</SelectItem>
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
              <Label htmlFor="expectedLeads" className="flex items-center gap-2">
                Expected Leads
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </Label>
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

          {/* Live Metrics Calculation */}
          {newCampaign.expectedLeads && Number(newCampaign.expectedLeads) > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Calculated Metrics Preview</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg border">
                {(() => {
                  const metrics = calculateMetrics(
                    newCampaign.expectedLeads || 0,
                    newCampaign.forecastedCost || 0,
                    newCampaign.campaignType
                  );
                  return (
                    <>
                      <div className="text-center space-y-1">
                        <div className="text-lg font-bold text-blue-600">{metrics.mql}</div>
                        <div className="text-xs text-muted-foreground">MQL Forecast</div>
                        <div className="text-xs text-muted-foreground">(10%)</div>
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-lg font-bold text-green-600">{metrics.sql}</div>
                        <div className="text-xs text-muted-foreground">SQL Forecast</div>
                        <div className="text-xs text-muted-foreground">(6%)</div>
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-lg font-bold text-purple-600">{metrics.opportunities}</div>
                        <div className="text-xs text-muted-foreground">Opportunities</div>
                        <div className="text-xs text-muted-foreground">(80% of SQL)</div>
                      </div>
                      <div className="text-center space-y-1">
                        <div className="text-lg font-bold text-orange-600">${metrics.pipelineForecast.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Pipeline Forecast</div>
                        <div className="text-xs text-muted-foreground">(Opps × $50K)</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Strategic Pillars */}
          <div className="space-y-2">
            <Label>Strategic Pillars</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {strategicPillarOptions.map(pillar => (
                <div key={pillar} className="flex items-center space-x-2">
                  <Checkbox 
                    id={pillar}
                    checked={(newCampaign.strategicPillar || []).includes(pillar)}
                    onCheckedChange={() => togglePillar(pillar)}
                  />
                  <Label htmlFor={pillar} className="text-sm">{pillar}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Play */}
          <div className="space-y-2">
            <Label htmlFor="revenuePlay">Revenue Play</Label>
            <Select 
              value={newCampaign.revenuePlay || ""} 
              onValueChange={(value) => setNewCampaign(prev => ({ ...prev, revenuePlay: value }))}
            >
              <SelectTrigger id="revenuePlay">
                <SelectValue placeholder="Select revenue play" />
              </SelectTrigger>
              <SelectContent>
                {revenuePlayOptions.map(play => (
                  <SelectItem key={play} value={play}>{play}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <TableHead>MQL</TableHead>
                  <TableHead>SQL</TableHead>
                  <TableHead>Opps</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                      No campaigns found. Add your first campaign above.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{campaign.description}</div>
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
                      <TableCell className="text-sm font-mono text-blue-600">
                        {campaign.mql}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-green-600">
                        {campaign.sql}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-purple-600">
                        {campaign.opportunities}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-orange-600">
                        ${campaign.pipelineForecast.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCampaign(campaign.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
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