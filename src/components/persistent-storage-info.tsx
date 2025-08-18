import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, GitBranch, FileJs, Users, CloudArrowUp, ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useKV } from '@github/spark/hooks';

export function PersistentStorageInfo({ campaigns = [] }) {
  const [kvCampaigns, setKvCampaigns] = useKV('campaignData', []);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Handle manual force sync to share data with all users
  const forceSync = () => {
    if (!campaigns || !Array.isArray(campaigns)) {
      toast.error("No campaign data available to sync");
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Create a clean copy to avoid reference issues
      const cleanCopy = JSON.parse(JSON.stringify(campaigns));
      
      // Update KV store directly
      setKvCampaigns(cleanCopy);
      
      // Also use localStorage as a backup
      localStorage.setItem('campaignData', JSON.stringify(cleanCopy));
      
      // Dispatch a custom event that other components will listen for
      window.dispatchEvent(new CustomEvent('campaign:force-sync', { 
        detail: { campaigns: cleanCopy }
      }));
      
      toast.success(`Shared ${cleanCopy.length} campaigns with all users`);
      
      // Reset sync state after a delay
      setTimeout(() => setIsSyncing(false), 1000);
    } catch (error) {
      console.error("Error forcing campaign sync:", error);
      toast.error("Failed to sync campaign data");
      setIsSyncing(false);
    }
  };
  
  // Handle getting the latest data from other users
  const refreshFromKV = () => {
    if (!kvCampaigns || !Array.isArray(kvCampaigns)) {
      toast.error("No data available in shared storage");
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Dispatch a refresh event that will be handled by our hooks
      window.dispatchEvent(new CustomEvent('campaign:refresh'));
      
      toast.success("Refreshing data from shared storage...");
      
      // Reset sync state after a delay
      setTimeout(() => setIsSyncing(false), 1000);
    } catch (error) {
      console.error("Error refreshing from KV:", error);
      toast.error("Failed to refresh data");
      setIsSyncing(false);
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> Data Sharing Controls
        </CardTitle>
        <CardDescription>
          Manage how your campaign data is shared with other users
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <h3 className="font-medium">Share Data with All Users</h3>
            <p className="text-sm text-muted-foreground">
              Push your local campaign data to all other users of this Spark
            </p>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            onClick={forceSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <CloudArrowUp className="h-4 w-4" /> 
            {isSyncing ? "Syncing..." : `Share ${campaigns.length} Campaigns`}
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <h3 className="font-medium">Get Latest Data</h3>
            <p className="text-sm text-muted-foreground">
              Pull the latest campaign data added by other users
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshFromKV}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <ArrowsClockwise className="h-4 w-4" /> 
            {isSyncing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Storage Information</h3>
          
          <div className="rounded-md bg-muted p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" /> Shared Storage
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your campaign data is stored in GitHub Spark's shared KV store.
              All users of this Spark can see and collaborate on the same data.
            </p>
            <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
              const [campaigns, setCampaigns] = useKV("campaignData", [])
            </div>
          </div>
          
          <div className="rounded-md bg-muted p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <GitBranch className="h-4 w-4" /> Local Storage (Backup)
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Campaign data is also backed up to browser local storage for offline use.
              This is primarily for compatibility with older versions of the app.
            </p>
            <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
              localStorage.setItem("campaignData", JSON.stringify(campaigns))
            </div>
          </div>
          
          <div className="rounded-md bg-muted p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileJs className="h-4 w-4" /> Regional Budgets
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Regional budget assignments are also stored in the shared KV store.
              All users see the same budget allocations and status.
            </p>
            <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
              const [budgets, setBudgets] = useKV("regionalBudgets", DEFAULT_BUDGETS)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}