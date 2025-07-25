import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "sonner";
import { Calculator, ChartBarHorizontal, Target, Calendar, Buildings, Gear, Warning } from "@phosphor-icons/react";
import { CampaignTable } from "@/components/campaign-table";
import { ExecutionTracking } from "@/components/execution-tracking";
import { ReportingDashboard } from "@/components/reporting-dashboard";
import { CampaignCalendarView } from "@/components/campaign-calendar-view";
import { BudgetManagement } from "@/components/budget-management";
import { StorageCleanupPanel } from "@/components/storage-cleanup-panel";
import { ErrorBoundary } from "@/components/error-boundary-simple";
import { useKV } from '@/hooks/useKVStorage';
import { Campaign } from "@/types/campaign";

export default function App() {
  // Use shared storage for campaigns data - this enables sharing across users
  const [campaigns, setCampaigns] = useKV<Campaign[]>('campaignData', []);
  
  // Local state for UI management
  const [isLoading, setIsLoading] = useState(true);
  const [storageWarning, setStorageWarning] = useState(false);
  
  useEffect(() => {
    // Simple initialization - localStorage handles persistence
    setIsLoading(false);
    
    // Check storage size on load
    const checkStorageSize = () => {
      try {
        let totalSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += new Blob([localStorage[key]]).size;
          }
        }
        // Warn if storage is over 4MB
        setStorageWarning(totalSize > 4 * 1024 * 1024);
      } catch (error) {
        console.warn('Could not check storage size:', error);
      }
    };
    
    checkStorageSize();
  }, []);

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
                  <strong>Storage Warning:</strong> Your browser storage is large and may cause deployment issues. 
                  <Button variant="link" size="sm" className="ml-2 p-0 h-auto text-destructive underline">
                    Open Settings to clear storage
                  </Button>
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
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {Array.isArray(campaigns) ? campaigns.length : 0} campaigns (local)
                </div>
                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                  ✓ Local Storage
                </div>
                {storageWarning && (
                  <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200">
                    ⚠ Storage Full
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Gear className="h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>App Settings & Storage Management</DialogTitle>
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
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="planning" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Planning
              </TabsTrigger>
              <TabsTrigger value="execution" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Execution
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-2">
                <ChartBarHorizontal className="h-4 w-4" />
                Reporting
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <Buildings className="h-4 w-4" />
                Budget
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planning">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Campaign Planning</h2>
                    <p className="text-muted-foreground">
                      Plan and forecast marketing campaign performance across APAC regions
                    </p>
                  </div>
                </div>

                <ErrorBoundary>
                  <CampaignTable campaigns={campaigns || []} setCampaigns={setCampaigns} />
                </ErrorBoundary>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Auto-Calculated Metrics</CardTitle>
                    <CardDescription>
                      Based on "Expected Leads," we automatically calculate performance forecasts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium">MQL Forecast</div>
                        <div className="text-muted-foreground">10% of Expected Leads</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">SQL Forecast</div>
                        <div className="text-muted-foreground">6% of Expected Leads</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium"># Opportunities</div>
                        <div className="text-muted-foreground">80% of SQL Forecast</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">Pipeline Forecast</div>
                        <div className="text-muted-foreground"># Opportunities × $50K</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="execution">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Execution Tracking</h2>
                  <p className="text-muted-foreground">
                    Update campaign status and track actual performance metrics
                  </p>
                </div>

                <ErrorBoundary>
                  <ExecutionTracking campaigns={campaigns || []} setCampaigns={setCampaigns} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="reporting">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Performance</h2>
                  <p className="text-muted-foreground">
                    Analyze forecasted vs actual performance across regions and campaigns
                  </p>
                </div>

                <ErrorBoundary>
                  <ReportingDashboard campaigns={campaigns || []} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Calendar</h2>
                  <p className="text-muted-foreground">
                    Visual timeline of all campaigns organized by fiscal year and quarter
                  </p>
                </div>

                <ErrorBoundary>
                  <CampaignCalendarView campaigns={campaigns || []} />
                </ErrorBoundary>
              </div>
            </TabsContent>

            <TabsContent value="budget">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
                  <p className="text-muted-foreground">
                    Track budget allocation and spending across regions and campaign owners
                  </p>
                </div>

                <ErrorBoundary>
                  <BudgetManagement campaigns={campaigns || []} />
                </ErrorBoundary>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ErrorBoundary>
  );
}
