import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ClipboardText, Link as LinkIcon } from "@phosphor-icons/react";
import { Campaign } from "./campaign-table";

// Props for ExecutionTracking
interface ExecutionTrackingProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export function ExecutionTracking({ campaigns, setCampaigns }: ExecutionTrackingProps) {
  // Filters
  const [regionFilter, setRegionFilter] = useState("_all");
  const [ownerFilter, setOwnerFilter] = useState("_all");

  // Extract unique regions and owners for filter options
  const regions = Array.from(new Set(campaigns.map(c => c.region))).filter(Boolean);
  const owners = Array.from(new Set(campaigns.map(c => c.owner))).filter(Boolean);

  // Filter campaigns based on selected filters
  const filteredCampaigns = campaigns.filter(campaign => 
    (regionFilter === "_all" || campaign.region === regionFilter) &&
    (ownerFilter === "_all" || campaign.owner === ownerFilter)
  );

  // Calculate totals for the filtered campaigns
  const totalForecastedCost = filteredCampaigns.reduce(
    (sum, campaign) => sum + (typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0), 
    0
  );
  
  const totalActualCost = filteredCampaigns.reduce(
    (sum, campaign) => sum + (typeof campaign.actualCost === 'number' ? campaign.actualCost : 0), 
    0
  );

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle numeric input changes
  const handleNumericChange = (id: string, field: string, value: string) => {
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === id) {
          if (value === "") {
            return { ...campaign, [field]: "" };
          } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
              return { ...campaign, [field]: numValue };
            }
          }
        }
        return campaign;
      })
    );
  };

  // Handle text input changes
  const handleTextChange = (id: string, field: string, value: string) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === id ? { ...campaign, [field]: value } : campaign
      )
    );
  };

  // Handle boolean toggle changes
  const handleToggleChange = (id: string, field: string, checked: boolean) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === id ? { ...campaign, [field]: checked } : campaign
      )
    );
  };

  // Check if a campaign is locked (cancelled or shipped)
  const isCampaignLocked = (campaign: Campaign) => {
    return campaign.status === "Cancelled" || campaign.status === "Shipped";
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ClipboardText className="h-5 w-5" /> Execution Tracking
        </CardTitle>
        <CardDescription>Update execution status and performance metrics</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-full max-w-xs">
              <Label htmlFor="region-filter">Filter by Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger id="region-filter" className="w-full">
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

            <div className="w-full max-w-xs">
              <Label htmlFor="owner-filter">Filter by Owner</Label>
              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger id="owner-filter" className="w-full">
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
          </div>

          {/* Campaign Execution Table */}
          <div className="overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PO Raised?</TableHead>
                  <TableHead>Campaign Code / Issue Link</TableHead>
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
                    <TableCell colSpan={9} className="h-24 text-center">
                      No campaigns to display. Please adjust your filters or add campaigns in the Planning tab.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map(campaign => {
                    // Calculate variance
                    const hasBothCosts = typeof campaign.forecastedCost === 'number' && 
                                         typeof campaign.actualCost === 'number';
                    const forecastedCost = typeof campaign.forecastedCost === 'number' ? campaign.forecastedCost : 0;
                    const actualCost = typeof campaign.actualCost === 'number' ? campaign.actualCost : 0;
                    const variance = hasBothCosts ? actualCost - forecastedCost : null;
                    const variancePercent = hasBothCosts && forecastedCost !== 0 ? 
                      (variance as number) / forecastedCost * 100 : null;

                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{campaign.description || "Untitled Campaign"}</span>
                            <span className="text-xs text-muted-foreground">
                              {campaign.campaignType} • {campaign.region} • {campaign.country}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status Dropdown */}
                        <TableCell>
                          <Select 
                            value={campaign.status || "_none"} 
                            onValueChange={(value) => handleTextChange(campaign.id, 'status', value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Select...</SelectItem>
                              <SelectItem value="Planning">Planning</SelectItem>
                              <SelectItem value="On Track">On Track</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* PO Raised Toggle */}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`po-raised-${campaign.id}`}
                              checked={campaign.poRaised || false}
                              onCheckedChange={(checked) => handleToggleChange(campaign.id, 'poRaised', checked)}
                              disabled={isCampaignLocked(campaign)}
                            />
                            <Label htmlFor={`po-raised-${campaign.id}`} className="sr-only">PO Raised</Label>
                          </div>
                        </TableCell>

                        {/* Campaign Code and Issue Link */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              value={campaign.campaignCode || ""}
                              onChange={(e) => handleTextChange(campaign.id, 'campaignCode', e.target.value)}
                              placeholder="SF Campaign Code"
                              className="w-[120px]"
                              disabled={isCampaignLocked(campaign)}
                            />
                            <Input
                              value={campaign.issueLink || ""}
                              onChange={(e) => handleTextChange(campaign.id, 'issueLink', e.target.value)}
                              placeholder="Issue URL"
                              className="w-[120px]"
                              disabled={isCampaignLocked(campaign)}
                            />
                            {campaign.issueLink && (
                              <a 
                                href={campaign.issueLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                <LinkIcon className="h-4 w-4" />
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
                    <TableCell colSpan={4} className="text-right font-medium">
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
        </div>
      </CardContent>
    </Card>
  );
}