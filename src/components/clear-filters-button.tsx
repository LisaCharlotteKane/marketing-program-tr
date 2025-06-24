import { Button } from "@/components/ui/button";
import { FilterX } from "@phosphor-icons/react";
import { toast } from "sonner";

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
  showToast?: boolean;
}

export function ClearFiltersButton({ 
  onClick, 
  className = "",
  showToast = true
}: ClearFiltersButtonProps) {
  // Wrapper function to handle both the onClick action and showing toast
  const handleClick = () => {
    onClick();
    if (showToast) {
      toast.success("Filters cleared successfully");
    }
  };

  return (
    <Button 
      onClick={handleClick}
      variant="outline"
      size="sm"
      className={`flex items-center gap-1.5 text-xs font-medium bg-muted/20 border-muted hover:bg-muted hover:text-foreground ${className}`}
    >
      <FilterX className="h-3.5 w-3.5" /> 
      <span>Clear Filters</span>
    </Button>
  );
}