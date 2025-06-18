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
      className={`flex items-center gap-1 text-xs ${className}`}
    >
      <FilterX className="h-3 w-3" /> Clear Filters
    </Button>
  );
}