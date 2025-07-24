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

interface BudgetManagementProps {
  campaigns: Campaign[];
}

export function BudgetManagement({ campaigns }: BudgetManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          Budget tracking for {campaigns.length} campaigns
        </div>
      </CardContent>
    </Card>
  );
}