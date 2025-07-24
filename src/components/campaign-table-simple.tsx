import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Upload, Download } from "@phosphor-icons/react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  description: string;
  campaignType: string;
  strategicPillar: string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function CampaignTable({ campaigns, setCampaigns }: CampaignTableProps) {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');

  // Options for dropdowns
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

  const fiscalYears = ["FY25", "FY26"];
  
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December",
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];
  
  const countries = [
    "Afghanistan", "Australia", "Bangladesh", "Bhutan", "Brunei", "Cambodia",
    "China", "Hong Kong", "India", "Indonesia", "Japan", "Laos", "Malaysia",
    "Maldives", "Myanmar", "Nepal", "New Zealand", "Pakistan", "Philippines",
    "Singapore", "South Korea", "Sri Lanka", "Taiwan", "Thailand", "Vietnam",
    "X APAC English", "X APAC Non English", "X South APAC", "X SAARC", "ASEAN", "GCR"
  ];

  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];

  // Calculate metrics for a campaign
  const calculateMetrics = (expectedLeads: number, forecastedCost: number, campaignType: string) => {
    if (campaignType === "In-Account Events (1:1)" && (!expectedLeads || expectedLeads === 0)) {
      // Special ROI logic for 1:1 events
      const pipelineForecast = forecastedCost * 20;
      return {
        mql: 0,
        sql: 0,
        opportunities: 0,
        pipelineForecast
      };
    }

    const mql = Math.round(expectedLeads * 0.1);
    const sql = Math.round(expectedLeads * 0.06);
    const opportunities = Math.round(sql * 0.8);
    const pipelineForecast = opportunities * 50000;

    return { mql, sql, opportunities, pipelineForecast };
  };

  // Add new campaign
  const addCampaign = () => {
    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      description: "",
      campaignType: "",
      strategicPillar: [],
      revenuePlay: "",
      fy: "FY25",
      quarterMonth: "",
      region: "",
      country: "",
      owner: "",
      forecastedCost: 0,
      expectedLeads: 0,
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: 0
    };

    setCampaigns([...campaigns, newCampaign]);
  };

  // Update campaign
  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const updated = { ...campaign, [field]: value };
        
        // Recalculate metrics if relevant fields changed
        if (field === 'expectedLeads' || field === 'forecastedCost' || field === 'campaignType') {
          const metrics = calculateMetrics(
            field === 'expectedLeads' ? Number(value) : updated.expectedLeads,
            field === 'forecastedCost' ? Number(value) : updated.forecastedCost,
            field === 'campaignType' ? value : updated.campaignType
          );
          Object.assign(updated, metrics);
        }
        
        return updated;
      }
      return campaign;
    }));
  };

  // Delete campaigns
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  
  const toggleCampaignSelection = (id: string) => {
    const newSelection = new Set(selectedCampaigns);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCampaigns(newSelection);
  };

  const deleteSelectedCampaigns = () => {
    setCampaigns(campaigns.filter(campaign => !selectedCampaigns.has(campaign.id)));
    setSelectedCampaigns(new Set());
    toast.success(`Deleted ${selectedCampaigns.size} campaign(s)`);
  };

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      if (regionFilter !== 'all' && campaign.region !== regionFilter) return false;
      if (quarterFilter !== 'all' && campaign.quarterMonth !== quarterFilter) return false;
      return true;
    });
  }, [campaigns, regionFilter, quarterFilter]);

  // Clear filters
  const clearFilters = () => {
    setRegionFilter('all');
    setQuarterFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
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
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Quarter/Month</label>
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

            <div className="flex items-end gap-2">
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
              <Button onClick={addCampaign} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete selected button */}
      {selectedCampaigns.size > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedCampaigns.size} campaign(s) selected
          </div>
          <Button 
            onClick={deleteSelectedCampaigns} 
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.size === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns(new Set(filteredCampaigns.map(c => c.id)));
                        } else {
                          setSelectedCampaigns(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Campaign Type</TableHead>
                  <TableHead>Strategic Pillar</TableHead>
                  <TableHead>Revenue Play</TableHead>
                  <TableHead>FY</TableHead>
                  <TableHead>Quarter/Month</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Forecasted Cost</TableHead>
                  <TableHead>Expected Leads</TableHead>
                  <TableHead>MQL</TableHead>
                  <TableHead>SQL</TableHead>
                  <TableHead>Opportunities</TableHead>
                  <TableHead>Pipeline Forecast</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.has(campaign.id)}
                        onChange={() => toggleCampaignSelection(campaign.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={campaign.description}
                        onChange={(e) => updateCampaign(campaign.id, 'description', e.target.value)}
                        placeholder="Campaign description"
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.campaignType}
                        onValueChange={(value) => updateCampaign(campaign.id, 'campaignType', value)}
                      >
                        <SelectTrigger className="min-w-[150px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaignTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[150px]">
                        {strategicPillars.map(pillar => (
                          <label key={pillar} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={campaign.strategicPillar.includes(pillar)}
                              onChange={(e) => {
                                const newPillars = e.target.checked
                                  ? [...campaign.strategicPillar, pillar]
                                  : campaign.strategicPillar.filter(p => p !== pillar);
                                updateCampaign(campaign.id, 'strategicPillar', newPillars);
                              }}
                            />
                            <span>{pillar}</span>
                          </label>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.revenuePlay}
                        onValueChange={(value) => updateCampaign(campaign.id, 'revenuePlay', value)}
                      >
                        <SelectTrigger className="min-w-[150px]">
                          <SelectValue placeholder="Select revenue play" />
                        </SelectTrigger>
                        <SelectContent>
                          {revenuePlays.map(play => (
                            <SelectItem key={play} value={play}>{play}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.fy}
                        onValueChange={(value) => updateCampaign(campaign.id, 'fy', value)}
                      >
                        <SelectTrigger className="min-w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fiscalYears.map(fy => (
                            <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.quarterMonth}
                        onValueChange={(value) => updateCampaign(campaign.id, 'quarterMonth', value)}
                      >
                        <SelectTrigger className="min-w-[120px]">
                          <SelectValue placeholder="Select quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          {quarters.map(quarter => (
                            <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.region}
                        onValueChange={(value) => updateCampaign(campaign.id, 'region', value)}
                      >
                        <SelectTrigger className="min-w-[120px]">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.country}
                        onValueChange={(value) => updateCampaign(campaign.id, 'country', value)}
                      >
                        <SelectTrigger className="min-w-[120px]">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={campaign.owner}
                        onValueChange={(value) => updateCampaign(campaign.id, 'owner', value)}
                      >
                        <SelectTrigger className="min-w-[120px]">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map(owner => (
                            <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={campaign.forecastedCost}
                        onChange={(e) => updateCampaign(campaign.id, 'forecastedCost', Number(e.target.value))}
                        placeholder="0"
                        className="min-w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={campaign.expectedLeads}
                        onChange={(e) => updateCampaign(campaign.id, 'expectedLeads', Number(e.target.value))}
                        placeholder="0"
                        className="min-w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{campaign.mql}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{campaign.sql}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{campaign.opportunities}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        ${campaign.pipelineForecast.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}