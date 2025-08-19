import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Warning, Info } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CsvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  errors: string[];
  warnings: string[];
  onConfirm: () => void;
}

export function CsvPreviewModal({
  isOpen,
  onClose,
  campaigns,
  errors,
  warnings,
  onConfirm
}: CsvPreviewModalProps) {
  const [showAllColumns, setShowAllColumns] = useState(false);

  // Format currency
  const formatCurrency = (value: number | string) => {
    if (value === "" || typeof value !== 'number') return "";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Extract strategic pillars for display
  const formatStrategicPillars = (pillars: string[]) => {
    if (!pillars || pillars.length === 0) return "-";
    if (pillars.length === 1) return pillars[0];
    return `${pillars.length} pillars selected`;
  };

  // Select which columns to display in preview (basic vs all)
  const previewColumns = showAllColumns 
    ? [
        "campaignName",
        "campaignType",
        "strategicPillars",
        "revenuePlay",
        "fiscalYear",
        "quarterMonth",
        "region",
        "country",
        "owner",
        "description",
        "forecastedCost",
        "expectedLeads",
        "mql",
        "sql",
        "opportunities",
        "pipelineForecast",
        "status"
      ]
    : [
        "campaignName",
        "campaignType",
        "region", 
        "owner",
        "forecastedCost",
        "expectedLeads",
        "pipelineForecast"
      ];

  // Column header labels (more user-friendly than raw keys)
  const columnLabels: Record<string, string> = {
    campaignName: "Campaign Name",
    campaignType: "Type",
    strategicPillars: "Strategic Pillars",
    revenuePlay: "Revenue Play",
    fiscalYear: "FY",
    quarterMonth: "Quarter",
    region: "Region",
    country: "Country",
    owner: "Owner",
    description: "Description",
    forecastedCost: "Cost",
    expectedLeads: "Leads",
    mql: "MQLs",
    sql: "SQLs",
    opportunities: "Opps",
    pipelineForecast: "Pipeline",
    status: "Status"
  };

  const hasErrors = errors.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[1000px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Preview Import Data
            <Badge variant={hasErrors ? "destructive" : warnings.length > 0 ? "outline" : "default"}>
              {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review the campaigns that will be imported before confirming.
          </DialogDescription>
        </DialogHeader>

        {/* Error & Warning Alerts */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className="space-y-3 mb-4">
            {errors.length > 0 && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <X className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <div className="font-medium mb-1">
                    {errors.length} error{errors.length !== 1 ? "s" : ""} found:
                  </div>
                  <ScrollArea className="h-[100px]">
                    <ul className="text-xs space-y-1 list-disc pl-5">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}
            
            {warnings.length > 0 && (
              <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
                <Warning className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  <div className="font-medium mb-1">
                    {warnings.length} warning{warnings.length !== 1 ? "s" : ""} found:
                  </div>
                  <ScrollArea className="h-[100px]">
                    <ul className="text-xs space-y-1 list-disc pl-5">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Campaign Data Preview */}
        {campaigns.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Previewing {Math.min(campaigns.length, 10)} of {campaigns.length} campaigns
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAllColumns(!showAllColumns)}
                className="text-xs"
              >
                {showAllColumns ? "Show Basic Columns" : "Show All Columns"}
              </Button>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      {previewColumns.map((column) => (
                        <TableHead key={column} className="font-medium whitespace-nowrap px-2 py-2 text-xs">
                          {columnLabels[column] || column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.slice(0, 10).map((campaign, index) => (
                      <TableRow key={index} className="text-xs">
                        {previewColumns.map((column) => (
                          <TableCell key={column} className="px-2 py-2 whitespace-nowrap">
                            {column === 'forecastedCost' ? formatCurrency(campaign[column]) :
                             column === 'pipelineForecast' ? formatCurrency(campaign[column]) :
                             column === 'strategicPillars' ? formatStrategicPillars(campaign[column]) :
                             column === 'description' ? (campaign[column]?.toString().substring(0, 30) + (campaign[column]?.toString().length > 30 ? '...' : '')) :
                             campaign[column]?.toString() || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {campaigns.length > 10 && (
              <div className="text-xs text-center text-muted-foreground italic">
                ...and {campaigns.length - 10} more campaign{campaigns.length - 10 !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            <div className="text-destructive font-medium">No valid campaigns found to import</div>
            <p className="text-muted-foreground text-sm mt-2">
              Please check the errors above and fix the CSV file before trying again.
            </p>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="text-xs text-muted-foreground">
            {hasErrors 
              ? "Please fix the errors before importing" 
              : warnings.length > 0 
                ? "Warnings won't block import but should be reviewed" 
                : "Data looks good! Ready to import."}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={onConfirm}
              disabled={hasErrors || campaigns.length === 0}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Import {campaigns.length} Campaign{campaigns.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}