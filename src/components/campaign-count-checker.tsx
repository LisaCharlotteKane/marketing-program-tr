import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react";

export function CampaignCountChecker() {
  const [campaignCount, setCampaignCount] = useState(0);
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('campaignData');
      if (stored) {
        const campaigns = JSON.parse(stored);
        if (Array.isArray(campaigns)) {
          setCampaignCount(campaigns.length);
        }
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaignCount(0);
    }
  }, []);

  const handleRefresh = () => {
    try {
      const stored = localStorage.getItem('campaignData');
      if (stored) {
        const campaigns = JSON.parse(stored);
        if (Array.isArray(campaigns)) {
          setCampaignCount(campaigns.length);
        }
      }
      setRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
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