import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash, ArrowClockwise, Info } from "@phosphor-icons/react";
import { toast } from "sonner";
import { clearAllAppData, resetAppStorage } from "@/lib/cookie-cleanup";
import { cleanupStorage, getStorageInfo } from "@/lib/storage-cleanup";

export function StorageCleanupPanel() {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStorageInfo = () => {
    const info = getStorageInfo();
    setStorageInfo(info);
  };

  const handleQuickCleanup = async () => {
    setIsLoading(true);
    try {
      const result = cleanupStorage();
      if (result.cleaned) {
        toast.success(`Cleaned up ${result.totalCleaned}KB of storage`);
      } else {
        toast.info('No cleanup needed - storage is already optimized');
      }
      refreshStorageInfo();
    } catch (error) {
      toast.error('Cleanup failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullCleanup = async () => {
    setIsLoading(true);
    try {
      const result = clearAllAppData();
      if (result.success) {
        toast.success('All app data cleared successfully');
        // Reload the page after clearing data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error('Cleanup failed: ' + result.message);
      }
    } catch (error) {
      toast.error('Cleanup failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullReset = async () => {
    if (confirm('This will completely reset the app and reload the page. Continue?')) {
      setIsLoading(true);
      try {
        const result = resetAppStorage();
        if (result.success) {
          toast.success('Complete reset successful - reloading...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('Reset failed: ' + result.message);
        }
      } catch (error) {
        toast.error('Reset failed: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    refreshStorageInfo();
  }, []);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash className="h-5 w-5" />
          Storage Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            If you're experiencing HTTP 431 "Request Header Fields Too Large" errors, 
            these tools can help clean up problematic data that might be causing the issue.
          </AlertDescription>
        </Alert>

        {storageInfo && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Local Storage</h4>
              <Badge variant="outline">{storageInfo.localStorage.usedKB}KB used</Badge>
              <div className="text-xs text-muted-foreground">
                {storageInfo.localStorage.items.length} items
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Session Storage</h4>
              <Badge variant="outline">{storageInfo.sessionStorage.usedKB}KB used</Badge>
              <div className="text-xs text-muted-foreground">
                {storageInfo.sessionStorage.items.length} items
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Quick Cleanup</h4>
              <p className="text-sm text-muted-foreground">
                Remove large storage items while preserving campaign data
              </p>
            </div>
            <Button 
              onClick={handleQuickCleanup} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <ArrowClockwise className="h-4 w-4 animate-spin" /> : 'Clean Up'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Clear App Data</h4>
              <p className="text-sm text-muted-foreground">
                Remove all app-related storage and cookies
              </p>
            </div>
            <Button 
              onClick={handleFullCleanup} 
              disabled={isLoading}
              variant="secondary"
            >
              Clear Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Complete Reset</h4>
              <p className="text-sm text-muted-foreground text-destructive">
                Nuclear option: clear everything and restart
              </p>
            </div>
            <Button 
              onClick={handleFullReset} 
              disabled={isLoading}
              variant="destructive"
            >
              Full Reset
            </Button>
          </div>
        </div>

        <Button 
          onClick={refreshStorageInfo} 
          variant="ghost" 
          size="sm"
          className="w-full"
        >
          <ArrowClockwise className="h-4 w-4 mr-2" />
          Refresh Storage Info
        </Button>
      </CardContent>
    </Card>
  );
}