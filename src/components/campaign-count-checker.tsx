import React, { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react";

export function CampaignCountChecker() {
  const [kvCampaigns] = useKV('campaignData', []);
  const [campaignCount, setCampaignCount] = useState(0);
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    if (Array.isArray(kvCampaigns)) {
      setCampaignCount(kvCampaigns.length);
    }
  }, [kvCampaigns]);

  const handleRefresh = () => {
    if (Array.isArray(kvCampaigns)) {
      setCampaignCount(kvCampaigns.length);
      setRefreshTime(new Date());
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Campaign Count Checker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-muted rounded-md">
          <p className="text-3xl font-bold">{campaignCount}</p>
          <p className="text-sm text-muted-foreground">campaigns in storage</p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Last checked: {refreshTime.toLocaleTimeString()}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <ArrowClockwise className="h-3 w-3" /> Refresh Count
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}