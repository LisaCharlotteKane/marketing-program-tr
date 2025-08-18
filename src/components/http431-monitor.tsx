import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSystemStatus, emergencyCleanup } from '@/utils/http431-prevention';

export function HTTP431Monitor() {
  const [status, setStatus] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getSystemStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const hasWarnings = status.recommendations.length > 0;
  const isEmergency = status.headers.isOverLimit || status.storage.percentUsed > 0.95;

  if (!isExpanded && !hasWarnings) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="opacity-50 hover:opacity-100"
        >
          HTTP Status
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className={`shadow-lg ${isEmergency ? 'border-red-500' : hasWarnings ? 'border-yellow-500' : 'border-green-500'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              HTTP 431 Monitor
              {isEmergency && <span className="text-red-500 ml-2">🚨</span>}
              {!isEmergency && hasWarnings && <span className="text-yellow-500 ml-2">⚠️</span>}
              {!hasWarnings && <span className="text-green-500 ml-2">✅</span>}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="font-medium">Headers</div>
              <div>Size: {Math.round(status.headers.estimatedSize / 1024)}KB</div>
              <div>Cookies: {Math.round(status.headers.cookieSize / 1024)}KB</div>
            </div>
            <div>
              <div className="font-medium">Storage</div>
              <div>Used: {Math.round(status.storage.percentUsed * 100)}%</div>
              <div>Size: {Math.round(status.storage.currentSize / 1024)}KB</div>
            </div>
          </div>

          {status.recommendations.length > 0 && (
            <Alert variant={isEmergency ? "destructive" : "default"}>
              <AlertDescription className="text-xs">
                {status.recommendations.slice(0, 2).map((rec: string, i: number) => (
                  <div key={i}>• {rec}</div>
                ))}
                {status.recommendations.length > 2 && (
                  <div>... and {status.recommendations.length - 2} more</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={emergencyCleanup}
              className="text-xs"
            >
              Clean Up
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatus(getSystemStatus())}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}