import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Warning, CheckCircle, Download } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Papa from "papaparse";
import { Campaign } from "./campaign-table";

interface CSVUploaderProps {
  onCampaignsImported: (campaigns: Campaign[]) => void;
}

export const CSVUploader = ({ onCampaignsImported }: CSVUploaderProps) => {
  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    type: "error" | "success" | null;
  }>({ message: "", type: null });

  const [isProcessing, setIsProcessing] = useState(false);

  // Required fields to validate in CSV
  const requiredFields = [
    "Campaign Type", 
    "Strategic Pillars", 
    "Revenue Play", 
    "Fiscal Year", 
    "Quarter/Month", 
    "Region", 
    "Country", 
    "Owner"
  ];

  // Map CSV headers to campaign object properties
  const headerMap: Record<string, keyof Campaign> = {
    "Campaign Name": "campaignName",
    "Campaign Type": "campaignType",
    "Strategic Pillars": "strategicPillars",
    "Revenue Play": "revenuePlay",
    "Fiscal Year": "fiscalYear",
    "Quarter/Month": "quarterMonth",
    "Region": "region",
    "Country": "country",
    "Impacted Regions": "impactedRegions",
    "Owner": "owner",
    "Description": "description",
    "Forecasted Cost": "forecastedCost",
    "Expected Leads": "expectedLeads"
  };

  // Generate template CSV for download
  const generateTemplateCSV = () => {
    try {
      // Create template CSV content
      const csvContent = `Campaign Name,Campaign Type,Strategic Pillars,Revenue Play,Fiscal Year,Quarter/Month,Region,Country,Owner,Description,Forecasted Cost,Expected Leads,Impacted Regions
Q1 Enterprise Workshop,In-Account Events (1:1),"Account Growth and Product Adoption,Pipeline Acceleration & Executive Engagement",Accelerate developer productivity with Copilot in VS Code and GitHub,FY24,Q2 - November,North APAC,Japan,Tomoko Tanaka,Enterprise customer workshop,15000,50,"South APAC,SAARC"
Developer Meetup,Localized Events,Brand Awareness & Top of Funnel Demand Generation,Secure all developer workloads with the power of AI,FY24,Q3 - January,SAARC,India,Shruti Narang,Developer community meetup,8000,100,
Cross-region Webinar,Webinars,New Logo Acquisition,All,FY24,Q4 - April,Digital,X Apac,Giorgia Parham,Cross-regional webinar series,5000,150,"North APAC,South APAC,SAARC"`;

      // Create blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      // Create and configure link element
      const link = document.createElement("a");
      link.href = url;
      link.download = "campaign_template.csv";
      link.style.display = "none";
      
      // Append to document, trigger click, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      setUploadStatus({
        message: "Template downloaded successfully",
        type: "success"
      });
      
      setTimeout(() => {
        setUploadStatus({ message: "", type: null });
      }, 3000);
    } catch (error) {
      console.error("Error generating template:", error);
      setUploadStatus({
        message: "Failed to download template: " + (error instanceof Error ? error.message : String(error)),
        type: "error"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setUploadStatus({ message: "", type: null });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadStatus({
            message: `Error parsing CSV: ${results.errors[0].message}`,
            type: "error"
          });
          setIsProcessing(false);
          return;
        }

        // Validate headers
        const headers = results.meta.fields || [];
        const missingRequiredFields = requiredFields.filter(
          field => !headers.includes(field)
        );

        if (missingRequiredFields.length > 0) {
          setUploadStatus({
            message: `Missing required columns: ${missingRequiredFields.join(", ")}`,
            type: "error"
          });
          setIsProcessing(false);
          return;
        }

        // Process data rows
        try {
          const validCampaigns: Campaign[] = [];
          const errors: string[] = [];
          
          results.data.forEach((row: any, index) => {
            try {
              // Create a new campaign with default values
              const campaign: Campaign = {
                id: Math.random().toString(36).substring(2, 9),
                campaignName: "",
                campaignType: "",
                strategicPillars: [],
                revenuePlay: "",
                fiscalYear: "",
                quarterMonth: "",
                region: "",
                country: "",
                owner: "",
                description: "",
                forecastedCost: "",
                expectedLeads: "",
                impactedRegions: [],
                // Initialize execution tracking fields
                status: "Planning",
                poRaised: false,
                campaignCode: "",
                issueLink: "",
                actualCost: "",
                actualLeads: "",
                actualMQLs: "",
                // Initialize calculated fields
                mql: 0,
                sql: 0,
                opportunities: 0,
                pipelineForecast: 0
              };
              
              // Map CSV data to campaign object
              Object.entries(headerMap).forEach(([csvHeader, campaignField]) => {
                if (row[csvHeader] !== undefined) {
                  // Handle special field types
                  if (campaignField === "strategicPillars" || campaignField === "impactedRegions") {
                    // Parse comma-separated values into arrays
                    campaign[campaignField] = row[csvHeader]
                      ? row[csvHeader].split(",").map((item: string) => item.trim())
                      : [];
                  } 
                  else if (campaignField === "forecastedCost" || campaignField === "expectedLeads") {
                    // Parse numeric values
                    const numValue = parseFloat(row[csvHeader]);
                    campaign[campaignField] = !isNaN(numValue) ? numValue : "";
                  } 
                  else {
                    // Handle string values
                    campaign[campaignField] = row[csvHeader];
                  }
                }
              });
              
              // Calculate derived metrics if expected leads is available
              if (typeof campaign.expectedLeads === 'number') {
                const mqlValue = Math.round(campaign.expectedLeads * 0.1); // 10% of leads
                const sqlValue = Math.round(campaign.expectedLeads * 0.06); // 6% of leads
                const oppsValue = Math.round(sqlValue * 0.8); // 80% of SQLs
                const pipelineValue = oppsValue * 50000; // $50K per opportunity

                campaign.mql = mqlValue;
                campaign.sql = sqlValue;
                campaign.opportunities = oppsValue;
                campaign.pipelineForecast = pipelineValue;
              }

              // Validate required fields
              const missingFields = requiredFields.filter(field => {
                const campaignField = headerMap[field];
                const value = campaign[campaignField];
                
                // Check if field has a value
                if (Array.isArray(value)) {
                  return value.length === 0;
                }
                return !value && value !== 0;
              });

              if (missingFields.length > 0) {
                errors.push(`Row ${index + 2}: Missing values for ${missingFields.join(", ")}`);
              } else {
                // Validate region
                const validRegions = ["North APAC", "South APAC", "SAARC", "Digital", "X APAC Non English", "X APAC English"];
                if (!validRegions.includes(campaign.region)) {
                  errors.push(`Row ${index + 2}: Invalid region "${campaign.region}".`);
                } else {
                  validCampaigns.push(campaign);
                }
              }
            } catch (err) {
              errors.push(`Error processing row ${index + 2}: ${err}`);
            }
          });

          if (errors.length > 0) {
            setUploadStatus({
              message: `Imported ${validCampaigns.length} campaigns with ${errors.length} errors. First error: ${errors[0]}`,
              type: "error"
            });
          } else if (validCampaigns.length === 0) {
            setUploadStatus({
              message: "No valid campaigns found in the CSV file.",
              type: "error"
            });
          } else {
            onCampaignsImported(validCampaigns);
            setUploadStatus({
              message: `Successfully imported ${validCampaigns.length} campaigns.`,
              type: "success"
            });
          }
        } catch (err) {
          setUploadStatus({
            message: `Error processing CSV data: ${err}`,
            type: "error"
          });
        }
        
        setIsProcessing(false);
        // Reset file input
        event.target.value = "";
      },
      error: (error) => {
        setUploadStatus({
          message: `Error reading CSV file: ${error.message}`,
          type: "error"
        });
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="relative"
            disabled={isProcessing}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {isProcessing ? "Processing..." : "Upload CSV"}
            </div>
          </Button>
          <div className="text-sm text-muted-foreground">
            Upload a CSV file with campaign data
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={generateTemplateCSV}
            type="button"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <div className="text-sm text-muted-foreground">
            Get a sample CSV template
          </div>
        </div>
      </div>

      {uploadStatus.type && (
        <Alert
          variant={uploadStatus.type === "error" ? "destructive" : "default"}
          className={uploadStatus.type === "error" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}
        >
          {uploadStatus.type === "error" ? (
            <Warning className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertTitle className={uploadStatus.type === "error" ? "text-red-800" : "text-green-800"}>
            {uploadStatus.type === "error" ? "Import Error" : "Import Successful"}
          </AlertTitle>
          <AlertDescription className={uploadStatus.type === "error" ? "text-red-700" : "text-green-700"}>
            {uploadStatus.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};