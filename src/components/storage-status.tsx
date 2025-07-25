import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useKV } from '@github/spark/hooks';
import { Campaign } from "@/types/campaign";

export function StorageStatus() {
  const [campaigns] = useKV<Campaign[]>('campaignData', [], { scope: 'global' });
  
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
              GitHub Spark KV (Global)
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            All users can see and edit the same campaign data. Changes are automatically synchronized.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}