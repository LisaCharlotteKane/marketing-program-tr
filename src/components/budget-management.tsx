import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BuildingOffice, Warning, ChartBar, FileText } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";
import { BudgetAllocationCharts } from "@/components/budget-allocation-charts";
import { BudgetSummaryReport } from "@/components/budget-summary-report";

interface BudgetManagementProps {
  campaigns: Campaign[];
}

interface BudgetPoolData {
  owner: string;
  assigned: number;
  used: number;
  remaining: number;
  overage: number;
  campaigns: Campaign[];
}

export function BudgetManagement({ campaigns }: BudgetManagementProps) {
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [quarterFilter, setQuarterFilter] = useState<string>("all");

  // Fixed budget allocations by owner
  const budgetPoolByOwner = {
    "Tomoko Tanaka": 358000,
    "Beverly Leung": 385500,
    "Shruti Narang": 265000,
    "Giorgia Parham": 68000,
  };

  const ownerToRegion = {
    "Tomoko Tanaka": "JP & Korea",
    "Beverly Leung": "South APAC", 
    "Shruti Narang": "SAARC",
    "Giorgia Parham": "Digital",
  };

  // Get unique regions and quarters for filters
  const regions = ["all", ...Array.from(new Set(campaigns.map(c => c.region).filter(Boolean)))];
  const quarters = ["all", ...Array.from(new Set(campaigns.map(c => c.quarterMonth).filter(Boolean)))];

  // Calculate budget data for each owner
  const budgetData = useMemo(() => {
    const data: Record<string, BudgetPoolData> = {};

    Object.entries(budgetPoolByOwner).forEach(([owner, assigned]) => {
      // Get campaigns owned by this person
      let ownerCampaigns = campaigns.filter(c => c.owner === owner);

      // Apply filters
      if (regionFilter !== "all") {
  const regions = ["all", ...Array.from(new Set(campaigns.map(c => c.region).filter(Boolean)))];
  const quarters = ["all", ...Array.from(new Set(campaigns.map(c => c.quarterMonth).filter(Boolean)))];

  // Calculate budget data for each owner
  const budgetData = useMemo(() => {
    const data: Record<string, BudgetPoolData> = {};

    Object.entries(budgetPoolByOwner).forEach(([owner, assigned]) => {
      // Get campaigns owned by this person
      let ownerCampaigns = campaigns.filter(c => c.owner === owner);

      // Apply filters
      if (regionFilter !== "all") {
        ownerCampaigns = ownerCampaigns.filter(c => c.region === regionFilter);
      }
      if (quarterFilter !== "all") {
        owner,
        assigned,
        used,
        remaining: Math.max(0, remaining),
        overage,
        campaigns: ownerCampaigns
      };
    });

    return data;
  }, [campaigns, regionFilter, quarterFilter]);

  const totalBudget = Object.values(budgetPoolByOwner).reduce((sum, budget) => sum + budget, 0);
  const totalUsed = Object.values(budgetData).reduce((sum, data) => sum + data.used, 0);
  const totalRemaining = totalBudget - totalUsed;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BuildingOffice className="h-4 w-4" />
            Budget Overview
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            Visual Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.filter(r => r !== "all").map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quarter</label>
                  <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quarters</SelectItem>
                      {quarters.filter(q => q !== "all").map(quarter => (
                        <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Budget Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Assigned</div>
                </div>
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingOffice className="h-5 w-5" />
            Budget Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.filter(r => r !== "all").map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quarter</label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  {quarters.filter(q => q !== "all").map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      ) : (
              <div className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${totalUsed.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Used</div>
            </div>
            <div className="text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          data.overage > 0 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                      />
                    </div>

                    {/* Warning for overage */}
                    {data.overage > 500 && (
                      <Alert variant="destructive">
                        <Warning className="h-4 w-4" />
                        <AlertDescription>
                          Budget exceeded by ${data.overage.toLocaleString()}. Review campaign allocations.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Campaign count */}
                    <div className="text-sm text-muted-foreground">
                      {data.campaigns.length} campaign{data.campaigns.length !== 1 ? 's' : ''} assigned
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <BudgetAllocationCharts 
            campaigns={campaigns}
            budgetData={Object.values(budgetData)}
            ownerToRegion={ownerToRegion}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <BudgetSummaryReport campaigns={campaigns} />
        </TabsContent>
      </Tabs>
    </div>
  );
}