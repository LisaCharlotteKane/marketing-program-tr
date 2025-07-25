import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash, ArrowClockwise, Info } from "@phosphor-icons/react";
import { toast } from "sonner";
import { StorageStatus } from "@/components/storage-status";

export function StorageCleanupPanel() {
  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast.success("All browser storage cleared");
    } catch (error) {
      toast.error("Failed to clear storage");
    }
  };

  return (
    <div className="space-y-4">
      <StorageStatus />
      
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Storage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This app uses browser localStorage to persist campaign data. Data is saved locally 
              and will persist across sessions on this device.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="text-sm font-medium">Current Setup:</div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Campaign data is stored in browser localStorage</li>
              <li>• Data persists across browser sessions</li>
              <li>• Each user has their own local data store</li>
              <li>• Data is automatically saved when changed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Button 
              onClick={handleClearLocalStorage} 
              variant="outline" 
              className="w-full"
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear Browser Storage
            </Button>
            <p className="text-xs text-muted-foreground">
              Clears localStorage and sessionStorage to resolve any legacy data conflicts
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>If you experience issues:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Try refreshing the page</li>
            <li>Clear browser storage using the button above</li>
            <li>Use an incognito/private browsing window</li>
            <li>Check browser console for error messages</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
