import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash, Info, Warning, CheckCircle, Users, Database } from "@phosphor-icons/react";

export function StorageCleanupPanel() {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);

  React.useEffect(() => {
    analyzeStorage();
  }, []);

  const analyzeStorage = () => {
    try {
      let localStorageSize = 0;
      const localItems: any[] = [];
      
      // Analyze remaining localStorage items (non-campaign data)
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage[key];
          const size = new Blob([value]).size;
          localStorageSize += size;
          localItems.push({ 
            key, 
            size, 
            preview: value.substring(0, 100),
            type: key.includes('campaign') ? 'legacy-campaign' : 'other'
          });
        }
      }

      setStorageInfo({
        localStorageSize,
        localItemCount: localItems.length,
        localItems: localItems.sort((a, b) => b.size - a.size),
        sharedStorageActive: true
      });
    } catch (error) {
      console.error('Error analyzing storage:', error);
    }
  };

  const clearLocalStorage = async () => {
    setIsClearing(true);
    try {
      // Only clear localStorage, not shared storage
      localStorage.clear();
      await new Promise(resolve => setTimeout(resolve, 500));
      analyzeStorage();
    } catch (error) {
      console.error('Error clearing local storage:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const clearItem = (key: string) => {
    try {
      localStorage.removeItem(key);
      analyzeStorage();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStorageStatus = () => {
    if (!storageInfo) return { status: 'unknown', message: 'Analyzing...', color: 'gray' };
    
    if (storageInfo.localStorageSize > 2 * 1024 * 1024) { // 2MB for local storage
      return { 
        status: 'warning', 
        message: 'Local storage is large', 
        color: 'yellow' 
      };
    } else {
      return { 
        status: 'healthy', 
        message: 'Local storage is clean', 
        color: 'green' 
      };
    }
  };

  const storageStatus = getStorageStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Shared Storage Active:</strong> Campaign data is now stored in shared storage accessible by all logged-in users. 
                This ensures team collaboration and data persistence across sessions.
              </AlertDescription>
            </Alert>
            
            {storageInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatSize(storageInfo.localStorageSize)}</div>
                  <div className="text-sm text-muted-foreground">Local Storage Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{storageInfo.localItemCount}</div>
                  <div className="text-sm text-muted-foreground">Local Items</div>
                </div>
                <div className="text-center">
                  <Badge 
                    variant={storageStatus.color === 'green' ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {storageStatus.status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {storageStatus.status === 'warning' && <Warning className="h-3 w-3 mr-1" />}
                    {storageStatus.message}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {storageInfo && storageInfo.localItemCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5" />
              Local Storage Cleanup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The items below are stored locally in your browser. Campaign data is now in shared storage and won't be affected by clearing local storage.
                </AlertDescription>
              </Alert>

              <Button 
                variant="destructive" 
                onClick={clearLocalStorage}
                disabled={isClearing}
                className="w-full"
              >
                {isClearing ? 'Clearing...' : 'Clear All Local Storage'}
              </Button>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {storageInfo.localItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.key}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSize(item.size)} • {item.type === 'legacy-campaign' ? 'Legacy Campaign Data' : 'App Setting'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearItem(item.key)}
                      className="ml-2"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}