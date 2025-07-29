import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Trash, 
  Upload, 
  Download, 
  Calculator, 
  ChartBar, 
  Calendar as CalendarIcon, 
  Target,
  Funnel,
  X,
  Edit
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Campaign } from "@/types/campaign";

interface CampaignManagerProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function CampaignManager({ campaigns, setCampaigns }: CampaignManagerProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState("all");
  const [quarterFilter, setQuarterFilter] = useState("all");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [editingPillars, setEditingPillars] = useState<{campaignId: string; pillars: string[]} | null>(null);

  // Form state for new campaign
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    campaignType: '',
    strategicPillar: [],
    revenuePlay: '',
    fy: 'FY25',
    quarterMonth: '',
    region: '',
    country: '',
    owner: '',
    description: '',
    forecastedCost: '',
    expectedLeads: ''
  });

  // Constants
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

  const regions = [
    "JP & Korea", "South APAC", "SAARC", "Digital",
    "X APAC English", "X APAC Non English", "X South APAC", "X SAARC"
  ];

  const countries = [
    "Afghanistan", "ASEAN", "Australia", "Bangladesh", "Bhutan", "Brunei",
    "Cambodia", "China", "GCR", "Hong Kong", "India", "Indonesia", "Japan",
    "Laos", "Malaysia", "Maldives", "Myanmar", "Nepal", "New Zealand",
    "Pakistan", "Philippines", "Singapore", "South Korea", "Sri Lanka",
    "Taiwan", "Thailand", "Vietnam", "X Apac", "X APAC English", 
    "X APAC Non English", "X South APAC", "X SAARC"
  ];

  const owners = [
    "Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"
  ];

  // Calculate metrics for a campaign
  const calculateMetrics = (campaign: Partial<Campaign>) => {
    const leads = Number(campaign.expectedLeads) || 0;
    const cost = Number(campaign.forecastedCost) || 0;
    
    // Special logic for In-Account Events (1:1) - check for various naming variations
    const isInAccountEvent = campaign.campaignType?.includes("In-Account") || 
                           campaign.campaignType?.includes("In Account") ||
                           campaign.campaignType === "In-Account Events (1:1)";
    
    if (isInAccountEvent && leads === 0) {
      const pipeline = cost * 20;
      return {
        mql: 0,
        sql: 0,
        opportunities: 0,
        pipelineForecast: pipeline
      };
    }
    
    // Standard calculation flow:
    // Expected Leads (user input)
    // MQLs = 10% of Expected Leads  
    const mql = Math.round(leads * 0.1);
    
    // SQLs = 6% of Expected Leads (not MQLs)
    const sql = Math.round(leads * 0.06);
    
    // Opportunities = 80% of SQLs
    const opportunities = Math.round(sql * 0.8);
    
    // Pipeline = Opportunities × $50K
    const pipelineForecast = opportunities * 50000;
    
    return { mql, sql, opportunities, pipelineForecast };
  };

  // Add new campaign
  const addCampaign = () => {
    if (!newCampaign.campaignType || !newCampaign.region || !newCampaign.owner) {
      toast.error("Please fill in required fields");
      return;
    }

    const metrics = calculateMetrics(newCampaign);
    const campaign: Campaign = {
      id: Date.now().toString(),
      campaignType: newCampaign.campaignType!,
      strategicPillar: newCampaign.strategicPillar || [],
      revenuePlay: newCampaign.revenuePlay || '',
      fy: newCampaign.fy || 'FY25',
      quarterMonth: newCampaign.quarterMonth || '',
      region: newCampaign.region!,
      country: newCampaign.country || '',
      owner: newCampaign.owner!,
      description: newCampaign.description || '',
      forecastedCost: newCampaign.forecastedCost || '0',
      expectedLeads: newCampaign.expectedLeads || '0',
      ...metrics,
      status: 'Planning',
      poRaised: false,
      salesforceCampaignCode: '',
      issueLink: '',
      actualCost: '0',
      actualLeads: '0',
      actualMQLs: '0'
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      campaignType: '',
      strategicPillar: [],
      revenuePlay: '',
      fy: 'FY25',
      quarterMonth: '',
      region: '',
      country: '',
      owner: '',
      description: '',
      forecastedCost: '',
      expectedLeads: ''
    });
    toast.success("Campaign added successfully");
  };

  // Update campaign
  const updateCampaign = (id: string, field: string, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const updated = { ...campaign, [field]: value };
        
        // Recalculate metrics if cost or leads changed
        if (field === 'forecastedCost' || field === 'expectedLeads') {
          const metrics = calculateMetrics(updated);
          return { ...updated, ...metrics };
        }
        
        return updated;
      }
      return campaign;
    }));
  };

  // Delete selected campaigns
  const deleteSelectedCampaigns = () => {
    if (selectedCampaigns.length === 0) {
      toast.error("No campaigns selected");
      return;
    }
    
    setCampaigns(campaigns.filter(c => !selectedCampaigns.includes(c.id)));
    setSelectedCampaigns([]);
    toast.success(`Deleted ${selectedCampaigns.length} campaign(s)`);
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (regionFilter !== "all" && campaign.region !== regionFilter) return false;
    if (quarterFilter !== "all" && campaign.quarterMonth !== quarterFilter) return false;
    return true;
  });

  // Clear filters
  const clearFilters = () => {
    setRegionFilter("all");
    setQuarterFilter("all");
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'Campaign Type', 'Strategic Pillar', 'Revenue Play', 'FY', 'Quarter/Month',
      'Region', 'Country', 'Owner', 'Description', 'Forecasted Cost', 'Forecasted Leads',
      'MQLs', 'SQLs', 'Opportunities', 'Pipeline Forecast'
    ];
    
    const csvData = filteredCampaigns.map(campaign => [
      campaign.campaignType,
      Array.isArray(campaign.strategicPillar) ? campaign.strategicPillar.join('; ') : campaign.strategicPillar,
      campaign.revenuePlay,
      campaign.fy,
      campaign.quarterMonth,
      campaign.region,
      campaign.country,
      campaign.owner,
      campaign.description,
      campaign.forecastedCost,
      campaign.expectedLeads,
      campaign.mql,
      campaign.sql,
      campaign.opportunities,
      campaign.pipelineForecast
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaigns.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  // CSV Import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index] || '';
              return obj;
            }, {} as any);
          });

        setPreviewData(data);
        setShowPreview(true);
      } catch (error) {
        toast.error("Error reading CSV file");
      }
    };
    reader.readAsText(file);
  };

  // Import from preview
  const importFromPreview = () => {
    const newCampaigns = previewData.map(row => {
      const metrics = calculateMetrics({
        forecastedCost: row['Forecasted Cost'],
        expectedLeads: row['Forecasted Leads'] || row['Expected Leads'], // Handle both naming conventions
        campaignType: row['Campaign Type']
      });

      return {
        id: Date.now().toString() + Math.random(),
        campaignType: row['Campaign Type'] || '',
        strategicPillar: row['Strategic Pillar'] ? row['Strategic Pillar'].split(';').map((s: string) => s.trim()) : [],
        revenuePlay: row['Revenue Play'] || '',
        fy: row['FY'] || 'FY25',
        quarterMonth: row['Quarter/Month'] || '',
        region: row['Region'] || '',
        country: row['Country'] || '',
        owner: row['Owner'] || '',
        description: row['Description'] || '',
        forecastedCost: row['Forecasted Cost'] || '0',
        expectedLeads: row['Forecasted Leads'] || row['Expected Leads'] || '0',
        ...metrics,
        status: 'Planning',
        poRaised: false,
        salesforceCampaignCode: '',
        issueLink: '',
        actualCost: '0',
        actualLeads: '0',
        actualMQLs: '0'
      };
    });

    setCampaigns([...campaigns, ...newCampaigns]);
    setShowPreview(false);
    setPreviewData([]);
    toast.success(`Imported ${newCampaigns.length} campaigns`);
  };

  // Handle Strategic Pillar editing
  const openPillarEditor = (campaignId: string, currentPillars: string[]) => {
    setEditingPillars({ campaignId, pillars: [...currentPillars] });
  };

  const savePillars = () => {
    if (editingPillars) {
      updateCampaign(editingPillars.campaignId, 'strategicPillar', editingPillars.pillars);
      setEditingPillars(null);
    }
  };

  const togglePillar = (pillar: string) => {
    if (!editingPillars) return;
    
    const pillars = editingPillars.pillars.includes(pillar)
      ? editingPillars.pillars.filter(p => p !== pillar)
      : [...editingPillars.pillars, pillar];
    
    setEditingPillars({ ...editingPillars, pillars });
  };

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
            Enter campaign details and automatically calculate ROI metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="campaignType">Campaign Type *</Label>
              <Select value={newCampaign.campaignType} onValueChange={(value) => setNewCampaign({...newCampaign, campaignType: value})}>
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

            <div>
              <Label htmlFor="strategicPillar">Strategic Pillar</Label>
              <div className="space-y-2">
                {strategicPillars.map(pillar => (
                  <div key={pillar} className="flex items-center space-x-2">
                    <Checkbox
                      id={`new-${pillar}`}
                      checked={newCampaign.strategicPillar?.includes(pillar) || false}
                      onCheckedChange={(checked) => {
                        const current = newCampaign.strategicPillar || [];
                        const updated = checked 
                          ? [...current, pillar]
                          : current.filter(p => p !== pillar);
                        setNewCampaign({...newCampaign, strategicPillar: updated});
                      }}
                    />
                    <Label htmlFor={`new-${pillar}`} className="text-sm">
                      {pillar}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="revenuePlay">Revenue Play</Label>
              <Select value={newCampaign.revenuePlay} onValueChange={(value) => setNewCampaign({...newCampaign, revenuePlay: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue play" />
                </SelectTrigger>
                <SelectContent>
                  {revenuePlays.map(play => (
                    <SelectItem key={play} value={play}>{play}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fy">FY</Label>
              <Select value={newCampaign.fy} onValueChange={(value) => setNewCampaign({...newCampaign, fy: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map(fy => (
                    <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quarterMonth">Quarter/Month</Label>
              <Select value={newCampaign.quarterMonth} onValueChange={(value) => setNewCampaign({...newCampaign, quarterMonth: value})}>
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

            <div>
              <Label htmlFor="region">Region *</Label>
              <Select value={newCampaign.region} onValueChange={(value) => setNewCampaign({...newCampaign, region: value})}>
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

            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={newCampaign.country} onValueChange={(value) => setNewCampaign({...newCampaign, country: value})}>
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

            <div>
              <Label htmlFor="owner">Owner *</Label>
              <Select value={newCampaign.owner} onValueChange={(value) => setNewCampaign({...newCampaign, owner: value})}>
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

            <div>
              <Label htmlFor="forecastedCost">Forecasted Cost ($)</Label>
              <Input
                type="number"
                value={newCampaign.forecastedCost}
                onChange={(e) => setNewCampaign({...newCampaign, forecastedCost: e.target.value})}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="expectedLeads">Forecasted Leads</Label>
              <Input
                type="number"
                value={newCampaign.expectedLeads}
                onChange={(e) => setNewCampaign({...newCampaign, expectedLeads: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                placeholder="Campaign description..."
                rows={3}
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

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Funnel className="h-4 w-4" />
              <Label>Filters:</Label>
            </div>
            
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={quarterFilter} onValueChange={setQuarterFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quarters</SelectItem>
                {quarters.map(quarter => (
                  <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button asChild variant="outline" className="flex items-center gap-2">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </label>
              </Button>
            </div>

            {selectedCampaigns.length > 0 && (
              <Button onClick={deleteSelectedCampaigns} variant="destructive" className="flex items-center gap-2">
                <Trash className="h-4 w-4" />
                Delete Selected ({selectedCampaigns.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1400px]"> {/* Ensure minimum width for all columns */}
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
                    <TableHead className="min-w-[200px]">Campaign Type</TableHead>
                    <TableHead className="min-w-[200px]">Strategic Pillar</TableHead>
                    <TableHead className="min-w-[150px]">Revenue Play</TableHead>
                    <TableHead className="min-w-[80px]">FY</TableHead>
                    <TableHead className="min-w-[120px]">Quarter/Month</TableHead>
                    <TableHead className="min-w-[120px]">Region</TableHead>
                    <TableHead className="min-w-[120px]">Country</TableHead>
                    <TableHead className="min-w-[120px]">Owner</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="min-w-[120px]">Forecasted Cost</TableHead>
                    <TableHead className="min-w-[120px]">Forecasted Leads</TableHead>
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
                    
                    {/* Campaign Type */}
                    <TableCell>
                      <Select value={campaign.campaignType} onValueChange={(value) => updateCampaign(campaign.id, 'campaignType', value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {campaignTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Strategic Pillar */}
                    <TableCell>
                      <div className="max-w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            {Array.isArray(campaign.strategicPillar) && campaign.strategicPillar.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {campaign.strategicPillar.map((pillar, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {pillar.substring(0, 15)}{pillar.length > 15 ? '...' : ''}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">None selected</span>
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => openPillarEditor(campaign.id, campaign.strategicPillar || [])}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Strategic Pillars</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Select one or more strategic pillars for this campaign:
                                </p>
                                <div className="space-y-2">
                                  {strategicPillars.map(pillar => (
                                    <div key={pillar} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={pillar}
                                        checked={editingPillars?.pillars.includes(pillar) || false}
                                        onCheckedChange={() => togglePillar(pillar)}
                                      />
                                      <Label htmlFor={pillar} className="text-sm">
                                        {pillar}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingPillars(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={savePillars}>
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </TableCell>

                    {/* Revenue Play */}
                    <TableCell>
                      <Select value={campaign.revenuePlay} onValueChange={(value) => updateCampaign(campaign.id, 'revenuePlay', value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {revenuePlays.map(play => (
                            <SelectItem key={play} value={play}>{play}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* FY */}
                    <TableCell>
                      <Select value={campaign.fy} onValueChange={(value) => updateCampaign(campaign.id, 'fy', value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fiscalYears.map(fy => (
                            <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Quarter/Month */}
                    <TableCell>
                      <Select value={campaign.quarterMonth} onValueChange={(value) => updateCampaign(campaign.id, 'quarterMonth', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {quarters.map(quarter => (
                            <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Region */}
                    <TableCell>
                      <Select value={campaign.region} onValueChange={(value) => updateCampaign(campaign.id, 'region', value)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Country */}
                    <TableCell>
                      <Select value={campaign.country} onValueChange={(value) => updateCampaign(campaign.id, 'country', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Owner */}
                    <TableCell>
                      <Select value={campaign.owner} onValueChange={(value) => updateCampaign(campaign.id, 'owner', value)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map(owner => (
                            <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      <Input
                        value={campaign.description}
                        onChange={(e) => updateCampaign(campaign.id, 'description', e.target.value)}
                        placeholder="Campaign description..."
                        className="min-w-48"
                      />
                    </TableCell>

                    {/* Forecasted Cost */}
                    <TableCell>
                      <Input
                        type="number"
                        value={campaign.forecastedCost}
                        onChange={(e) => updateCampaign(campaign.id, 'forecastedCost', e.target.value)}
                        className="w-24"
                        placeholder="0"
                      />
                    </TableCell>

                    {/* Forecasted Leads */}
                    <TableCell>
                      <Input
                        type="number"
                        value={campaign.expectedLeads}
                        onChange={(e) => updateCampaign(campaign.id, 'expectedLeads', e.target.value)}
                        className="w-24"
                        placeholder="0"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Calculated Metrics Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Auto-Calculated Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Standard Calculation:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• MQL Forecast = 10% of Expected Leads</li>
                <li>• SQL Forecast = 6% of Expected Leads</li>
                <li>• Opportunities = 80% of SQLs</li>
                <li>• Pipeline Forecast = Opportunities × $50K</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Special Case:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• In-Account Programs with no lead numbers:</li>
                <li>• Pipeline = Campaign Cost × 20 (20:1 ROI)</li>
                <li>• MQLs, SQLs, Opportunities = 0</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview CSV Import</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review the data below before importing {previewData.length} campaigns:
            </p>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Campaign Type</th>
                    <th className="border border-border p-2 text-left">Strategic Pillar</th>
                    <th className="border border-border p-2 text-left">Region</th>
                    <th className="border border-border p-2 text-left">Owner</th>
                    <th className="border border-border p-2 text-left">Cost</th>
                    <th className="border border-border p-2 text-left">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td className="border border-border p-2">{row['Campaign Type']}</td>
                      <td className="border border-border p-2">{row['Strategic Pillar']}</td>
                      <td className="border border-border p-2">{row['Region']}</td>
                      <td className="border border-border p-2">{row['Owner']}</td>
                      <td className="border border-border p-2">{row['Forecasted Cost']}</td>
                      <td className="border border-border p-2">{row['Forecasted Leads'] || row['Expected Leads']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  ... and {previewData.length - 10} more rows
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
              <Button onClick={importFromPreview}>
                Import {previewData.length} Campaigns
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}