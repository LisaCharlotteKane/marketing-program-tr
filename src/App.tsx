import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "sonner";
import { Calculator, ChartBar, Target, BuildingOffice, ClipboardText } from "@phosphor-icons/react";
import { notify } from "@/lib/notifier";
import { useKV } from "@github/spark/hooks";
import { num } from "@/lib/utils";
import type { Campaign } from "@/types/campaign";

// Simple campaign data for testing
const sampleCampaigns: Campaign[] = [
  {
    id: "1",
    campaignName: "Q1 Developer Event",
    campaignType: "Webinars",
    strategicPillar: ["Brand Awareness & Top of Funnel Demand Generation"],
    revenuePlay: "All",
    fy: "FY25",
    quarterMonth: "Q1 - July",
    region: "JP & Korea",
    country: "Japan",
    owner: "Tomoko Tanaka",
    description: "Quarterly developer engagement event",
    forecastedCost: 15000,
    expectedLeads: 100,
    mql: 10,
    sql: 6,
    opportunities: 5,
    pipelineForecast: 250000,
    status: "Planning"
  }
];

// Simple Campaign List Component
function CampaignList({ campaigns }: { campaigns: Campaign[] }): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign List</CardTitle>
        <CardDescription>Current marketing campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No campaigns found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign: Campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                    <TableCell>{campaign.campaignType}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.region}</Badge>
                    </TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell className="text-right">
                      ${num(campaign.forecastedCost, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{num(campaign.expectedLeads, 0)}</TableCell>
                    <TableCell className="text-right">
                      ${num(campaign.pipelineForecast, 0).toLocaleString()}
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

// Simple Budget Overview
function SimpleBudgetOverview({ campaigns }: { campaigns: Campaign[] }): JSX.Element {
  const budgets = {
    "Tomoko Tanaka": { region: "JP & Korea", budget: 358000 },
    "Beverly Leung": { region: "South APAC", budget: 385500 },
    "Shruti Narang": { region: "SAARC", budget: 265000 },
    "Giorgia Parham": { region: "Digital", budget: 68000 },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BuildingOffice className="h-5 w-5" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {Object.entries(budgets).map(([owner, { region, budget }]) => {
            const used = campaigns
              .filter(c => c.owner === owner)
              .reduce((sum, c) => sum + num(c.forecastedCost, 0), 0);
            const remaining = budget - used;
            
            return (
              <div key={owner} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{owner}</h4>
                    <p className="text-sm text-muted-foreground">{region}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">
                      ${used.toLocaleString()} / ${budget.toLocaleString()}
                    </p>
                    <p className={`text-xs ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {remaining < 0 ? `Over by $${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()} remaining`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Main App Component
export default function App(): JSX.Element {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Initialize with sample data using useKV for persistence
  const [persistedCampaigns, setPersistedCampaigns] = useKV<Campaign[]>('marketing-campaigns', sampleCampaigns);
  
  // Sync with persisted data on mount
  useEffect(() => {
    setCampaigns(persistedCampaigns);
  }, [persistedCampaigns]);

  const totals = campaigns.reduce(
    (acc, campaign) => {
      acc.totalCost += num(campaign.forecastedCost, 0);
      acc.totalLeads += num(campaign.expectedLeads, 0);
      acc.totalPipeline += num(campaign.pipelineForecast, 0);
      return acc;
    }, 
    { totalCost: 0, totalLeads: 0, totalPipeline: 0 }
  );

  const roi = totals.totalCost > 0 ? (totals.totalPipeline / totals.totalCost) : 0;

  // Test notification on mount
  useEffect(() => {
    console.log("App mounted successfully!");
    notify.success("Marketing Campaign Planner loaded successfully!");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      
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
              Planning
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
            <CampaignList campaigns={campaigns} />
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Campaign Execution</h2>
              <p className="text-muted-foreground">
                Track actual results and execution status
              </p>
            </div>
            <CampaignList campaigns={campaigns} />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
              <p className="text-muted-foreground">
                Track regional budget allocations and spending
              </p>
            </div>
            <SimpleBudgetOverview campaigns={campaigns} />
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
}