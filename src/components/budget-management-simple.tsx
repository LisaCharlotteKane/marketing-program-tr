import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Warning, WarningCircle } from "@phosphor-icons/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Campaign, CampaignDisplayProps } from "@/types/campaign";

interface BudgetManagementProps {
  campaigns: Campaign[];
}

// Budget allocations by owner
const BUDGET_ALLOCATIONS = {
  "Tomoko Tanaka": { region: "JP & Korea", budget: 358000 },
  "Beverly Leung": { region: "South APAC", budget: 385500 },
  "Shruti Narang": { region: "SAARC", budget: 265000 },
  "Giorgia Parham": { region: "Digital", budget: 68000 }
};

export function BudgetManagement({ campaigns = [] }: BudgetManagementProps) {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December",
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) {
      return [];
    }
    return campaigns.filter(campaign => {
      if (regionFilter !== 'all' && campaign.region !== regionFilter) return false;
      if (quarterFilter !== 'all' && campaign.quarterMonth !== quarterFilter) return false;
      return true;
    });
  }, [campaigns, regionFilter, quarterFilter]);

  const budgetAnalysis = useMemo(() => {
    const ownerBudgets = new Map();

    Object.entries(BUDGET_ALLOCATIONS).forEach(([owner, allocation]) => {
      ownerBudgets.set(owner, {
        owner,
        region: allocation.region,
        assignedBudget: allocation.budget,
        forecastedSpend: 0,
        actualSpend: 0,
        campaignCount: 0,
        campaigns: []
      });
    });

    filteredCampaigns.forEach(campaign => {
      const owner = campaign.owner;
      if (ownerBudgets.has(owner)) {
        const budget = ownerBudgets.get(owner);
        budget.forecastedSpend += campaign.forecastedCost || 0;
        budget.actualSpend += campaign.actualCost || 0;
        budget.campaignCount += 1;
        budget.campaigns.push(campaign);
      }
    });

    return Array.from(ownerBudgets.values());
  }, [filteredCampaigns]);

  const clearFilters = () => {
    setRegionFilter('all');
    setQuarterFilter('all');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUsagePercentage = (spent: number, budget: number) => {
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  const getBudgetStatus = (forecastedSpend: number, actualSpend: number, budget: number) => {
    const forecastedOverage = forecastedSpend - budget;
    const actualOverage = actualSpend - budget;

    if (actualOverage > 500) return { type: 'critical', message: 'Actual spend exceeds budget' };
    if (forecastedOverage > 500) return { type: 'warning', message: 'Forecasted spend exceeds budget' };
    return { type: 'good', message: 'Within budget' };
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
            <div>
              <label className="text-sm font-medium">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quarter</label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgetAnalysis.map((budget) => {
          const forecastedPercentage = getUsagePercentage(budget.forecastedSpend, budget.assignedBudget);
          const actualPercentage = getUsagePercentage(budget.actualSpend, budget.assignedBudget);
          const status = getBudgetStatus(budget.forecastedSpend, budget.actualSpend, budget.assignedBudget);

          return (
            <Card key={budget.owner} className={
              status.type === 'critical' ? 'border border-red-500' :
              status.type === 'warning' ? 'border border-yellow-500' : ''
            }>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.region}</CardTitle>
                  {status.type !== 'good' && (
                    <Warning className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{budget.owner}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Assigned Budget</span>
                    <span className="font-semibold">{formatCurrency(budget.assignedBudget)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Forecasted Spend</span>
                    <span>{formatCurrency(budget.forecastedSpend)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Actual Spend</span>
                    <span>{formatCurrency(budget.actualSpend)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Campaigns</span>
                    <span>{budget.campaignCount}</span>
                  </div>
                </div>

                {/* Budget Usage Bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Forecasted Usage</span>
                      <span>{forecastedPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          forecastedPercentage > 100 ? 'bg-destructive' :
                          forecastedPercentage > 90 ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(forecastedPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Actual Usage</span>
                      <span>{actualPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          actualPercentage > 100 ? 'bg-destructive' :
                          actualPercentage > 90 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(actualPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Alert */}
                {status.type !== 'good' && (
                  <Alert variant={status.type === 'critical' ? 'destructive' : 'default'}>
                    <WarningCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {status.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Remaining Budget */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Remaining (Forecasted)</span>
                    <span className={
                      budget.assignedBudget - budget.forecastedSpend < 0 ? 'text-destructive font-semibold' : 'text-green-600 font-semibold'
                    }>
                      {formatCurrency(budget.assignedBudget - budget.forecastedSpend)}
                    </span>
                  </div>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(budgetAnalysis.reduce((sum, b) => sum + b.assignedBudget, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Assigned</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(budgetAnalysis.reduce((sum, b) => sum + b.forecastedSpend, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Forecasted</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(budgetAnalysis.reduce((sum, b) => sum + b.actualSpend, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Actual</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {budgetAnalysis.reduce((sum, b) => sum + b.campaignCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Campaigns</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
