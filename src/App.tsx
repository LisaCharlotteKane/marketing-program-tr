import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toaster } from "sonner";
import { Calculator, ChartBarHorizontal, Target, Calendar, Building, Gear } from "@phosphor-icons/react";
import { CampaignTable } from "@/components/campaign-table";
import { ExecutionTracking } from "@/components/execution-tracking";
import { ReportingDashboard } from "@/components/reporting-dashboard";
import { CampaignCalendarView } from "@/components/campaign-calendar-view";
import { BudgetManagement } from "@/components/budget-management";
import { StorageCleanupPanel } from "@/components/storage-cleanup-panel";
import { ErrorBoundary } from "@/components/error-boundary-simple";
import { initStorageCleanup } from "@/lib/storage-cleanup";
import { clearProblematicCookies } from "@/lib/cookie-cleanup";

export default function App() {
  useEffect(() => {
    clearProblematicCookies();
    initStorageCleanup();
  }, []);

  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('campaignData');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.warn('Failed to load campaign data:', error);
      return [];
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('campaignData', JSON.stringify(campaigns));
      } catch (error) {
        console.warn('Failed to save campaigns to localStorage:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [campaigns]);

  useEffect(() => {
    try {
      const problematicKeys = [
        'spark-kv-campaignData',
        'github-auth-token',
        'kvStore-cache',
        'campaign-sync-data',
        'persistentCampaigns'
      ];

      problematicKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      const campaignData = localStorage.getItem('campaignData');
      if (campaignData && campaignData.length > 100000) {
        console.warn('Large campaign data detected, reducing size...');
        const parsed = JSON.parse(campaignData);
        if (Array.isArray(parsed) && parsed.length > 100) {
          const reduced = parsed.slice(0, 100);
          localStorage.setItem('campaignData', JSON.stringify(reduced));
          setCampaigns(reduced);
        }
      }
    } catch (error) {
      console.warn('Storage cleanup failed:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background">
        <Toaster position="top-right" richColors />

        <header className="border-b shadow-sm bg-card">
          <div className="container mx-auto p-4">
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
                  {Array.isArray(campaigns) ? campaigns.length : 0} campaigns
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Gear className="h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
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
                <Building className="h-4 w-4" />
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

                <CampaignTable campaigns={campaigns} setCampaigns={setCampaigns} />

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

                <ExecutionTracking campaigns={campaigns} setCampaigns={setCampaigns} />
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

                <ReportingDashboard campaigns={campaigns} />
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

                <CampaignCalendarView campaigns={campaigns} />
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

                <BudgetManagement campaigns={campaigns} />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ErrorBoundary>
  );
}
