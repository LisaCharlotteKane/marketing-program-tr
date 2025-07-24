import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building2, AlertTriangle } from "@phosphor-icons/react";
import { Campaign } from "@/components/campaign-table";

interface BudgetManagementProps {
  campaigns: Campaign[];
}

export function BudgetManagement({ campaigns }: BudgetManagementProps) {
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [quarterFilter, setQuarterFilter] = useState<string>("");

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  // Budget allocations by owner
  const budgetAllocations = {
    "Tomoko Tanaka": { region: "JP & Korea", budget: 358000 },
    "Beverly Leung": { region: "South APAC", budget: 385500 },
    "Shruti Narang": { region: "SAARC", budget: 265000 },
    "Giorgia Parham": { region: "Digital", budget: 68000 }
  };

  // Calculate budget utilization by owner
  const budgetSummary = Object.entries(budgetAllocations).map(([owner, allocation]) => {
    const ownerCampaigns = campaigns.filter(campaign => {
      const matchesOwner = campaign.owner === owner;
      const matchesRegion = !regionFilter || allocation.region === regionFilter;
      const matchesQuarter = !quarterFilter || campaign.quarterMonth === quarterFilter;
      return matchesOwner && matchesRegion && matchesQuarter;
    });

    const totalForecasted = ownerCampaigns.reduce((sum, campaign) => {
      return sum + (typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : parseFloat(campaign.forecastedCost.toString()) || 0);
    }, 0);

    const totalActual = ownerCampaigns.reduce((sum, campaign) => {
      return sum + (typeof campaign.actualCost === 'number' ? campaign.actualCost : parseFloat(campaign.actualCost.toString()) || 0);
    }, 0);

    const forecastedPercent = (totalForecasted / allocation.budget) * 100;
    const actualPercent = (totalActual / allocation.budget) * 100;

    return {
      owner,
      region: allocation.region,
      assignedBudget: allocation.budget,
      totalForecasted,
      totalActual,
      forecastedPercent,
      actualPercent,
      forecastedOverage: Math.max(0, totalForecasted - allocation.budget),
      actualOverage: Math.max(0, totalActual - allocation.budget),
      campaignCount: ownerCampaigns.length
    };
  });

  const clearFilters = () => {
    setRegionFilter("");
    setQuarterFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Budget Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
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
              <Label>Quarter</Label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
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
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgetSummary.map((budget) => (
          <Card key={budget.owner} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{budget.region}</CardTitle>
              <CardDescription className="text-xs">{budget.owner}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Assigned Budget</span>
                  <span className="font-mono">${budget.assignedBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Forecasted</span>
                  <span className="font-mono">${budget.totalForecasted.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Actual</span>
                  <span className="font-mono">${budget.totalActual.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Forecasted Usage</span>
                    <span>{Math.round(budget.forecastedPercent)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(budget.forecastedPercent, 100)} 
                    className={budget.forecastedPercent > 100 ? "bg-red-100" : ""}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Actual Usage</span>
                    <span>{Math.round(budget.actualPercent)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(budget.actualPercent, 100)} 
                    className={budget.actualPercent > 100 ? "bg-red-100" : ""}
                  />
                </div>
              </div>

              {(budget.forecastedOverage > 500 || budget.actualOverage > 500) && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Budget Exceeded</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {budget.campaignCount} campaign(s)
              </div>
            </CardContent>

            {budget.forecastedPercent > 100 && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-xs">
                  Over Budget
                </Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Budget Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary by Owner</CardTitle>
          <CardDescription>
            Detailed budget allocation and utilization tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Owner</th>
                  <th className="text-left py-2">Region</th>
                  <th className="text-right py-2">Assigned Budget</th>
                  <th className="text-right py-2">Forecasted Spend</th>
                  <th className="text-right py-2">Actual Spend</th>
                  <th className="text-right py-2">Remaining</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {budgetSummary.map((budget) => (
                  <tr key={budget.owner} className="border-b">
                    <td className="py-2 font-medium">{budget.owner}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-xs">
                        {budget.region}
                      </Badge>
                    </td>
                    <td className="py-2 text-right font-mono">
                      ${budget.assignedBudget.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono">
                      ${budget.totalForecasted.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono">
                      ${budget.totalActual.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono">
                      ${Math.max(0, budget.assignedBudget - budget.totalForecasted).toLocaleString()}
                    </td>
                    <td className="py-2 text-center">
                      {budget.forecastedPercent > 100 ? (
                        <Badge variant="destructive" className="text-xs">
                          Over Budget
                        </Badge>
                      ) : budget.forecastedPercent > 90 ? (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          Near Limit
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          On Track
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}