import { Button } from "@/components/ui/button";
import { FilterX } from "@phosphor-icons/react";

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
}

export function ClearFiltersButton({ onClick, className = "" }: ClearFiltersButtonProps) {
  return (
    <Button 
      onClick={onClick}
      variant="outline"
      size="sm"
      className={`flex items-center gap-1.5 text-xs font-medium bg-muted/20 border-muted hover:bg-muted hover:text-foreground ${className}`}
    >
      <FilterX className="h-3.5 w-3.5" /> 
      <span>Clear Filters</span>
    </Button>
  );
}