import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";
import { UploadSimple, DownloadSimple } from "@phosphor-icons/react";
import { Campaign } from "@/components/campaign-table";
import { processCsvData, exportCampaignsToCsv } from "@/utils/csv-helper";

interface FileUploaderProps {
  onFileUpload: (campaigns: Campaign[]) => void;
  currentCampaigns: Campaign[];
}

export function FileUploader({ onFileUpload, currentCampaigns }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Show toast to indicate processing has started
    const loadingToast = toast.loading('Processing CSV file...');
    
    // Use FileReader to read the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      // Clear the loading toast
      toast.dismiss(loadingToast);
      
      try {
        const csvContent = e.target?.result as string;
        if (!csvContent) {
          toast.error('Failed to read CSV file content');
          return;
        }
        
        // Process the CSV data using our utility function
        const { campaigns, errors, warnings } = processCsvData(csvContent);
        
        // Show validation errors if any
        if (errors.length > 0) {
          toast.error(
            <div>
              <p>Import had errors:</p>
              <ul className="text-sm mt-2 max-h-40 overflow-auto list-disc pl-4">
                {errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {errors.length > 5 && <li>...and {errors.length - 5} more errors</li>}
              </ul>
            </div>
          );
        }
        
        // Show warnings if any
        if (warnings.length > 0) {
          toast.warning(
            <div>
              <p>Import had warnings:</p>
              <ul className="text-sm mt-2 max-h-40 overflow-auto list-disc pl-4">
                {warnings.slice(0, 5).map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
                {warnings.length > 5 && <li>...and {warnings.length - 5} more warnings</li>}
              </ul>
            </div>
          );
        }
        
        // Process imported campaigns
        if (campaigns.length > 0) {
          onFileUpload(campaigns);
          toast.success(`Imported ${campaigns.length} campaigns successfully`);
        } else if (errors.length === 0) {
          toast.error('No valid campaigns found in the CSV file');
        }
      } catch (error) {
        console.error('Error processing CSV:', error);
        toast.error(`Failed to process CSV file: ${(error as Error).message}`);
      }
      
      // Reset the file input
      event.target.value = '';
    };
    
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error('Failed to read the file');
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };
  };

  // Export current campaigns to CSV template
  const downloadTemplate = () => {
    // Define valid options as comments in the template
    const headerComment = `# Campaign Import Template
# 
# REQUIRED FIELDS:
# - campaignName: Name of your campaign
# - campaignType: Must be one of: "In-Account Events (1:1)", "Exec Engagement Programs", "CxO Events (1:Few)", etc.
# - region: Must be one of: "North APAC", "South APAC", "SAARC", "Digital"
# - country: Country where campaign is running
# - owner: Campaign owner name
#
# MULTI-SELECT FIELDS (comma-separated):
# - strategicPillars: e.g. "Account Growth and Product Adoption, New Logo Acquisition"
# - impactedRegions: For Digital campaigns, list affected regions
#
# STATUS OPTIONS: "Planning", "On Track", "Shipped", "Cancelled"
# 
# Special calculation for "In-Account Events (1:1)":
# If expectedLeads is empty but forecastedCost is provided, pipeline will be calculated as 20× the cost.
`;

    // Define the CSV template structure with example data
    const templateData = [
      {
        id: "",
        campaignName: "Example Webinar Campaign",
        campaignType: "Webinars",
        strategicPillars: "Account Growth and Product Adoption, New Logo Acquisition",
        revenuePlay: "All",
        fiscalYear: "FY25",
        quarterMonth: "Q1 - July",
        region: "North APAC",
        country: "Japan",
        owner: "Tomoko Tanaka",
        description: "Example campaign - replace with real data",
        forecastedCost: "15000",
        expectedLeads: "100",
        impactedRegions: "South APAC, SAARC",
        status: "Planning",
        poRaised: "false",
        campaignCode: "",
        issueLink: "",
        actualCost: "",
        actualLeads: "",
        actualMQLs: ""
      },
      {
        id: "",
        campaignName: "In-Account Executive Event",
        campaignType: "In-Account Events (1:1)",
        strategicPillars: "Pipeline Acceleration & Executive Engagement",
        revenuePlay: "Secure all developer workloads with the power of AI",
        fiscalYear: "FY25",
        quarterMonth: "Q2 - October",
        region: "SAARC",
        country: "India",
        owner: "Shruti Narang",
        description: "Executive roundtable for enterprise accounts",
        forecastedCost: "25000",
        expectedLeads: "",  // Deliberately empty to demonstrate 20:1 ROI calculation
        impactedRegions: "",
        status: "Planning",
        poRaised: "false",
        campaignCode: "",
        issueLink: "",
        actualCost: "",
        actualLeads: "",
        actualMQLs: ""
      },
      {
        id: "",
        campaignName: "Digital Marketing Campaign",
        campaignType: "Targeted Paid Ads & Content Syndication",
        strategicPillars: "Brand Awareness & Top of Funnel Demand Generation",
        revenuePlay: "Accelerate developer productivity with Copilot in VS Code and GitHub",
        fiscalYear: "FY25",
        quarterMonth: "Q3 - January",
        region: "Digital", // Example using Digital region
        country: "X APAC English", // Regional marker
        owner: "Beverly Leung",
        description: "Multi-region digital campaign",
        forecastedCost: "50000",
        expectedLeads: "200",
        impactedRegions: "North APAC, South APAC", // Impacted regions for Digital campaign
        status: "Planning",
        poRaised: "false",
        campaignCode: "",
        issueLink: "",
        actualCost: "",
        actualLeads: "",
        actualMQLs: ""
      },
      {
        id: "",
        campaignName: "Completed Campaign Example",
        campaignType: "Partners",
        strategicPillars: "New Logo Acquisition",
        revenuePlay: "All",
        fiscalYear: "FY25",
        quarterMonth: "Q1 - September",
        region: "South APAC",
        country: "Singapore",
        owner: "Giorgia Parham",
        description: "Example of a completed campaign with actuals",
        forecastedCost: "30000",
        expectedLeads: "80",
        impactedRegions: "",
        status: "Shipped", // Example of completed status
        poRaised: "true",
        campaignCode: "APAC-SG-FY25-001",
        issueLink: "https://github.com/issues/123",
        actualCost: "32500", // Showing actual costs
        actualLeads: "75",
        actualMQLs: "12"
      }
    ];

    // Generate CSV content with comment header
    const csv = Papa.unparse(templateData);
    const csvWithComments = headerComment + csv;
    const blob = new Blob([csvWithComments], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and click it
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'campaign_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template downloaded successfully');
  };

  // Export current campaigns to CSV
  const exportToCsv = () => {
    if (currentCampaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }
    
    try {
      // Generate CSV content using our utility function
      const csv = exportCampaignsToCsv(currentCampaigns);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and click it
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      link.setAttribute('download', `marketing_campaigns_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${currentCampaigns.length} campaigns successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export campaigns: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {/* Template Button */}
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={downloadTemplate}
        >
          <DownloadSimple className="h-4 w-4" />
          <span>Download Template</span>
        </Button>
        
        {/* Export Button */}
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={exportToCsv}
          disabled={currentCampaigns.length === 0}
        >
          <DownloadSimple className="h-4 w-4" />
          <span>Export {currentCampaigns.length} Campaigns</span>
        </Button>
        
        {/* Upload Button */}
        <Button
          variant="default"
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadSimple className="h-4 w-4" />
          <span>Upload CSV</span>
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
        <p className="mb-2 font-medium text-foreground text-xs">CSV Import Instructions:</p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>Download the template for correct column headers</li>
          <li>Required fields: Campaign Name, Type, Region, Country, Owner</li>
          <li>For multi-select fields (like Strategic Pillars), separate values with commas</li>
          <li>Numeric fields should contain only numbers without currency symbols</li>
          <li>Date fields should follow the format in the template</li>
        </ul>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileUpload}
      />
    </div>
  );
}