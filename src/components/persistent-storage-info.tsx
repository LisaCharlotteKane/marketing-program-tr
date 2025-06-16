import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoCircle, CloudCheck, Database, GithubLogo, ChartDonut } from "@phosphor-icons/react";
import { countTotalSavedCampaigns } from "@/services/persistent-storage";
import { Badge } from "@/components/ui/badge";
import { isAutoGitHubSyncAvailable } from "@/services/auto-github-sync";

export function PersistentStorageInfo() {
  const [storageSummary, setStorageSummary] = useState({
    totalCampaigns: 0,
    lastSaved: null as Date | null,
    lastBudgetSaved: null as Date | null,
    storageType: "local",
    githubSyncActive: false
  });
  
  // Get storage information on mount
  useEffect(() => {
    const updateStorageSummary = async () => {
      try {
        // Get campaign count
        const totalCampaigns = await countTotalSavedCampaigns();
        
        // Get last saved timestamp
        let lastSaved: Date | null = null;
        try {
          const statusStr = localStorage.getItem('autoSaveStatus');
          if (statusStr) {
            const status = JSON.parse(statusStr);
            if (status.timestamp) {
              lastSaved = new Date(status.timestamp);
            }
          }
        } catch (e) {
          console.error("Error parsing last save status:", e);
        }
        
        // Get last budget saved timestamp
        let lastBudgetSaved: Date | null = null;
        try {
          const statusStr = localStorage.getItem('budgetSaveStatus');
          if (statusStr) {
            const status = JSON.parse(statusStr);
            if (status.timestamp) {
              lastBudgetSaved = new Date(status.timestamp);
            }
          }
        } catch (e) {
          console.error("Error parsing budget save status:", e);
        }
        
        // Determine storage type
        const storageType = window.indexedDB ? "multi-layer" : "local";
        
        // Check if GitHub sync is active
        const githubSyncActive = isAutoGitHubSyncAvailable();
        
        setStorageSummary({
          totalCampaigns,
          lastSaved,
          lastBudgetSaved,
          storageType,
          githubSyncActive
        });
      } catch (error) {
        console.error("Error getting storage summary:", error);
      }
    };
    
    updateStorageSummary();
    
    // Update every 30 seconds
    const interval = setInterval(updateStorageSummary, 30000);
    
    // Listen for save events
    const handleSaveEvent = () => {
      updateStorageSummary();
    };
    
    window.addEventListener('campaignDataSaved', handleSaveEvent);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('campaignDataSaved', handleSaveEvent);
    };
  }, []);
  
  // Format the last saved time
  const formatLastSaved = (date: Date | null) => {
    if (!date) return "Never";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) {
      return `${diffSecs} seconds ago`;
    } else if (diffSecs < 3600) {
      return `${Math.floor(diffSecs / 60)} minutes ago`;
    } else if (diffSecs < 86400) {
      return `${Math.floor(diffSecs / 3600)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" /> Local Storage Status
        </CardTitle>
        <CardDescription>
          Your campaign and budget data is automatically saved in your browser
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-lg border p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Storage Type</h3>
              <Badge variant="outline" className="capitalize">
                {storageSummary.storageType}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {storageSummary.storageType === "multi-layer" 
                ? "Using IndexedDB + localStorage"
                : "Using localStorage only"}
            </p>
          </div>
          
          <div className="rounded-lg border p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Campaigns</h3>
              <Badge variant="outline">
                {storageSummary.totalCampaigns}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Total campaigns in local storage
            </p>
          </div>
          
          <div className="rounded-lg border p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Campaign Save</h3>
              <Badge variant="outline">
                {formatLastSaved(storageSummary.lastSaved)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Campaigns auto-saved
            </p>
          </div>
          
          <div className="rounded-lg border p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Budget Save</h3>
              <Badge variant="outline">
                {formatLastSaved(storageSummary.lastBudgetSaved)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Budgets auto-saved
            </p>
          </div>
          
          <div className="rounded-lg border p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">GitHub Sync</h3>
              <Badge variant={storageSummary.githubSyncActive ? "default" : "outline"} className={`capitalize ${storageSummary.githubSyncActive ? 'bg-green-500 hover:bg-green-500/90' : ''}`}>
                {storageSummary.githubSyncActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
              {storageSummary.githubSyncActive ? (
                <>
                  <GithubLogo className="h-3.5 w-3.5" /> Auto-sync to GitHub enabled
                </>
              ) : (
                "Not configured in GitHub Sync tab"
              )}
            </p>
          </div>
        </div>
        
        <div className="rounded-lg border bg-green-50 p-3 mt-4" style={{ display: storageSummary.githubSyncActive ? 'block' : 'none' }}>
          <div className="flex items-start gap-3">
            <GithubLogo className="h-5 w-5 text-gray-800 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">GitHub Auto-Sync Active</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Your campaign and budget data is now automatically syncing to GitHub with the provided token.
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Auto-sync happens in the background with each edit</li>
                  <li>Campaign data syncs to: <code>campaign-data/campaigns.json</code></li>
                  <li>Budget data syncs to: <code>campaign-data/budgets.json</code></li>
                  <li>A GitHub repository name and owner must be configured in the GitHub Sync tab</li>
                  <li>You can still use the manual GitHub Sync controls for specific operations</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-start gap-3">
            <InfoCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">About Browser Storage</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                All data is automatically saved to your browser's local storage. This means:
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Data persists even if you close your browser or refresh the page</li>
                  <li>Data is stored only on your device and not on any server</li>
                  <li>Clearing browser data/cookies will delete your saved campaigns</li>
                  <li>Different browsers/devices will have separate data</li>
                </ul>
              </p>
              <p className="mt-2 text-xs text-muted-foreground flex gap-1 items-center font-medium">
                <CloudCheck className="h-3.5 w-3.5 text-green-600" />
                For data backup, use the GitHub Sync feature or export options.
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-yellow-50 p-3">
          <div className="flex items-start gap-3">
            <InfoCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Using GitHub Sync</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                <strong>Important:</strong> GitHub sync requires:
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>A valid GitHub personal access token with repo scope</li>
                  <li>Owner name and repository name that you have write access to</li>
                  <li>The repository must already exist (cannot be created through this tool)</li>
                </ul>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                If you encounter "Not Found" errors, please verify the repository exists and your token has proper permissions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}