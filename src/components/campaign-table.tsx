import React, { useState, useEffect, useRef } from "react";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ROIDashboard } from "@/components/roi-dashboard";
import { CSVUploader } from "@/components/csv-uploader";
import { AICampaignSuggestions } from "@/components/ai-campaign-suggestions";
import { toast } from "sonner";
import { 
  PlusCircle, 
  Trash, 
  Download,
  UploadSimple,
  Check,
  ChartLineUp,
  InfoCircle,
  FloppyDisk
} from "@phosphor-icons/react";

// Type definitions
export interface Campaign {
  id: string;
  campaignType: string;
  strategicPillars: string[];
  revenuePlay: string;
  fiscalYear: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number | "";
  expectedLeads: number | "";
  impactedRegions?: string[]; // Optional field for Digital region campaigns
  // Calculated fields (not editable)
  mql?: number;
  sql?: number;
  opportunities?: number;
  pipelineForecast?: number;
  // Execution tracking fields
  status?: string;
  poRaised?: boolean;
  campaignCode?: string;
  issueLink?: string;
  actualCost: number | "";
  actualLeads?: number | "";
  actualMQLs?: number | "";
}

interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export const CampaignTable = ({ campaigns, setCampaigns }: CampaignTableProps) => {
  // Filter state
  const [selectedOwner, setSelectedOwner] = useState<string>("_all");
  
  // Constants for dropdown options
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

  const fiscalYears = ["FY24", "FY25", "FY26"];
  
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];
  
  const regions = ["North APAC", "South APAC", "SAARC", "Digital"];
  
  const countries = [
    "Afghanistan", "Australia", "Bangladesh", "Bhutan", "Brunei", 
    "Cambodia", "China", "Hong Kong", "India", "Indonesia", "Japan", 
    "Laos", "Malaysia", "Maldives", "Myanmar", "Nepal", "New Zealand", 
    "Pakistan", "Philippines", "Singapore", "South Korea", "Sri Lanka", 
    "Taiwan", "Thailand", "Vietnam", "X Apac"
  ];

  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  
  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Add a new row (campaign)
  const addCampaign = () => {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(2, 9),
      campaignType: campaignTypes[0] || "In-Account Events (1:1)",
      strategicPillars: [pillars[0]], // Add at least one pillar by default
      revenuePlay: revenuePlays[0] || "All",
      fiscalYear: fiscalYears[0] || "FY25",
      quarterMonth: quarters[0] || "Q1 - July",
      region: regions[0] || "North APAC",
      country: countries[0] || "Afghanistan",
      owner: selectedOwner !== "_all" ? selectedOwner : owners[0] || "Giorgia Parham", // Pre-select current filter owner or default
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

  // Handle cell value changes
  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const updatedCampaign = { ...campaign, [field]: value };
        
        // Recalculate derived metrics if needed
        if (field === 'expectedLeads') {
          if (typeof value === 'number' && !isNaN(value)) {
            const mqlValue = Math.round(value * 0.1); // 10% of leads
            const sqlValue = Math.round(value * 0.06); // 6% of leads
            const oppsValue = Math.round(sqlValue * 0.8); // 80% of SQLs
            const pipelineValue = oppsValue * 50000; // $50K per opportunity

            updatedCampaign.mql = mqlValue;
            updatedCampaign.sql = sqlValue;
            updatedCampaign.opportunities = oppsValue;
            updatedCampaign.pipelineForecast = pipelineValue;
          } else {
            // Reset calculated values if expectedLeads is empty or invalid
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

  // Handle strategic pillar selection
  const togglePillar = (id: string, pillar: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const pillars = [...campaign.strategicPillars];
        const index = pillars.indexOf(pillar);
        
        if (index > -1) {
          pillars.splice(index, 1);
        } else {
          pillars.push(pillar);
        }
        
        return { ...campaign, strategicPillars: pillars };
      }
      return campaign;
    }));
  };

  // Handle impacted regions selection
  const toggleImpactedRegion = (id: string, region: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const impactedRegions = [...(campaign.impactedRegions || [])];
        const index = impactedRegions.indexOf(region);
        
        if (index > -1) {
          impactedRegions.splice(index, 1);
        } else {
          impactedRegions.push(region);
        }
        
        return { ...campaign, impactedRegions };
      }
      return campaign;
    }));
  };

  // Function to export campaigns as JSON
  const exportCampaignsAsJSON = () => {
    try {
      // Create a JSON blob
      const campaignsJson = JSON.stringify(campaigns, null, 2);
      const blob = new Blob([campaignsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketing-campaigns-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting campaigns:', error);
      toast.error("Failed to export campaigns");
    }
  };
  
  // Function to export campaigns as CSV
  const exportCampaignsAsCSV = () => {
    try {
      // Convert campaigns to CSV format
      const headers = [
        'Campaign Type', 'Strategic Pillars', 'Revenue Play', 'Fiscal Year',
        'Quarter/Month', 'Region', 'Country', 'Owner', 'Description',
        'Forecasted Cost', 'Expected Leads', 'MQLs', 'SQLs',
        'Opportunities', 'Pipeline Forecast', 'Status', 'PO Raised',
        'Campaign Code', 'Issue Link', 'Actual Cost', 'Actual Leads', 'Actual MQLs'
      ].join(',');
      
      const rows = campaigns.map(c => [
        `"${c.campaignType || ''}"`,
        `"${c.strategicPillars?.join('; ') || ''}"`,
        `"${c.revenuePlay || ''}"`,
        `"${c.fiscalYear || ''}"`,
        `"${c.quarterMonth || ''}"`,
        `"${c.region || ''}"`,
        `"${c.country || ''}"`,
        `"${c.owner || ''}"`,
        `"${c.description?.replace(/"/g, '""') || ''}"`,
        c.forecastedCost !== '' ? c.forecastedCost : '',
        c.expectedLeads !== '' ? c.expectedLeads : '',
        c.mql || '',
        c.sql || '',
        c.opportunities || '',
        c.pipelineForecast || '',
        `"${c.status || ''}"`,
        c.poRaised ? 'Yes' : 'No',
        `"${c.campaignCode || ''}"`,
        `"${c.issueLink || ''}"`,
        c.actualCost !== '' ? c.actualCost : '',
        c.actualLeads !== '' ? c.actualLeads : '',
        c.actualMQLs !== '' ? c.actualMQLs : ''
      ].join(','));
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketing-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting campaigns as CSV:', error);
      toast.error("Failed to export campaigns as CSV");
    }
  };

  // Handle numeric input changes
  const handleNumericChange = (
    id: string,
    field: 'forecastedCost' | 'expectedLeads' | 'actualCost' | 'actualLeads' | 'actualMQLs',
    value: string
  ) => {
    if (value === "") {
      updateCampaign(id, field, "");
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        updateCampaign(id, field, numValue);
      }
    }
  };

  // Export table data to CSV
  const exportToCSV = () => {
    // Headers including calculated fields
    const headers = [
      "Campaign Type", "Strategic Pillars", "Revenue Play", 
      "Fiscal Year", "Quarter/Month", "Region", "Country", "Impacted Regions", "Owner", 
      "Description", "Forecasted Cost", "Expected Leads",
      "MQLs (10%)", "SQLs (6%)", "Opportunities (80% of SQL)", "Pipeline Forecast",
      "Status", "PO Raised", "Campaign Code", "Issue Link", "Actual Cost", "Actual Leads", "Actual MQLs"
    ];
    
    // Convert campaign data to CSV rows
    const rows = campaigns.map(campaign => [
      campaign.campaignType,
      campaign.strategicPillars.join(', '),
      campaign.revenuePlay,
      campaign.fiscalYear,
      campaign.quarterMonth,
      campaign.region,
      campaign.country,
      campaign.impactedRegions ? campaign.impactedRegions.join(', ') : '',
      campaign.owner,
      campaign.description,
      typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0,
      typeof campaign.expectedLeads === 'number' ? campaign.expectedLeads : 0,
      campaign.mql || 0,
      campaign.sql || 0,
      campaign.opportunities || 0,
      campaign.pipelineForecast || 0,
      campaign.status || 'Planning',
      campaign.poRaised ? 'Yes' : 'No',
      campaign.campaignCode || '',
      campaign.issueLink || '',
      typeof campaign.actualCost === 'number' ? campaign.actualCost : '',
      typeof campaign.actualLeads === 'number' ? campaign.actualLeads : '',
      typeof campaign.actualMQLs === 'number' ? campaign.actualMQLs : ''
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Wrap text fields in quotes and handle commas
        if (typeof cell === 'string') {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campaign_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total forecasted cost
  const totalForecastedCost = campaigns.reduce((total, campaign) => {
    return total + (typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0);
  }, 0);

  // Calculate total actual cost
  const totalActualCost = campaigns.reduce((total, campaign) => {
    return total + (typeof campaign.actualCost === 'number' ? campaign.actualCost : 0);
  }, 0);

  // Import JSON data
  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedCampaigns = JSON.parse(content) as Campaign[];
        
        // Validate campaigns
        const validCampaigns = importedCampaigns.filter(c => 
          c.id && typeof c.id === 'string'
        );
        
        // Ask for confirmation if replacing existing data
        if (campaigns.length > 0) {
          if (confirm(`You currently have ${campaigns.length} campaigns. Do you want to replace them with ${validCampaigns.length} imported campaigns?`)) {
            setCampaigns(validCampaigns);
            toast.success(`Imported ${validCampaigns.length} campaigns successfully`);
          }
        } else {
          setCampaigns(validCampaigns);
          toast.success(`Imported ${validCampaigns.length} campaigns successfully`);
        }
      } catch (error) {
        console.error('Error importing campaigns:', error);
        toast.error('Failed to import campaigns. Invalid file format.');
      }
      
      // Reset file input
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };
  
  // Check if campaign is locked (cancelled or shipped)
  const isCampaignLocked = (campaign: Campaign) => {
    return campaign.status === "Cancelled" || campaign.status === "Shipped";
  };

  // Filter campaigns by owner
  const filteredCampaigns = selectedOwner === "_all"
    ? campaigns
    : campaigns.filter(campaign => campaign.owner === selectedOwner);
    
  // Reference for file input
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Campaign Planning</h2>
        <div className="flex space-x-2">
          {/* Export Buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCampaignsAsJSON}
            className="flex items-center gap-2"
            title="Export data to JSON file (for backup)"
          >
            <FloppyDisk className="h-4 w-4" />
            Export JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            className="flex items-center gap-2"
            title="Export data to CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          
          {/* Import JSON Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => jsonFileInputRef.current?.click()}
            className="flex items-center gap-2"
            title="Import from JSON backup file"
          >
            <UploadSimple className="h-4 w-4" />
            Import JSON
          </Button>
          <input
            type="file"
            ref={jsonFileInputRef}
            onChange={importFromJSON}
            accept=".json"
            className="hidden"
          />
          
          {/* Add Campaign Button */}
          <Button 
            onClick={addCampaign} 
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Campaign
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Owner Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="owner-filter" className="text-sm font-medium">Filter by Owner:</label>
            <Select
              value={selectedOwner}
              onValueChange={setSelectedOwner}
            >
              <SelectTrigger id="owner-filter" className="w-[180px]">
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Owners</SelectItem>
                {owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status info */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <InfoCircle className="h-3.5 w-3.5" />
            <span>Shipped or Cancelled campaigns are locked for editing</span>
          </div>
        </div>

        {/* Display campaign count */}
        <div className="text-sm text-muted-foreground">
          {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} 
          {selectedOwner !== "_all" ? ` for ${selectedOwner}` : ''}
        </div>
      </div>

      {/* CSV Uploader */}
      <CSVUploader 
        onCampaignsImported={(importedCampaigns) => {
          setCampaigns((prevCampaigns) => [...prevCampaigns, ...importedCampaigns]);
        }} 
      />

      <div className="space-y-6">
        <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Type</TableHead>
                  <TableHead>Strategic Pillars</TableHead>
                  <TableHead>Revenue Play</TableHead>
                  <TableHead>FY</TableHead>
                  <TableHead>Quarter/Month</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Forecasted Cost</TableHead>
                  <TableHead>Expected Leads</TableHead>
                  <TableHead>MQLs (10%)</TableHead>
                  <TableHead>SQLs (6%)</TableHead>
                  <TableHead>Opportunities</TableHead>
                  <TableHead>Pipeline Forecast</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center py-6 text-muted-foreground">
                      No campaigns added. Click "Add Campaign" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow 
                      key={campaign.id}
                      className={isCampaignLocked(campaign) ? "opacity-70" : ""}
                    >
                      {/* Campaign Type */}
                      <TableCell>
                        <Select
                          value={campaign.campaignType}
                          onValueChange={(value) => updateCampaign(campaign.id, 'campaignType', value)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {campaignTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Strategic Pillars - Multi-select */}
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-[180px] justify-start text-left font-normal"
                              size="sm"
                              disabled={isCampaignLocked(campaign)}
                            >
                              {campaign.strategicPillars.length > 0 
                                ? `${campaign.strategicPillars.length} selected`
                                : "Select pillars"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[220px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search pillars..." />
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup>
                                {pillars.map((pillar) => (
                                  <CommandItem
                                    key={pillar}
                                    onSelect={() => togglePillar(campaign.id, pillar)}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox 
                                      checked={campaign.strategicPillars.includes(pillar)}
                                      className="mr-2"
                                    />
                                    <span>{pillar}</span>
                                    {campaign.strategicPillars.includes(pillar) && (
                                      <Check className="h-4 w-4 ml-auto" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {campaign.strategicPillars.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.strategicPillars.map((pillar) => (
                              <Badge key={pillar} variant="outline" className="text-xs px-1 py-0">
                                {pillar.substring(0, 15)}...
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      {/* Revenue Play */}
                      <TableCell>
                        <Select
                          value={campaign.revenuePlay}
                          onValueChange={(value) => updateCampaign(campaign.id, 'revenuePlay', value)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select play" />
                          </SelectTrigger>
                          <SelectContent>
                            {revenuePlays.map((play) => (
                              <SelectItem key={play} value={play} className="whitespace-normal py-2">
                                {play}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Fiscal Year */}
                      <TableCell>
                        <Select
                          value={campaign.fiscalYear}
                          onValueChange={(value) => updateCampaign(campaign.id, 'fiscalYear', value)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="FY" />
                          </SelectTrigger>
                          <SelectContent>
                            {fiscalYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Quarter/Month */}
                      <TableCell>
                        <Select
                          value={campaign.quarterMonth}
                          onValueChange={(value) => updateCampaign(campaign.id, 'quarterMonth', value)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {quarters.map((quarter) => (
                              <SelectItem key={quarter} value={quarter}>
                                {quarter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Region */}
                      <TableCell>
                        <Select
                          value={campaign.region}
                          onValueChange={(value) => updateCampaign(campaign.id, 'region', value)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Country */}
                      <TableCell>
                        <Select
                          value={campaign.country}
                          onValueChange={(value) => updateCampaign(campaign.id, 'country', value)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Impacted Regions (only show for Digital region) */}
                        {campaign.region === "Digital" && (
                          <div className="mt-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-[180px] justify-start text-left font-normal"
                                  size="sm"
                                  disabled={isCampaignLocked(campaign)}
                                >
                                  {campaign.impactedRegions && campaign.impactedRegions.length > 0 
                                    ? `${campaign.impactedRegions.length} region(s) impacted`
                                    : "Select impacted regions"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[220px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search regions..." />
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  <CommandGroup>
                                    {regions.filter(r => r !== "Digital").map((region) => (
                                      <CommandItem
                                        key={region}
                                        onSelect={() => toggleImpactedRegion(campaign.id, region)}
                                        className="flex items-center gap-2"
                                      >
                                        <Checkbox 
                                          checked={campaign.impactedRegions?.includes(region)}
                                          className="mr-2"
                                        />
                                        <span>{region}</span>
                                        {campaign.impactedRegions?.includes(region) && (
                                          <Check className="h-4 w-4 ml-auto" />
                                        )}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {campaign.impactedRegions && campaign.impactedRegions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {campaign.impactedRegions.map((region) => (
                                  <Badge key={region} variant="outline" className="text-xs px-1 py-0">
                                    {region}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Owner */}
                      <TableCell>
                        <Select
                          value={campaign.owner}
                          onValueChange={(value) => updateCampaign(campaign.id, 'owner', value)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {owners.map((owner) => (
                              <SelectItem key={owner} value={owner}>
                                {owner}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <Input
                          value={campaign.description}
                          onChange={(e) => updateCampaign(campaign.id, 'description', e.target.value)}
                          placeholder="Brief description"
                          className="w-[180px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Forecasted Cost */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.forecastedCost === "" ? "" : campaign.forecastedCost}
                          onChange={(e) => handleNumericChange(campaign.id, 'forecastedCost', e.target.value)}
                          placeholder="USD"
                          className="w-[100px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Expected Leads */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.expectedLeads === "" ? "" : campaign.expectedLeads}
                          onChange={(e) => handleNumericChange(campaign.id, 'expectedLeads', e.target.value)}
                          placeholder="#"
                          className="w-[80px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Calculated fields (read-only) */}
                      <TableCell className="text-muted-foreground">
                        {campaign.mql || 0}
                      </TableCell>
                      
                      <TableCell className="text-muted-foreground">
                        {campaign.sql || 0}
                      </TableCell>
                      
                      <TableCell className="text-muted-foreground">
                        {campaign.opportunities || 0}
                      </TableCell>
                      
                      <TableCell className="font-medium">
                        {campaign.pipelineForecast ? formatCurrency(campaign.pipelineForecast) : "$0"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCampaign(campaign.id)}
                          disabled={isCampaignLocked(campaign)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {filteredCampaigns.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={9} className="text-right font-medium">
                      Total Forecasted Cost:
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(totalForecastedCost)}
                    </TableCell>
                    <TableCell colSpan={6}></TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

        {/* ROI Dashboard */}
        {campaigns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
              <ChartLineUp className="h-5 w-5" />
              ROI & Performance Dashboard
            </div>
            <ROIDashboard campaigns={campaigns} />
          </div>
        )}
        
        {/* AI Campaign Suggestions */}
        <AICampaignSuggestions 
          campaigns={campaigns} 
          onAddCampaign={(newCampaign) => {
            setCampaigns([...campaigns, newCampaign as Campaign]);
          }} 
        />
      </div>
    </div>
  );
};