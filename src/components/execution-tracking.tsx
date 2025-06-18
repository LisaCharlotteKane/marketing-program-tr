import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilterX, ClipboardText, Search, TrashSimple } from "@phosphor-icons/react";
import { type Campaign } from "@/components/campaign-table";
import { toast } from "sonner";
import { ClearFiltersButton } from "@/components/clear-filters-button";

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
  
  // Get unique regions and owners from campaigns
  const regions = ["_all", ...new Set(campaigns.map(c => c.region))].filter(Boolean);
  const owners = ["_all", ...new Set(campaigns.map(c => c.owner))].filter(Boolean);
  
  // Extract strategic pillars (flattened from arrays)
  const allPillars = campaigns.reduce((acc, campaign) => {
    if (Array.isArray(campaign.strategicPillars)) {
      acc.push(...campaign.strategicPillars);
    }
    return acc;
  }, [] as string[]);
  const pillars = ["_all", ...new Set(allPillars)].filter(Boolean);
  
  // Campaign types and revenue plays
  const campaignTypes = ["_all", ...new Set(campaigns.map(c => c.campaignType))].filter(Boolean);
  const revenuePlays = ["_all", ...new Set(campaigns.map(c => c.revenuePlay))].filter(Boolean);
  
  // Update a campaign with new execution data
  const updateCampaign = (id: string, key: keyof Campaign, value: any) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === id ? { ...campaign, [key]: value } : campaign
      )
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
    if (selectedCampaigns.length === filteredCampaigns.length) {
      // If all are selected, deselect all
      setSelectedCampaigns([]);
    } else {
      // Otherwise, select all filtered campaigns
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };
  
  // Filter campaigns based on selected filters
  const filteredCampaigns = campaigns.filter(campaign => {
    // Skip campaigns with no region or owner
    if (!campaign.region || !campaign.owner) return false;
    
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
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => {
                setRegionFilter("_all");
                setOwnerFilter("_all");
                setPillarFilter("_all");
                setCampaignTypeFilter("_all");
                setRevenuePlayFilter("_all");
                setSelectedCampaigns([]);
              }}
            >
              <FilterX className="h-3.5 w-3.5" /> Clear Filters
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <Label htmlFor="region-filter">Filter by Region</Label>
            <Select 
              value={regionFilter}
              onValueChange={setRegionFilter}
            >
              <SelectTrigger id="region-filter" className="mt-1">
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
            <Label htmlFor="owner-filter">Filter by Owner</Label>
            <Select 
              value={ownerFilter}
              onValueChange={setOwnerFilter}
            >
              <SelectTrigger id="owner-filter" className="mt-1">
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
            <Label htmlFor="pillar-filter">Strategic Pillar</Label>
            <Select 
              value={pillarFilter}
              onValueChange={setPillarFilter}
            >
              <SelectTrigger id="pillar-filter" className="mt-1">
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
            <Label htmlFor="campaign-type-filter">Campaign Type</Label>
            <Select 
              value={campaignTypeFilter}
              onValueChange={setCampaignTypeFilter}
            >
              <SelectTrigger id="campaign-type-filter" className="mt-1">
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
            <Label htmlFor="revenue-play-filter">Revenue Play</Label>
            <Select 
              value={revenuePlayFilter}
              onValueChange={setRevenuePlayFilter}
            >
              <SelectTrigger id="revenue-play-filter" className="mt-1">
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
        
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No campaigns match your current filters</p>
            <p className="text-sm mt-1">Try changing your filter criteria</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-auto max-h-[calc(100vh-24rem)]">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={filteredCampaigns.length > 0 && selectedCampaigns.length === filteredCampaigns.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all campaigns"
                    />
                  </TableHead>
                  <TableHead className="w-[200px]">Campaign Name</TableHead>
                  <TableHead className="w-[300px]">Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PO Raised?</TableHead>
                  <TableHead>Issue Link</TableHead>
                  <TableHead>Actual Cost</TableHead>
                  <TableHead>Actual Leads</TableHead>
                  <TableHead>Actual MQLs</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow 
                    key={campaign.id} 
                    className={`${campaign.status === "Cancelled" ? "opacity-60" : ""} ${selectedCampaigns.includes(campaign.id) ? "bg-accent/30" : ""}`}
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
                      <div className="text-xs text-muted-foreground">
                        {campaign.owner} • {campaign.region} • {campaign.country}
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
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="On Track">On Track</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`po-${campaign.id}`}
                          checked={campaign.poRaised}
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
                        value={campaign.actualCost === "" ? "" : campaign.actualCost}
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
                        value={campaign.actualLeads === "" ? "" : campaign.actualLeads}
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
                        value={campaign.actualMQLs === "" ? "" : campaign.actualMQLs}
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