import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Campaign } from "@/components/campaign-table";
import { InfoCircle, Link } from "@phosphor-icons/react";

interface ExecutionTrackingProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export function ExecutionTracking({ campaigns, setCampaigns }: ExecutionTrackingProps) {
  // Filter states
  const [selectedRegion, setSelectedRegion] = useState("_all");
  const [selectedOwner, setSelectedOwner] = useState("_all");
  
  // Constants
  const regions = ["SAARC", "North Asia", "South Asia", "Digital"];
  const statusOptions = ["Planning", "On Track", "Shipped", "Cancelled"];
  
  // Get unique owners from campaigns
  const owners = Array.from(new Set(campaigns.map(campaign => campaign.owner))).filter(Boolean);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Handle numeric input changes
  const handleNumericChange = (
    id: string,
    field: 'actualCost' | 'actualLeads' | 'actualMQLs',
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
  
  // Update campaign field
  const updateCampaign = (id: string, field: keyof Campaign, value: any) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        return { ...campaign, [field]: value };
      }
      return campaign;
    }));
  };
  
  // Check if campaign is locked (cancelled or shipped)
  const isCampaignLocked = (campaign: Campaign) => {
    return campaign.status === "Cancelled" || campaign.status === "Shipped";
  };
  
  // Filter campaigns by region and owner
  const filteredCampaigns = campaigns.filter(campaign => {
    if (selectedRegion !== "_all" && campaign.region !== selectedRegion) {
      return false;
    }
    if (selectedOwner !== "_all" && campaign.owner !== selectedOwner) {
      return false;
    }
    return true;
  });
  
  // Calculate totals
  const totalForecastedCost = filteredCampaigns.reduce((total, campaign) => {
    return total + (typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0);
  }, 0);
  
  const totalActualCost = filteredCampaigns.reduce((total, campaign) => {
    return total + (typeof campaign.actualCost === 'number' ? campaign.actualCost : 0);
  }, 0);
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Execution Tracking</CardTitle>
        <CardDescription>Track campaign execution status and performance</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          {/* Region Filter */}
          <div className="space-y-2">
            <Label htmlFor="filter-region">Filter by Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger id="filter-region" className="w-[180px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Owner Filter */}
          <div className="space-y-2">
            <Label htmlFor="filter-owner">Filter by Owner</Label>
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger id="filter-owner" className="w-[180px]">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Owners</SelectItem>
                {owners.map(owner => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Reset Filters Button */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedRegion("_all");
              setSelectedOwner("_all");
            }}
          >
            Reset Filters
          </Button>
          
          {/* Applied Filters */}
          {(selectedRegion !== "_all" || selectedOwner !== "_all") && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {selectedRegion !== "_all" && (
                <Badge variant="outline" className="text-xs">
                  Region: {selectedRegion}
                </Badge>
              )}
              {selectedOwner !== "_all" && (
                <Badge variant="outline" className="text-xs">
                  Owner: {selectedOwner}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Campaign Execution Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PO Raised?</TableHead>
                <TableHead>Campaign Code</TableHead>
                <TableHead>Issue Link</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Actual Leads</TableHead>
                <TableHead>Actual MQLs</TableHead>
                <TableHead>Forecasted Cost</TableHead>
                <TableHead>Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    No campaigns found matching your filter criteria. Add campaigns in the Planning tab.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => {
                  // Calculate variance if both forecasted and actual costs are available
                  const hasBothCosts = typeof campaign.forecastedCost === 'number' && 
                                      typeof campaign.actualCost === 'number';
                  const variance = hasBothCosts 
                    ? (campaign.actualCost as number) - (campaign.forecastedCost as number)
                    : null;
                  const variancePercent = hasBothCosts && campaign.forecastedCost !== 0
                    ? ((campaign.actualCost as number) / (campaign.forecastedCost as number) - 1) * 100
                    : null;
                  
                  return (
                    <TableRow 
                      key={campaign.id}
                      className={isCampaignLocked(campaign) ? "opacity-70" : ""}
                    >
                      {/* Campaign Name/Description */}
                      <TableCell>
                        <div className="font-medium">{campaign.campaignType || "Untitled Campaign"}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {campaign.description || "No description"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {campaign.region} • {campaign.country}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                <Select
                                  value={campaign.status || "Planning"}
                                  onValueChange={(value) => updateCampaign(campaign.id, 'status', value)}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <InfoCircle className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Current execution status of the campaign</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* PO Raised */}
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={campaign.poRaised || false}
                                  onCheckedChange={(checked) => updateCampaign(campaign.id, 'poRaised', checked)}
                                  disabled={isCampaignLocked(campaign)}
                                />
                                <InfoCircle className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Has a purchase order been issued?</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* Campaign Code */}
                      <TableCell>
                        <Input
                          value={campaign.campaignCode || ""}
                          onChange={(e) => updateCampaign(campaign.id, 'campaignCode', e.target.value)}
                          placeholder="SF-123456"
                          className="w-[120px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Issue Link */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            value={campaign.issueLink || ""}
                            onChange={(e) => updateCampaign(campaign.id, 'issueLink', e.target.value)}
                            placeholder="https://..."
                            className="w-[140px]"
                            disabled={isCampaignLocked(campaign)}
                          />
                          {campaign.issueLink && (
                            <a 
                              href={campaign.issueLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <Link className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>

                      {/* Actual Cost */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualCost === "" ? "" : campaign.actualCost}
                          onChange={(e) => handleNumericChange(campaign.id, 'actualCost', e.target.value)}
                          placeholder="USD"
                          className="w-[100px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Actual Leads */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualLeads === "" ? "" : campaign.actualLeads}
                          onChange={(e) => handleNumericChange(campaign.id, 'actualLeads', e.target.value)}
                          placeholder="#"
                          className="w-[80px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Actual MQLs */}
                      <TableCell>
                        <Input
                          type="number"
                          value={campaign.actualMQLs === "" ? "" : campaign.actualMQLs}
                          onChange={(e) => handleNumericChange(campaign.id, 'actualMQLs', e.target.value)}
                          placeholder="#"
                          className="w-[80px]"
                          disabled={isCampaignLocked(campaign)}
                        />
                      </TableCell>

                      {/* Forecasted Cost (read-only) */}
                      <TableCell className="text-muted-foreground">
                        {typeof campaign.forecastedCost === 'number' 
                          ? formatCurrency(campaign.forecastedCost) 
                          : "$0"}
                      </TableCell>

                      {/* Variance */}
                      <TableCell>
                        {hasBothCosts && (
                          <div className={`${variance && variance > 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatCurrency(variance || 0)} 
                            {variancePercent !== null && (
                              <span className="text-xs ml-1">
                                ({variancePercent > 0 ? "+" : ""}{Math.round(variancePercent)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {filteredCampaigns.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Total Costs:
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totalActualCost)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(totalForecastedCost)}
                  </TableCell>
                  <TableCell className={`font-bold ${totalActualCost > totalForecastedCost ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(totalActualCost - totalForecastedCost)}
                    {totalForecastedCost > 0 && (
                      <span className="text-xs ml-1">
                        ({Math.round((totalActualCost / totalForecastedCost - 1) * 100)}%)
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}