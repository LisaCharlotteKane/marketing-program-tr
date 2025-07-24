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

interface ReportingDashboardProps {
  campaigns: Campaign[];
}

export function ReportingDashboard({ campaigns }: ReportingDashboardProps) {
  const totalCost = campaigns.reduce((sum, c) => sum + c.forecastedCost, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.expectedLeads, 0);
  const totalPipeline = campaigns.reduce((sum, c) => sum + c.pipelineForecast, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Forecasted Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Expected Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Pipeline Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPipeline.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}