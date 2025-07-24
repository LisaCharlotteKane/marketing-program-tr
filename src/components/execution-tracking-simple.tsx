import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  region: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  pipelineForecast: number;
}

interface ExecutionTrackingProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function ExecutionTracking({ campaigns }: ExecutionTrackingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          {campaigns.length} campaigns being tracked
        </div>
      </CardContent>
    </Card>
  );
}