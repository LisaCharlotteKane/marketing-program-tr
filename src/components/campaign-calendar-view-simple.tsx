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

interface CampaignCalendarViewProps {
  campaigns: Campaign[];
}

export function CampaignCalendarView({ campaigns }: CampaignCalendarViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          Calendar view of {campaigns.length} campaigns
        </div>
      </CardContent>
    </Card>
  );
}