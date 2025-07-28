import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/utils/storage-monitor";

export function StorageDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  const collectDebugInfo = () => {
    const info = {
      localStorage: {
        available: typeof localStorage !== 'undefined',
        keys: [],
        sizes: {},
        totalSize: 0
      },
      browser: {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        storage: typeof Storage !== 'undefined'
      },
      campaign: {
        data: null,
        size: 0
      }
    };

    try {
      if (typeof localStorage !== 'undefined') {
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            const value = localStorage[key];
            const size = new Blob([value]).size;
            info.localStorage.keys.push(key);
            info.localStorage.sizes[key] = size;
            info.localStorage.totalSize += size;

            if (key === 'campaignData') {
              info.campaign.data = value;
              info.campaign.size = size;
            }
          }
        }
      }
    } catch (error) {
      info.localStorage.error = error.message;
    }

    setDebugInfo(info);
  };

  useEffect(() => {
    collectDebugInfo();
  }, []);

  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      collectDebugInfo();
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">LocalStorage Status</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <div>Available: {debugInfo.localStorage?.available ? '✓' : '✗'}</div>
              <div>Total Size: {formatBytes(debugInfo.localStorage?.totalSize || 0)}</div>
              <div>Keys Count: {debugInfo.localStorage?.keys?.length || 0}</div>
              {debugInfo.localStorage?.error && (
                <div className="text-red-600">Error: {debugInfo.localStorage.error}</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Campaign Data</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <div>Size: {formatBytes(debugInfo.campaign?.size || 0)}</div>
              <div>Has Data: {debugInfo.campaign?.data ? '✓' : '✗'}</div>
              {debugInfo.campaign?.data && (
                <div>Records: {(() => {
                  try {
                    const parsed = JSON.parse(debugInfo.campaign.data);
                    return Array.isArray(parsed) ? parsed.length : 'Not an array';
                  } catch {
                    return 'Invalid JSON';
                  }
                })()}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Storage Keys</h4>
          <div className="text-xs bg-muted p-3 rounded max-h-32 overflow-y-auto">
            {debugInfo.localStorage?.keys?.map((key: string) => (
              <div key={key} className="flex justify-between">
                <span>{key}</span>
                <span>{formatBytes(debugInfo.localStorage.sizes[key])}</span>
              </div>
            )) || 'No keys found'}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={collectDebugInfo} variant="outline" size="sm">
            Refresh Debug Info
          </Button>
          <Button onClick={clearStorage} variant="destructive" size="sm">
            Clear All Storage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}