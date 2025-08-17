import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Warning } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/utils";

interface BudgetAllocationDetailsProps {
  regionName: string;
  campaignAllocations: Record<string, {
    allocated: number;
    forecasted: number;
    actual: number;
    remaining: number;
  }>;
  campaignDetails: Record<string, {
    id: string;
    name: string;
    owner: string;
  }>;
  totalBudget: number;
  remainingBudget: number;
}

export function BudgetAllocationDetails({
  regionName,
  campaignAllocations,
  campaignDetails,
  totalBudget,
  remainingBudget
}: BudgetAllocationDetailsProps) {
  // Skip if no allocations
  if (!campaignAllocations || Object.keys(campaignAllocations).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation Details - {regionName}</CardTitle>
          <CardDescription>
            No campaigns with budget allocations found
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Allocation Details - {regionName}</CardTitle>
        <CardDescription>
          Detailed breakdown of budget allocations for each campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total Budget Allocation</span>
            <span>{formatCurrency(totalBudget)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Remaining Unallocated</span>
            <span className={remainingBudget < 0 ? "text-destructive" : ""}>
              {formatCurrency(remainingBudget)}
            </span>
          </div>
          {remainingBudget < 0 && (
            <div className="flex items-center text-xs text-destructive mt-1">
              <Warning className="h-3 w-3 mr-1" />
              <span>Budget overallocated by {formatCurrency(Math.abs(remainingBudget))}</span>
            </div>
          )}
          <Progress 
            value={(totalBudget - remainingBudget) / totalBudget * 100} 
            className={remainingBudget < 0 ? "bg-destructive/20" : ""}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Allocated Budget</TableHead>
              <TableHead>Forecasted Cost</TableHead>
              <TableHead>Actual Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(campaignAllocations).map(([id, allocation]) => {
              const campaign = campaignDetails[id] || { name: `Campaign ${id}`, owner: 'Unknown' };
              
              // Determine status based on remaining budget
              let status = "On Track";
              let statusVariant: "default" | "warning" | "destructive" = "default";
              
              if (allocation.remaining < 0) {
                status = "Over Budget";
                statusVariant = "destructive";
              } else if (allocation.forecasted > allocation.allocated * 0.9) {
                status = "Warning";
                statusVariant = "warning";
              }

              return (
                <TableRow key={id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.owner}</TableCell>
                  <TableCell>{formatCurrency(allocation.allocated)}</TableCell>
                  <TableCell>{formatCurrency(allocation.forecasted)}</TableCell>
                  <TableCell>{formatCurrency(allocation.actual)}</TableCell>
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
  );
}