import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash, ArrowClockwise, Info } from "@phosphor-icons/react";
import { getStorageUsage, emergencyCleanup } from "@/lib/storage-cleanup";
import { clearAllCookies } from "@/lib/cookie-cleanup";
import { toast } from "sonner";

export function StorageCleanupPanel() {
  const [storageInfo, setStorageInfo] = useState(getStorageUsage());

  const refreshStorageInfo = () => {
    setStorageInfo(getStorageUsage());
  };

  const handleEmergencyCleanup = () => {
    const success = emergencyCleanup();
    if (success) {
      toast.success("Emergency cleanup completed");
      refreshStorageInfo();
    } else {
      toast.error("Emergency cleanup failed");
    }
  };

  const handleClearCookies = () => {
    clearAllCookies();
    toast.success("All cookies cleared");
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
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
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Local Storage</div>
                  <div className="text-2xl font-bold">{formatBytes(storageInfo.localStorage)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Session Storage</div>
                  <div className="text-2xl font-bold">{formatBytes(storageInfo.sessionStorage)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Total Usage:</span>
                <Badge variant={storageInfo.total > 100000 ? "destructive" : "secondary"}>
                  {formatBytes(storageInfo.total)}
                </Badge>
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
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cleanup Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Button 
              onClick={handleClearCookies} 
              variant="outline" 
              className="w-full"
            >
              Clear All Cookies
            </Button>
            <p className="text-xs text-muted-foreground">
              Removes all cookies that might be causing header size issues
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleEmergencyCleanup} 
              variant="destructive" 
              className="w-full"
            >
              Emergency Cleanup
            </Button>
            <p className="text-xs text-muted-foreground">
              Clears all storage except essential campaign data (keeps only 10 campaigns)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting HTTP 431 Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>If you're seeing "HTTP 431 Request Header Fields Too Large":</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Clear All Cookies" first</li>
            <li>If that doesn't work, try "Emergency Cleanup"</li>
            <li>Refresh the page after cleanup</li>
            <li>Consider using a private/incognito browser window</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
