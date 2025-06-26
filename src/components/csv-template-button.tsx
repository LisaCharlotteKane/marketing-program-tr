import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import Papa from "papaparse";

export function CsvTemplateButton() {
  const downloadTemplate = () => {
    // Define the header comment with detailed instructions
    const headerComment = `# Campaign Import Template
# 
# REQUIRED FIELDS:
# - campaignName: Name of your campaign
# - campaignType: Must be one of: "In-Account Events (1:1)", "Exec Engagement Programs", "CxO Events (1:Few)", etc.
# - region: Must be one of: "JP & Korea", "South APAC", "SAARC", "Digital Motions", etc.
# - country: Country where campaign is running
# - owner: Campaign owner name (determines budget pool allocation)
#
# QUARTER/MONTH FORMAT:
# - Must follow the format "Q1 - July", "Q2 - October", etc.
# - Quarter number (1-4) followed by month name
# - Month must be valid for that quarter (e.g., Q1 = July/Aug/Sept, Q2 = Oct/Nov/Dec, etc.)
#
# STRATEGIC PILLARS (comma-separated, must match exactly):
# - "Account Growth and Product Adoption"
# - "Pipeline Acceleration & Executive Engagement"
# - "Brand Awareness & Top of Funnel Demand Generation"
# - "New Logo Acquisition"
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

    // Define the CSV template structure with examples
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
        expectedLeads: "",
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
        campaignName: "Digital Campaign Example",
        campaignType: "Targeted Paid Ads & Content Syndication",
        strategicPillars: "Brand Awareness & Top of Funnel Demand Generation",
        revenuePlay: "Accelerate developer productivity with Copilot in VS Code and GitHub",
        fiscalYear: "FY25",
        quarterMonth: "Q3 - January",
        region: "Digital Motions",
        country: "X APAC English",
        owner: "Giorgia Parham",
        description: "Region-wide digital marketing campaign",
        forecastedCost: "50000",
        expectedLeads: "200",
        impactedRegions: "JP & Korea, South APAC",
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
        campaignName: "Completed Campaign with Actuals",
        campaignType: "Partners",
        strategicPillars: "New Logo Acquisition",
        revenuePlay: "All",
        fiscalYear: "FY25",
        quarterMonth: "Q4 - May",
        region: "South APAC",
        country: "Singapore",
        owner: "Beverly Leung",
        description: "Example of a completed campaign with actuals",
        forecastedCost: "30000",
        expectedLeads: "80",
        impactedRegions: "",
        status: "Shipped",
        poRaised: "true",
        campaignCode: "APAC-SG-FY25-001",
        issueLink: "https://github.com/issues/123",
        actualCost: "32500",
        actualLeads: "75",
        actualMQLs: "12"
      }
    ];

    // Generate CSV content with comment header
    const csv = Papa.unparse(templateData);
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

  return (
    <Button 
      variant="outline" 
      className="flex items-center gap-2"
      onClick={downloadTemplate}
    >
      <DownloadSimple className="h-4 w-4" />
      Download Template
    </Button>
  );
}