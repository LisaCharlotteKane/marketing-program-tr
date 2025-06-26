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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { TrashSimple, FileCsv, Plus, ChartBar, FilterX, DownloadSimple, UploadSimple, Calculator, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";
import Papa from "papaparse";
import { ClearFiltersButton } from "@/components/clear-filters-button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { FileUploader } from "@/components/file-uploader";
import { CsvTemplateButton } from "@/components/csv-template-button";

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
  
  // Import dialog state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
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
  
  const quartersMonths = [
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
  
  const regionOptions = ["JP & Korea", "South APAC", "SAARC", "Digital Motions", "X APAC Non English", "X APAC English"];
  
  const countries = [
    "Afghanistan",
    "ASEAN",
    "Australia",
    "Bangladesh",
    "Bhutan",
    "Brunei",
    "Cambodia",
    "China",
    "GCR",
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
    "X Apac",
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
  const addCampaign = async () => {
    // Use selected owner from filter or default to first owner in list
    const preselectedOwner = selectedOwner !== "_all" ? selectedOwner : ownerOptions[0] || "Giorgia Parham";
    
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(2, 9),
      campaignName: "", // Initialize campaign name
      campaignType: campaignTypes[0] || "In-Account Events (1:1)",
      strategicPillars: [pillars[0]], // Add at least one pillar by default
      revenuePlay: revenuePlays[0] || "All",
      fiscalYear: fiscalYears[0] || "FY25",
      quarterMonth: quartersMonths[0] || "Q1 - July",
      region: regionOptions[0] || "JP & Korea",
      country: countries[0] || "Afghanistan",
      owner: preselectedOwner,
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
    
    try {
      // Check budget pool for selected owner
      const { getOwnerInfo } = await import('@/services/budget-service');
      const { OWNER_TO_REGION_MAP } = await import('@/hooks/useRegionalBudgets');
      const ownerInfo = getOwnerInfo(preselectedOwner);
      
      // Calculate total cost for this owner's existing campaigns, excluding contractor types
      const ownerExistingCost = campaigns
        .filter(c => c.owner === preselectedOwner && 
                !(c.campaignType === "Contractor" || c.campaignType === "Contractor/Infrastructure"))
        .reduce((sum, c) => sum + (typeof c.forecastedCost === 'number' ? c.forecastedCost : 0), 0);
      
      // Check if owner is approaching budget limit
      if (ownerInfo.budget > 0) {
        const remainingBudget = ownerInfo.budget - ownerExistingCost;
        const percentRemaining = (remainingBudget / ownerInfo.budget) * 100;
        
        // Get region name for more informative messaging
        const regionName = OWNER_TO_REGION_MAP[preselectedOwner] || ownerInfo.region;
        
        if (percentRemaining < 10 && remainingBudget > 0) {
          toast.warning(`${preselectedOwner} has only ${formatCurrency(remainingBudget)} budget remaining (${percentRemaining.toFixed(1)}%) in ${regionName}`,
            { duration: 5000 });
        } else if (remainingBudget <= 0) {
          toast.error(`${preselectedOwner} has exceeded their ${regionName} budget pool by ${formatCurrency(Math.abs(remainingBudget))}`, 
            { duration: 5000 });
        }
      }
    } catch (error) {
      console.error("Error checking budget info:", error);
      // Continue with campaign creation even if budget check fails
    }
    
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

  // Update campaign cell value changes
  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        let updatedValue = value;
        
        // Handle special case for quarterMonth - parse it correctly
        if (field === 'quarterMonth' && typeof value === 'string') {
          updatedValue = parseQuarterMonth(value);
        }
        
        // Handle numeric fields - ensure proper cleaning and conversion
        if (['forecastedCost', 'expectedLeads', 'actualCost', 'actualLeads', 'actualMQLs'].includes(field) && 
            typeof value === 'string' && value !== '') {
          // Clean and parse numeric values
          const cleanedValue = value.replace(/[^0-9.-]/g, '');
          const parsedValue = parseFloat(cleanedValue);
          if (!isNaN(parsedValue)) {
            updatedValue = parsedValue;
          } else {
            // If we can't parse it, keep it as a string - will be handled elsewhere
            updatedValue = value;
          }
        }
        
        const updatedCampaign = { ...campaign, [field]: updatedValue };
        
        // Budget pool validation for owner + cost changes
        if ((field === 'forecastedCost' || field === 'owner' || field === 'campaignType') && 
            typeof updatedCampaign.forecastedCost === 'number' && 
            updatedCampaign.forecastedCost > 0 &&
            updatedCampaign.owner) {
          
          // Skip budget check for contractor campaigns
          if (updatedCampaign.campaignType === "Contractor" || updatedCampaign.campaignType === "Contractor/Infrastructure") {
            return updatedCampaign;
          }
          
          // We'll handle the budget validation in a separate function
          (async () => {
            try {
              // Import OWNER_TO_REGION_MAP from constants to ensure consistency
              const { OWNER_TO_REGION_MAP } = await import('@/hooks/useRegionalBudgets');
              const { getBudgetByRegion } = await import('@/services/budget-service');
              
              // Additional budget validation could go here if needed
            } catch (error) {
              console.error("Error loading budget modules:", error);
            }
          })();
          
          // Budget validation has been moved to the async function above
          
          // Budget pool constants - hardcoded to avoid async issues
          const budgetPoolByRegionOwner = {
            "JP & Korea": { 
              owner: "Tomoko Tanaka", 
              budget: 358000, // Hardcoded budget values from constants
              used: 0, 
              overage: 0 
            },
            "South APAC": { 
              owner: "Beverly Leung", 
              budget: 385500, // Hardcoded budget values from constants
              used: 0, 
              overage: 0 
            },
            "SAARC": { 
              owner: "Shruti Narang", 
              budget: 265000, // Hardcoded budget values from constants
              used: 0, 
              overage: 0 
            },
            "Digital Motions": { 
              owner: "Giorgia Parham", 
              budget: 68000, // Hardcoded budget values from constants
              used: 0, 
              overage: 0 
            },
          };
          
          // Get budget region from owner using imported constant
          const budgetRegion = OWNER_TO_REGION_MAP[updatedCampaign.owner];
          
          // Check if this owner has a budget region assigned
          if (budgetRegion && budgetPoolByRegionOwner[budgetRegion]) {
            // Filter campaigns by owner and exclude contractor types
            const otherCampaignsCost = campaigns
              .filter(c => c.id !== id && 
                      c.owner === updatedCampaign.owner && 
                      !(c.campaignType === "Contractor" || c.campaignType === "Contractor/Infrastructure"))
              .reduce((sum, c) => sum + (typeof c.forecastedCost === 'number' ? c.forecastedCost : 0), 0);
            
            // Calculate total cost with current campaign
            const totalCost = otherCampaignsCost + updatedCampaign.forecastedCost;
            const totalBudget = budgetPoolByRegionOwner[budgetRegion].budget;
            
            // Update used and calculate overage
            budgetPoolByRegionOwner[budgetRegion].used = totalCost;
            const remainingBudget = totalBudget - totalCost;
            
            if (remainingBudget < 0) {
              budgetPoolByRegionOwner[budgetRegion].overage = Math.abs(remainingBudget);
              
              // Only show warning if overage exceeds $500
              if (budgetPoolByRegionOwner[budgetRegion].overage > 500) {
                toast.warning(
                  `${updatedCampaign.owner} has exceeded their ${budgetRegion} budget by ${formatCurrency(budgetPoolByRegionOwner[budgetRegion].overage)}`,
                  { duration: 5000 }
                );
              }
            } else {
              budgetPoolByRegionOwner[budgetRegion].overage = 0;
            }
          }
        }
        
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
  
  // Helper function to parse quarter-month format
  const parseQuarterMonth = (value: string): string => {
    if (!value) return quartersMonths[0]; // Default to first quarter-month
    
    // Check if it's already in the correct format
    if (quartersMonths.includes(value)) {
      return value;
    }
    
    // Try to extract quarter and month with regex
    const qMatch = value.match(/[Qq]([1-4])/);
    const monthMatch = value.match(/([A-Za-z]+)/);
    
    if (qMatch && monthMatch) {
      const formattedValue = `Q${qMatch[1]} - ${monthMatch[1]}`;
      // Check if this is a valid quarter-month combination
      if (quartersMonths.includes(formattedValue)) {
        return formattedValue;
      }
    }
    
    // If we couldn't parse it properly, return the first quarter-month as default
    console.warn(`Could not parse quarter-month value: "${value}", using default`);
    return quartersMonths[0];
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

  // Handle file upload with campaigns
  const handleFileUpload = async (importedCampaigns: Campaign[]) => {
    if (!importedCampaigns || importedCampaigns.length === 0) {
      toast.error("No valid campaigns found in the uploaded file");
      return;
    }
    
    try {
      console.log("Importing campaigns:", importedCampaigns);
      
      // Process numeric fields to ensure they're correctly formatted
      const processedCampaigns = importedCampaigns.map(campaign => {
        const processed = { ...campaign };
        
        // Convert numeric fields to actual numbers if they're strings
        if (typeof processed.forecastedCost === 'string' && processed.forecastedCost !== '') {
          // Strip any currency symbols and commas
          const cleanValue = processed.forecastedCost.replace(/[$,]/g, '');
          const parsedCost = parseFloat(cleanValue);
          if (!isNaN(parsedCost)) {
            processed.forecastedCost = parsedCost;
            console.log(`Converted forecastedCost string to number: ${parsedCost}`);
          }
        }
        
        if (typeof processed.expectedLeads === 'string' && processed.expectedLeads !== '') {
          // Strip any commas
          const cleanValue = processed.expectedLeads.replace(/,/g, '');
          const parsedLeads = parseFloat(cleanValue);
          if (!isNaN(parsedLeads)) {
            processed.expectedLeads = parsedLeads;
            console.log(`Converted expectedLeads string to number: ${parsedLeads}`);
          }
        }
        
        if (typeof processed.actualCost === 'string' && processed.actualCost !== '') {
          // Strip any currency symbols and commas
          const cleanValue = processed.actualCost.replace(/[$,]/g, '');
          const parsedActualCost = parseFloat(cleanValue);
          if (!isNaN(parsedActualCost)) {
            processed.actualCost = parsedActualCost;
            console.log(`Converted actualCost string to number: ${parsedActualCost}`);
          }
        }
        
        if (typeof processed.actualLeads === 'string' && processed.actualLeads !== '') {
          // Strip any commas
          const cleanValue = processed.actualLeads.replace(/,/g, '');
          const parsedActualLeads = parseFloat(cleanValue);
          if (!isNaN(parsedActualLeads)) {
            processed.actualLeads = parsedActualLeads;
            console.log(`Converted actualLeads string to number: ${parsedActualLeads}`);
          }
        }
        
        if (typeof processed.actualMQLs === 'string' && processed.actualMQLs !== '') {
          // Strip any commas
          const cleanValue = processed.actualMQLs.replace(/,/g, '');
          const parsedActualMQLs = parseFloat(cleanValue);
          if (!isNaN(parsedActualMQLs)) {
            processed.actualMQLs = parsedActualMQLs;
            console.log(`Converted actualMQLs string to number: ${parsedActualMQLs}`);
          }
        }
        
        // Ensure all calculated fields are numbers (not strings)
        if (typeof processed.mql === 'string') {
          processed.mql = parseFloat(processed.mql) || 0;
        }
        
        if (typeof processed.sql === 'string') {
          processed.sql = parseFloat(processed.sql) || 0;
        }
        
        if (typeof processed.opportunities === 'string') {
          processed.opportunities = parseFloat(processed.opportunities) || 0;
        }
        
        if (typeof processed.pipelineForecast === 'string') {
          processed.pipelineForecast = parseFloat(processed.pipelineForecast) || 0;
        }
        
        // Handle special case for In-Account Events with no leads
        if (processed.campaignType === "In-Account Events (1:1)" && 
            (!processed.expectedLeads || processed.expectedLeads === 0 || processed.expectedLeads === "") && 
            typeof processed.forecastedCost === 'number' && processed.forecastedCost > 0) {
          // Calculate pipeline based on 20:1 ROI
          processed.pipelineForecast = processed.forecastedCost * 20;
          processed.mql = 0;
          processed.sql = 0;
          processed.opportunities = 0;
          console.log(`Applied 20:1 ROI for In-Account Events: ${processed.forecastedCost} * 20 = ${processed.pipelineForecast}`);
        } else if (typeof processed.expectedLeads === 'number' && processed.expectedLeads > 0) {
          // Standard calculation for campaigns with leads
          processed.mql = Math.round(processed.expectedLeads * 0.1);
          processed.sql = Math.round(processed.expectedLeads * 0.06);
          processed.opportunities = Math.round(processed.sql * 0.8);
          processed.pipelineForecast = processed.opportunities * 50000;
          console.log(`Applied standard ROI calculation: ${processed.expectedLeads} leads → ${processed.pipelineForecast} pipeline`);
        }
        
        return processed;
      });
      
      // Final debug check of processed campaigns
      console.log("Final processed campaigns sample:", processedCampaigns.slice(0, 2).map(c => ({
        id: c.id,
        campaignName: c.campaignName,
        forecastedCost: c.forecastedCost,
        typeForecastedCost: typeof c.forecastedCost,
        expectedLeads: c.expectedLeads,
        typeExpectedLeads: typeof c.expectedLeads,
        pipelineForecast: c.pipelineForecast
      })));
      
      // Budget validation before importing
      try {
        // Use an async IIFE to handle the dynamic imports
        (async () => {
          try {
            const { OWNER_TO_REGION_MAP } = await import('@/hooks/useRegionalBudgets');
            const { getBudgetByRegion } = await import('@/services/budget-service');
            
            // Group current campaigns by owner to calculate existing costs
            const existingCostByOwner: Record<string, number> = {};
            campaigns.forEach(campaign => {
              const owner = campaign.owner;
              if (!owner || !OWNER_TO_REGION_MAP[owner]) return;
              
              // Skip contractor campaigns for budget allocation
              if (campaign.campaignType === "Contractor" || campaign.campaignType === "Contractor/Infrastructure") {
                return;
              }
              
              const forecastedCost = typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0;
              existingCostByOwner[owner] = (existingCostByOwner[owner] || 0) + forecastedCost;
            });
            
            // Check each imported campaign for budget impact
            const budgetImpactByOwner: Record<string, { total: number, newCost: number, budgetLimit: number }> = {};
            
            processedCampaigns.forEach(campaign => {
              const owner = campaign.owner;
              if (!owner || !OWNER_TO_REGION_MAP[owner]) return;
              
              // Skip contractor campaigns for budget allocation
              if (campaign.campaignType === "Contractor" || campaign.campaignType === "Contractor/Infrastructure") {
                return;
              }
              
              const forecastedCost = typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0;
              if (forecastedCost <= 0) return;
              
              const budgetRegion = OWNER_TO_REGION_MAP[owner];
              const budgetLimit = getBudgetByRegion(budgetRegion);
              
              if (!budgetImpactByOwner[owner]) {
                budgetImpactByOwner[owner] = {
                  total: (existingCostByOwner[owner] || 0) + forecastedCost,
                  newCost: forecastedCost,
                  budgetLimit
                };
              } else {
                budgetImpactByOwner[owner].total += forecastedCost;
                budgetImpactByOwner[owner].newCost += forecastedCost;
              }
            });
            
            // Show warnings for budget overages
            Object.entries(budgetImpactByOwner).forEach(([owner, impact]) => {
              if (impact.total > impact.budgetLimit + 500) { // 500 buffer for rounding
                const overage = impact.total - impact.budgetLimit;
                const region = OWNER_TO_REGION_MAP[owner];
                
                toast.warning(
                  `These imports will cause ${owner} to exceed their ${region} budget by ${formatCurrency(overage)}`,
                  { duration: 6000 }
                );
              }
            });
          } catch (error) {
            console.error("Error in budget validation async code:", error);
          }
        })();
      } catch (error) {
        console.error("Error checking budget impact:", error);
        // Continue with import even if budget check fails
      }
      
      setCampaigns((prevCampaigns) => [...prevCampaigns, ...processedCampaigns]);
      setIsImportDialogOpen(false);
      toast.success(`Imported ${processedCampaigns.length} campaigns successfully`);
    } catch (error) {
      console.error("Error importing campaigns:", error);
      toast.error("Failed to import campaigns. Please check the file format.");
    }
  };

  // Check if a campaign is complete (shipped or cancelled)
  const isCampaignComplete = (campaign: Campaign) => {
    return campaign.status === "Cancelled" || campaign.status === "Shipped";
  };
  
  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedOwner("_all");
    setSelectedRegion("_all");
    setSelectedQuarter("_all");
    setSelectedPillar("_all");
    setSelectedCampaignType("_all");
    setSelectedRevenuePlay("_all");
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

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
          <h3 className="text-lg font-semibold">Campaign Planning</h3>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="flex items-center gap-2 shadow-sm"
              onClick={() => addCampaign()}
            >
              <Plus className="h-4 w-4" />
              Add Campaign
            </Button>
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <UploadSimple className="h-4 w-4" />
                  Import Campaigns
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Import Campaign Data</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with campaign data or download a template to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <FileUploader 
                    onFileUpload={handleFileUpload}
                    currentCampaigns={campaigns}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
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
        
        <div className="rounded-lg p-4 mb-4 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FilterX className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Filter Campaigns</h4>
            </div>
            <ClearFiltersButton onClick={clearAllFilters} />
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
          <ClearFiltersButton 
            onClick={clearAllFilters}
            className="mx-auto" 
          />
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
                  <TableHead className="w-[200px] font-medium">
                    <div className="flex items-center gap-1">
                      <span>Description</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <MagnifyingGlass className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">Hover over text to view full description</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableHead>
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
                      {quartersMonths.map(q => (
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
                <TableCell className="max-w-xs truncate group relative" title={campaign.description || ""}>
                  <div className="flex items-center gap-1">
                    <span className="truncate inline-block max-w-[180px]">
                      {campaign.description || "-"}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-6 w-6 p-0 opacity-20 group-hover:opacity-100"
                          disabled={isCampaignComplete(campaign)}
                        >
                          <MagnifyingGlass className="h-3.5 w-3.5" />
                          <span className="sr-only">View full description</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{campaign.campaignName || "Campaign Description"}</DialogTitle>
                          <DialogDescription>
                            {isCampaignComplete(campaign) ? "View full description" : "Edit the description for this campaign"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Textarea
                            value={campaign.description || ""}
                            onChange={(e) => !isCampaignComplete(campaign) && updateCampaign(campaign.id, 'description', e.target.value)}
                            placeholder="No description provided"
                            className="w-full h-32"
                            readOnly={isCampaignComplete(campaign)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
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
      {/* This input was retained but is now unused since we have the FileUploader component */}
      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => {
          // Functionality now handled by FileUploader component
          event.target.value = '';
        }}
      />
    </div>
  );
}