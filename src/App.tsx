import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "sonner";
import { Calculator, ChartBarHorizontal, Target, Calendar, BuildingOffice, Gear, Warning, ChartBar, ClipboardText, Funnel, X, PencilSimple, Copy, FloppyDisk } from "@phosphor-icons/react";
import { useKV } from "@/hooks/useKV";
import { StorageCleanupPanel } from "@/components/storage-cleanup-panel";
import { SharedStorageStatus } from "@/components/shared-storage-status";
import { DataSyncStatus } from "@/components/data-sync-status";
import { ErrorBoundary } from "@/components/error-boundary-simple";
import { CampaignManager } from "@/components/campaign-manager";
import { ExecutionTracking } from "@/components/execution-tracking";
import { ReportingDashboard } from "@/components/reporting-dashboard";
import { CampaignCalendarView } from "@/components/campaign-calendar-view";
import { BudgetManagement } from "@/components/budget-management";
import { Campaign } from "@/types/campaign";

// Simple campaign table component
function QuickStatsCard({ campaigns }: { campaigns: Campaign[] }) {
  const totals = campaigns.reduce((acc, campaign) => {
    acc.forecastedCost += Number(campaign.forecastedCost) || 0;
    acc.expectedLeads += Number(campaign.expectedLeads) || 0;
    acc.pipelineForecast += campaign.pipelineForecast || 0;
    return acc;
  }, {
    forecastedCost: 0,
    expectedLeads: 0,
    pipelineForecast: 0
  });

  const roi = totals.forecastedCost > 0 ? (totals.pipelineForecast / totals.forecastedCost) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-primary">{campaigns.length}</div>
          <div className="text-sm text-muted-foreground">Total Campaigns</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">${totals.forecastedCost.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Forecasted Spend</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">${totals.pipelineForecast.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Pipeline Forecast</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600">{roi.toFixed(1)}x</div>
          <div className="text-sm text-muted-foreground">ROI Multiple</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  // Use shared KV storage with global scope for cross-user data sharing
  const [campaigns, setCampaigns] = useKV<Campaign[]>('shared-campaign-data', [], { scope: 'global' });
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    // For shared storage, we don't need to check localStorage size as extensively
    // Just check if there are potential performance issues with data size
    const checkDataSize = () => {
      try {
        const dataSize = new Blob([JSON.stringify(campaigns)]).size;
        setStorageWarning(dataSize > 2 * 1024 * 1024); // 2MB threshold for campaign data
      } catch (error) {
        console.warn('Could not check data size:', error);
      }
    };

    checkDataSize();
  }, [campaigns]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background">
        <Toaster position="top-right" richColors />

        <header className="border-b shadow-sm bg-card">
          <div className="container mx-auto p-4">
            {storageWarning && (
              <Alert variant="destructive" className="mb-4">
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  <strong>Data Size Warning:</strong> Campaign data is large and may affect performance.
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="ml-2 p-0 h-auto text-destructive underline">
                        Open Settings to manage data
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Data Management</DialogTitle>
                      </DialogHeader>
                      <StorageCleanupPanel />
                    </DialogContent>
                  </Dialog>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Marketing Campaign Planner</h1>
                  <p className="text-sm text-muted-foreground">APAC Marketing Operations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DataSyncStatus campaigns={campaigns} />
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {campaigns.length} campaigns
                </div>
                <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                  ✓ Global Shared Access
                </div>
                {storageWarning && (
                  <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200">
                    ⚠ Large Dataset
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Gear className="h-4 w-4" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>App Settings & Data Management</DialogTitle>
                    </DialogHeader>
                    <StorageCleanupPanel />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4">
          <Tabs defaultValue="planning" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="planning" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Campaign Planning
              </TabsTrigger>
              <TabsTrigger value="execution" className="flex items-center gap-2">
                <ClipboardText className="h-4 w-4" />
                Execution Tracking
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                Reporting
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <BuildingOffice className="h-4 w-4" />
                Budget Management
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                System Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planning">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Planning</h2>
                  <p className="text-muted-foreground">
                    Plan and manage marketing campaigns with ROI calculations
                  </p>
                </div>

                <QuickStatsCard campaigns={campaigns} />

                <ErrorBoundary>
                  <CampaignManager campaigns={campaigns} setCampaigns={setCampaigns} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="execution">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Execution Tracking</h2>
                  <p className="text-muted-foreground">
                    Track campaign execution status, costs, and performance metrics
                  </p>
                </div>

                <ErrorBoundary>
                  <ExecutionTracking campaigns={campaigns} setCampaigns={setCampaigns} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="reporting">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Reporting</h2>
                  <p className="text-muted-foreground">
                    View performance metrics and analytics
                  </p>
                </div>

                <ErrorBoundary>
                  <ReportingDashboard campaigns={campaigns} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="budget">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
                  <p className="text-muted-foreground">
                    Track regional budget allocations and spending across campaigns
                  </p>
                </div>

                <ErrorBoundary>
                  <BudgetManagement campaigns={campaigns} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Calendar</h2>
                  <p className="text-muted-foreground">
                    View campaigns organized by fiscal year timeline
                  </p>
                </div>

                <ErrorBoundary>
                  <CampaignCalendarView campaigns={campaigns} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">System Status</h2>
                  <p className="text-muted-foreground">
                    Check storage health and manage browser data
                  </p>
                </div>

                <SharedStorageStatus campaigns={campaigns} />

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Global Shared Storage Active:</strong> Campaign data is now shared globally across all logged-in users. 
                        All team members can view, edit, and collaborate on the same campaign data in real-time. 
                        No user restrictions - everyone has full access to all campaigns.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <ErrorBoundary>
                  <StorageCleanupPanel />
                </ErrorBoundary>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ErrorBoundary>
  );
}
