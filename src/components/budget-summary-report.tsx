import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendUp, TrendDown, AlertTriangle, CheckCircle } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";

interface BudgetSummaryReportProps {
  campaigns: Campaign[];
}

export function BudgetSummaryReport({ campaigns }: BudgetSummaryReportProps) {
  // Budget pool data
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

  // Calculate budget analytics
  const budgetAnalytics = React.useMemo(() => {
    const totalBudget = Object.values(budgetPoolByOwner).reduce((sum, budget) => sum + budget, 0);
    
    // Calculate by owner
    const ownerAnalytics = Object.entries(budgetPoolByOwner).map(([owner, assigned]) => {
      const ownerCampaigns = campaigns.filter(c => c.owner === owner);
      const used = ownerCampaigns.reduce((sum, campaign) => {
        return sum + (Number(campaign.forecastedCost) || 0);
      }, 0);
      
      const actualUsed = ownerCampaigns.reduce((sum, campaign) => {
        return sum + (Number(campaign.actualCost) || 0);
      }, 0);

      const utilization = (used / assigned) * 100;
      const actualUtilization = (actualUsed / assigned) * 100;
      const avgCostPerCampaign = ownerCampaigns.length > 0 ? used / ownerCampaigns.length : 0;
      
      return {
        owner,
        region: ownerToRegion[owner as keyof typeof ownerToRegion],
        assigned,
        forecasted: used,
        actual: actualUsed,
        remaining: assigned - used,
        actualRemaining: assigned - actualUsed,
        utilization,
        actualUtilization,
        campaignCount: ownerCampaigns.length,
        avgCostPerCampaign,
        variance: actualUsed - used,
        status: utilization > 100 ? 'over' : utilization > 80 ? 'warning' : 'good'
      };
    });

    // Overall metrics
    const totalForecasted = ownerAnalytics.reduce((sum, data) => sum + data.forecasted, 0);
    const totalActual = ownerAnalytics.reduce((sum, data) => sum + data.actual, 0);
    const totalRemaining = totalBudget - totalForecasted;
    const overallUtilization = (totalForecasted / totalBudget) * 100;
    const actualUtilization = (totalActual / totalBudget) * 100;

    return {
      ownerAnalytics,
      totalBudget,
      totalForecasted,
      totalActual,
      totalRemaining,
      overallUtilization,
      actualUtilization,
      variance: totalActual - totalForecasted
    };
  }, [campaigns]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <TrendUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                ${budgetAnalytics.totalBudget.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Budget Allocated</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                ${budgetAnalytics.totalForecasted.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Forecasted Spend</div>
              <div className="text-xs text-muted-foreground">
                {budgetAnalytics.overallUtilization.toFixed(1)}% of budget
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                ${budgetAnalytics.totalActual.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Actual Spend</div>
              <div className="text-xs text-muted-foreground">
                {budgetAnalytics.actualUtilization.toFixed(1)}% of budget
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${budgetAnalytics.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {budgetAnalytics.variance >= 0 ? '+' : ''}${budgetAnalytics.variance.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Budget Variance</div>
              <div className="text-xs text-muted-foreground">
                Actual vs Forecasted
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Budget Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Budget Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetAnalytics.ownerAnalytics.map((data) => (
              <div key={data.owner} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(data.status)}
                  <div>
                    <div className="font-semibold">{data.region}</div>
                    <div className="text-sm text-muted-foreground">{data.owner}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-6 text-center">
                  <div>
                    <div className="text-sm font-medium">${data.assigned.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Assigned</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-orange-600">${data.forecasted.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Forecasted</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-purple-600">${data.actual.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Actual</div>
                  </div>
                  
                  <div>
                    <div className={`text-sm font-medium ${getStatusColor(data.status)}`}>
                      {data.utilization.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Utilization</div>
                  </div>
                  
                  <div>
                    <Badge variant={data.status === 'over' ? 'destructive' : data.status === 'warning' ? 'default' : 'secondary'}>
                      {data.campaignCount} campaigns
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Efficiency Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Efficiency Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Cost per Campaign</h4>
              <div className="space-y-2">
                {budgetAnalytics.ownerAnalytics.map((data) => (
                  <div key={data.owner} className="flex justify-between items-center">
                    <span className="text-sm">{data.region}</span>
                    <span className="font-medium">
                      ${data.avgCostPerCampaign.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Forecast Accuracy</h4>
              <div className="space-y-2">
                {budgetAnalytics.ownerAnalytics.map((data) => {
                  const accuracy = data.forecasted > 0 ? ((data.forecasted - Math.abs(data.variance)) / data.forecasted) * 100 : 0;
                  return (
                    <div key={data.owner} className="flex justify-between items-center">
                      <span className="text-sm">{data.region}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{accuracy.toFixed(1)}%</span>
                        {data.variance !== 0 && (
                          data.variance > 0 ? 
                            <TrendUp className="h-3 w-3 text-red-500" /> : 
                            <TrendDown className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Alerts & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetAnalytics.ownerAnalytics
              .filter(data => data.status === 'over' || data.status === 'warning')
              .map((data) => (
                <div key={data.owner} className={`p-3 rounded-lg border-l-4 ${
                  data.status === 'over' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.status)}
                    <span className="font-medium">{data.region}</span>
                  </div>
                  <div className="text-sm mt-1">
                    {data.status === 'over' 
                      ? `Budget exceeded by $${(data.forecasted - data.assigned).toLocaleString()}. Review campaign priorities.`
                      : `Budget utilization at ${data.utilization.toFixed(1)}%. Monitor remaining campaigns closely.`
                    }
                  </div>
                </div>
              ))}
            
            {budgetAnalytics.ownerAnalytics.every(data => data.status === 'good') && (
              <div className="p-3 rounded-lg border-l-4 border-green-500 bg-green-50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">All Regions Within Budget</span>
                </div>
                <div className="text-sm mt-1">
                  All regions are operating within their allocated budgets. Continue monitoring for optimal resource allocation.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}