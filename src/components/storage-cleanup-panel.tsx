import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash, ArrowClockwise, Info, Warning, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { 
  getStorageStats, 
  formatBytes, 
  clearAllStorage, 
  getStorageRecommendations,
  clearStorageByPattern,
  type StorageStats 
} from "@/utils/storage-monitor";
import { StorageDebug } from "@/components/storage-debug";

export function StorageCleanupPanel() {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    refreshStorageStats();
  }, []);

  const refreshStorageStats = () => {
    setRefreshing(true);
    try {
      const stats = getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error getting storage stats:', error);
      toast.error('Failed to analyze storage');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearAllStorage = () => {
    try {
      clearAllStorage();
      toast.success("All browser storage and cookies cleared");
      setTimeout(() => {
        refreshStorageStats();
        // Force page reload to reset application state
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to clear storage");
    }
  };

  const handleClearSpecificKey = (key: string) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      refreshStorageStats();
      toast.success(`Cleared ${key}`);
    } catch (error) {
      toast.error(`Failed to clear ${key}`);
    }
  };

  const handleClearOldData = () => {
    try {
      // Clear common legacy keys that might cause issues
      const cleared = clearStorageByPattern('temp,cache,old,backup,legacy');
      refreshStorageStats();
      toast.success(`Cleared ${cleared} legacy storage items`);
    } catch (error) {
      toast.error("Failed to clear legacy data");
    }
  };

  if (!storageStats) {
    return <div className="p-4">Loading storage analysis...</div>;
  }

  const recommendations: string[] = [];
  const isHealthy = !storageStats.isNearLimit;
  const isOverLimit = storageStats.totalSize > 10000000; // 10MB threshold

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isHealthy ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Warning className="h-5 w-5 text-orange-600" />
            )}
            Storage Health Analysis
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshStorageStats}
              disabled={refreshing}
              className="ml-auto"
            >
              <ArrowClockwise className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOverLimit && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical:</strong> Storage is {formatBytes(storageStats.totalSize)} 
                and may cause HTTP 431 errors or deployment failures. Clear storage immediately.
              </AlertDescription>
            </Alert>
          )}

          {storageStats.isNearLimit && !isOverLimit && (
            <Alert>
              <Warning className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Storage is {formatBytes(storageStats.totalSize)} 
                and approaching limits. Consider clearing data to prevent issues.
              </AlertDescription>
            </Alert>
          )}

          {isHealthy && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Storage is healthy at {formatBytes(storageStats.totalSize)}. 
                No immediate action required.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{formatBytes(storageStats.totalSize)}</div>
              <div className="text-sm text-muted-foreground">Total Storage Used</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{(storageStats as any).items?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Storage Items</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {(() => {
                  const items = (storageStats as any).items;
                  const campaignItem = items?.find((item: any) => item.key === 'campaignData');
                  return campaignItem ? formatBytes(campaignItem.size) : '0 Bytes';
                })()}
              </div>
              <div className="text-sm text-muted-foreground">Campaign Data</div>
            </div>
          </div>
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Recommendations:</div>
              <ul className="space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(storageStats as any).items && (storageStats as any).items.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Storage Breakdown:</div>
              <div className="space-y-1">
                {(storageStats as any).items.slice(0, 15).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded">
                    <span className="truncate flex-1 mr-2">{item.key}</span>
                    <Badge variant="outline" className="text-xs mr-2">
                      {item.type === 'localStorage' ? 'Local' : 'Session'}
                    </Badge>
                    <span className="font-mono mr-2">{formatBytes(item.size)}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleClearSpecificKey(item.key)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash className="h-5 w-5" />
            Storage Cleanup Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={handleClearAllStorage} 
              variant={isOverLimit ? "destructive" : "outline"}
              className="w-full"
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear All Storage & Cookies
            </Button>
            
            <Button 
              onClick={handleClearOldData}
              variant="outline" 
              className="w-full"
            >
              <ArrowClockwise className="h-4 w-4 mr-2" />
              Clear Legacy Data
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            <strong>Clear All:</strong> Removes all localStorage, sessionStorage, and cookies. 
            Recommended for HTTP 431 errors.<br/>
            <strong>Clear Legacy:</strong> Removes old/temporary data that may be causing conflicts.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <Button 
              onClick={() => setShowDebug(!showDebug)} 
              variant="ghost" 
              size="sm"
            >
              <Info className="h-4 w-4 mr-2" />
              {showDebug ? 'Hide' : 'Show'} Debug
            </Button>
          </CardTitle>
        </CardHeader>
        {showDebug && (
          <CardContent>
            <StorageDebug />
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prevention & Best Practices</CardTitle>
        </CardHeader>
          <CardTitle>Prevention & Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <p>To prevent HTTP 431 errors and storage issues:</p>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            <li>Export campaign data to CSV regularly</li>
            <li>Monitor storage size using this panel</li>
            <li>Clear browser storage monthly</li>
            <li>Avoid storing extremely large datasets</li>
            <li>Use incognito mode for testing large imports</li>
            <li>Clear storage before major data imports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
        <CardContent>
          <p>To prevent HTTP 431 errors and storage issues:</p>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            <li>Export campaign data to CSV regularly</li>
            <li>Monitor storage size using this panel</li>
            <li>Clear browser storage monthly</li>
            <li>Avoid storing extremely large datasets</li>
            <li>Use incognito mode for testing large imports</li>
            <li>Clear storage before major data imports</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
