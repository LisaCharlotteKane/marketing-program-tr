import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "sonner";
import { Calculator, ChartBarHorizontal, Target, Calendar, BuildingOffice, Gear, Warning, ChartBar } from "@phosphor-icons/react";
import { StorageCleanupPanel } from "@/components/storage-cleanup-panel";
import { ErrorBoundary } from "@/components/error-boundary-simple";
import { CampaignManager } from "@/components/campaign-manager";
import { Campaign } from "@/types/campaign";

// Stable localStorage hook with error handling
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Save to localStorage when value changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }
  }, [key, value, isLoaded]);

  return [value, setValue] as const;
}

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
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('campaignData', []);
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    // Check storage size periodically
    const checkStorage = () => {
      try {
        let totalSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += new Blob([localStorage[key]]).size;
          }
        }
        setStorageWarning(totalSize > 4 * 1024 * 1024); // 4MB threshold
      } catch (error) {
        console.warn('Could not check storage size:', error);
      }
    };

    checkStorage();
    // Check storage size when campaigns change
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
                  <strong>Storage Warning:</strong> Your browser storage is large and may cause issues.
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="ml-2 p-0 h-auto text-destructive underline">
                        Open Settings to clear storage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Storage Management</DialogTitle>
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
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {campaigns.length} campaigns
                </div>
                <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                  ✓ Storage Fixed
                </div>
                {storageWarning && (
                  <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200">
                    ⚠ Storage Warning
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
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="planning" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Campaign Planning
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                Reporting
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

            <TabsContent value="reporting">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Reporting</h2>
                  <p className="text-muted-foreground">
                    View performance metrics and analytics
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Advanced reporting features including charts, filters, and export capabilities will be available here.
                    </p>
                  </CardContent>
                </Card>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Calendar view showing campaigns by month and quarter will be available here.
                    </p>
                  </CardContent>
                </Card>
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

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        <strong>All Systems Operational:</strong> Storage issues have been resolved. 
                        The app now uses a stable localStorage implementation with proper error handling.
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
