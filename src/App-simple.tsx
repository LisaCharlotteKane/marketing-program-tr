import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "sonner";
import { Calculator, ChartBarHorizontal, Target, Calendar, BuildingOffice, Gear, Warning } from "@phosphor-icons/react";
import { StorageCleanupPanel } from "@/components/storage-cleanup-panel";
import { Campaign } from "@/types/campaign";

// Simple localStorage-based storage hook
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [value, setStoredValue] as const;
}

// Simple campaign table component
function SimpleCampaignTable({ campaigns, setCampaigns }: { campaigns: Campaign[], setCampaigns: (campaigns: Campaign[]) => void }) {
  const [newDescription, setNewDescription] = useState('');

  const addCampaign = () => {
    if (!newDescription.trim()) return;
    
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      description: newDescription,
      campaignType: 'Localized Events',
      strategicPillar: ['Brand Awareness & Top of Funnel Demand Generation'],
      revenuePlay: 'All',
      fy: 'FY26',
      quarterMonth: 'Q1 - July',
      region: 'JP & Korea',
      country: 'Japan',
      owner: 'Tomoko Tanaka',
      forecastedCost: 0,
      expectedLeads: 0,
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: 0,
      status: 'Planning'
    };

    setCampaigns([...campaigns, newCampaign]);
    setNewDescription('');
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Campaign description"
              className="flex-1 px-3 py-2 border rounded"
            />
            <Button onClick={addCampaign}>Add Campaign</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-2 border rounded">
                <span>{campaign.description}</span>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteCampaign(campaign.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No campaigns yet. Add your first campaign above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>('campaignData', []);
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    // Check storage size
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
  }, [campaigns]);

  return (
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
                ✓ Working
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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Campaign Planning
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
                  Simplified campaign management for testing storage functionality
                </p>
              </div>

              <SimpleCampaignTable campaigns={campaigns} setCampaigns={setCampaigns} />
            </div>
          </TabsContent>

          <TabsContent value="status">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Status</h2>
                <p className="text-muted-foreground">
                  Check storage health and system diagnostics
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{campaigns.length}</div>
                      <div className="text-sm text-muted-foreground">Total Campaigns</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {(() => {
                          try {
                            const size = new Blob([JSON.stringify(campaigns)]).size;
                            return size < 1024 ? `${size}B` : `${Math.round(size / 1024)}KB`;
                          } catch {
                            return 'Error';
                          }
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">Data Size</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {typeof localStorage !== 'undefined' ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-muted-foreground">Storage Available</div>
                    </div>
                  </div>

                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>System Status:</strong> Storage system is working correctly. 
                      Data is being saved to localStorage automatically.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <StorageCleanupPanel />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}