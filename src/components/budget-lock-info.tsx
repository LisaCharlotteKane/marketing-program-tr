import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LockKey, Info } from "@phosphor-icons/react";
import { RegionalBudget } from "@/hooks/useRegionalBudgets";

interface BudgetLockInfoProps {
  region: string;
  budget: RegionalBudget;
  className?: string;
}

export function BudgetLockInfo({ region, budget, className = "" }: BudgetLockInfoProps) {
  if (!budget.lockedByOwner) return null;
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-muted/50 text-xs px-2 py-0 h-5 flex items-center gap-1 cursor-help">
              <LockKey className="h-3 w-3" />
              <span>Administrator Locked</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="text-sm space-y-1">
              <div className="font-medium flex items-center gap-1">
                <Info className="h-4 w-4" />
                Budget Lock Information
              </div>
              <p className="text-xs">
                This budget value has been locked by an administrator and cannot be changed by regular users.
              </p>
              <div className="mt-2 text-xs">
                <div><strong>Region:</strong> {region}</div>
                <div><strong>Budget:</strong> ${budget.lockedValue?.toLocaleString()}</div>
                {budget.lastLockedBy && (
                  <div><strong>Set by:</strong> {budget.lastLockedBy}</div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}