import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useKV } from '@/hooks/useKVStorage';
import { Campaign } from "@/types/campaign";

export function StorageStatus() {
  const [campaigns] = useKV<Campaign[]>('campaignData', []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Storage Status
          <Badge variant="outline" className="text-green-600">
            Shared
          </Badge>
        </CardTitle>
        <CardDescription>
          Campaign data is stored globally and shared across all users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Campaigns:</span>
            <Badge variant="secondary">
              {Array.isArray(campaigns) ? campaigns.length : 0}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Storage Type:</span>
            <Badge variant="outline">
              Browser Storage (Local)
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Campaign data is stored locally in your browser. Data persists across sessions but is not shared with other users.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}