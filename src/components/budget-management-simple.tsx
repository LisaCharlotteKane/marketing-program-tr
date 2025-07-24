import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Warning } from "@phosphor-icons/react";

interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  strategicPillar: string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number;
  expectedLeads: number;
  status?: string;
  actualCost?: number;
}

interface BudgetManagementProps {
  campaigns: Campaign[];
}

// Define budget assignments per owner
const BUDGET_ASSIGNMENTS = {
  "Tomoko Tanaka": { region: "JP & Korea", budget: 358000 },
  "Beverly Leung": { region: "South APAC", budget: 385500 },
  "Shruti Narang": { region: "SAARC", budget: 265000 },
  "Giorgia Parham": { region: "Digital", budget: 68000 }
};

export function BudgetManagement({ campaigns }: BudgetManagementProps) {
  const [filters, setFilters] = useState({
    region: '',
    quarter: ''
  });

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    return (
      (!filters.region || campaign.region === filters.region) &&
      (!filters.quarter || campaign.quarterMonth === filters.quarter)
    );
  });

  // Calculate budget usage by owner
  const budgetUsage = Object.entries(BUDGET_ASSIGNMENTS).map(([owner, { region, budget }]) => {
    const ownerCampaigns = filteredCampaigns.filter(c => c.owner === owner);
    
    const totalForecasted = ownerCampaigns.reduce((sum, c) => sum + (c.forecastedCost || 0), 0);
    const totalActual = ownerCampaigns.reduce((sum, c) => sum + (c.actualCost || 0), 0);
    
    const forecastedPercent = budget > 0 ? (totalForecasted / budget) * 100 : 0;
    const actualPercent = budget > 0 ? (totalActual / budget) * 100 : 0;
    
    const forecastedOverage = Math.max(0, totalForecasted - budget);
    const actualOverage = Math.max(0, totalActual - budget);
    
    return {
      owner,
      region,
      budget,
      totalForecasted,
      totalActual,
      forecastedPercent,
      actualPercent,
      forecastedOverage,
      actualOverage,
      campaignCount: ownerCampaigns.length,
      remaining: budget - totalForecasted
    };
  });

  const clearFilters = () => {
    setFilters({
      region: '',
      quarter: ''
    });
  };

  const getBudgetStatus = (percent: number, overage: number) => {
    if (overage > 500) return { color: 'text-red-600', bg: 'bg-red-50', level: 'Critical' };
    if (percent > 100) return { color: 'text-red-600', bg: 'bg-red-50', level: 'Over Budget' };
    if (percent > 80) return { color: 'text-yellow-600', bg: 'bg-yellow-50', level: 'Warning' };
    return { color: 'text-green-600', bg: 'bg-green-50', level: 'On Track' };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={filters.quarter} onValueChange={(value) => setFilters(prev => ({ ...prev, quarter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Quarters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Quarters</SelectItem>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2 w-full"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgetUsage.map((usage) => {
          const forecastedStatus = getBudgetStatus(usage.forecastedPercent, usage.forecastedOverage);
          const actualStatus = getBudgetStatus(usage.actualPercent, usage.actualOverage);

          return (
            <Card key={usage.owner} className={forecastedStatus.bg}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{usage.region}</CardTitle>
                  {usage.forecastedOverage > 500 && (
                    <Warning className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{usage.owner}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Assigned Budget</span>
                    <span className="font-medium">${usage.budget.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Forecasted Spend</span>
                    <span className={`font-medium ${forecastedStatus.color}`}>
                      ${usage.totalForecasted.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(usage.forecastedPercent, 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {usage.forecastedPercent.toFixed(1)}% of budget
                  </div>
                  {usage.forecastedOverage > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Overage: ${usage.forecastedOverage.toLocaleString()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Actual Spend</span>
                    <span className={`font-medium ${actualStatus.color}`}>
                      ${usage.totalActual.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(usage.actualPercent, 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {usage.actualPercent.toFixed(1)}% of budget
                  </div>
                  {usage.actualOverage > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Overage: ${usage.actualOverage.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Campaigns</span>
                  <span className="font-medium">{usage.campaignCount}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Remaining</span>
                  <span className={`font-medium ${usage.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${usage.remaining.toLocaleString()}
                  </span>
                </div>

                <Badge 
                  variant="outline" 
                  className={`${forecastedStatus.color} ${forecastedStatus.bg} border-current`}
                >
                  {forecastedStatus.level}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetUsage.map((usage) => (
              <div key={usage.owner} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold">{usage.owner}</div>
                    <div className="text-sm text-muted-foreground">{usage.region}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">${usage.budget.toLocaleString()}</div>
                    <div className="text-muted-foreground">Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">${usage.totalForecasted.toLocaleString()}</div>
                    <div className="text-muted-foreground">Forecasted</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">${usage.totalActual.toLocaleString()}</div>
                    <div className="text-muted-foreground">Actual</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${usage.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${usage.remaining.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{usage.campaignCount}</div>
                    <div className="text-muted-foreground">Campaigns</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Total Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                ${budgetUsage.reduce((sum, u) => sum + u.budget, 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Assigned Budget</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${budgetUsage.reduce((sum, u) => sum + u.totalForecasted, 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Forecasted Spend</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${budgetUsage.reduce((sum, u) => sum + u.totalActual, 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Actual Spend</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl font-bold ${
                budgetUsage.reduce((sum, u) => sum + u.remaining, 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${budgetUsage.reduce((sum, u) => sum + u.remaining, 0).toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}