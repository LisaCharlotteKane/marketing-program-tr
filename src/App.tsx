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
import { Plus, Trash, Calculator, ChartBar, Target, BuildingOffice } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import type { CheckedState } from "@radix-ui/react-checkbox";

// Types
interface Campaign {
  id: string;
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
  status?: string;
  poRaised?: boolean;
  salesforceCampaignCode?: string;
  issueLink?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;
}

interface FormData {
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
}

interface BudgetAllocation {
  region: string;
  budget: number;
}

interface BudgetUsage {
  owner: string;
  region: string;
  budget: number;
  used: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// Campaign Form Component
function CampaignForm({ onAddCampaign }: { onAddCampaign: (campaign: Campaign) => void }) {
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
  });

  const calculateMetrics = (expectedLeads: number, forecastedCost: number, campaignType: string) => {
    // Special case for In Account Events
    if (campaignType === "In-Account Events (1:1)" && expectedLeads === 0) {
      return {
        mql: 0,
        sql: 0,
        opportunities: 0,
        pipelineForecast: forecastedCost * 20 // 20:1 ROI for in-account events
      };
    }

    const mql = Math.round(expectedLeads * 0.1); // 10% of expected leads
    const sql = Math.round(mql * 0.6); // 6% of expected leads  
    const opportunities = Math.round(sql * 0.8); // 80% of SQLs
    const pipelineForecast = opportunities * 50000; // $50K per opportunity

    return { mql, sql, opportunities, pipelineForecast };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.campaignType || !formData.owner || !formData.region) {
      toast.error('Please fill in required fields');
      return;
    }

    const metrics = calculateMetrics(formData.expectedLeads, formData.forecastedCost, formData.campaignType);
    
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
  
  // Primary approach - try useKV, fall back to simple state if needed
  const [campaigns, setCampaigns] = useKV<Campaign[]>('marketing-campaigns', []);
  
  React.useEffect(() => {
    console.log("App mounted successfully!");
    console.log("Campaigns:", campaigns);
  }, [campaigns]);

  const handleAddCampaign = (campaign: Campaign) => {
  
  React.useEffect(() => {
    console.log("App mounted successfully!");
    console.log("Campaigns:", campaigns);
  }, [campaigns]);

  const handleAddCampaign = (campaign: Campaign) => {
    setCampaigns([...campaigns, campaign]);
  const totals = campaigns.reduce((acc: { totalCost: number; totalLeads: number; totalPipeline: number }, campaign: Campaign) => {
    acc.totalCost += campaign.forecastedCost;
    acc.totalLeads += campaign.expectedLeads;
    acc.totalPipeline += campaign.pipelineForecast;
    return acc;
  }, {
    totalCost: 0,
    totalLeads: 0,
    totalPipeline: 0
  });

  const roi = totals.totalCost > 0 ? (totals.totalPipeline / totals.totalCost) : 0;

  // Fallback render if something goes wrong
  try {
    console.log("App rendering...", { campaignsLength: campaigns.length, totals });
  } catch (e) {
    console.error("Error in render preparation:", e);
    return <div style={{ padding: '20px', fontSize: '24px', color: 'green' }}>READY - Basic render</div>;
  }
  // Fallback render if something goes wrong
  try {
    console.log("App rendering...", { campaignsLength: campaigns.length, totals });
  } catch (e) {
    console.error("Error in render preparation:", e);
    return <div style={{ padding: '20px', fontSize: '24px', color: 'green' }}>READY - Basic render</div>;
  }

        
        <Toaster position="top-right" richColors />
      {/* Simple ready check */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'green', color: 'white', padding: '5px', zIndex: 9999 }}>
        READY
      </div>
      
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Marketing Campaign Planner</h1>
                <p className="text-sm text-muted-foreground">APAC Marketing Operations</p>
              </div>
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Marketing Campaign Planner</h1>
              <p className="text-sm text-muted-foreground">APAC Marketing Operations</p>
            </div>
          </div>st className="grid w-full grid-cols-3 mb-6">
        </div><TabsTrigger value="planning" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Campaign Planning
      <main className="container mx-auto p-4">
        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
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

              <CampaignForm onAddCampaign={handleAddCampaign} />
              <CampaignTable campaigns={campaigns} onDeleteCampaign={handleDeleteCampaign} />
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