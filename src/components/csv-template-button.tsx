import React from "react";
import { Button } from "@/components/ui/button";
import { DownloadSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import Papa from "papaparse";

// Define the CSV template structure
const templateData = [
  {
    id: "",
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
    impactedRegions: "",
    status: "Planning",
    poRaised: "false",
    campaignCode: "",
    issueLink: "",
    actualCost: "",
    actualLeads: "",
    actualMQLs: ""
  }
];

export function CsvTemplateButton() {
  const downloadTemplate = () => {
    // Generate CSV content
    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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