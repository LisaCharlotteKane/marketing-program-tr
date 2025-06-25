import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FilterX, ClipboardText, Search, TrashSimple, ArrowClockwise } from "@phosphor-icons/react";
import { type Campaign } from "@/components/campaign-table";
import { toast } from "sonner";
import { ClearFiltersButton } from "@/components/clear-filters-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ExecutionTracking({ 
  campaigns, 
  setCampaigns 
}: { 
  campaigns: Campaign[], 
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>> 
}) {
  // Filters
  const [regionFilter, setRegionFilter] = useState("_all");
  const [ownerFilter, setOwnerFilter] = useState("_all");
  const [pillarFilter, setPillarFilter] = useState("_all");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("_all");
  const [revenuePlayFilter, setRevenuePlayFilter] = useState("_all");
  
  // Selected campaigns for bulk operations
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  
  // Get unique regions and owners from campaigns with fallbacks for missing data
  const regions = ["_all", ...new Set(campaigns.filter(c => c && c.region).map(c => c.region))];
  const owners = ["_all", ...new Set(campaigns.filter(c => c && c.owner).map(c => c.owner))];
  
  // Extract strategic pillars (flattened from arrays) with safety checks
  const allPillars = campaigns.reduce((acc, campaign) => {
    if (campaign && Array.isArray(campaign.strategicPillars)) {
      acc.push(...campaign.strategicPillars);
    }
    return acc;
  }, [] as string[]);
  const pillars = ["_all", ...new Set(allPillars)];
  
  // Campaign types and revenue plays with safety checks
  const campaignTypes = ["_all", ...new Set(campaigns.filter(c => c && c.campaignType).map(c => c.campaignType))];
  const revenuePlays = ["_all", ...new Set(campaigns.filter(c => c && c.revenuePlay).map(c => c.revenuePlay))];
  
  // Update a campaign with new execution data
  const updateCampaign = (id: string, key: keyof Campaign, value: any) => {
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === id) {
          // Create a copy of the campaign with the updated field
          const updatedCampaign = { ...campaign, [key]: value };
          
          // Ensure all execution tracking fields have proper values
          if (updatedCampaign.status === undefined) updatedCampaign.status = "Planning";
          if (typeof updatedCampaign.poRaised !== 'boolean') updatedCampaign.poRaised = false;
          if (updatedCampaign.campaignName === undefined) updatedCampaign.campaignName = "";
          if (updatedCampaign.campaignCode === undefined) updatedCampaign.campaignCode = "";
          if (updatedCampaign.issueLink === undefined) updatedCampaign.issueLink = "";
          
          return updatedCampaign;
        }
        return campaign;
      })
    );
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
    if (selectedCampaigns.length === safeFilteredCampaigns.length) {
      // If all are selected, deselect all
      setSelectedCampaigns([]);
    } else {
      // Otherwise, select all filtered campaigns
      setSelectedCampaigns(safeFilteredCampaigns.map(c => c.id));
    }
  };
  
  // Safer implementation for filtered campaigns with robust error handling
  const safeFilteredCampaigns = campaigns.filter(campaign => {
    try {
      // Skip invalid campaigns
      if (!campaign || typeof campaign !== 'object' || !campaign.id) {
        return false;
      }
      
      // Apply region filter with safety check
      if (regionFilter !== "_all" && campaign.region !== regionFilter) {
        return false;
      }
      
      // Apply owner filter with safety check
      if (ownerFilter !== "_all" && campaign.owner !== ownerFilter) {
        return false;
      }
      
      // Apply strategic pillar filter with safety check
      if (pillarFilter !== "_all") {
        // Handle potential undefined strategicPillars
        const pillars = Array.isArray(campaign.strategicPillars) ? campaign.strategicPillars : [];
        if (!pillars.includes(pillarFilter)) {
          return false;
        }
      }
      
      // Apply campaign type filter with safety check
      if (campaignTypeFilter !== "_all" && campaign.campaignType !== campaignTypeFilter) {
        return false;
      }
      
      // Apply revenue play filter with safety check
      if (revenuePlayFilter !== "_all" && campaign.revenuePlay !== revenuePlayFilter) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error filtering campaign:", error);
      return false; // Exclude problematic campaigns
    }
  });
  
  // Function to clear all filters
  const clearAllFilters = () => {
    setRegionFilter("_all");
    setOwnerFilter("_all");
    setPillarFilter("_all");
    setCampaignTypeFilter("_all");
    setRevenuePlayFilter("_all");
    setSelectedCampaigns([]);
  };
  
  // Use safeFilteredCampaigns instead of filteredCampaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Skip campaigns with missing required properties
    if (!campaign || !campaign.id) return false;
    
    // Apply region filter
    if (regionFilter !== "_all" && campaign.region !== regionFilter) return false;
    
    // Apply owner filter
    if (ownerFilter !== "_all" && campaign.owner !== ownerFilter) return false;
    
    // Apply strategic pillar filter (check if any pillar matches)
    if (pillarFilter !== "_all") {
      if (!Array.isArray(campaign.strategicPillars) || 
          !campaign.strategicPillars.includes(pillarFilter)) {
        return false;
      }
    }
    
    // Apply campaign type filter
    if (campaignTypeFilter !== "_all" && campaign.campaignType !== campaignTypeFilter) return false;
    
    // Apply revenue play filter
    if (revenuePlayFilter !== "_all" && campaign.revenuePlay !== revenuePlayFilter) return false;
    
    return true;
  });
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 bg-card/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ClipboardText className="h-5 w-5" /> Execution Tracking
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Update status and performance metrics for your campaigns</span>
          <div className="flex items-center gap-2">
            {selectedCampaigns.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 gap-1"
                onClick={removeSelectedCampaigns}
              >
                <TrashSimple className="h-3.5 w-3.5" /> Delete ({selectedCampaigns.length})
              </Button>
            )}
            <ClearFiltersButton 
              onClick={clearAllFilters}
              className="h-8" 
            />
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FilterX className="h-4 w-4 text-muted-foreground" />
              Filter Campaigns
            </h4>
            <ClearFiltersButton onClick={clearAllFilters} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="region-filter" className="text-xs mb-1.5 block">Region</Label>
              <Select 
                value={regionFilter}
                onValueChange={setRegionFilter}
              >
                <SelectTrigger id="region-filter">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Regions</SelectItem>
                  {regions.filter(r => r !== "_all").map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="owner-filter" className="text-xs mb-1.5 block">Owner</Label>
              <Select 
                value={ownerFilter}
                onValueChange={setOwnerFilter}
              >
                <SelectTrigger id="owner-filter">
                  <SelectValue placeholder="All Owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Owners</SelectItem>
                  {owners.filter(o => o !== "_all").map((owner) => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pillar-filter" className="text-xs mb-1.5 block">Strategic Pillar</Label>
              <Select 
                value={pillarFilter}
                onValueChange={setPillarFilter}
              >
                <SelectTrigger id="pillar-filter">
                  <SelectValue placeholder="All Pillars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Pillars</SelectItem>
                  {pillars.filter(p => p !== "_all").map((pillar) => (
                    <SelectItem key={pillar} value={pillar}>{pillar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="campaign-type-filter" className="text-xs mb-1.5 block">Campaign Type</Label>
              <Select 
                value={campaignTypeFilter}
                onValueChange={setCampaignTypeFilter}
              >
                <SelectTrigger id="campaign-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Types</SelectItem>
                  {campaignTypes.filter(t => t !== "_all").map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="revenue-play-filter" className="text-xs mb-1.5 block">Revenue Play</Label>
              <Select 
                value={revenuePlayFilter}
                onValueChange={setRevenuePlayFilter}
              >
                <SelectTrigger id="revenue-play-filter">
                  <SelectValue placeholder="All Plays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Plays</SelectItem>
                  {revenuePlays.filter(p => p !== "_all").map((play) => (
                    <SelectItem key={play} value={play}>{play}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {safeFilteredCampaigns.length === 0 ? (
          <div className="text-center py-12 px-4 bg-card/50 border rounded-lg">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h4 className="text-lg font-semibold mb-2">No campaigns match your filters</h4>
            <p className="text-sm text-muted-foreground mb-4">Try changing your filter criteria or add new campaigns</p>
              <ClearFiltersButton 
                onClick={clearAllFilters}
                className="mx-auto" 
              >
                <FilterX className="h-3.5 w-3.5 mr-1" /> Clear Filters
              </ClearFiltersButton>
          </div>
        ) : (
          <div className="rounded-md border overflow-auto max-h-[calc(100vh-24rem)] bg-card">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={safeFilteredCampaigns.length > 0 && selectedCampaigns.length === safeFilteredCampaigns.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all campaigns"
                    />
                  </TableHead>
                  <TableHead className="w-[200px] font-medium">Campaign Name</TableHead>
                  <TableHead className="w-[300px] font-medium">Details</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">PO Raised?</TableHead>
                  <TableHead className="font-medium">Issue Link</TableHead>
                  <TableHead className="font-medium">Actual Cost</TableHead>
                  <TableHead className="font-medium">Actual Leads</TableHead>
                  <TableHead className="font-medium">Actual MQLs</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {safeFilteredCampaigns.map((campaign) => (
                  <TableRow 
                    key={campaign.id} 
                    className={`
                      ${campaign.status === "Cancelled" ? "bg-muted/20 opacity-70" : ""} 
                      ${campaign.status === "Shipped" ? "bg-green-50/50" : ""}
                      ${selectedCampaigns.includes(campaign.id) ? "bg-accent/30" : ""}
                      hover:bg-muted/10
                    `}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedCampaigns.includes(campaign.id)}
                        onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                        aria-label={`Select campaign ${campaign.campaignName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Input
                        type="text"
                        value={campaign.campaignName || ""}
                        onChange={(e) => updateCampaign(campaign.id, "campaignName", e.target.value)}
                        placeholder="Enter campaign name"
                        className="w-full"
                        disabled={campaign.status === "Cancelled"}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-muted/30">{campaign.owner}</Badge>
                          <Badge variant="outline" className="bg-muted/30">{campaign.region}</Badge>
                        </div>
                        {campaign.description && (
                          <div className="mt-1 text-foreground">
                            {campaign.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Select 
                        value={campaign.status || "Planning"} 
                        disabled={campaign.status === "Cancelled"}
                        onValueChange={(value) => updateCampaign(campaign.id, "status", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Planning" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
                              Planning
                            </div>
                          </SelectItem>
                          <SelectItem value="On Track">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-primary"></span>
                              On Track
                            </div>
                          </SelectItem>
                          <SelectItem value="Shipped">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              Shipped
                            </div>
                          </SelectItem>
                          <SelectItem value="Cancelled">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-destructive"></span>
                              Cancelled
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`po-${campaign.id}`}
                          checked={Boolean(campaign.poRaised)}
                          disabled={campaign.status === "Cancelled"}
                          onCheckedChange={(checked) => updateCampaign(campaign.id, "poRaised", checked)}
                        />
                        <Label htmlFor={`po-${campaign.id}`} className="cursor-pointer">
                          {campaign.poRaised ? "Yes" : "No"}
                        </Label>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={campaign.issueLink || ""}
                        disabled={campaign.status === "Cancelled"}
                        onChange={(e) => updateCampaign(campaign.id, "issueLink", e.target.value)}
                        className="w-40"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="$"
                        value={typeof campaign.actualCost === 'number' ? campaign.actualCost : ""}
                        disabled={campaign.status === "Cancelled"}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "" : Number(e.target.value);
                          updateCampaign(campaign.id, "actualCost", value);
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="#"
                        value={typeof campaign.actualLeads === 'number' ? campaign.actualLeads : ""}
                        disabled={campaign.status === "Cancelled"}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "" : Number(e.target.value);
                          updateCampaign(campaign.id, "actualLeads", value);
                        }}
                        className="w-20"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="#"
                        value={typeof campaign.actualMQLs === 'number' ? campaign.actualMQLs : ""}
                        disabled={campaign.status === "Cancelled"}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "" : Number(e.target.value);
                          updateCampaign(campaign.id, "actualMQLs", value);
                        }}
                        className="w-20"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}