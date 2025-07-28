import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Upload, Download, Calculator, BarChart3, Calendar, Target } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Campaign } from "@/types/campaign";

// Constants for dropdowns
const CAMPAIGN_TYPES = [
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

const STRATEGIC_PILLARS = [
  "Account Growth and Product Adoption",
  "Pipeline Acceleration & Executive Engagement", 
  "Brand Awareness & Top of Funnel Demand Generation",
  "New Logo Acquisition"
];

const REVENUE_PLAYS = [
  "Accelerate developer productivity with Copilot in VS Code and GitHub",
  "Secure all developer workloads with the power of AI",
  "All"
];

const FISCAL_YEARS = ["FY25", "FY26"];

const QUARTERS = [
  "Q1 - July", "Q1 - August", "Q1 - September",
  "Q2 - October", "Q2 - November", "Q2 - December", 
  "Q3 - January", "Q3 - February", "Q3 - March",
  "Q4 - April", "Q4 - May", "Q4 - June"
];

const REGIONS = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];

const COUNTRIES = [
  "Afghanistan", "ASEAN", "Australia", "Bangladesh", "Bhutan", "Brunei", "Cambodia", 
  "China", "GCR", "Hong Kong", "India", "Indonesia", "Japan", "Laos", "Malaysia", 
  "Maldives", "Myanmar", "Nepal", "New Zealand", "Pakistan", "Philippines", 
  "Singapore", "South Korea", "Sri Lanka", "Taiwan", "Thailand", "Vietnam", 
  "X APAC English", "X APAC Non English", "X South APAC", "X SAARC"
];

const OWNERS = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];

const STATUS_OPTIONS = ["Planning", "On Track", "Shipped", "Cancelled"];

interface CampaignManagerProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function CampaignManager({ campaigns, setCampaigns }: CampaignManagerProps) {
  // Form state for new campaign
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    campaignType: '',
    strategicPillar: [],
    revenuePlay: '',
    fy: 'FY26',
    quarterMonth: '',
    region: '',
    country: '',
    owner: '',
    description: '',
    forecastedCost: 0,
    expectedLeads: 0,
    status: 'Planning'
  });

  // Filters
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  // Calculate metrics for a campaign
  const calculateMetrics = (expectedLeads: number | string, forecastedCost: number | string) => {
    const leads = Number(expectedLeads) || 0;
    const cost = Number(forecastedCost) || 0;
    
    // Special logic for In-Account Events (1:1)
    if (newCampaign.campaignType === "In-Account Events (1:1)" && leads === 0) {
      const pipeline = cost * 20; // 20:1 ROI
      return {
        mql: 0,
        sql: 0, 
        opportunities: 0,
        pipelineForecast: pipeline
      };
    }
    
    const mql = Math.round(leads * 0.10); // 10%
    const sql = Math.round(leads * 0.06); // 6%
    const opportunities = Math.round(sql * 0.80); // 80% of SQL
    const pipelineForecast = opportunities * 50000; // $50K per opp
    
    return { mql, sql, opportunities, pipelineForecast };
  };

  const addCampaign = () => {
    if (!newCampaign.description?.trim()) {
      toast.error("Campaign description is required");
      return;
    }

    const metrics = calculateMetrics(newCampaign.expectedLeads || 0, newCampaign.forecastedCost || 0);
    
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      description: newCampaign.description,
      campaignType: newCampaign.campaignType || '',
      strategicPillar: newCampaign.strategicPillar || [],
      revenuePlay: newCampaign.revenuePlay || '',
      fy: newCampaign.fy || 'FY26',
      quarterMonth: newCampaign.quarterMonth || '',
      region: newCampaign.region || '',
      country: newCampaign.country || '',
      owner: newCampaign.owner || '',
      forecastedCost: Number(newCampaign.forecastedCost) || 0,
      expectedLeads: Number(newCampaign.expectedLeads) || 0,
      ...metrics,
      status: newCampaign.status || 'Planning'
    };

    setCampaigns([...campaigns, campaign]);
    
    // Reset form
    setNewCampaign({
      campaignType: '',
      strategicPillar: [],
      revenuePlay: '',
      fy: 'FY26',
      quarterMonth: '',
      region: '',
      country: '',
      owner: '',
      description: '',
      forecastedCost: 0,
      expectedLeads: 0,
      status: 'Planning'
    });
    
    toast.success("Campaign added successfully");
  };

  const deleteCampaigns = () => {
    if (selectedCampaigns.length === 0) {
      toast.error("No campaigns selected");
      return;
    }
    
    setCampaigns(campaigns.filter(c => !selectedCampaigns.includes(c.id)));
    setSelectedCampaigns([]);
    toast.success(`Deleted ${selectedCampaigns.length} campaign(s)`);
  };

  const updateCampaign = (id: string, field: string, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const updated = { ...campaign, [field]: value };
        
        // Recalculate metrics if cost or leads changed
        if (field === 'expectedLeads' || field === 'forecastedCost') {
          const metrics = calculateMetrics(
            field === 'expectedLeads' ? value : updated.expectedLeads,
            field === 'forecastedCost' ? value : updated.forecastedCost
          );
          return { ...updated, ...metrics };
        }
        
        return updated;
      }
      return campaign;
    }));
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (regionFilter !== 'all' && campaign.region !== regionFilter) return false;
    if (quarterFilter !== 'all' && campaign.quarterMonth !== quarterFilter) return false;
    return true;
  });

  // Calculate totals
  const totals = filteredCampaigns.reduce((acc, campaign) => {
    acc.forecastedCost += Number(campaign.forecastedCost) || 0;
    acc.expectedLeads += Number(campaign.expectedLeads) || 0;
    acc.mql += campaign.mql || 0;
    acc.sql += campaign.sql || 0;
    acc.opportunities += campaign.opportunities || 0;
    acc.pipelineForecast += campaign.pipelineForecast || 0;
    return acc;
  }, {
    forecastedCost: 0,
    expectedLeads: 0,
    mql: 0,
    sql: 0,
    opportunities: 0,
    pipelineForecast: 0
  });

  return (
    <div className="space-y-6">
      {/* Add New Campaign Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Campaign
          </CardTitle>
          <CardDescription>
            Create a new marketing campaign with automatic ROI calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Campaign Description*</Label>
              <Input
                id="description"
                value={newCampaign.description || ''}
                onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                placeholder="Enter campaign description"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={newCampaign.campaignType} onValueChange={(value) => setNewCampaign({...newCampaign, campaignType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Revenue Play</Label>
              <Select value={newCampaign.revenuePlay} onValueChange={(value) => setNewCampaign({...newCampaign, revenuePlay: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue play" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_PLAYS.map(play => (
                    <SelectItem key={play} value={play}>{play}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>FY</Label>
              <Select value={newCampaign.fy} onValueChange={(value) => setNewCampaign({...newCampaign, fy: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FISCAL_YEARS.map(fy => (
                    <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Quarter/Month</Label>
              <Select value={newCampaign.quarterMonth} onValueChange={(value) => setNewCampaign({...newCampaign, quarterMonth: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter/month" />
                </SelectTrigger>
                <SelectContent>
                  {QUARTERS.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={newCampaign.region} onValueChange={(value) => setNewCampaign({...newCampaign, region: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={newCampaign.country} onValueChange={(value) => setNewCampaign({...newCampaign, country: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={newCampaign.owner} onValueChange={(value) => setNewCampaign({...newCampaign, owner: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {OWNERS.map(owner => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="forecastedCost">Forecasted Cost (USD)</Label>
              <Input
                id="forecastedCost"
                type="number"
                value={newCampaign.forecastedCost || ''}
                onChange={(e) => setNewCampaign({...newCampaign, forecastedCost: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedLeads">Expected Leads</Label>
              <Input
                id="expectedLeads"
                type="number"
                value={newCampaign.expectedLeads || ''}
                onChange={(e) => setNewCampaign({...newCampaign, expectedLeads: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Strategic Pillars</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {STRATEGIC_PILLARS.map(pillar => (
                <div key={pillar} className="flex items-center space-x-2">
                  <Checkbox
                    id={pillar}
                    checked={newCampaign.strategicPillar?.includes(pillar)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewCampaign({
                          ...newCampaign, 
                          strategicPillar: [...(newCampaign.strategicPillar || []), pillar]
                        });
                      } else {
                        setNewCampaign({
                          ...newCampaign, 
                          strategicPillar: (newCampaign.strategicPillar || []).filter(p => p !== pillar)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={pillar} className="text-sm">{pillar}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button onClick={addCampaign} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
            <div className="flex gap-4">
              <div>
                <Label htmlFor="regionFilter">Filter by Region</Label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger id="regionFilter" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quarterFilter">Filter by Quarter</Label>
                <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                  <SelectTrigger id="quarterFilter" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    {QUARTERS.map(quarter => (
                      <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              {selectedCampaigns.length > 0 && (
                <Button variant="destructive" onClick={deleteCampaigns}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedCampaigns.length})
                </Button>
              )}
            </div>
          </div>

          {/* Campaign Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCampaigns(filteredCampaigns.map(c => c.id));
                        } else {
                          setSelectedCampaigns([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Forecasted Cost</TableHead>
                  <TableHead>Expected Leads</TableHead>
                  <TableHead>MQLs</TableHead>
                  <TableHead>SQLs</TableHead>
                  <TableHead>Opportunities</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCampaigns.includes(campaign.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                          } else {
                            setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{campaign.description}</TableCell>
                    <TableCell>{campaign.campaignType}</TableCell>
                    <TableCell>{campaign.region}</TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell>${(Number(campaign.forecastedCost) || 0).toLocaleString()}</TableCell>
                    <TableCell>{campaign.expectedLeads}</TableCell>
                    <TableCell>{campaign.mql}</TableCell>
                    <TableCell>{campaign.sql}</TableCell>
                    <TableCell>{campaign.opportunities}</TableCell>
                    <TableCell>${(campaign.pipelineForecast || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        campaign.status === 'Shipped' ? 'default' :
                        campaign.status === 'On Track' ? 'secondary' :
                        campaign.status === 'Cancelled' ? 'destructive' : 'outline'
                      }>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Totals Row */}
                {filteredCampaigns.length > 0 && (
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={5}>TOTALS</TableCell>
                    <TableCell>${totals.forecastedCost.toLocaleString()}</TableCell>
                    <TableCell>{totals.expectedLeads}</TableCell>
                    <TableCell>{totals.mql}</TableCell>
                    <TableCell>{totals.sql}</TableCell>
                    <TableCell>{totals.opportunities}</TableCell>
                    <TableCell>${totals.pipelineForecast.toLocaleString()}</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found. {campaigns.length > 0 ? 'Try adjusting your filters.' : 'Add your first campaign above.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Calculated Metrics Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Auto-Calculated Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Standard Calculations:</h4>
              <ul className="space-y-1">
                <li>• MQL Forecast = 10% of Expected Leads</li>
                <li>• SQL Forecast = 6% of Expected Leads</li>
                <li>• Opportunities = 80% of SQL</li>
                <li>• Pipeline Forecast = Opportunities × $50K</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Special Cases:</h4>
              <ul className="space-y-1">
                <li>• In-Account Events (1:1): 20:1 ROI on cost if no leads specified</li>
                <li>• Contractor/Infrastructure: Excluded from calendar and ROI reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}