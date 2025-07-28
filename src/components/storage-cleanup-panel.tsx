import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash, Info, Warning, CheckCircle } from "@phosphor-icons/react";

export function StorageCleanupPanel() {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);

  React.useEffect(() => {
    analyzeStorage();
  }, []);

  const analyzeStorage = () => {
    try {
      let totalSize = 0;
      const items: any[] = [];
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage[key];
          const size = new Blob([value]).size;
          totalSize += size;
          items.push({ key, size, preview: value.substring(0, 100) });
        }
      }

      setStorageInfo({
        totalSize,
        itemCount: items.length,
        items: items.sort((a, b) => b.size - a.size)
      });
    } catch (error) {
      console.error('Error analyzing storage:', error);
    }
  };

  const clearAllStorage = async () => {
    setIsClearing(true);
    try {
      localStorage.clear();
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
      analyzeStorage();
    } catch (error) {
      console.error('Error clearing storage:', error);
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
    
    if (storageInfo.totalSize > 4 * 1024 * 1024) { // 4MB
      return { 
        status: 'critical', 
        message: 'Storage is very large and may cause issues', 
        color: 'red' 
      };
    } else if (storageInfo.totalSize > 1 * 1024 * 1024) { // 1MB
      return { 
        status: 'warning', 
        message: 'Storage is getting large', 
        color: 'yellow' 
      };
    } else {
      return { 
        status: 'healthy', 
        message: 'Storage size is normal', 
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
            <Info className="h-5 w-5" />
            Storage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storageInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatSize(storageInfo.totalSize)}</div>
                  <div className="text-sm text-muted-foreground">Total Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{storageInfo.itemCount}</div>
                  <div className="text-sm text-muted-foreground">Items Stored</div>
                </div>
                <div className="text-center">
                  <Badge 
                    variant={storageStatus.color === 'green' ? 'default' : 'destructive'}
                    className="text-sm"
                  >
                    {storageStatus.status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {storageStatus.status === 'warning' && <Warning className="h-3 w-3 mr-1" />}
                    {storageStatus.status === 'critical' && <Warning className="h-3 w-3 mr-1" />}
                    {storageStatus.message}
                  </Badge>
                </div>
              </div>

              <Alert variant={storageStatus.color === 'red' ? 'destructive' : 'default'}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {storageStatus.color === 'red' && (
                    <>
                      <strong>Action Required:</strong> Your browser storage is very large ({formatSize(storageInfo.totalSize)}). 
                      This may cause the app to fail with "HTTP 431 Request Header Fields Too Large" errors.
                    </>
                  )}
                  {storageStatus.color === 'yellow' && (
                    <>
                      <strong>Notice:</strong> Storage size is {formatSize(storageInfo.totalSize)}. 
                      Consider clearing old data if you experience issues.
                    </>
                  )}
                  {storageStatus.color === 'green' && (
                    <>
                      <strong>Good:</strong> Storage size is healthy at {formatSize(storageInfo.totalSize)}.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Analyzing storage...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {storageInfo && storageInfo.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trash className="h-5 w-5" />
                Storage Items
              </span>
              <Button 
                variant="destructive" 
                onClick={clearAllStorage}
                disabled={isClearing}
                className="flex items-center gap-2"
              >
                <Trash className="h-4 w-4" />
                {isClearing ? 'Clearing...' : 'Clear All Storage'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {storageInfo.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {item.key}
                      </code>
                      <Badge variant="secondary">
                        {formatSize(item.size)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {item.preview}...
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => clearItem(item.key)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Storage Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Browser Storage Limits:</strong> Most browsers limit localStorage to 5-10MB total</p>
            <p>• <strong>HTTP 431 Errors:</strong> Large storage can cause "Request Header Fields Too Large" errors</p>
            <p>• <strong>Performance:</strong> Large storage can slow down app startup and saving</p>
            <p>• <strong>Recommendation:</strong> Keep storage under 1MB for optimal performance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}