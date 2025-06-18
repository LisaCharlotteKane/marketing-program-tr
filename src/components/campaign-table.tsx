import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { TrashSimple, FileCsv, Plus, ChartBar, FilterX, DownloadSimple, UploadSimple, Calculator } from "@phosphor-icons/react";
import { toast } from "sonner";
import Papa from "papaparse";
import { ClearFiltersButton } from "@/components/clear-filters-button";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Campaign type interface
export interface Campaign {
  id: string;
  campaignName: string; // Added campaign name field
  campaignType: string;
  strategicPillars: string[];
  revenuePlay: string;
  fiscalYear: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number | string;
  expectedLeads: number | string;
  impactedRegions?: string[];
  
  // Execution tracking fields
  status: string;
  poRaised: boolean;
  campaignCode: string;
  issueLink: string;
  actualCost: number | string;
  actualLeads: number | string;
  actualMQLs: number | string;
  
  // Calculated fields
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
}
export function CampaignTable({ 
  campaigns, 
  setCampaigns 
}: { 
  campaigns: Campaign[], 
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>> 
}) {
  // Mobile responsive state
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Selected campaigns for bulk operations
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  
  // Filter states
  const [selectedRegion, setSelectedRegion] = useState("_all");
  const [selectedQuarter, setSelectedQuarter] = useState("_all");
  const [selectedOwner, setOwnerFilter] = useState("_all");
  const [selectedPillar, setSelectedPillar] = useState("_all");
  const [selectedCampaignType, setSelectedCampaignType] = useState("_all");
  const [selectedRevenuePlay, setSelectedRevenuePlay] = useState("_all");
  
  // Derive unique values for filters
  const regions = ["_all", ...new Set(campaigns.map(c => c.region))].filter(Boolean);
  const availableQuarters = ["_all", ...new Set(campaigns.map(c => c.quarterMonth))].filter(Boolean);
  const owners = ["_all", ...new Set(campaigns.map(c => c.owner))].filter(Boolean);
  
  // Extract strategic pillars (flattened from arrays)
  const allPillars = campaigns.reduce((acc, campaign) => {
    if (Array.isArray(campaign.strategicPillars)) {
      acc.push(...campaign.strategicPillars);
    }
    return acc;
  }, [] as string[]);
  const availablePillars = ["_all", ...new Set(allPillars)].filter(Boolean);
  
  // Campaign types and revenue plays from the actual data
  const availableCampaignTypes = ["_all", ...new Set(campaigns.map(c => c.campaignType))].filter(Boolean);
  const availableRevenuePlays = ["_all", ...new Set(campaigns.map(c => c.revenuePlay))].filter(Boolean);
  
  // Default data options
  const campaignTypes = [
    "In-Account Events (1:1)",
    "Exec Engagement Programs",
    "CxO Events (1:Few)",
    "Localized Events",
    "Localized Programs",
    "Lunch & Learns and Workshops (1:Few)",
    "Microsoft",
    "Partners",
    "Webinars",
    "3P Sponsored Events",
    "Flagship Events (Galaxy, Universe Recaps) (1:Many)",
    "Targeted Paid Ads & Content Syndication",
    "User Groups",
    "Contractor/Infrastructure"
  ];
  
  const pillars = [
    "Account Growth and Product Adoption",
    "Pipeline Acceleration & Executive Engagement",
    "Brand Awareness & Top of Funnel Demand Generation",
    "New Logo Acquisition"
  ];
  
  const revenuePlays = [
    "Accelerate developer productivity with Copilot in VS Code and GitHub",
    "Secure all developer workloads with the power of AI",
    "All"
  ];
  
  const fiscalYears = ["FY25", "FY26"];
  
  const quarters = [
    "Q1 - July",
    "Q1 - August",
    "Q1 - September",
    "Q2 - October",
    "Q2 - November",
    "Q2 - December",
    "Q3 - January",
    "Q3 - February",
    "Q3 - March",
    "Q4 - April",
    "Q4 - May",
    "Q4 - June"
  ];
  
  const regionOptions = ["North APAC", "South APAC", "SAARC", "Digital"];
  
  const countries = [
    "Afghanistan",
    "Australia",
    "Bangladesh",
    "Bhutan",
    "Brunei",
    "Cambodia",
    "China",
    "Hong Kong",
    "India",
    "Indonesia",
    "Japan",
    "Laos",
    "Malaysia",
    "Maldives",
    "Myanmar",
    "Nepal",
    "New Zealand",
    "Pakistan",
    "Philippines",
    "Singapore",
    "South Korea",
    "Sri Lanka",
    "Taiwan",
    "Thailand",
    "Vietnam",
    "X APAC English",
    "X APAC Non English",
    "X South APAC",
    "X SAARC"
  ];
  
  const ownerOptions = [
    "Giorgia Parham",
    "Tomoko Tanaka",
    "Beverly Leung",
    "Shruti Narang"
  ];

  // Add a new row (campaign)
  const addCampaign = () => {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(2, 9),
      campaignName: "", // Initialize campaign name
      campaignType: campaignTypes[0] || "In-Account Events (1:1)",
      strategicPillars: [pillars[0]], // Add at least one pillar by default
      revenuePlay: revenuePlays[0] || "All",
      fiscalYear: fiscalYears[0] || "FY25",
      quarterMonth: quarters[0] || "Q1 - July",
      region: regionOptions[0] || "North APAC",
      country: countries[0] || "Afghanistan",
      owner: selectedOwner !== "_all" ? selectedOwner : ownerOptions[0] || "Giorgia Parham", // Pre-select current filter owner or default
      description: "",
      forecastedCost: "",
      expectedLeads: "",
      impactedRegions: [],
      // Initialize execution tracking fields
      status: "Planning",
      poRaised: false,
      campaignCode: "",
      issueLink: "",
      actualCost: "", // Ensure this is always initialized
      actualLeads: "",
      actualMQLs: "",
      // Initialize calculated fields
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: 0
    };
    setCampaigns([...campaigns, newCampaign]);
    toast.success('New campaign added successfully');
  };

  // Remove a row (campaign)
  const removeCampaign = (id: string) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id));
  };

  // Handle bulk deletion of selected campaigns
  const removeSelectedCampaigns = () => {
    if (selectedCampaigns.length === 0) return;
    
    setCampaigns(campaigns.filter(campaign => !selectedCampaigns.includes(campaign.id)));
    setSelectedCampaigns([]); // Clear selection after deletion
    toast.success(`${selectedCampaigns.length} campaign(s) deleted successfully`);
  };
  
  // Toggle selection of a campaign for bulk operations
  const toggleCampaignSelection = (id: string) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(id)) {
        return prev.filter(campaignId => campaignId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Toggle selection of all filtered campaigns
  const toggleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      // If all are selected, deselect all
      setSelectedCampaigns([]);
    } else {
      // Otherwise, select all filtered campaigns
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };

  // Handle cell value changes
  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const updatedCampaign = { ...campaign, [field]: value };
        
        // Recalculate derived metrics if needed
        if (field === 'expectedLeads' || field === 'forecastedCost' || field === 'campaignType') {
          // Special logic for "In-Account Events (1:1)" campaigns
          if (updatedCampaign.campaignType === "In-Account Events (1:1)") {
            // If leads are specified, use standard calculation
            if (typeof updatedCampaign.expectedLeads === 'number' && !isNaN(updatedCampaign.expectedLeads) && updatedCampaign.expectedLeads > 0) {
              const mqlValue = Math.round(updatedCampaign.expectedLeads * 0.1); // 10% of leads
              const sqlValue = Math.round(updatedCampaign.expectedLeads * 0.06); // 6% of leads
              const oppsValue = Math.round(sqlValue * 0.8); // 80% of SQLs
              const pipelineValue = oppsValue * 50000; // $50K per opportunity
              
              updatedCampaign.mql = mqlValue;
              updatedCampaign.sql = sqlValue;
              updatedCampaign.opportunities = oppsValue;
              updatedCampaign.pipelineForecast = pipelineValue;
            } 
            // If no leads but cost exists, use 20:1 ROI calculation
            else if (typeof updatedCampaign.forecastedCost === 'number' && !isNaN(updatedCampaign.forecastedCost) && updatedCampaign.forecastedCost > 0) {
              const pipelineValue = updatedCampaign.forecastedCost * 20; // 20:1 ROI based on cost
              
              // Set zeroes for other metrics since we're only deriving pipeline
              updatedCampaign.mql = 0;
              updatedCampaign.sql = 0;
              updatedCampaign.opportunities = 0;
              updatedCampaign.pipelineForecast = pipelineValue;
            } else {
              // Reset all values if neither leads nor costs are provided
              updatedCampaign.mql = 0;
              updatedCampaign.sql = 0;
              updatedCampaign.opportunities = 0;
              updatedCampaign.pipelineForecast = 0;
            }
          } 
          // Standard calculation for all other campaign types
          else if (typeof updatedCampaign.expectedLeads === 'number' && !isNaN(updatedCampaign.expectedLeads)) {
            const mqlValue = Math.round(updatedCampaign.expectedLeads * 0.1); // 10% of leads
            const sqlValue = Math.round(updatedCampaign.expectedLeads * 0.06); // 6% of leads
            const oppsValue = Math.round(sqlValue * 0.8); // 80% of SQLs
            const pipelineValue = oppsValue * 50000; // $50K per opportunity
            
            updatedCampaign.mql = mqlValue;
            updatedCampaign.sql = sqlValue;
            updatedCampaign.opportunities = oppsValue;
            updatedCampaign.pipelineForecast = pipelineValue;
          } else {
            // Reset calculated values if input is invalid
            updatedCampaign.mql = 0;
            updatedCampaign.sql = 0;
            updatedCampaign.opportunities = 0;
            updatedCampaign.pipelineForecast = 0;
          }
        }
        
        return updatedCampaign;
      }
      return campaign;
    }));
  };

  // Toggle strategic pillar selection
  const togglePillar = (id: string, pillar: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        // Ensure currentPillars is always an array, even if undefined in stored data
        const currentPillars = Array.isArray(campaign.strategicPillars) 
          ? [...campaign.strategicPillars] 
          : [];
        
        const pillarIndex = currentPillars.indexOf(pillar);
        
        if (pillarIndex >= 0) {
          // Remove if already selected
          currentPillars.splice(pillarIndex, 1);
        } else {
          // Add if not selected
          currentPillars.push(pillar);
        }
        
        return {
          ...campaign,
          strategicPillars: currentPillars
        };
      }
      return campaign;
    }));
  };

  // Format currency
  const formatCurrency = (value: number | string) => {
    if (value === "" || typeof value !== 'number') return "";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Export campaigns to CSV
  const exportToCsv = () => {
    if (campaigns.length === 0) {
      toast.error('No campaigns to export');
      return;
    }
    
    // Flatten the campaigns for CSV export
    const flattenedCampaigns = campaigns.map(c => ({
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

  // Import campaigns from JSON file
  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedCampaigns = JSON.parse(content) as Campaign[];
        
        // Validate the imported campaigns
        const validCampaigns = importedCampaigns.filter(
          campaign => campaign.id && campaign.campaignType
        );
        
        if (validCampaigns.length !== importedCampaigns.length) {
          // Some campaigns were invalid
          toast.warning(`Imported ${validCampaigns.length} of ${importedCampaigns.length} campaigns. Some were invalid.`);
          setCampaigns(validCampaigns);
        } else {
          // All campaigns were valid
          setCampaigns(validCampaigns);
          toast.success(`Imported ${validCampaigns.length} campaigns successfully`);
        }
      } catch (error) {
        console.error('Error importing campaigns:', error);
        toast.error('Failed to import campaigns. Invalid file format.');
      }
      
      // Reset the file input
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };

  // Check if a campaign is complete (shipped or cancelled)
  const isCampaignComplete = (campaign: Campaign) => {
    return campaign.status === "Cancelled" || campaign.status === "Shipped";
  };
  
  // Filter campaigns based on the selected filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const ownerMatch = selectedOwner === "_all" || campaign.owner === selectedOwner;
    const regionMatch = selectedRegion === "_all" || campaign.region === selectedRegion;
    const quarterMatch = selectedQuarter === "_all" || campaign.quarterMonth === selectedQuarter;
    
    // Check strategic pillar (if any pillar matches for multi-select field)
    const pillarMatch = selectedPillar === "_all" || 
      (Array.isArray(campaign.strategicPillars) && 
       campaign.strategicPillars.includes(selectedPillar));
    
    // Check campaign type and revenue play
    const campaignTypeMatch = selectedCampaignType === "_all" || 
      campaign.campaignType === selectedCampaignType;
      
    const revenuePlayMatch = selectedRevenuePlay === "_all" || 
      campaign.revenuePlay === selectedRevenuePlay;
    
    return ownerMatch && regionMatch && quarterMatch && 
           pillarMatch && campaignTypeMatch && revenuePlayMatch;
  });
  
  // Reference to file input for JSON import
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Download CSV template
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

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5 bg-slate-300">
          <h3 className="text-lg font-semibold">Campaign Planning</h3>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="flex items-center gap-2 shadow-sm"
              onClick={addCampaign}
            >
              <Plus className="h-4 w-4" />
              Add Campaign
            </Button>
            
            {selectedCampaigns.length > 0 && (
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                onClick={removeSelectedCampaigns}
              >
                <TrashSimple className="h-4 w-4" />
                Delete Selected ({selectedCampaigns.length})
              </Button>
            )}
          </div>
        </div>
        
        <div className="rounded-lg p-4 mb-4 bg-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FilterX className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Filter Campaigns</h4>
            </div>
            <ClearFiltersButton 
              onClick={() => {
                setSelectedOwner("_all");
                setSelectedRegion("_all");
                setSelectedQuarter("_all");
                setSelectedPillar("_all");
                setSelectedCampaignType("_all");
                setSelectedRevenuePlay("_all");
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <Select
                value={selectedRegion}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger id="region-filter" className="w-full bg-background">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Regions</SelectItem>
                  {regions.map(region => (
                    region && <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
                <SelectTrigger id="quarter-filter" className="w-full bg-background">
                  <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Quarters</SelectItem>
                  {availableQuarters.map(quarter => (
                    quarter && <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={selectedOwner}
                onValueChange={setOwnerFilter}
              >
                <SelectTrigger id="owner-filter" className="w-full bg-background">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Owners</SelectItem>
                  {owners.map(owner => (
                    owner && <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={selectedPillar}
                onValueChange={setSelectedPillar}
              >
                <SelectTrigger id="pillar-filter" className="w-full bg-background">
                  <SelectValue placeholder="Strategic Pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Pillars</SelectItem>
                  {availablePillars.filter(p => p !== "_all").map(pillar => (
                    pillar && <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={selectedCampaignType}
                onValueChange={setSelectedCampaignType}
              >
                <SelectTrigger id="campaign-type-filter" className="w-full bg-background">
                  <SelectValue placeholder="Campaign Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Types</SelectItem>
                  {availableCampaignTypes.filter(t => t !== "_all").map(type => (
                    type && <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={selectedRevenuePlay}
                onValueChange={setSelectedRevenuePlay}
              >
                <SelectTrigger id="revenue-play-filter" className="w-full bg-background">
                  <SelectValue placeholder="Revenue Play" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Plays</SelectItem>
                  {availableRevenuePlays.filter(p => p !== "_all").map(play => (
                    play && <SelectItem key={play} value={play}>{play}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      {/* Display error if no campaigns match filters */}
      {filteredCampaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 bg-card border rounded-lg text-center">
          <FilterX className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No campaigns match the filters</h3>
          <p className="text-muted-foreground mb-4 max-w-md">Try clearing some filters or add a new campaign to get started.</p>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedOwner("_all");
              setSelectedRegion("_all");
              setSelectedQuarter("_all");
              setSelectedPillar("_all");
              setSelectedCampaignType("_all");
              setSelectedRevenuePlay("_all");
            }}
          >
            <FilterX className="h-4 w-4" />
            <span>Clear All Filters</span>
          </Button>
        </div>
      )}
      {/* Campaign table */}
      {filteredCampaigns.length > 0 && (
        <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
          <div className="overflow-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={filteredCampaigns.length > 0 && selectedCampaigns.length === filteredCampaigns.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all campaigns"
                    />
                  </TableHead>
                  <TableHead className="w-[180px] font-medium">Campaign Name</TableHead>
                  <TableHead className="w-[180px] font-medium">Campaign Type</TableHead>
                  <TableHead className="w-[140px] font-medium">Strategic Pillar</TableHead>
                  <TableHead className="w-[140px] font-medium">Revenue Play</TableHead>
                  <TableHead className="w-[80px] font-medium">FY</TableHead>
                  <TableHead className="w-[110px] font-medium">Quarter</TableHead>
                  <TableHead className="w-[100px] font-medium">Region</TableHead>
                  <TableHead className="w-[120px] font-medium">Country</TableHead>
                  <TableHead className="w-[120px] font-medium">Owner</TableHead>
                  <TableHead className="w-[200px] font-medium">Description</TableHead>
                  <TableHead className="w-[120px] font-medium">Forecasted Cost</TableHead>
                  <TableHead className="w-[110px] font-medium">Expected Leads</TableHead>
                  <TableHead className="w-[80px] font-medium text-muted-foreground bg-muted/5">MQLs</TableHead>
                  <TableHead className="w-[80px] font-medium text-muted-foreground bg-muted/5">SQLs</TableHead>
                  <TableHead className="w-[110px] font-medium text-muted-foreground bg-muted/5">Opps</TableHead>
                  <TableHead className="w-[130px] font-medium text-primary bg-muted/5">Pipeline</TableHead>
                  <TableHead className="w-[80px] font-medium">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredCampaigns.map(campaign => (
                <TableRow 
                  key={campaign.id}
                  className={`${isCampaignComplete(campaign) ? "bg-muted/10" : ""} ${selectedCampaigns.includes(campaign.id) ? "bg-accent/20" : ""} hover:bg-muted/5`}
                >
                  {/* Selection Checkbox */}
                  <TableCell>
                    <Checkbox 
                      checked={selectedCampaigns.includes(campaign.id)}
                      onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                      aria-label={`Select campaign ${campaign.campaignName}`}
                    />
                  </TableCell>
                
                {/* Campaign Name */}
                <TableCell>
                  <Input
                    type="text"
                    value={campaign.campaignName || ""}
                    onChange={(e) => updateCampaign(campaign.id, 'campaignName', e.target.value)}
                    placeholder="Enter name"
                    className="w-full border-0 focus-visible:ring-1"
                    disabled={isCampaignComplete(campaign)}
                  />
                </TableCell>
                
                {/* Campaign Type */}
                <TableCell>
                  <Select
                    value={campaign.campaignType}
                    onValueChange={(value) => updateCampaign(campaign.id, 'campaignType', value)}
                    disabled={isCampaignComplete(campaign)}
                  >
                    <SelectTrigger className="w-full border-0 focus-visible:ring-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                {/* Strategic Pillars (Multi-select) */}
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start truncate border-0 shadow-none focus-visible:ring-1 h-8 px-2"
                        disabled={isCampaignComplete(campaign)}
                      >
                        {campaign.strategicPillars.length > 0 
                          ? (campaign.strategicPillars.length === 1 
                            ? campaign.strategicPillars[0].substring(0, 15) + (campaign.strategicPillars[0].length > 15 ? "..." : "") 
                            : `${campaign.strategicPillars.length} selected`)
                          : "Select pillars"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Strategic Pillars</DialogTitle>
                        <DialogDescription>
                          Choose one or more strategic pillars for this campaign.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {pillars.map(pillar => (
                          <div key={pillar} className="flex items-start space-x-2">
                            <Checkbox 
                              id={`pillar-${campaign.id}-${pillar}`}
                              checked={campaign.strategicPillars.includes(pillar)}
                              onCheckedChange={() => togglePillar(campaign.id, pillar)}
                            />
                            <Label 
                              htmlFor={`pillar-${campaign.id}-${pillar}`}
                              className="font-normal"
                            >
                              {pillar}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button type="button">Done</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                
                {/* Revenue Play */}
                <TableCell>
                  <Select
                    value={campaign.revenuePlay}
                    onValueChange={(value) => updateCampaign(campaign.id, 'revenuePlay', value)}
                    disabled={isCampaignComplete(campaign)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select play" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenuePlays.map(play => (
                        <SelectItem key={play} value={play}>{play}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                {/* Fiscal Year */}
                <TableCell>
                  <Select
                    value={campaign.fiscalYear}
                    onValueChange={(value) => updateCampaign(campaign.id, 'fiscalYear', value)}
                    disabled={isCampaignComplete(campaign)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="FY" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiscalYears.map(fy => (
                        <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                {/* Quarter/Month */}
                <TableCell>
                  <Select
                    value={campaign.quarterMonth}
                    onValueChange={(value) => updateCampaign(campaign.id, 'quarterMonth', value)}
                    disabled={isCampaignComplete(campaign)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map(q => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                {/* Region */}
                <TableCell>
                  <Select
                    value={campaign.region}
                    onValueChange={(value) => updateCampaign(campaign.id, 'region', value)}
                    disabled={isCampaignComplete(campaign)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionOptions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                {/* Country */}
                <TableCell>
                  <Select
                    value={campaign.country}
                    onValueChange={(value) => updateCampaign(campaign.id, 'country', value)}
                    disabled={isCampaignComplete(campaign)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                {/* Owner */}
                <TableCell>
                  <Select
                    value={campaign.owner}
                    onValueChange={(value) => updateCampaign(campaign.id, 'owner', value)}
                    disabled={isCampaignComplete(campaign)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map(owner => (
                        <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                
                {/* Description */}
                <TableCell>
                  <Input
                    type="text"
                    value={campaign.description || ""}
                    onChange={(e) => updateCampaign(campaign.id, 'description', e.target.value)}
                    placeholder="Enter description"
                    className="w-full"
                    disabled={isCampaignComplete(campaign)}
                  />
                </TableCell>
                
                {/* Forecasted Cost */}
                <TableCell>
                  <Input
                    type="number"
                    value={campaign.forecastedCost === "" ? "" : Number(campaign.forecastedCost)}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateCampaign(campaign.id, 'forecastedCost', value === "" ? "" : Number(value));
                    }}
                    placeholder="USD"
                    className="w-full"
                    disabled={isCampaignComplete(campaign)}
                  />
                </TableCell>
                
                {/* Expected Leads */}
                <TableCell>
                  <Input
                    type="number"
                    value={campaign.expectedLeads === "" ? "" : Number(campaign.expectedLeads)}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateCampaign(campaign.id, 'expectedLeads', value === "" ? "" : Number(value));
                    }}
                    placeholder="# Leads"
                    className="w-full"
                    disabled={isCampaignComplete(campaign)}
                  />
                </TableCell>
                
                {/* MQLs (Calculated) */}
                <TableCell className="text-muted-foreground bg-muted/5">
                  <div className="relative group">
                    <span className="font-mono text-xs">{campaign.mql}</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-md whitespace-nowrap z-50">
                      Auto-calculated: 10% of {typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : 0} leads
                    </div>
                  </div>
                </TableCell>
                
                {/* SQLs (Calculated) */}
                <TableCell className="text-muted-foreground bg-muted/5">
                  <div className="relative group">
                    <span className="font-mono text-xs">{campaign.sql}</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-md whitespace-nowrap z-50">
                      Auto-calculated: 6% of {typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : 0} leads
                    </div>
                  </div>
                </TableCell>
                
                {/* Opportunities (Calculated) */}
                <TableCell className="text-muted-foreground bg-muted/5">
                  <div className="relative group">
                    <span className="font-mono text-xs">{campaign.opportunities}</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-md whitespace-nowrap z-50">
                      Auto-calculated: 80% of {campaign.sql} SQLs
                    </div>
                  </div>
                </TableCell>
                
                {/* Pipeline Forecast (Calculated) */}
                <TableCell className="text-primary font-medium bg-muted/5">
                  <div className="relative group">
                    <span className="font-mono text-xs">{formatCurrency(campaign.pipelineForecast)}</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-md whitespace-nowrap z-50">
                      {campaign.campaignType === "In-Account Events (1:1)" && 
                       (typeof campaign.expectedLeads !== 'number' || campaign.expectedLeads <= 0) && 
                       typeof campaign.forecastedCost === 'number' && campaign.forecastedCost > 0 ? 
                        `Special calculation: ${formatCurrency(campaign.forecastedCost)} × 20 (20:1 ROI)` : 
                        `Auto-calculated: ${campaign.opportunities} × $50,000`
                      }
                    </div>
                  </div>
                </TableCell>
                
                {/* Status */}
                <TableCell>
                  <Badge 
                    variant={
                      campaign.status === "On Track" ? "default" : 
                      campaign.status === "Shipped" ? "outline" : 
                      campaign.status === "Cancelled" ? "destructive" : "secondary"
                    }
                    className={`whitespace-nowrap px-2 py-0.5 ${
                      campaign.status === "Shipped" ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200" :
                      campaign.status === "Planning" ? "bg-muted text-muted-foreground" :
                      ""
                    }`}
                  >
                    {campaign.status}
                  </Badge>
                </TableCell>
                
                {/* Actions */}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCampaign(campaign.id)}
                  >
                    <TrashSimple className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {/* Mobile Summary - Above for mobile, Below for desktop */}
      {isMobile && filteredCampaigns.length > 0 && (
        <div className="mt-8 rounded-lg bg-card border shadow-sm p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <ChartBar className="h-5 w-5 text-primary" />
            Campaign Summary
          </h3>
          <div className="grid grid-cols-2 gap-5">
            <div className="p-3 rounded-md bg-background border">
              <dt className="text-xs text-muted-foreground mb-1">Total Campaigns</dt>
              <dd className="text-2xl font-semibold">{filteredCampaigns.length}</dd>
            </div>
            <div className="p-3 rounded-md bg-background border">
              <dt className="text-xs text-muted-foreground mb-1">Forecasted Cost</dt>
              <dd className="text-2xl font-semibold">
                {formatCurrency(filteredCampaigns.reduce((sum, c) => 
                  sum + (typeof c.forecastedCost === 'number' ? c.forecastedCost : 0), 0))}
              </dd>
            </div>
            <div className="p-3 rounded-md bg-background border">
              <dt className="text-xs text-muted-foreground mb-1">Expected Leads</dt>
              <dd className="text-2xl font-semibold">
                {filteredCampaigns.reduce((sum, c) => 
                  sum + (typeof c.expectedLeads === 'number' ? c.expectedLeads : 0), 0)}
              </dd>
            </div>
            <div className="p-3 rounded-md bg-background border">
              <dt className="text-xs text-muted-foreground mb-1">Pipeline Forecast</dt>
              <dd className="text-2xl font-semibold">
                {formatCurrency(filteredCampaigns.reduce((sum, c) => sum + c.pipelineForecast, 0))}
              </dd>
            </div>
          </div>
        </div>
      )}
      {/* Auto-calculation Info Alert - Styled more cleanly */}
      <div className="bg-card rounded-lg shadow-sm border p-5 mt-8">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Calculator className="h-4 w-4 text-primary" />
          Auto-Calculated Metrics
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Standard calculations based on <span className="font-medium text-foreground">Expected Leads</span>:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 p-3 rounded-md">
                <Badge variant="outline" className="font-mono mb-1">MQLs</Badge>
                <p className="text-sm text-muted-foreground">10% of Expected Leads</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-md">
                <Badge variant="outline" className="font-mono mb-1">SQLs</Badge>
                <p className="text-sm text-muted-foreground">6% of Expected Leads</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-md">
                <Badge variant="outline" className="font-mono mb-1">Opps</Badge>
                <p className="text-sm text-muted-foreground">80% of SQLs</p>
              </div>
              <div className="bg-muted/20 p-3 rounded-md">
                <Badge variant="outline" className="font-mono mb-1">Pipeline</Badge>
                <p className="text-sm text-muted-foreground">Opps × $50,000</p>
              </div>
            </div>
          </div>
          
          <div className="border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6 mt-4 sm:mt-0">
            <div className="bg-muted/20 p-4 rounded-md">
              <h5 className="text-sm font-medium mb-2">Special Logic for "In-Account Events (1:1)":</h5>
              <p className="text-sm text-muted-foreground">
                If no leads are provided, pipeline is calculated as 20× the forecasted cost (20:1 ROI).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t flex items-center gap-2">
              <div className="bg-accent/30 px-2 py-1 rounded text-xs text-primary font-medium">TIP</div>
              <span className="text-sm text-muted-foreground">Hover over calculated values to see formula details.</span>
            </div>
          </div>
        </div>
      </div>
      {/* Add JSON importing functionality */}
      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => {
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
                      campaignType: row.campaignType || campaignTypes[0],
                      strategicPillars: row.strategicPillars?.split(",").map((p: string) => p.trim()) || [pillars[0]],
                      revenuePlay: row.revenuePlay || revenuePlays[0],
                      fiscalYear: row.fiscalYear || fiscalYears[0],
                      quarterMonth: row.quarterMonth || quarters[0],
                      region: row.region || regionOptions[0],
                      country: row.country || countries[0],
                      owner: row.owner || ownerOptions[0],
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
                    const validRegions = regionOptions;
                    if (!validRegions.includes(campaign.region as string)) {
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
                  setCampaigns((prevCampaigns) => [...prevCampaigns, ...importedCampaigns]);
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
        }}
      />
    </div>
  );
}