import React from "react";
import { LockKey, LockOpen } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { type RegionalBudget } from "@/hooks/useRegionalBudgets";

export function BudgetLockInfo({ 
  budget 
}: { 
  budget: RegionalBudget;
}) {
  if (!budget.lockedByOwner) {
    return (
      <Badge variant="outline" className="ml-2">
        <LockOpen className="h-3 w-3 mr-1" />
        Editable
      </Badge>
    );
  }
  
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