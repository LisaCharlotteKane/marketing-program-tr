import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";
import { UploadSimple, DownloadSimple } from "@phosphor-icons/react";
import { Campaign } from "@/components/campaign-table";

interface FileUploaderProps {
  onFileUpload: (campaigns: Campaign[]) => void;
  currentCampaigns: Campaign[];
}

export function FileUploader({ onFileUpload, currentCampaigns }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    Papa.parse<any>(file, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Process CSV data
          const importedCampaigns: Campaign[] = [];
          const errors: string[] = [];
          
          results.data.forEach((row, index) => {
            // Skip empty rows
            if (Object.keys(row).length <= 1 && !row.id) return;
            
            try {
              // Validate and convert row data
              const campaign: Partial<Campaign> = {
                id: row.id || Math.random().toString(36).substring(2, 9),
                campaignName: row.campaignName || "",
                campaignType: row.campaignType || "",
                strategicPillars: row.strategicPillars?.split(",").map((p: string) => p.trim()) || [],
                revenuePlay: row.revenuePlay || "",
                fiscalYear: row.fiscalYear || "",
                quarterMonth: row.quarterMonth || "",
                region: row.region || "",
                country: row.country || "",
                owner: row.owner || "",
                description: row.description || "",
                forecastedCost: row.forecastedCost !== undefined ? Number(row.forecastedCost) : "",
                expectedLeads: row.expectedLeads !== undefined ? Number(row.expectedLeads) : "",
                impactedRegions: row.impactedRegions?.split(",").map((r: string) => r.trim()) || [],
                status: row.status || "Planning",
                poRaised: row.poRaised === "true" || row.poRaised === true,
                campaignCode: row.campaignCode || "",
                issueLink: row.issueLink || "",
                actualCost: row.actualCost !== undefined ? Number(row.actualCost) : "",
                actualLeads: row.actualLeads !== undefined ? Number(row.actualLeads) : "",
                actualMQLs: row.actualMQLs !== undefined ? Number(row.actualMQLs) : "",
                mql: Number(row.mql) || 0,
                sql: Number(row.sql) || 0,
                opportunities: Number(row.opportunities) || 0,
                pipelineForecast: Number(row.pipelineForecast) || 0
              };
              
              // Validate required fields
              const validRegions = ["North APAC", "South APAC", "SAARC", "Digital"];
              if (campaign.region && !validRegions.includes(campaign.region as string)) {
                errors.push(`Row ${index + 2}: Invalid region "${campaign.region}".`);
              }
              
              // Calculate derived fields
              if (campaign.campaignType === "In-Account Events (1:1)") {
                // Special logic for "In-Account Events (1:1)" campaigns
                if (campaign.expectedLeads !== undefined && campaign.expectedLeads !== "" && !isNaN(Number(campaign.expectedLeads)) && Number(campaign.expectedLeads) > 0) {
                  // Standard calculation if leads are provided
                  const leads = Number(campaign.expectedLeads);
                  campaign.mql = Math.round(leads * 0.1);
                  campaign.sql = Math.round(leads * 0.06);
                  campaign.opportunities = Math.round(campaign.sql * 0.8);
                  campaign.pipelineForecast = campaign.opportunities * 50000;
                } 
                // If no leads but cost exists, use 20:1 ROI calculation
                else if (campaign.forecastedCost !== undefined && campaign.forecastedCost !== "" && !isNaN(Number(campaign.forecastedCost)) && Number(campaign.forecastedCost) > 0) {
                  const cost = Number(campaign.forecastedCost);
                  campaign.pipelineForecast = cost * 20; // 20:1 ROI based on cost
                  campaign.mql = 0;
                  campaign.sql = 0;
                  campaign.opportunities = 0;
                }
              } 
              // Standard calculation for all other campaign types
              else if (campaign.expectedLeads !== undefined && campaign.expectedLeads !== "" && !isNaN(Number(campaign.expectedLeads))) {
                const leads = Number(campaign.expectedLeads);
                campaign.mql = Math.round(leads * 0.1);
                campaign.sql = Math.round(leads * 0.06);
                campaign.opportunities = Math.round(campaign.sql * 0.8);
                campaign.pipelineForecast = campaign.opportunities * 50000;
              }
              
              importedCampaigns.push(campaign as Campaign);
            } catch (error) {
              console.error('Error processing row:', error);
              errors.push(`Row ${index + 2}: ${(error as Error).message}`);
            }
          });
          
          if (errors.length > 0) {
            // Show validation errors
            toast.error(
              <div>
                <p>Import had validation errors:</p>
                <ul className="text-sm mt-2 max-h-40 overflow-auto list-disc pl-4">
                  {errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {errors.length > 5 && <li>...and {errors.length - 5} more errors</li>}
                </ul>
              </div>
            );
          }
          
          if (importedCampaigns.length > 0) {
            // Add imported campaigns to existing ones
            onFileUpload(importedCampaigns);
            toast.success(`Imported ${importedCampaigns.length} campaigns successfully`);
          } else {
            toast.error('No valid campaigns found in the CSV file');
          }
        }
        
        // Reset the file input
        event.target.value = '';
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error('Failed to parse CSV file');
        
        // Reset the file input
        event.target.value = '';
      }
    });
  };

  // Export current campaigns to CSV template
  const downloadTemplate = () => {
    // Define the CSV template structure
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
        expectedLeads: "20",
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

  // Export current campaigns to CSV
  const exportToCsv = () => {
    if (currentCampaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }
    
    // Flatten the campaigns for CSV export
    const flattenedCampaigns = currentCampaigns.map(c => ({
      ...c,
      strategicPillars: c.strategicPillars.join(", "),
      impactedRegions: c.impactedRegions ? c.impactedRegions.join(", ") : ""
    }));
    
    // Generate CSV content
    const csv = Papa.unparse(flattenedCampaigns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and click it
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketing_campaigns.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Campaigns exported successfully');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {/* Template Button */}
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={downloadTemplate}
      >
        <DownloadSimple className="h-4 w-4" />
        <span>Download Template</span>
      </Button>
      
      {/* Export Button */}
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={exportToCsv}
      >
        <DownloadSimple className="h-4 w-4" />
        <span>Export CSV</span>
      </Button>
      
      {/* Upload Button */}
      <Button
        variant="default"
        className="flex items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadSimple className="h-4 w-4" />
        <span>Upload CSV</span>
      </Button>
      
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