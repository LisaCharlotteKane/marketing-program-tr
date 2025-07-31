import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Trash, 
  Upload, 
  Download, 
  Calculator, 
  ChartBar, 
  Calendar as CalendarIcon, 
  Target,
  Funnel,
  X,
  PencilSimple,
  Copy,
  FloppyDisk
} from "@phosphor-icons/react";
import { toast } from "sonner";
import Papa from "papaparse";
import { Campaign } from "@/types/campaign";
import { 
  MultiSelectFilters, 
  getStandardFilterConfigs, 
  applyFilters 
} from "@/components/multi-select-filters";

interface CampaignManagerProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function CampaignManager({ campaigns, setCampaigns }: CampaignManagerProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    owner: [],
    campaignType: [],
    strategicPillar: [],
    revenuePlay: [],
    fy: [],
    quarterMonth: [],
    region: [],
    country: [],
    status: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [editingPillars, setEditingPillars] = useState<{campaignId: string; pillars: string[]} | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Migrate strategic pillars to arrays and recalculate metrics on component mount
  useEffect(() => {
    const needsMigrationOrRecalc = campaigns.some(campaign => {
      const expectedMetrics = calculateMetrics(campaign);
      return typeof campaign.strategicPillar === 'string' || 
             campaign.mql !== expectedMetrics.mql || 
             campaign.sql !== expectedMetrics.sql || 
             campaign.opportunities !== expectedMetrics.opportunities || 
             campaign.pipelineForecast !== expectedMetrics.pipelineForecast;
    });

    if (needsMigrationOrRecalc) {
      const migratedCampaigns = campaigns.map(campaign => {
        // Migrate strategic pillar to array if it's still a string
        const migratedPillar = typeof campaign.strategicPillar === 'string' 
          ? campaign.strategicPillar ? [campaign.strategicPillar] : []
          : campaign.strategicPillar || [];
        
        return {
          ...campaign,
          strategicPillar: migratedPillar,
          ...calculateMetrics(campaign)
        };
      });
      setCampaigns(migratedCampaigns);
    }
  }, []); // Only run once on mount

  // New campaign row for inline editing
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    campaignType: '',
    strategicPillar: [],
    revenuePlay: '',
    fy: 'FY25',
    quarterMonth: '',
    region: '',
    country: '',
    owner: '',
    description: '',
    forecastedCost: '',
    expectedLeads: ''
  });

  // Constants
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

  const strategicPillars = [
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
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const regions = [
    "JP & Korea", "South APAC", "SAARC", "Digital",
    "X APAC English", "X APAC Non English", "X South APAC", "X SAARC"
  ];

  const countries = [
    "Afghanistan", "ASEAN", "Australia", "Bangladesh", "Bhutan", "Brunei",
    "Cambodia", "China", "GCR", "Hong Kong", "India", "Indonesia", "Japan",
    "Laos", "Malaysia", "Maldives", "Myanmar", "Nepal", "New Zealand",
    "Pakistan", "Philippines", "Singapore", "South Korea", "Sri Lanka",
    "Taiwan", "Thailand", "Vietnam", "X Apac", "X APAC English", 
    "X APAC Non English", "X South APAC", "X SAARC"
  ];

  const owners = [
    "Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"
  ];

  // Validate campaign
  const validateCampaign = (campaign: Partial<Campaign>, id?: string): string[] => {
    const errors: string[] = [];
    
    if (!campaign.campaignType?.trim()) errors.push("Campaign Type is required");
    if (!campaign.region?.trim()) errors.push("Region is required"); 
    if (!campaign.owner?.trim()) errors.push("Owner is required");
    
    if (campaign.forecastedCost && isNaN(Number(campaign.forecastedCost))) {
      errors.push("Forecasted Cost must be a valid number");
    }
    
    if (campaign.expectedLeads && isNaN(Number(campaign.expectedLeads))) {
      errors.push("Forecasted Leads must be a valid number");
    }
    
    return errors;
  };

  // Add new campaign inline
  const addNewCampaign = () => {
    const errors = validateCampaign(newCampaign);
    if (errors.length > 0) {
      setValidationErrors({...validationErrors, 'new': errors});
      toast.error("Please fix validation errors");
      return;
    }

    const metrics = calculateMetrics(newCampaign);
    const campaign: Campaign = {
      id: Date.now().toString(),
      campaignType: newCampaign.campaignType!,
      strategicPillar: newCampaign.strategicPillar || [],
      revenuePlay: newCampaign.revenuePlay || '',
      fy: newCampaign.fy || 'FY25',
      quarterMonth: newCampaign.quarterMonth || '',
      region: newCampaign.region!,
      country: newCampaign.country || '',
      owner: newCampaign.owner!,
      description: newCampaign.description || '',
      forecastedCost: newCampaign.forecastedCost || '0',
      expectedLeads: newCampaign.expectedLeads || '0',
      ...metrics,
      status: 'Planning',
      poRaised: false,
      salesforceCampaignCode: '',
      issueLink: '',
      actualCost: '0',
      actualLeads: '0',
      actualMQLs: '0'
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      campaignType: '',
      strategicPillar: [],
      revenuePlay: '',
      fy: 'FY25',
      quarterMonth: '',
      region: '',
      country: '',
      owner: '',
      description: '',
      forecastedCost: '',
      expectedLeads: ''
    });
    setIsAddingNew(false);
    setValidationErrors({...validationErrors, 'new': []});
    toast.success("Campaign added successfully");
  };

  // Cancel new campaign
  const cancelNewCampaign = () => {
    setNewCampaign({
      campaignType: '',
      strategicPillar: [],
      revenuePlay: '',
      fy: 'FY25',
      quarterMonth: '',
      region: '',
      country: '',
      owner: '',
      description: '',
      forecastedCost: '',
      expectedLeads: ''
    });
    setIsAddingNew(false);
    setValidationErrors({...validationErrors, 'new': []});
  };
  const calculateMetrics = (campaign: Partial<Campaign>) => {
    const leads = Number(campaign.expectedLeads) || 0;
    const cost = Number(campaign.forecastedCost) || 0;
    
    // Special logic for In-Account Events (1:1) - check for various naming variations
    const isInAccountEvent = campaign.campaignType?.includes("In-Account") || 
                           campaign.campaignType?.includes("In Account") ||
                           campaign.campaignType === "In-Account Events (1:1)";
    
    if (isInAccountEvent && leads === 0) {
      const pipeline = cost * 20;
      return {
        mql: 0,
        sql: 0,
        opportunities: 0,
        pipelineForecast: pipeline
      };
    }
    
    // Updated calculation flow per requirements:
    // Expected Leads (user input)
    // MQL Forecast = 10% of Expected Leads  
    const mql = Math.round(leads * 0.1);
    
    // SQL Forecast = 6% of MQL Forecast (updated calculation)
    const sql = Math.round(mql * 0.06);
    
    // # Opportunities = 80% of SQL Forecast
    const opportunities = Math.round(sql * 0.8);
    
    // Pipeline Forecast = # Opportunities × $50K
    const pipelineForecast = opportunities * 50000;
    
    return { mql, sql, opportunities, pipelineForecast };
  };

  // Update campaign with validation
  const updateCampaign = (id: string, field: string, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const updated = { ...campaign, [field]: value };
        
        // Validate the updated campaign
        const errors = validateCampaign(updated, id);
        if (errors.length > 0) {
          setValidationErrors({...validationErrors, [id]: errors});
        } else {
          setValidationErrors({...validationErrors, [id]: []});
        }
        
        // Recalculate metrics if cost or leads changed
        if (field === 'forecastedCost' || field === 'expectedLeads') {
          const metrics = calculateMetrics(updated);
          return { ...updated, ...metrics };
        }
        
        return updated;
      }
      return campaign;
    }));
  };

  // Duplicate campaign
  const duplicateCampaign = (campaignToDuplicate: Campaign) => {
    const newId = Date.now().toString();
    const duplicated: Campaign = {
      ...campaignToDuplicate,
      id: newId,
      description: `${campaignToDuplicate.description} (Copy)`
    };
    
    setCampaigns([...campaigns, duplicated]);
    toast.success("Campaign duplicated successfully");
  };

  // Delete selected campaigns
  const deleteSelectedCampaigns = () => {
    if (selectedCampaigns.length === 0) {
      toast.error("No campaigns selected");
      return;
    }
    
    setCampaigns(campaigns.filter(c => !selectedCampaigns.includes(c.id)));
    setSelectedCampaigns([]);
    toast.success(`Deleted ${selectedCampaigns.length} campaign(s)`);
  };

  // Filter campaigns using multi-select filters
  const filteredCampaigns = applyFilters(campaigns, filters);

  // Get filter configurations
  const filterConfigs = getStandardFilterConfigs(campaigns);

  // CSV Template Download
  const downloadTemplate = () => {
    const headers = [
      'Campaign Type', 'Strategic Pillar', 'Revenue Play', 'FY', 'Quarter/Month',
      'Region', 'Country', 'Owner', 'Description', 'Forecasted Cost', 'Forecasted Leads'
    ];
    
    const sampleData = [
      [
        'Webinars',
        'Brand Awareness & Top of Funnel Demand Generation',
        'Accelerate developer productivity with Copilot in VS Code and GitHub',
        'FY25',
        'Q1 - July',
        'JP & Korea',
        'Japan',
        'Tomoko Tanaka',
        'Developer productivity webinar series',
        '15000',
        '500'
      ],
      [
        'In-Account Events (1:1)',
        'Account Growth and Product Adoption',
        'Secure all developer workloads with the power of AI',
        'FY25',
        'Q2 - October',
        'South APAC',
        'Australia',
        'Beverly Leung',
        'Executive briefing on AI security',
        '25000',
        '0'
      ]
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Campaign Type', 'Strategic Pillar', 'Revenue Play', 'FY', 'Quarter/Month',
      'Region', 'Country', 'Owner', 'Description', 'Forecasted Cost', 'Forecasted Leads',
      'MQLs', 'SQLs', 'Opportunities', 'Pipeline Forecast'
    ];
    
    const csvData = filteredCampaigns.map(campaign => [
      campaign.campaignType,
      Array.isArray(campaign.strategicPillar) ? campaign.strategicPillar.join('; ') : campaign.strategicPillar,
      campaign.revenuePlay,
      campaign.fy,
      campaign.quarterMonth,
      campaign.region,
      campaign.country,
      campaign.owner,
      campaign.description,
      campaign.forecastedCost,
      campaign.expectedLeads,
      campaign.mql,
      campaign.sql,
      campaign.opportunities,
      campaign.pipelineForecast
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaigns.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  // Enhanced CSV Import with PapaParse
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        // Clean up values
        return typeof value === 'string' ? value.trim() : value;
      },
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
            // Show non-critical errors as warnings
            const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
            if (criticalErrors.length > 0) {
              toast.error("Critical CSV parsing errors detected");
              return;
            }
          }

          const data = results.data as any[];
          console.log('PapaParse results:', { data, meta: results.meta });
          
          if (data.length === 0) {
            toast.error("No data found in CSV file");
            return;
          }

          // Filter out completely empty rows
          const validData = data.filter(row => {
            return Object.values(row).some(value => value && value.toString().trim());
          });

          console.log(`Loaded ${validData.length} valid rows from ${data.length} total rows`);
          setPreviewData(validData);
          setShowPreview(true);
          toast.success(`Loaded ${validData.length} rows for preview`);
        } catch (error) {
          console.error('CSV processing error:', error);
          toast.error("Error processing CSV file: " + (error as Error).message);
        }
      },
      error: (error) => {
        console.error('PapaParse error:', error);
        toast.error("Error reading CSV file: " + error.message);
      }
    });
  };

  // Sanitize numerical values
  const sanitizeNumber = (value: string): string => {
    if (!value) return '0';
    // Remove currency symbols, commas, and other non-numeric characters except decimal points
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    return cleaned || '0';
  };
  // Import from preview with enhanced field mapping and validation
  const importFromPreview = () => {
    const successfulImports: any[] = [];
    const failedImports: any[] = [];

    previewData.forEach((row, index) => {
      try {
        // Enhanced field mapping with multiple possible header names
        const getFieldValue = (possibleNames: string[]): string => {
          for (const name of possibleNames) {
            if (row[name] && row[name].toString().trim()) {
              return row[name].toString().trim();
            }
          }
          return '';
        };

        // Sanitize cost and leads values
        const rawCost = getFieldValue(['Forecasted Cost', 'Cost', 'Budget', 'Spend', 'Amount']);
        const rawLeads = getFieldValue(['Forecasted Leads', 'Expected Leads', 'Leads', 'Lead Target', 'Target Leads']);
        
        const forecastedCost = sanitizeNumber(rawCost);
        const expectedLeads = sanitizeNumber(rawLeads);

        const campaignType = getFieldValue(['Campaign Type', 'Type', 'Campaign', 'Program Type']);
        
        // Validate required fields
        if (!campaignType) {
          throw new Error(`Row ${index + 1}: Campaign Type is required`);
        }

        const region = getFieldValue(['Region', 'Area', 'Territory']);
        const owner = getFieldValue(['Owner', 'Campaign Owner', 'Manager', 'Lead']);
        
        if (!region) {
          throw new Error(`Row ${index + 1}: Region is required`);
        }
        
        if (!owner) {
          throw new Error(`Row ${index + 1}: Owner is required`);
        }

        console.log(`Campaign ${index + 1} mapping:`, {
          rawCost,
          rawLeads,
          forecastedCost,
          expectedLeads,
          campaignType,
          region,
          owner
        });

        const metrics = calculateMetrics({
          forecastedCost,
          expectedLeads,
          campaignType
        });

        // Handle Strategic Pillar as multiple selections
        const strategicPillarRaw = getFieldValue(['Strategic Pillar', 'Strategic Pillars', 'Pillar', 'Strategy']);
        const strategicPillar = strategicPillarRaw ? 
          strategicPillarRaw.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean) : [];

        // Handle Quarter/Month field with regex parsing
        const quarterMonthRaw = getFieldValue(['Quarter/Month', 'Quarter', 'Month', 'Q/M', 'Period']);
        let quarterMonth = quarterMonthRaw;
        
        // Try to parse quarter-month patterns
        if (quarterMonthRaw) {
          const match = quarterMonthRaw.match(/(Q[1-4])\s*[-\s]*\s*(\w+)/i);
          if (match) {
            const quarter = match[1].toUpperCase();
            const month = match[2];
            quarterMonth = `${quarter} - ${month}`;
          }
        }

        const newCampaign = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          campaignType,
          strategicPillar,
          revenuePlay: getFieldValue(['Revenue Play', 'Revenue', 'Play', 'Focus Area']),
          fy: getFieldValue(['FY', 'Fiscal Year', 'Year']) || 'FY25',
          quarterMonth,
          region,
          country: getFieldValue(['Country', 'Location', 'Market']),
          owner,
          description: getFieldValue(['Description', 'Details', 'Campaign Description', 'Notes']),
          forecastedCost,
          expectedLeads,
          ...metrics,
          status: getFieldValue(['Status', 'Campaign Status']) || 'Planning',
          poRaised: false,
          salesforceCampaignCode: getFieldValue(['Salesforce Campaign Code', 'SFDC Code', 'Campaign Code']),
          issueLink: getFieldValue(['Issue Link', 'Link', 'URL', 'Reference']),
          actualCost: sanitizeNumber(getFieldValue(['Actual Cost', 'Actual Spend', 'Real Cost'])),
          actualLeads: sanitizeNumber(getFieldValue(['Actual Leads', 'Real Leads', 'Generated Leads'])),
          actualMQLs: sanitizeNumber(getFieldValue(['Actual MQLs', 'Real MQLs', 'Generated MQLs']))
        };

        console.log(`Final campaign ${index + 1}:`, newCampaign);
        successfulImports.push(newCampaign);
        
      } catch (error) {
        console.error(`Failed to import row ${index + 1}:`, error);
        failedImports.push({ row: index + 1, error: (error as Error).message, data: row });
      }
    });

    // Update campaigns with successful imports
    if (successfulImports.length > 0) {
      setCampaigns([...campaigns, ...successfulImports]);
    }

    // Show results
    if (failedImports.length > 0) {
      console.warn('Failed imports:', failedImports);
      toast.error(`Imported ${successfulImports.length} campaigns successfully, ${failedImports.length} failed. Check console for details.`);
    } else {
      toast.success(`Successfully imported all ${successfulImports.length} campaigns with complete data capture`);
    }

    setShowPreview(false);
    setPreviewData([]);
  };

  // Handle Strategic Pillar editing
  const openPillarEditor = (campaignId: string, currentPillars: string[]) => {
    setEditingPillars({ campaignId, pillars: [...currentPillars] });
  };

  const savePillars = () => {
    if (editingPillars) {
      updateCampaign(editingPillars.campaignId, 'strategicPillar', editingPillars.pillars);
      setEditingPillars(null);
    }
  };

  const togglePillar = (pillar: string) => {
    if (!editingPillars) return;
    
    const pillars = editingPillars.pillars.includes(pillar)
      ? editingPillars.pillars.filter(p => p !== pillar)
      : [...editingPillars.pillars, pillar];
    
    setEditingPillars({ ...editingPillars, pillars });
  };

  return (
    <div className="space-y-6">
      {/* Multi-Select Filters */}
      <MultiSelectFilters
        filters={filters}
        onFiltersChange={setFilters}
        filterConfigs={filterConfigs}
        title="Campaign Filters"
        icon={<Target className="h-5 w-5" />}
      />

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Campaign Management
          </CardTitle>
          <CardDescription>
            Add, edit, and manage marketing campaigns with inline editing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={() => setIsAddingNew(true)} 
              className="flex items-center gap-2"
              disabled={isAddingNew}
            >
              <Plus className="h-4 w-4" />
              Add New Campaign
            </Button>

            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>

            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <Button asChild variant="outline" className="flex items-center gap-2">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </label>
              </Button>
            </div>

            {selectedCampaigns.length > 0 && (
              <Button onClick={deleteSelectedCampaigns} variant="destructive" className="flex items-center gap-2">
                <Trash className="h-4 w-4" />
                Delete Selected ({selectedCampaigns.length})
              </Button>
            )}
            
            <div className="ml-auto">
              <Badge variant="secondary" className="text-xs">
                ✨ Enhanced CSV Import
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1600px]"> {/* Ensure minimum width for all columns */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCampaigns(filteredCampaigns.map(c => c.id));
                          } else {
                            setSelectedCampaigns([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Campaign Type *</TableHead>
                    <TableHead className="min-w-[200px]">Strategic Pillar</TableHead>
                    <TableHead className="min-w-[150px]">Revenue Play</TableHead>
                    <TableHead className="min-w-[80px]">FY</TableHead>
                    <TableHead className="min-w-[120px]">Quarter/Month</TableHead>
                    <TableHead className="min-w-[120px]">Region *</TableHead>
                    <TableHead className="min-w-[120px]">Country</TableHead>
                    <TableHead className="min-w-[120px]">Owner *</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead className="min-w-[120px]">Forecasted Cost</TableHead>
                    <TableHead className="min-w-[120px]">Forecasted Leads</TableHead>
                    <TableHead className="min-w-[100px]">Forecasted MQLs</TableHead>
                    <TableHead className="min-w-[100px]">Forecasted SQLs</TableHead>
                    <TableHead className="min-w-[120px]">Forecasted Pipeline</TableHead>
                    <TableHead className="min-w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* New Campaign Row */}
                  {isAddingNew && (
                    <TableRow className="bg-blue-50">
                      <TableCell>
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                      </TableCell>
                      
                      {/* Campaign Type */}
                      <TableCell>
                        <div className="space-y-1">
                          <Select value={newCampaign.campaignType} onValueChange={(value) => setNewCampaign({...newCampaign, campaignType: value})}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                              {campaignTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors['new']?.some(e => e.includes('Campaign Type')) && (
                            <p className="text-xs text-red-500">Required</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Strategic Pillar */}
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-48 justify-start text-left">
                              {newCampaign.strategicPillar && newCampaign.strategicPillar.length > 0 
                                ? `${newCampaign.strategicPillar.length} selected`
                                : "Select pillars..."
                              }
                              <PencilSimple className="h-3 w-3 ml-auto" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Select Strategic Pillars</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              {strategicPillars.map(pillar => (
                                <div key={pillar} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`new-${pillar}`}
                                    checked={newCampaign.strategicPillar?.includes(pillar) || false}
                                    onCheckedChange={(checked) => {
                                      const current = newCampaign.strategicPillar || [];
                                      const updated = checked 
                                        ? [...current, pillar]
                                        : current.filter(p => p !== pillar);
                                      setNewCampaign({...newCampaign, strategicPillar: updated});
                                    }}
                                  />
                                  <Label htmlFor={`new-${pillar}`} className="text-sm">
                                    {pillar}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>

                      {/* Revenue Play */}
                      <TableCell>
                        <Select value={newCampaign.revenuePlay} onValueChange={(value) => setNewCampaign({...newCampaign, revenuePlay: value})}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {revenuePlays.map(play => (
                              <SelectItem key={play} value={play}>{play}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* FY */}
                      <TableCell>
                        <Select value={newCampaign.fy} onValueChange={(value) => setNewCampaign({...newCampaign, fy: value})}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
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
                        <Select value={newCampaign.quarterMonth} onValueChange={(value) => setNewCampaign({...newCampaign, quarterMonth: value})}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {quarters.map(quarter => (
                              <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Region */}
                      <TableCell>
                        <div className="space-y-1">
                          <Select value={newCampaign.region} onValueChange={(value) => setNewCampaign({...newCampaign, region: value})}>
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map(region => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors['new']?.some(e => e.includes('Region')) && (
                            <p className="text-xs text-red-500">Required</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Country */}
                      <TableCell>
                        <Select value={newCampaign.country} onValueChange={(value) => setNewCampaign({...newCampaign, country: value})}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select..." />
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
                        <div className="space-y-1">
                          <Select value={newCampaign.owner} onValueChange={(value) => setNewCampaign({...newCampaign, owner: value})}>
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {owners.map(owner => (
                                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors['new']?.some(e => e.includes('Owner')) && (
                            <p className="text-xs text-red-500">Required</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <Input
                          value={newCampaign.description}
                          onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                          placeholder="Campaign description..."
                          className="min-w-48"
                        />
                      </TableCell>

                      {/* Forecasted Cost */}
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={newCampaign.forecastedCost}
                            onChange={(e) => setNewCampaign({...newCampaign, forecastedCost: e.target.value})}
                            className="w-24"
                            placeholder="0"
                          />
                          {validationErrors['new']?.some(e => e.includes('Forecasted Cost')) && (
                            <p className="text-xs text-red-500">Invalid</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Forecasted Leads */}
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={newCampaign.expectedLeads}
                            onChange={(e) => setNewCampaign({...newCampaign, expectedLeads: e.target.value})}
                            className="w-24"
                            placeholder="0"
                          />
                          {validationErrors['new']?.some(e => e.includes('Forecasted Leads')) && (
                            <p className="text-xs text-red-500">Invalid</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Forecasted MQLs (Auto-calculated) */}
                      <TableCell>
                        <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded text-center w-20">
                          {(() => {
                            const leads = Number(newCampaign.expectedLeads) || 0;
                            const campaignType = newCampaign.campaignType || '';
                            if (campaignType.includes('In-Account') && leads === 0) return '0';
                            return Math.round(leads * 0.1);
                          })()}
                        </div>
                      </TableCell>

                      {/* Forecasted SQLs (Auto-calculated) */}
                      <TableCell>
                        <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded text-center w-20">
                          {(() => {
                            const leads = Number(newCampaign.expectedLeads) || 0;
                            const campaignType = newCampaign.campaignType || '';
                            if (campaignType.includes('In-Account') && leads === 0) return '0';
                            const mql = Math.round(leads * 0.1);
                            return Math.round(mql * 0.06);
                          })()}
                        </div>
                      </TableCell>

                      {/* Forecasted Pipeline (Auto-calculated) */}
                     <TableCell>
  <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded text-center w-24">
    ${(() => {
      const leads = Number(newCampaign.expectedLeads) || 0;
      const cost = Number(newCampaign.forecastedCost) || 0;
      const campaignType = newCampaign.campaignType || '';
      
      if (campaignType.includes('In-Account') && leads === 0) {
        return (cost * 20).toLocaleString();
      }

      const mql = Math.round(leads * 0.1);
      const sql = Math.round(mql * 0.06);
      const opportunities = Math.round(sql * 0.8);
      return (opportunities * 50000).toLocaleString();
    })()}
  </div>
</TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" onClick={addNewCampaign} className="h-8 w-8 p-0">
                            <FloppyDisk className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelNewCampaign} className="h-8 w-8 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Existing Campaign Rows */}
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className={validationErrors[campaign.id]?.length > 0 ? "bg-red-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCampaigns.includes(campaign.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                            } else {
                              setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                            }
                          }}
                        />
                      </TableCell>
                      
                      {/* Campaign Type */}
                      <TableCell>
                        <div className="space-y-1">
                          <Select value={campaign.campaignType} onValueChange={(value) => updateCampaign(campaign.id, 'campaignType', value)}>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {campaignTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors[campaign.id]?.some(e => e.includes('Campaign Type')) && (
                            <p className="text-xs text-red-500">Required</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Strategic Pillar */}
<TableCell>
  <div className="max-w-48">
    <div className="flex items-center gap-2">
      <div className="flex-1">
        {Array.isArray(campaign?.strategicPillar) && campaign.strategicPillar.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {campaign.strategicPillar.map((pillar: string, index: number) => (
              <Badge
                key={`${campaign.id || 'campaign'}-pillar-${index}`}
                variant="secondary"
                className="text-xs"
              >
                {pillar && pillar.length > 15 ? `${pillar.substring(0, 15)}...` : pillar || "—"}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">None selected</span>
        )}
      </div>
    </div>
  </div>
</TableCell>

                      {/* Revenue Play */}
                      <TableCell>
                        <Select value={campaign.revenuePlay} onValueChange={(value) => updateCampaign(campaign.id, 'revenuePlay', value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {revenuePlays.map(play => (
                              <SelectItem key={play} value={play}>{play}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* FY */}
                      <TableCell>
                        <Select value={campaign.fy} onValueChange={(value) => updateCampaign(campaign.id, 'fy', value)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
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
                        <Select value={campaign.quarterMonth} onValueChange={(value) => updateCampaign(campaign.id, 'quarterMonth', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {quarters.map(quarter => (
                              <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Region */}
                      <TableCell>
                        <div className="space-y-1">
                          <Select value={campaign.region} onValueChange={(value) => updateCampaign(campaign.id, 'region', value)}>
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map(region => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors[campaign.id]?.some(e => e.includes('Region')) && (
                            <p className="text-xs text-red-500">Required</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Country */}
                      <TableCell>
                        <Select value={campaign.country} onValueChange={(value) => updateCampaign(campaign.id, 'country', value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select..." />
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
                        <div className="space-y-1">
                          <Select value={campaign.owner} onValueChange={(value) => updateCampaign(campaign.id, 'owner', value)}>
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {owners.map(owner => (
                                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors[campaign.id]?.some(e => e.includes('Owner')) && (
                            <p className="text-xs text-red-500">Required</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <Input
                          value={campaign.description}
                          onChange={(e) => updateCampaign(campaign.id, 'description', e.target.value)}
                          placeholder="Campaign description..."
                          className="min-w-48"
                        />
                      </TableCell>

                      {/* Forecasted Cost */}
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={campaign.forecastedCost}
                            onChange={(e) => updateCampaign(campaign.id, 'forecastedCost', e.target.value)}
                            className="w-24"
                            placeholder="0"
                          />
                          {validationErrors[campaign.id]?.some(e => e.includes('Forecasted Cost')) && (
                            <p className="text-xs text-red-500">Invalid</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Forecasted Leads */}
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={campaign.expectedLeads}
                            onChange={(e) => updateCampaign(campaign.id, 'expectedLeads', e.target.value)}
                            className="w-24"
                            placeholder="0"
                          />
                          {validationErrors[campaign.id]?.some(e => e.includes('Forecasted Leads')) && (
                            <p className="text-xs text-red-500">Invalid</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Forecasted MQLs (Auto-calculated) */}
                      <TableCell>
                        <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded text-center w-20">
                          {campaign.mql || 0}
                        </div>
                      </TableCell>

                      {/* Forecasted SQLs (Auto-calculated) */}
                      <TableCell>
                        <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded text-center w-20">
                          {campaign.sql || 0}
                        </div>
                      </TableCell>

                      {/* Forecasted Pipeline (Auto-calculated) */}
                      <TableCell>
                        <div className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded text-center w-24">
                          ${(campaign.pipelineForecast || 0).toLocaleString()}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => duplicateCampaign(campaign)}
                            className="h-8 w-8 p-0"
                            title="Duplicate"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setCampaigns(campaigns.filter(c => c.id !== campaign.id));
                              toast.success("Campaign deleted");
                            }}
                            className="h-8 w-8 p-0 text-red-500"
                            title="Delete"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Show validation errors if any */}
          {Object.keys(validationErrors).some(key => validationErrors[key]?.length > 0) && (
            <Alert className="mt-4">
              <AlertDescription>
                <strong>Validation Errors Found:</strong> Please fix the highlighted fields to ensure data accuracy.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Auto-Calculated Metrics Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Auto-Calculated Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Standard Calculation:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• MQL Forecast = 10% of Expected Leads</li>
                <li>• SQL Forecast = 6% of MQL Forecast</li>
                <li>• # Opportunities = 80% of SQL Forecast</li>
                <li>• Pipeline Forecast = # Opportunities × $50K</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Special Case:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• In-Account Programs with no lead numbers:</li>
                <li>• Pipeline = Campaign Cost × 20 (20:1 ROI)</li>
                <li>• MQLs, SQLs, Opportunities = 0</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview CSV Import</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Review the data below before importing {previewData.length} campaigns:
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  All columns detected: {previewData.length > 0 ? Object.keys(previewData[0]).length : 0}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ✅ Enhanced mapping
                </Badge>
              </div>
            </div>
            
            {/* Show detected headers */}
            {previewData.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Detected CSV Headers:</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(previewData[0]).map((header, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {header}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 The system will automatically map these headers to campaign fields using smart matching
                </p>
              </div>
            )}

            <div className="overflow-x-auto max-h-96">
              <table className="w-full border border-border text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left min-w-32">Campaign Type</th>
                    <th className="border border-border p-2 text-left min-w-32">Strategic Pillar</th>
                    <th className="border border-border p-2 text-left min-w-24">Region</th>
                    <th className="border border-border p-2 text-left min-w-24">Owner</th>
                    <th className="border border-border p-2 text-left min-w-24">Cost</th>
                    <th className="border border-border p-2 text-left min-w-24">Leads</th>
                    <th className="border border-border p-2 text-left min-w-24">Quarter/Month</th>
                    <th className="border border-border p-2 text-left min-w-32">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 15).map((row, index) => {
                    // Helper function to get field values with fallbacks
                    const getFieldValue = (possibleNames: string[]) => {
                      for (const name of possibleNames) {
                        if (row[name] && row[name].trim()) {
                          return row[name].trim();
                        }
                      }
                      return '-';
                    };

                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                        <td className="border border-border p-2">
                          {getFieldValue(['Campaign Type', 'Type', 'Campaign', 'Program Type'])}
                        </td>
                        <td className="border border-border p-2">
                          {getFieldValue(['Strategic Pillar', 'Strategic Pillars', 'Pillar', 'Strategy'])}
                        </td>
                        <td className="border border-border p-2">
                          {getFieldValue(['Region', 'Area', 'Territory'])}
                        </td>
                        <td className="border border-border p-2">
                          {getFieldValue(['Owner', 'Campaign Owner', 'Manager', 'Lead'])}
                        </td>
                        <td className="border border-border p-2 font-mono">
                          {getFieldValue(['Forecasted Cost', 'Cost', 'Budget', 'Spend'])}
                        </td>
                        <td className="border border-border p-2 font-mono">
                          {getFieldValue(['Forecasted Leads', 'Expected Leads', 'Leads', 'Lead Target'])}
                        </td>
                        <td className="border border-border p-2">
                          {getFieldValue(['Quarter/Month', 'Quarter', 'Month', 'Q/M', 'Period'])}
                        </td>
                        <td className="border border-border p-2 max-w-48 truncate">
                          {getFieldValue(['Description', 'Details', 'Campaign Description', 'Notes'])}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {previewData.length > 15 && (
                <p className="text-sm text-muted-foreground mt-2">
                  ... and {previewData.length - 15} more rows
                </p>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                💡 The import will automatically map column headers to campaign fields
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button onClick={importFromPreview}>
                  Import {previewData.length} Campaigns
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}