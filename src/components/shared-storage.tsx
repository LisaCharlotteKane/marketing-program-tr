import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useKV } from '@github/spark/hooks';

interface StorageProps {
  scope?: 'global' | 'user';
}

export function SharedStorage({ scope = 'global' }: StorageProps) {
  // Use global scope for shared data across all users
  const [campaigns, setCampaigns] = useKV('campaignData', [], { scope });
  const [refreshTime, setRefreshTime] = useState(new Date());
  
  const refreshData = () => {
    setRefreshTime(new Date());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shared Storage Status</CardTitle>
        <CardDescription>
          Using {scope} storage scope - data is {scope === 'global' ? 'shared across all users' : 'specific to current user'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Campaign Count:</span>
            <Badge variant="outline" className="ml-2">
              {Array.isArray(campaigns) ? campaigns.length : 0} campaigns
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Last refresh: {refreshTime.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" onClick={refreshData}>
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  );
}