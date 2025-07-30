import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Funnel, X, CaretDown } from "@phosphor-icons/react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface MultiSelectFiltersProps {
  filters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  filterConfigs: FilterConfig[];
  title?: string;
  icon?: React.ReactNode;
}

export function MultiSelectFilters({
  filters,
  onFiltersChange,
  filterConfigs,
  title = "Filters",
  icon = <Funnel className="h-5 w-5" />
}: MultiSelectFiltersProps) {
  
  const updateFilter = (filterKey: string, values: string[]) => {
    onFiltersChange({
      ...filters,
      [filterKey]: values
    });
  };

  const clearFilter = (filterKey: string) => {
    updateFilter(filterKey, []);
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {} as Record<string, string[]>);
    onFiltersChange(clearedFilters);
  };

  const toggleFilterValue = (filterKey: string, value: string) => {
    const currentValues = filters[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFilter(filterKey, newValues);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, values) => count + values.length, 0);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(values => values.length > 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          {hasActiveFilters() && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {filterConfigs.map((config) => {
            const selectedValues = filters[config.key] || [];
            
            return (
              <div key={config.key} className="space-y-2">
                <Label className="text-sm font-medium">{config.label}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-left font-normal"
                      size="sm"
                    >
                      <span className="truncate">
                        {selectedValues.length === 0 
                          ? `All ${config.label}`
                          : selectedValues.length === 1
                          ? selectedValues[0]
                          : `${selectedValues.length} selected`
                        }
                      </span>
                      <CaretDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{config.label}</h4>
                        {selectedValues.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearFilter(config.key)}
                            className="h-auto p-1 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {config.options.map((option) => (
                        <div 
                          key={option.value}
                          className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                          onClick={() => toggleFilterValue(config.key, option.value)}
                        >
                          <Checkbox 
                            checked={selectedValues.includes(option.value)}
                            onChange={() => toggleFilterValue(config.key, option.value)}
                          />
                          <label className="text-sm cursor-pointer flex-1">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Show selected values as badges */}
                {selectedValues.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedValues.slice(0, 3).map((value) => (
                      <Badge 
                        key={value} 
                        variant="secondary" 
                        className="text-xs px-2 py-1"
                      >
                        {value}
                        <button
                          onClick={() => toggleFilterValue(config.key, value)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedValues.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedValues.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to create filter options from data
export function createFilterOptions(campaigns: any[], key: string): FilterOption[] {
  const uniqueValues = [...new Set(campaigns.map(campaign => campaign[key]).filter(Boolean))];
  return uniqueValues.map(value => ({ value: String(value), label: String(value) }));
}

// Predefined filter configurations
export const getStandardFilterConfigs = (campaigns: any[]): FilterConfig[] => [
  {
    key: "owner",
    label: "Owner",
    options: [
      { value: "Giorgia Parham", label: "Giorgia Parham" },
      { value: "Tomoko Tanaka", label: "Tomoko Tanaka" },
      { value: "Beverly Leung", label: "Beverly Leung" },
      { value: "Shruti Narang", label: "Shruti Narang" }
    ]
  },
  {
    key: "campaignType",
    label: "Campaign Type",
    options: [
      { value: "In-Account Events (1:1)", label: "In-Account Events (1:1)" },
      { value: "Exec Engagement Programs", label: "Exec Engagement Programs" },
      { value: "CxO Events (1:Few)", label: "CxO Events (1:Few)" },
      { value: "Localized Events", label: "Localized Events" },
      { value: "Localized Programs", label: "Localized Programs" },
      { value: "Lunch & Learns and Workshops (1:Few)", label: "Lunch & Learns and Workshops (1:Few)" },
      { value: "Microsoft", label: "Microsoft" },
      { value: "Partners", label: "Partners" },
      { value: "Webinars", label: "Webinars" },
      { value: "3P Sponsored Events", label: "3P Sponsored Events" },
      { value: "Flagship Events (Galaxy, Universe Recaps) (1:Many)", label: "Flagship Events (Galaxy, Universe Recaps) (1:Many)" },
      { value: "Targeted Paid Ads & Content Syndication", label: "Targeted Paid Ads & Content Syndication" },
      { value: "User Groups", label: "User Groups" },
      { value: "Contractor/Infrastructure", label: "Contractor/Infrastructure" }
    ]
  },
  {
    key: "strategicPillar",
    label: "Strategic Pillar",
    options: [
      { value: "Account Growth and Product Adoption", label: "Account Growth and Product Adoption" },
      { value: "Pipeline Acceleration & Executive Engagement", label: "Pipeline Acceleration & Executive Engagement" },
      { value: "Brand Awareness & Top of Funnel Demand Generation", label: "Brand Awareness & Top of Funnel Demand Generation" },
      { value: "New Logo Acquisition", label: "New Logo Acquisition" }
    ]
  },
  {
    key: "revenuePlay",
    label: "Revenue Play",
    options: [
      { value: "Accelerate developer productivity with Copilot in VS Code and GitHub", label: "Accelerate developer productivity with Copilot in VS Code and GitHub" },
      { value: "Secure all developer workloads with the power of AI", label: "Secure all developer workloads with the power of AI" },
      { value: "All", label: "All" }
    ]
  },
  {
    key: "quarterMonth",
    label: "Quarter/Month",
    options: [
      { value: "Q1 - July", label: "Q1 - July" },
      { value: "Q1 - August", label: "Q1 - August" },
      { value: "Q1 - September", label: "Q1 - September" },
      { value: "Q2 - October", label: "Q2 - October" },
      { value: "Q2 - November", label: "Q2 - November" },
      { value: "Q2 - December", label: "Q2 - December" },
      { value: "Q3 - January", label: "Q3 - January" },
      { value: "Q3 - February", label: "Q3 - February" },
      { value: "Q3 - March", label: "Q3 - March" },
      { value: "Q4 - April", label: "Q4 - April" },
      { value: "Q4 - May", label: "Q4 - May" },
      { value: "Q4 - June", label: "Q4 - June" }
    ]
  },
  {
    key: "region",
    label: "Region",
    options: [
      { value: "JP & Korea", label: "JP & Korea" },
      { value: "South APAC", label: "South APAC" },
      { value: "SAARC", label: "SAARC" },
      { value: "Digital", label: "Digital" },
      { value: "X APAC English", label: "X APAC English" },
      { value: "X APAC Non English", label: "X APAC Non English" },
      { value: "X South APAC", label: "X South APAC" },
      { value: "X SAARC", label: "X SAARC" }
    ]
  },
  {
    key: "country",
    label: "Country",
    options: createFilterOptions(campaigns, "country")
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "Planning", label: "Planning" },
      { value: "On Track", label: "On Track" },
      { value: "Shipped", label: "Shipped" },
      { value: "Cancelled", label: "Cancelled" }
    ]
  }
];

// Helper function to apply filters to campaigns
export function applyFilters(campaigns: any[], filters: Record<string, string[]>) {
  return campaigns.filter(campaign => {
    for (const [filterKey, selectedValues] of Object.entries(filters)) {
      if (selectedValues.length === 0) continue; // No filter applied
      
      const campaignValue = campaign[filterKey];
      
      // Handle strategic pillar as array
      if (filterKey === "strategicPillar" && Array.isArray(campaignValue)) {
        if (!selectedValues.some(value => campaignValue.includes(value))) {
          return false;
        }
      } else {
        if (!selectedValues.includes(String(campaignValue))) {
          return false;
        }
      }
    }
    return true;
  });
}