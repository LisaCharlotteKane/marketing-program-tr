import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";
import { UploadSimple, DownloadSimple } from "@phosphor-icons/react";
import { Campaign } from "@/components/campaign-table";
import { processCsvData, exportCampaignsToCsv } from "@/utils/csv-helper";
import { CsvPreviewModal } from "@/components/csv-preview-modal";

interface FileUploaderProps {
  onFileUpload: (campaigns: Campaign[]) => void;
  currentCampaigns: Campaign[];
}

export function FileUploader({ onFileUpload, currentCampaigns }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    campaigns: Campaign[];
    errors: string[];
    warnings: string[];
  }>({
    campaigns: [],
    errors: [],
    warnings: []
  });

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
        
        // Debug CSV content start to help diagnose issues
        console.log("CSV content first 200 chars:", csvContent.substring(0, 200));
        
        // Process the CSV data using our utility function
        const { campaigns, errors, warnings } = processCsvData(csvContent);
        
        console.log("Processed campaigns data:", {
          totalImported: campaigns.length,
          numericFieldSamples: campaigns.slice(0, 3).map(c => ({
            id: c.id,
            campaignName: c.campaignName,
            forecastedCost: c.forecastedCost,
            expectedLeads: c.expectedLeads,
            typeForecastedCost: typeof c.forecastedCost,
            typeExpectedLeads: typeof c.expectedLeads,
            strategicPillars: c.strategicPillars,
            calculatedMql: c.mql,
            calculatedSql: c.sql,
            calculatedOpps: c.opportunities,
            calculatedPipeline: c.pipelineForecast
          }))
        });
        
        // Check for any numeric field issues before passing to parent component
        const checkNumericIssues = campaigns.some(c => 
          (c.forecastedCost === undefined || c.forecastedCost === null) ||
          (c.expectedLeads === undefined || c.expectedLeads === null) ||
          (typeof c.forecastedCost === 'string' && c.forecastedCost !== "") ||
          (typeof c.expectedLeads === 'string' && c.expectedLeads !== "")
        );
        
        if (checkNumericIssues) {
          console.warn("Potential numeric field issues detected in imported campaigns");
          
          // Try to correct any string numeric values one more time
          campaigns.forEach(campaign => {
            // Fix forecastedCost if it's a string but should be a number
            if (typeof campaign.forecastedCost === 'string' && campaign.forecastedCost !== "") {
              try {
                // More aggressive cleaning - remove all non-numeric characters except decimal point
                const cleanedValue = campaign.forecastedCost.replace(/[^0-9.-]/g, '');
                const parsedCost = parseFloat(cleanedValue);
                if (!isNaN(parsedCost)) {
                  campaign.forecastedCost = parsedCost;
                  console.log(`Fixed forecastedCost for ${campaign.campaignName}: ${parsedCost} (from "${campaign.forecastedCost}")`);
                }
              } catch (err) {
                console.error(`Error parsing forecastedCost: ${campaign.forecastedCost}`, err);
              }
            }
            
            // Fix expectedLeads if it's a string but should be a number
            if (typeof campaign.expectedLeads === 'string' && campaign.expectedLeads !== "") {
              try {
                // More aggressive cleaning - remove all non-numeric characters except decimal point
                const cleanedValue = campaign.expectedLeads.replace(/[^0-9.-]/g, '');
                const parsedLeads = parseFloat(cleanedValue);
                if (!isNaN(parsedLeads)) {
                  campaign.expectedLeads = parsedLeads;
                  console.log(`Fixed expectedLeads for ${campaign.campaignName}: ${parsedLeads} (from "${campaign.expectedLeads}")`);
                }
              } catch (err) {
                console.error(`Error parsing expectedLeads: ${campaign.expectedLeads}`, err);
              }
            }
            
            // Also fix actualCost, actualLeads, and actualMQLs
            if (typeof campaign.actualCost === 'string' && campaign.actualCost !== "") {
              try {
                const cleanedValue = campaign.actualCost.replace(/[^0-9.-]/g, '');
                const parsedValue = parseFloat(cleanedValue);
                if (!isNaN(parsedValue)) {
                  campaign.actualCost = parsedValue;
                  console.log(`Fixed actualCost for ${campaign.campaignName}: ${parsedValue} (from "${campaign.actualCost}")`);
                }
              } catch (err) {
                console.error(`Error parsing actualCost: ${campaign.actualCost}`, err);
              }
            }
            
            if (typeof campaign.actualLeads === 'string' && campaign.actualLeads !== "") {
              try {
                const cleanedValue = campaign.actualLeads.replace(/[^0-9.-]/g, '');
                const parsedValue = parseFloat(cleanedValue);
                if (!isNaN(parsedValue)) {
                  campaign.actualLeads = parsedValue;
                  console.log(`Fixed actualLeads for ${campaign.campaignName}: ${parsedValue} (from "${campaign.actualLeads}")`);
                }
              } catch (err) {
                console.error(`Error parsing actualLeads: ${campaign.actualLeads}`, err);
              }
            }
            
            if (typeof campaign.actualMQLs === 'string' && campaign.actualMQLs !== "") {
              try {
                const cleanedValue = campaign.actualMQLs.replace(/[^0-9.-]/g, '');
                const parsedValue = parseFloat(cleanedValue);
                if (!isNaN(parsedValue)) {
                  campaign.actualMQLs = parsedValue;
                  console.log(`Fixed actualMQLs for ${campaign.campaignName}: ${parsedValue} (from "${campaign.actualMQLs}")`);
                }
              } catch (err) {
                console.error(`Error parsing actualMQLs: ${campaign.actualMQLs}`, err);
              }
            }
            
            // Always recalculate derived fields after fixing numeric inputs
            if ((typeof campaign.forecastedCost === 'number' && !isNaN(campaign.forecastedCost)) || 
                (typeof campaign.expectedLeads === 'number' && !isNaN(campaign.expectedLeads))) {
              
              // Check for In-Account programs (various naming variations)
              const isInAccountEvent = campaign.campaignType?.includes("In-Account") || 
                                     campaign.campaignType?.includes("In Account") ||
                                     campaign.campaignType === "In-Account Events (1:1)";
              
              if (isInAccountEvent) {
                if (typeof campaign.expectedLeads === 'number' && campaign.expectedLeads > 0) {
                  // Standard calculation if leads are provided
                  campaign.mql = Math.round(campaign.expectedLeads * 0.1);
                  campaign.sql = Math.round(campaign.mql * 0.06); // 6% of MQLs, not leads
                  campaign.opportunities = Math.round(campaign.sql * 0.8);
                  campaign.pipelineForecast = campaign.opportunities * 50000;
                } else if (typeof campaign.forecastedCost === 'number' && campaign.forecastedCost > 0) {
                  // 20:1 ROI for in-account events with cost but no leads
                  campaign.mql = 0;
                  campaign.sql = 0;
                  campaign.opportunities = 0;
                  campaign.pipelineForecast = campaign.forecastedCost * 20;
                }
              } else if (typeof campaign.expectedLeads === 'number' && campaign.expectedLeads > 0) {
                // Standard calculation for all other campaign types
                campaign.mql = Math.round(campaign.expectedLeads * 0.1);
                campaign.sql = Math.round(campaign.mql * 0.06); // 6% of MQLs, not leads
                campaign.opportunities = Math.round(campaign.sql * 0.8);
                campaign.pipelineForecast = campaign.opportunities * 50000;
              }
              
              console.log(`Recalculated derived fields for ${campaign.campaignName}:`, {
                expectedLeads: campaign.expectedLeads,
                forecastedCost: campaign.forecastedCost,
                mql: campaign.mql,
                sql: campaign.sql,
                opportunities: campaign.opportunities,
                pipelineForecast: campaign.pipelineForecast
              });
            }
          });
        }
        
        // Instead of immediately importing, set preview data and open the preview modal
        setPreviewData({
          campaigns,
          errors,
          warnings
        });
        setIsPreviewOpen(true);
        
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
  
  // Handle confirmation from the preview modal
  const handleConfirmImport = () => {
    const { campaigns, errors, warnings } = previewData;
    
    // Close the preview modal
    setIsPreviewOpen(false);
    
    // Show errors and warnings as toasts (reduced version since they've already seen them in the preview)
    if (errors.length > 0) {
      toast.error(`Import had ${errors.length} error${errors.length !== 1 ? 's' : ''}`);
    }
    
    if (warnings.length > 0) {
      toast.warning(`Import had ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`);
    }
    
    // Process imported campaigns
    if (campaigns.length > 0) {
      onFileUpload(campaigns);
      toast.success(`Imported ${campaigns.length} campaigns successfully`);
    } else if (errors.length === 0) {
      toast.error('No valid campaigns found in the CSV file');
    }
  };

  // Export current campaigns to CSV template
  const downloadTemplate = () => {
    // Define valid options as comments in the template
    const headerComment = `# Campaign Import Template
# 
# REQUIRED FIELDS:
# - campaignName: Name of your campaign
# - campaignType: Must be one of: "In-Account Events (1:1)", "Exec Engagement Programs", "CxO Events (1:Few)", etc.
# - region: Must be one of: "JP & Korea", "South APAC", "SAARC", "Digital Motions", etc.
# - country: Country where campaign is running
# - owner: Campaign owner name (determines budget pool allocation)
#
# STRATEGIC PILLARS (comma-separated, must match exactly):
# - "Account Growth and Product Adoption"
# - "Pipeline Acceleration & Executive Engagement"
# - "Brand Awareness & Top of Funnel Demand Generation"
# - "New Logo Acquisition"
#
# MULTI-SELECT FIELDS (comma-separated):
# - strategicPillars: e.g. "Account Growth and Product Adoption, New Logo Acquisition"
# - impactedRegions: For Digital campaigns, list affected regions
#
# STATUS OPTIONS: "Planning", "On Track", "Shipped", "Cancelled"
# 
# NUMERIC FIELDS: Enter just numbers without currency symbols, commas or other formatting
# - forecastedCost: e.g. "15000" (not "$15,000")
# - expectedLeads: e.g. "100" (not "100 leads")
# - actualCost: e.g. "15000" (not "$15,000")
# - actualLeads: e.g. "100" (not "100 leads")
#
# Special calculation for "In-Account Events (1:1)":
# If expectedLeads is empty but forecastedCost is provided, pipeline will be calculated as 20× the cost.
#`;

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
        region: "JP & Korea",
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
        campaignName: "Executive Engagement Example",
        campaignType: "Exec Engagement Programs",
        strategicPillars: "Pipeline Acceleration & Executive Engagement",
        revenuePlay: "Secure all developer workloads with the power of AI",
        fiscalYear: "FY25",
        quarterMonth: "Q2 - October",
        region: "SAARC",
        country: "India",
        owner: "Shruti Narang",
        description: "Executive roundtable for enterprise accounts",
        forecastedCost: "25000",
        expectedLeads: "50",
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
        region: "Digital Motions", // Example using Digital Motions region
        country: "X APAC English", // Regional marker
        owner: "Giorgia Parham", // Owner tied to Digital Motions budget
        description: "Multi-region digital campaign",
        forecastedCost: "50000",
        expectedLeads: "200",
        impactedRegions: "JP & Korea, South APAC", // Impacted regions for Digital campaign
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
        owner: "Beverly Leung",
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
    // Insert comment lines at the beginning of the file
    const csvWithComments = headerComment + "\n\n" + csv;
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
    
    toast.success('Template downloaded successfully', {
      description: 'A CSV template with sample data has been downloaded. Use this as a guide for formatting your import data.'
    });
  };

  const exportToCsv = () => {
    if (currentCampaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }

    try {
      const csv = exportCampaignsToCsv(currentCampaigns);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

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
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={downloadTemplate}
        >
          <DownloadSimple className="h-4 w-4" />
          <span>Download Template</span>
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={exportToCsv}
          disabled={currentCampaigns.length === 0}
        >
          <DownloadSimple className="h-4 w-4" />
          <span>Export {currentCampaigns.length} Campaigns</span>
        </Button>

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
          <li>Strategic Pillars column is comma-separated (e.g., "Account Growth and Product Adoption, New Logo Acquisition")</li>
          <li>Strategic Pillars must match exactly one of the valid options</li>
          <li><strong>Numeric fields (Forecasted Cost, Forecasted Leads) must contain only numbers - no currency symbols or commas</strong></li>
          <li><strong>Examples: Use "15000" not "$15,000" and "100" not "100 leads"</strong></li>
          <li>Empty numeric fields are allowed and will be treated as zero</li>
          <li>Date fields should follow the format in the template</li>
        </ul>
      </div>

      {/* Preview Modal */}
      <CsvPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        campaigns={previewData.campaigns}
        errors={previewData.errors}
        warnings={previewData.warnings}
        onConfirm={handleConfirmImport}
      />

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