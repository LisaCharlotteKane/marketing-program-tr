import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRegionalBudgets, RegionalBudget, OWNER_TO_REGION_MAP } from "@/hooks/useRegionalBudgets";
import { calculateRegionalMetrics, allocateBudgetToCampaigns } from "@/services/budget-service";
import { BudgetLockInfo } from "@/components/budget-lock-info";
import { BudgetSaveIndicator } from "@/components/budget-save-indicator";
import { BudgetAllocationDetails } from "@/components/budget-allocation-details";
import { Progress } from "@/components/ui/progress";
import { ArrowClockwise, Warning, ArrowsClockwise } from "@phosphor-icons/react";
import { formatCurrency, isContractorCampaign } from "@/lib/utils";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";

export function BudgetManagement() {
  const [budgets, setBudgets, budgetStatus] = useRegionalBudgets();
  const [campaigns] = useKV('campaignData', [], { scope: 'global' });
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sync campaigns with budget data
  useEffect(() => {
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      // Group campaigns by region and update budgets
      const newBudgets = { ...budgets };
      
      // Clear existing programs
      Object.keys(newBudgets).forEach(region => {
        newBudgets[region].programs = [];
      });
      
      // Add campaigns to their regions based on owner's region
      campaigns.forEach(campaign => {
        const owner = campaign.owner;
        const ownerRegion = OWNER_TO_REGION_MAP[owner];
        
        // Skip if we can't determine the region for this owner
        if (!ownerRegion || !newBudgets[ownerRegion]) return;
        
        // Add this campaign to the owner's region
        newBudgets[ownerRegion].programs.push({
          id: campaign.id,
          forecastedCost: typeof campaign.forecastedCost === 'number' 
            ? campaign.forecastedCost 
            : parseFloat(String(campaign.forecastedCost).replace(/[$,]/g, '')) || 0,
          actualCost: typeof campaign.actualCost === 'number' 
            ? campaign.actualCost 
            : parseFloat(String(campaign.actualCost).replace(/[$,]/g, '')) || 0,
          owner: campaign.owner,
          nonBudgetImpacting: isContractorCampaign(campaign),
          campaignType: campaign.campaignType
        });
      });
      
      // Update budgets state with new campaigns
      setBudgets(newBudgets);
    }
  }, [campaigns, setBudgets]);

  // Function to handle budget changes
  const handleBudgetChange = (region: string, value: string) => {
    const numValue = value === "" ? "" : parseFloat(value);
    
    // Don't update if the budget is locked
    if (budgets[region]?.lockedByOwner) {
      toast.error("This budget is locked and cannot be modified");
      return;
    }
    
    setBudgets((prev) => ({
      ...prev,
      [region]: {
        ...prev[region],
        assignedBudget: numValue,
      },
    }));
  };

  // Manual refresh of budget data
  const refreshBudgetData = () => {
    setIsRefreshing(true);
    
    // Re-allocate budget to campaigns
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      const { campaigns: updatedCampaigns, allocations, ownerBudgets } = allocateBudgetToCampaigns(campaigns);
      
      // Group campaigns by region and update budgets
      const newBudgets = { ...budgets };
      
      // Clear existing programs
      Object.keys(newBudgets).forEach(region => {
        newBudgets[region].programs = [];
      });
      
      // Add campaigns to their regions based on owner's region
      updatedCampaigns.forEach(campaign => {
        const owner = campaign.owner;
        const ownerRegion = OWNER_TO_REGION_MAP[owner];
        
        // Skip if we can't determine the region for this owner
        if (!ownerRegion || !newBudgets[ownerRegion]) return;
        
        // Add this campaign to the owner's region
        newBudgets[ownerRegion].programs.push({
          id: campaign.id,
          forecastedCost: typeof campaign.forecastedCost === 'number' 
            ? campaign.forecastedCost 
            : parseFloat(String(campaign.forecastedCost).replace(/[$,]/g, '')) || 0,
          actualCost: typeof campaign.actualCost === 'number' 
            ? campaign.actualCost 
            : parseFloat(String(campaign.actualCost).replace(/[$,]/g, '')) || 0,
          owner: campaign.owner,
          nonBudgetImpacting: isContractorCampaign(campaign),
          campaignType: campaign.campaignType
        });
      });
      
      // Update budgets state with new campaigns
      setBudgets(newBudgets);
      
      toast.success("Budget data refreshed successfully");
    } else {
      toast.info("No campaigns found to refresh budget data");
    }
    
    setIsRefreshing(false);
  };

  // Get all regions sorted
  const regions = Object.keys(budgets).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Management</h2>
        <div className="flex items-center gap-3">
          <BudgetSaveIndicator status={budgetStatus} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshBudgetData}
            disabled={isRefreshing}
          >
            <ArrowsClockwise className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={budgetStatus.resetToDefaults}
          >
            <ArrowClockwise className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocations">Budget Allocations</TabsTrigger>
          <TabsTrigger value="tracking">Spending Tracking</TabsTrigger>
          <TabsTrigger value="details">Allocation Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Regional Budget Overview</CardTitle>
              <CardDescription>
                Summary of budget allocations and spending across all regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Assigned Budget</TableHead>
                    <TableHead>Forecasted Spend</TableHead>
                    <TableHead>Actual Spend</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((region) => {
                    const metrics = calculateRegionalMetrics(budgets, region);
                    const remaining = typeof metrics.assignedBudget === "number" 
                      ? metrics.assignedBudget - metrics.totalForecasted
                      : 0;
                    
                    // Determine status based on forecasted spend
                    let status = "On Track";
                    let statusVariant: "default" | "warning" | "destructive" = "default";
                    
                    if (metrics.forecastedExceedsBudget) {
                      status = "Over Budget";
                      statusVariant = "destructive";
                    } else if (metrics.forecastedPercent > 85) {
                      status = "Warning";
                      statusVariant = "warning";
                    }

                    return (
                      <TableRow key={region}>
                        <TableCell className="font-medium">{region}</TableCell>
                        <TableCell>
                          {typeof metrics.assignedBudget === "number" 
                            ? formatCurrency(metrics.assignedBudget)
                            : "Not Set"}
                        </TableCell>
                        <TableCell>{formatCurrency(metrics.totalForecasted)}</TableCell>
                        <TableCell>{formatCurrency(metrics.totalActual)}</TableCell>
                        <TableCell>{formatCurrency(remaining)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant}>
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation Management</CardTitle>
              <CardDescription>
                Set and adjust budget allocations for each region
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(campaigns) && campaigns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Budget Allocation</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.map((region) => {
                      const regionData = budgets[region];
                      const isLocked = regionData.lockedByOwner;

                      return (
                        <TableRow key={region}>
                          <TableCell className="font-medium">{region}</TableCell>
                          <TableCell>{regionData.ownerName || "Unassigned"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 w-full max-w-xs">
                              <span className="text-muted-foreground">$</span>
                              <Input
                                type="number"
                                value={regionData.assignedBudget === "" ? "" : regionData.assignedBudget}
                                onChange={(e) => handleBudgetChange(region, e.target.value)}
                                disabled={isLocked}
                                placeholder="Enter budget amount"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <BudgetLockInfo budget={regionData} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">No campaigns found. Please add campaigns in the Planning tab or refresh the data.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refreshBudgetData}
                    disabled={isRefreshing}
                    className="mt-4"
                  >
                    <ArrowsClockwise className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Budget Spending Tracking</CardTitle>
              <CardDescription>
                Track forecasted and actual spending against allocated budgets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {regions.map((region) => {
                const metrics = calculateRegionalMetrics(budgets, region);
                const forecastedPercent = Math.min(100, metrics.forecastedPercent);
                const actualPercent = Math.min(100, metrics.actualPercent);
                
                // Skip regions with no budget allocated
                if (metrics.assignedBudget === "" || metrics.assignedBudget === 0) {
                  return null;
                }

                return (
                  <div key={region} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{region}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(metrics.totalForecasted)} of {formatCurrency(metrics.assignedBudget)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Forecasted Spend</span>
                        <span className="font-medium">{forecastedPercent.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={forecastedPercent} 
                        className={metrics.forecastedExceedsBudget ? "bg-destructive/20" : ""}
                      />
                      {metrics.forecastedExceedsBudget && (
                        <div className="flex items-center text-xs text-destructive mt-1">
                          <Warning className="h-3 w-3 mr-1" />
                          <span>Exceeds budget by {formatCurrency(metrics.forecastedOverage)}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Actual Spend</span>
                        <span className="font-medium">{actualPercent.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={actualPercent} 
                        className={metrics.actualExceedsBudget ? "bg-destructive/20" : "bg-muted"}
                      />
                      {metrics.actualExceedsBudget && (
                        <div className="flex items-center text-xs text-destructive mt-1">
                          <Warning className="h-3 w-3 mr-1" />
                          <span>Exceeds budget by {formatCurrency(metrics.actualOverage)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="space-y-6">
            {regions.map((region) => {
              const metrics = calculateRegionalMetrics(budgets, region);
              
              // Skip regions with no budget allocated or no programs
              if (
                (metrics.assignedBudget === "" || metrics.assignedBudget === 0) ||
                !metrics.campaignAllocations || 
                Object.keys(metrics.campaignAllocations).length === 0
              ) {
                return null;
              }
              
              // Create a mapping of campaign IDs to names for display
              const campaignDetails: Record<string, { id: string; name: string; owner: string }> = {};
              
              // Map campaign IDs to names and owners
              budgets[region].programs.forEach(program => {
                if (program.id) {
                  campaignDetails[program.id] = {
                    id: program.id,
                    name: program.id, // Use a more descriptive field if available
                    owner: program.owner || 'Unknown'
                  };
                }
              });
              
              // Get the total and remaining budget for the region
              const totalBudget = typeof metrics.assignedBudget === "number" ? metrics.assignedBudget : 0;
              const remainingBudget = metrics.remainingBudget || 0;
              
              return (
                <BudgetAllocationDetails
                  key={region}
                  regionName={region}
                  campaignAllocations={metrics.campaignAllocations || {}}
                  campaignDetails={campaignDetails}
                  totalBudget={totalBudget}
                  remainingBudget={remainingBudget}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}