import React from "react";
import { LockKey } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { type RegionalBudget } from "@/hooks/useRegionalBudgets";

export function BudgetLockInfo({ 
  region, 
  budget 
}: { 
  region: string;
  budget: RegionalBudget;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="ml-2 cursor-help">
            <LockKey className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            This budget was locked by an administrator and cannot be modified
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}