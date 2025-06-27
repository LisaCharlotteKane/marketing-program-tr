import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, GitBranch, FileJson, Users, CloudArrowUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function PersistentStorageInfo({ campaigns = [] }) {
  // Handle manual force sync
  const forceSync = () => {
    if (!campaigns || !Array.isArray(campaigns)) {
      toast.error("No campaign data available to sync");
      return;
    }
    
    try {
      // Dispatch a custom event that our DataSharingService component will handle
      window.dispatchEvent(new CustomEvent('campaign:force-sync', { 
        detail: { campaigns }
      }));
      
      // Also use localStorage as a backup
      localStorage.setItem('campaignData', JSON.stringify(campaigns));
      
      toast.success(`Synced ${campaigns.length} campaigns to shared storage`);
    } catch (error) {
      console.error("Error forcing campaign sync:", error);
      toast.error("Failed to sync campaign data");
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> Storage Information
        </CardTitle>
        <CardDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>How your campaign data is stored and persisted</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={forceSync}
            className="flex items-center gap-1 text-xs whitespace-nowrap"
          >
            <CloudArrowUp className="h-3.5 w-3.5" /> Force Sync Data
          </Button>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" /> Shared Storage
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Your campaign data is stored in GitHub Spark's shared KV store.
            All users of this Spark can see and collaborate on the same data.
          </p>
          <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
            const [campaigns, setCampaigns] = useKV("campaignData", [])
          </div>
        </div>
        
        <div className="rounded-md bg-muted p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> Local Storage (Backup)
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Campaign data is also backed up to browser local storage for offline use.
            This is primarily for compatibility with older versions of the app.
          </p>
          <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
            localStorage.setItem("campaignData", JSON.stringify(campaigns))
          </div>
        </div>
        
        <div className="rounded-md bg-muted p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <FileJson className="h-4 w-4" /> Regional Budgets
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Regional budget assignments are also stored in the shared KV store.
            All users see the same budget allocations and status.
          </p>
          <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
            const [budgets, setBudgets] = useKV("regionalBudgets", DEFAULT_BUDGETS)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}