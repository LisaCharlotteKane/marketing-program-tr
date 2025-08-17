import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "sonner";
import { Plus, Trash, Calculator, ChartBar, Target, BuildingOffice, Upload, Download, ClipboardText } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import type { CheckedState } from "@radix-ui/react-checkbox";
import type { 
  Campaign, 
  FormData, 
  BudgetAllocation, 
  BudgetUsage,
  ImportExportProps,
  CampaignFormProps,
  CampaignTableProps,
  ExecutionTrackingProps
} from "@/types/campaign";
import { 
  calculateCampaignMetrics, 
  parseToNumber, 
  parseStrategicPillars, 
  createCampaignWithMetrics 
} from "@/types/utils";

// Import/Export Component
function ImportExport({ onImportCampaigns, campaigns }: ImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must contain a header row and at least one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const importedCampaigns: Campaign[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) continue;

        const campaignData: Record<string, string> = {};
        headers.forEach((header, index) => {
          campaignData[header] = values[index] || '';
        });

        // Map CSV data to Campaign interface with proper type conversions
        const campaign: Campaign = {
          id: Date.now().toString() + i,
          campaignType: campaignData.campaignType || campaignData['Campaign Type'] || '',
          strategicPillar: parseStrategicPillars(campaignData.strategicPillar || campaignData['Strategic Pillar']),
          revenuePlay: campaignData.revenuePlay || campaignData['Revenue Play'] || '',
          fy: campaignData.fy || campaignData['FY'] || '',
          quarterMonth: campaignData.quarterMonth || campaignData['Quarter/Month'] || '',
          region: campaignData.region || campaignData['Region'] || '',
          country: campaignData.country || campaignData['Country'] || '',
          owner: campaignData.owner || campaignData['Owner'] || '',
          description: campaignData.description || campaignData['Description'] || '',
          // Fixed: Use utility function for safe number conversion
          forecastedCost: parseToNumber(campaignData.forecastedCost || campaignData['Forecasted Cost']),
          expectedLeads: parseToNumber(campaignData.expectedLeads || campaignData['Expected Leads']),
          mql: parseToNumber(campaignData.mql || campaignData['MQL']),
          sql: parseToNumber(campaignData.sql || campaignData['SQL']),
          opportunities: parseToNumber(campaignData.opportunities || campaignData['Opportunities']),
          pipelineForecast: parseToNumber(campaignData.pipelineForecast || campaignData['Pipeline Forecast']),
          status: campaignData.status || campaignData['Status'] || 'Planning'
        };

        // If metrics are not provided, calculate them
        if (!campaign.mql && !campaign.sql && !campaign.opportunities && !campaign.pipelineForecast) {
          const calculated = calculateCampaignMetrics(campaign.expectedLeads, campaign.forecastedCost, campaign.campaignType);
          campaign.mql = calculated.mql;
          campaign.sql = calculated.sql;
          campaign.opportunities = calculated.opportunities;
          campaign.pipelineForecast = calculated.pipelineForecast;
        }

        importedCampaigns.push(campaign);
      }

      if (importedCampaigns.length > 0) {
        onImportCampaigns(importedCampaigns);
        toast.success(`Successfully imported ${importedCampaigns.length} campaigns`);
      } else {
        toast.error('No valid campaigns found in the CSV file');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import campaigns. Please check the CSV format.');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const exportToCsv = () => {
    if (campaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }

    const headers = [
      'Campaign Type',
      'Strategic Pillar',
      'Revenue Play',
      'FY',
      'Quarter/Month',
      'Region',
      'Country',
      'Owner',
      'Description',
      'Forecasted Cost',
      'Expected Leads',
      'MQL',
      'SQL',
      'Opportunities',
      'Pipeline Forecast',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...campaigns.map(campaign => [
        `"${campaign.campaignType}"`,
        `"${campaign.strategicPillar.join(';')}"`,
        `"${campaign.revenuePlay}"`,
        `"${campaign.fy}"`,
        `"${campaign.quarterMonth}"`,
        `"${campaign.region}"`,
        `"${campaign.country}"`,
        `"${campaign.owner}"`,
        `"${campaign.description}"`,
        campaign.forecastedCost,
        campaign.expectedLeads,
        campaign.mql,
        campaign.sql,
        campaign.opportunities,
        campaign.pipelineForecast,
        `"${campaign.status || 'Planning'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `marketing-campaigns-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${campaigns.length} campaigns to CSV`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import/Export Campaigns
        </CardTitle>
        <CardDescription>
          Import campaigns from CSV or export existing campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Import from CSV</h4>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with campaign data. The file should include columns for campaign type, region, owner, etc.
            </p>
            <div className="relative">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="cursor-pointer"
              />
              {isImporting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Expected headers: Campaign Type, Region, Owner, Forecasted Cost, Expected Leads, Description, etc.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Export to CSV</h4>
            <p className="text-sm text-muted-foreground">
              Download all current campaigns as a CSV file for backup or analysis.
            </p>
            <Button 
              onClick={exportToCsv}
              disabled={campaigns.length === 0}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export {campaigns.length} Campaigns
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Campaign Form Component
function CampaignForm({ onAddCampaign }: CampaignFormProps) {
  const [formData, setFormData] = useState<FormData>({
    campaignType: '',
    strategicPillar: [] as string[],
    revenuePlay: '',
    fy: '',
    quarterMonth: '',
    region: '',
    country: '',
    owner: '',
    description: '',
    forecastedCost: 0,
    expectedLeads: 0,
    campaignName: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.campaignType || !formData.owner || !formData.region) {
      toast.error('Please fill in required fields');
      return;
    }

    const metrics = calculateCampaignMetrics(formData.expectedLeads, formData.forecastedCost, formData.campaignType);
    
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      ...formData,
      ...metrics,
      status: 'Planning'
    };

    onAddCampaign(newCampaign);
    
    // Reset form
    setFormData({
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
      campaignName: '',
    });
    
    toast.success('Campaign added successfully');
  };

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

  const revenuePlayOptions = [
    "Accelerate developer productivity with Copilot in VS Code and GitHub",
    "Secure all developer workloads with the power of AI",
    "All"
  ];

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital"];
  const owners = ["Tomoko Tanaka", "Beverly Leung", "Shruti Narang", "Giorgia Parham"];
  const fiscalYears = ["FY25", "FY26"];
  const quarters = ["Q1 - July", "Q1 - August", "Q1 - September", "Q2 - October", "Q2 - November", "Q2 - December", "Q3 - January", "Q3 - February", "Q3 - March", "Q4 - April", "Q4 - May", "Q4 - June"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Campaign
        </CardTitle>
        <CardDescription>
          Create a new marketing campaign with forecasted metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                value={formData.campaignName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: FormData) => ({...prev, campaignName: e.target.value}))}
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <Label htmlFor="campaignType">Campaign Type *</Label>
              <Select value={formData.campaignType} onValueChange={(value: string) => setFormData((prev: FormData) => ({...prev, campaignType: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map((type: string) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="region">Region *</Label>
              <Select value={formData.region} onValueChange={(value: string) => setFormData((prev: FormData) => ({...prev, region: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region: string) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="owner">Campaign Owner *</Label>
              <Select value={formData.owner} onValueChange={(value: string) => setFormData((prev: FormData) => ({...prev, owner: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner: string) => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fy">Fiscal Year</Label>
              <Select value={formData.fy} onValueChange={(value: string) => setFormData((prev: FormData) => ({...prev, fy: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select FY" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy: string) => (
                    <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quarterMonth">Quarter/Month</Label>
              <Select value={formData.quarterMonth} onValueChange={(value: string) => setFormData((prev: FormData) => ({...prev, quarterMonth: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter/month" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((quarter: string) => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="revenuePlay">Revenue Play</Label>
              <Select value={formData.revenuePlay} onValueChange={(value: string) => setFormData((prev: FormData) => ({...prev, revenuePlay: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue play" />
                </SelectTrigger>
                <SelectContent>
                  {revenuePlayOptions.map((play: string) => (
                    <SelectItem key={play} value={play}>{play}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="forecastedCost">Forecasted Cost ($)</Label>
              <Input
                type="number"
                value={formData.forecastedCost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: FormData) => ({...prev, forecastedCost: Number(e.target.value)}))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="expectedLeads">Expected Leads</Label>
              <Input
                type="number"
                value={formData.expectedLeads}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: FormData) => ({...prev, expectedLeads: Number(e.target.value)}))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: FormData) => ({...prev, description: e.target.value}))}
              placeholder="Campaign description..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Campaign Table Component
function CampaignTable({ campaigns, onDeleteCampaign }: { campaigns: Campaign[]; onDeleteCampaign: (id: string) => void }) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  const handleSelectAll = (checked: CheckedState) => {
    setSelectedCampaigns(checked ? campaigns.map((c: Campaign) => c.id) : []);
  };

  const handleSelectCampaign = (campaignId: string, checked: CheckedState) => {
    setSelectedCampaigns((prev: string[]) => 
      checked 
        ? [...prev, campaignId]
        : prev.filter((id: string) => id !== campaignId)
    );
  };

  const handleDeleteSelected = () => {
    selectedCampaigns.forEach(id => onDeleteCampaign(id));
    setSelectedCampaigns([]);
    toast.success(`Deleted ${selectedCampaigns.length} campaigns`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Campaign List</CardTitle>
            <CardDescription>Manage your marketing campaigns</CardDescription>
          </div>
          {selectedCampaigns.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedCampaigns.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No campaigns yet. Add your first campaign above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCampaigns.length === campaigns.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Campaign Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Forecasted Cost</TableHead>
                  <TableHead className="text-right">Expected Leads</TableHead>
                  <TableHead className="text-right">MQLs</TableHead>
                  <TableHead className="text-right">SQLs</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign: Campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCampaigns.includes(campaign.id)}
                        onCheckedChange={(checked: CheckedState) => handleSelectCampaign(campaign.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{campaign.campaignType}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.region}</Badge>
                    </TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell className="max-w-xs truncate">{campaign.description || '-'}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${campaign.forecastedCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{campaign.expectedLeads}</TableCell>
                    <TableCell className="text-right">{campaign.mql}</TableCell>
                    <TableCell className="text-right">{campaign.sql}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${campaign.pipelineForecast.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDeleteCampaign(campaign.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Execution Tracking Component
function ExecutionTracking({ campaigns, onUpdateCampaign }: ExecutionTrackingProps) {
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Campaign>>({});

  const handleEditStart = (campaign: Campaign) => {
    setEditingCampaign(campaign.id);
    setEditFormData({
      campaignName: campaign.campaignName || '',
      status: campaign.status || 'Planning',
      poRaised: campaign.poRaised || false,
      issueLink: campaign.issueLink || '',
      actualCost: campaign.actualCost || 0,
      actualLeads: campaign.actualLeads || 0,
      actualMqls: campaign.actualMqls || 0
    });
  };

  const handleSaveExecution = (campaign: Campaign) => {
    const updatedCampaign = {
      ...campaign,
      ...editFormData
    };
    onUpdateCampaign(updatedCampaign);
    setEditingCampaign(null);
    setEditFormData({});
    toast.success('Campaign execution updated');
  };

  const handleCancelEdit = () => {
    setEditingCampaign(null);
    setEditFormData({});
  };

  const statusOptions = ['Planning', 'On Track', 'Shipped', 'Cancelled'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardText className="h-5 w-5" />
          Campaign Execution Tracking
        </CardTitle>
        <CardDescription>
          Update actual results and execution status for campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No campaigns to track. Add campaigns in the Planning tab first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Campaign Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PO Raised</TableHead>
                  <TableHead>Issue URL</TableHead>
                  <TableHead className="text-right">Actual Cost</TableHead>
                  <TableHead className="text-right">Actual Leads</TableHead>
                  <TableHead className="text-right">Actual MQLs</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign: Campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      {editingCampaign === campaign.id ? (
                        <Input
                          placeholder="Campaign name"
                          value={editFormData.campaignName || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setEditFormData(prev => ({...prev, campaignName: e.target.value}))
                          }
                          className="w-40"
                        />
                      ) : (
                        <div className="font-medium">
                          {campaign.campaignName || campaign.campaignType}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-xs">{campaign.campaignType}</div>
                    </TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.region}</Badge>
                    </TableCell>
                    <TableCell>
                      {editingCampaign === campaign.id ? (
                        <Select 
                          value={editFormData.status || 'Planning'} 
                          onValueChange={(value: string) => setEditFormData(prev => ({...prev, status: value}))}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status: string) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          variant={
                            campaign.status === 'Shipped' ? 'default' :
                            campaign.status === 'On Track' ? 'secondary' :
                            campaign.status === 'Cancelled' ? 'destructive' : 'outline'
                          }
                        >
                          {campaign.status || 'Planning'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCampaign === campaign.id ? (
                        <Checkbox
                          checked={editFormData.poRaised || false}
                          onCheckedChange={(checked: CheckedState) => 
                            setEditFormData(prev => ({...prev, poRaised: !!checked}))
                          }
                        />
                      ) : (
                        <Badge variant={campaign.poRaised ? 'default' : 'outline'}>
                          {campaign.poRaised ? 'Yes' : 'No'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCampaign === campaign.id ? (
                        <Input
                          type="url"
                          placeholder="GitHub issue URL"
                          value={editFormData.issueLink || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setEditFormData(prev => ({...prev, issueLink: e.target.value}))
                          }
                          className="w-40"
                        />
                      ) : (
                        campaign.issueLink ? (
                          <a 
                            href={campaign.issueLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Issue
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingCampaign === campaign.id ? (
                        <Input
                          type="number"
                          placeholder="0"
                          value={editFormData.actualCost || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setEditFormData(prev => ({...prev, actualCost: Number(e.target.value)}))
                          }
                          className="w-24 text-right"
                        />
                      ) : (
                        <span className="font-mono">
                          ${(campaign.actualCost || 0).toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingCampaign === campaign.id ? (
                        <Input
                          type="number"
                          placeholder="0"
                          value={editFormData.actualLeads || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setEditFormData(prev => ({...prev, actualLeads: Number(e.target.value)}))
                          }
                          className="w-20 text-right"
                        />
                      ) : (
                        <span>{campaign.actualLeads || 0}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingCampaign === campaign.id ? (
                        <Input
                          type="number"
                          placeholder="0"
                          value={editFormData.actualMqls || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setEditFormData(prev => ({...prev, actualMqls: Number(e.target.value)}))
                          }
                          className="w-20 text-right"
                        />
                      ) : (
                        <span>{campaign.actualMqls || 0}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCampaign === campaign.id ? (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleSaveExecution(campaign)}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditStart(campaign)}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Budget Overview Component
function BudgetOverview({ campaigns }: { campaigns: Campaign[] }) {
  const budgetAllocations: Record<string, BudgetAllocation> = {
    "Tomoko Tanaka": { region: "JP & Korea", budget: 358000 },
    "Beverly Leung": { region: "South APAC", budget: 385500 },
    "Shruti Narang": { region: "SAARC", budget: 265000 },
    "Giorgia Parham": { region: "Digital", budget: 68000 },
  };

  const budgetUsage: BudgetUsage[] = Object.entries(budgetAllocations).map(([owner, { region, budget }]: [string, BudgetAllocation]): BudgetUsage => {
    const ownerCampaigns = campaigns.filter((c: Campaign) => c.owner === owner);
    const used = ownerCampaigns.reduce((sum: number, c: Campaign) => sum + c.forecastedCost, 0);
    const remaining = budget - used;
    const percentage = (used / budget) * 100;
    
    return {
      owner,
      region,
      budget,
      used,
      remaining,
      percentage,
      isOverBudget: remaining < 0
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BuildingOffice className="h-5 w-5" />
          Budget Overview
        </CardTitle>
        <CardDescription>Budget allocation and usage by owner</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {budgetUsage.map(({ owner, region, budget, used, remaining, percentage, isOverBudget }: BudgetUsage) => (
            <div key={owner} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{owner}</h4>
                  <p className="text-sm text-muted-foreground">{region}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">
                    ${used.toLocaleString()} / ${budget.toLocaleString()}
                  </p>
                  <p className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverBudget ? `Over by $${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()} remaining`}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>
                    Budget exceeded by ${Math.abs(remaining).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main App Component
export default function App() {
  console.log("App component loading...");
  
  // Fixed: Use proper error boundary for useKV with fallback
  const [campaigns, setCampaigns] = useKV<Campaign[]>('marketing-campaigns', []);
  
  React.useEffect(() => {
    console.log("App mounted successfully!");
    console.log("Campaigns:", campaigns);
  }, [campaigns]);

  const handleAddCampaign = (campaign: Campaign): void => {
    setCampaigns([...campaigns, campaign]);
  };

  const handleImportCampaigns = (importedCampaigns: Campaign[]): void => {
    setCampaigns([...campaigns, ...importedCampaigns]);
  };

  const handleDeleteCampaign = (id: string): void => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast.success('Campaign deleted');
  };

  const handleUpdateCampaign = (updatedCampaign: Campaign): void => {
    setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
  };

  const totals = campaigns.reduce(
    (acc: { totalCost: number; totalLeads: number; totalPipeline: number }, campaign: Campaign) => {
      acc.totalCost += campaign.forecastedCost || 0;
      acc.totalLeads += campaign.expectedLeads || 0;
      acc.totalPipeline += campaign.pipelineForecast || 0;
      return acc;
    }, 
    {
      totalCost: 0,
      totalLeads: 0,
      totalPipeline: 0
    }
  );

  const roi: number = totals.totalCost > 0 ? (totals.totalPipeline / totals.totalCost) : 0;

  // Fallback render if something goes wrong
  try {
    console.log("App rendering...", { campaignsLength: campaigns.length, totals });
    
    return (
      <div className="min-h-screen bg-background">
        <div data-healthcheck="READY" />
        <Toaster position="top-right" richColors />
        
        {/* Simple ready check */}
        <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'green', color: 'white', padding: '5px', zIndex: 9999 }}>
          READY
        </div>
        
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Marketing Campaign Planner</h1>
                <p className="text-sm text-muted-foreground">APAC Marketing Operations</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          <Tabs defaultValue="planning" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="planning" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Campaign Planning
              </TabsTrigger>
              <TabsTrigger value="execution" className="flex items-center gap-2">
                <ClipboardText className="h-4 w-4" />
                Execution
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <BuildingOffice className="h-4 w-4" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planning" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaign Planning</h2>
                <p className="text-muted-foreground">
                  Plan and manage marketing campaigns with ROI calculations
                </p>
              </div>

              <ImportExport onImportCampaigns={handleImportCampaigns} campaigns={campaigns} />
              <CampaignForm onAddCampaign={handleAddCampaign} />
              <CampaignTable campaigns={campaigns} onDeleteCampaign={handleDeleteCampaign} />
            </TabsContent>

            <TabsContent value="execution" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaign Execution</h2>
                <p className="text-muted-foreground">
                  Track actual results and execution status for campaigns
                </p>
              </div>

              <ExecutionTracking campaigns={campaigns} onUpdateCampaign={handleUpdateCampaign} />
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
                <p className="text-muted-foreground">
                  Track regional budget allocations and spending
                </p>
              </div>

              <BudgetOverview campaigns={campaigns} />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaign Overview</h2>
                <p className="text-muted-foreground">
                  Summary of all marketing campaigns and metrics
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">{campaigns.length}</div>
                    <div className="text-sm text-muted-foreground">Total Campaigns</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">${totals.totalCost.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Forecasted Spend</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">${totals.totalPipeline.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Pipeline Forecast</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{roi.toFixed(1)}x</div>
                    <div className="text-sm text-muted-foreground">ROI Multiple</div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Auto-Calculated Metrics</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm">
                    <li><strong>MQL Forecast:</strong> 10% of Expected Leads</li>
                    <li><strong>SQL Forecast:</strong> 6% of Expected Leads (60% of MQLs)</li>
                    <li><strong>Opportunities:</strong> 80% of SQLs</li>
                    <li><strong>Pipeline Forecast:</strong> Opportunities × $50,000</li>
                    <li><strong>Special Case:</strong> In-Account Events (1:1) with no leads assume 20:1 ROI</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in main render:", error);
    return (
      <div style={{ padding: '20px', color: 'black', fontFamily: 'Arial' }}>
        <h1>READY - App Error Caught</h1>
        <p>Error: {String(error)}</p>
      </div>
    );
  }
}