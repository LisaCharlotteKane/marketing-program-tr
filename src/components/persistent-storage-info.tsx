import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoCircle, CloudCheck, Database } from "@phosphor-icons/react";
import { countTotalSavedCampaigns } from "@/services/persistent-storage";
import { Badge } from "@/components/ui/badge";

export function PersistentStorageInfo() {
  const [storageSummary, setStorageSummary] = useState({
    totalCampaigns: 0,
    lastSaved: null as Date | null,
    storageType: "local",
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
        
        // Determine storage type
        const storageType = window.indexedDB ? "multi-layer" : "local";
        
        setStorageSummary({
          totalCampaigns,
          lastSaved,
          storageType,
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
  const formatLastSaved = () => {
    if (!storageSummary.lastSaved) return "Never";
    
    const now = new Date();
    const diffMs = now.getTime() - storageSummary.lastSaved.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) {
      return `${diffSecs} seconds ago`;
    } else if (diffSecs < 3600) {
      return `${Math.floor(diffSecs / 60)} minutes ago`;
    } else if (diffSecs < 86400) {
      return `${Math.floor(diffSecs / 3600)} hours ago`;
    } else {
      return storageSummary.lastSaved.toLocaleDateString();
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" /> Local Storage Status
        </CardTitle>
        <CardDescription>
          Your campaign data is automatically saved in your browser
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              <h3 className="font-medium">Last Auto-Save</h3>
              <Badge variant="outline">
                {formatLastSaved()}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Data is saved automatically after changes
            </p>
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
              <p className="mt-2 text-xs text-muted-foreground">
                For team collaboration, use the GitHub sync option above.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}