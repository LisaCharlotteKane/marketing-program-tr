import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { ArrowClockwise, Users } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";

interface DataSyncStatusProps {
  campaigns: Campaign[];
}

export function DataSyncStatus({ campaigns }: DataSyncStatusProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [changeCount, setChangeCount] = useState(0);

  useEffect(() => {
    setLastUpdate(new Date());
    setChangeCount(prev => prev + 1);
  }, [campaigns.length, JSON.stringify(campaigns.map(c => c.id + c.forecastedCost + c.status))]);

  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant="outline" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        Shared Data
      </Badge>
      <Badge variant={timeSinceUpdate < 30 ? "default" : "secondary"} className="flex items-center gap-1">
        <ArrowClockwise className="h-3 w-3" />
        {timeSinceUpdate < 60 
          ? `${timeSinceUpdate}s ago` 
          : `${Math.floor(timeSinceUpdate / 60)}m ago`}
      </Badge>
      <span className="text-muted-foreground">
        {campaigns.length} campaigns • {changeCount} updates
      </span>
    </div>
  );
}