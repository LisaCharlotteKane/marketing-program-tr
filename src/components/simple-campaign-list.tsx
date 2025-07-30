import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  region: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  quarterMonth: string;
}

interface SimpleCampaignListProps {
  campaigns: Campaign[];
}

export function SimpleCampaignList({ campaigns }: SimpleCampaignListProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>No campaigns created yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Add your first campaign using the form above
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalCost = campaigns.reduce((sum, campaign) => sum + (campaign.forecastedCost || 0), 0);
  const totalLeads = campaigns.reduce((sum, campaign) => sum + (campaign.expectedLeads || 0), 0);
  const totalMQLs = Math.round(totalLeads * 0.1);
  const totalSQLs = Math.round(totalMQLs * 0.06); // 6% of MQLs, not leads
  const totalOpportunities = Math.round(totalSQLs * 0.8);
  const totalPipeline = totalOpportunities * 50000;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
          <CardDescription>Overview of all campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Expected Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalMQLs.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">MQLs (10%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${totalPipeline.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Pipeline Forecast</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>{campaigns.length} campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Quarter/Month</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Pipeline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const expectedLeads = campaign.expectedLeads || 0;
                const forecastedCost = Number(campaign.forecastedCost) || 0;
                
                // Check for In-Account programs (various naming variations)
                const isInAccountEvent = campaign.campaignType?.includes("In-Account") || 
                                       campaign.campaignType?.includes("In Account") ||
                                       campaign.campaignType === "In-Account Events (1:1)";
                
                let mql, sql, opportunities, pipeline;
                
                if (isInAccountEvent && expectedLeads === 0) {
                  // Special 20:1 ROI calculation for In-Account Events without leads
                  mql = 0;
                  sql = 0;
                  opportunities = 0;
                  pipeline = forecastedCost * 20;
                } else {
                  mql = Math.round(expectedLeads * 0.1);
                  sql = Math.round(mql * 0.06); // 6% of MQLs, not leads
                  opportunities = Math.round(sql * 0.8);
                  pipeline = opportunities * 50000;
                }

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                    <TableCell className="text-sm">{campaign.campaignType}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {campaign.region}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{campaign.owner}</TableCell>
                    <TableCell className="text-sm">{campaign.quarterMonth}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${(campaign.forecastedCost || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(campaign.expectedLeads || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${pipeline.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}