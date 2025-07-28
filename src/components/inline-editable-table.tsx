import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Check, X, Calculator, Save } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Campaign, CampaignTableProps } from "@/types/campaign";

interface EditableCell {
  id: string;
  field: keyof Campaign;
  value: any;
}

export function InlineEditableTable({ campaigns, setCampaigns }: CampaignTableProps) {
  const [editingCell, setEditingCell] = useState<EditableCell | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);

  // Campaign options
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

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital", "X APAC English", "X APAC Non English"];

  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];

  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  // Calculate derived metrics
  const calculateMetrics = (expectedLeads: number | string) => {
    const leads = typeof expectedLeads === 'number' ? expectedLeads : parseFloat(expectedLeads.toString()) || 0;
    const mql = Math.round(leads * 0.1);
    const sql = Math.round(leads * 0.06);
    const opportunities = Math.round(sql * 0.8);
    const pipelineForecast = opportunities * 50000;
    
    return { mql, sql, opportunities, pipelineForecast };
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Handle cell click to start editing
  const startEditing = (id: string, field: keyof Campaign, value: any) => {
    setEditingCell({ id, field, value });
  };

  // Handle saving cell value
  const saveCell = (newValue: any) => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    
    // Validate required fields
    if ((field === 'campaignType' || field === 'owner') && (!newValue || newValue.trim() === '')) {
      toast.error(`${field === 'campaignType' ? 'Campaign Type' : 'Owner'} is required`);
      return;
    }

    // Validate numeric fields
    if ((field === 'forecastedCost' || field === 'expectedLeads') && newValue && isNaN(Number(newValue))) {
      toast.error('Please enter a valid number');
      return;
    }

    // Validate negative numbers
    if ((field === 'forecastedCost' || field === 'expectedLeads') && Number(newValue) < 0) {
      toast.error('Value cannot be negative');
      return;
    }

    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === id) {
        const updatedCampaign = { ...campaign, [field]: newValue };
        
        // Auto-calculate metrics if expectedLeads changed
        if (field === 'expectedLeads') {
          const metrics = calculateMetrics(newValue);
          Object.assign(updatedCampaign, metrics);
        }

        // Auto-generate description if campaign type changed and no description exists
        if (field === 'campaignType' && !campaign.description.trim()) {
          updatedCampaign.description = `${newValue} Campaign`;
        }

        return updatedCampaign;
      }
      return campaign;
    }));

    setUnsavedChanges(prev => new Set([...prev, id]));
    setEditingCell(null);
    toast.success('Cell updated');
  };

  // Handle canceling edit
  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent, newValue: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCell(newValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Add new campaign row
  const addNewRow = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      description: "",
      campaignType: "",
      strategicPillar: [],
      revenuePlay: "",
      fy: "FY26",
      quarterMonth: "Q1 - July",
      region: "JP & Korea",
      country: "",
      owner: "",
      forecastedCost: 0,
      expectedLeads: 0,
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: 0,
      status: "Planning"
    };

    setCampaigns([...campaigns, newCampaign]);
    setUnsavedChanges(prev => new Set([...prev, newCampaign.id]));
    toast.success('New campaign row added');
  };

  // Remove campaign
  const removeCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    setUnsavedChanges(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success('Campaign removed');
  };

  // Save all changes
  const saveAllChanges = () => {
    setUnsavedChanges(new Set());
    toast.success('All changes saved');
  };

  // Get display value for cell
  const getCellDisplayValue = (campaign: Campaign, field: keyof Campaign) => {
    const value = campaign[field];
    
    if (field === 'strategicPillar' && Array.isArray(value)) {
      return value.join(', ') || '-';
    }
    
    if (field === 'forecastedCost' || field === 'pipelineForecast') {
      return typeof value === 'number' ? `$${value.toLocaleString()}` : `$${value}`;
    }
    
    return value?.toString() || '-';
  };

  // Render editable cell
  const renderEditableCell = (campaign: Campaign, field: keyof Campaign) => {
    const isEditing = editingCell?.id === campaign.id && editingCell?.field === field;
    const hasUnsavedChanges = unsavedChanges.has(campaign.id);
    
    if (isEditing) {
      // Select fields
      if (field === 'campaignType') {
        return (
          <Select
            value={editingCell.value}
            onValueChange={(value) => setEditingCell(prev => prev ? { ...prev, value } : null)}
            onOpenChange={(open) => {
              if (!open && editingCell) {
                saveCell(editingCell.value);
              }
            }}
          >
            <SelectTrigger ref={selectRef} className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {campaignTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      if (field === 'owner') {
        return (
          <Select
            value={editingCell.value}
            onValueChange={(value) => setEditingCell(prev => prev ? { ...prev, value } : null)}
            onOpenChange={(open) => {
              if (!open && editingCell) {
                saveCell(editingCell.value);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {owners.map(owner => (
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      if (field === 'region') {
        return (
          <Select
            value={editingCell.value}
            onValueChange={(value) => setEditingCell(prev => prev ? { ...prev, value } : null)}
            onOpenChange={(open) => {
              if (!open && editingCell) {
                saveCell(editingCell.value);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      if (field === 'quarterMonth') {
        return (
          <Select
            value={editingCell.value}
            onValueChange={(value) => setEditingCell(prev => prev ? { ...prev, value } : null)}
            onOpenChange={(open) => {
              if (!open && editingCell) {
                saveCell(editingCell.value);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quarters.map(quarter => (
                <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      // Input fields
      return (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={editingCell.value}
            onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
            onKeyDown={(e) => handleKeyDown(e, editingCell.value)}
            onBlur={() => saveCell(editingCell.value)}
            className="h-8 text-xs"
            type={field === 'forecastedCost' || field === 'expectedLeads' ? 'number' : 'text'}
            min={field === 'forecastedCost' || field === 'expectedLeads' ? '0' : undefined}
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => saveCell(editingCell.value)}
            >
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={cancelEdit}
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        </div>
      );
    }

    // Display mode
    return (
      <div
        className={`cursor-pointer hover:bg-muted/50 p-1 rounded text-xs min-h-[24px] flex items-center ${
          hasUnsavedChanges ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''
        }`}
        onClick={() => startEditing(campaign.id, field, campaign[field])}
        title="Click to edit"
      >
        {getCellDisplayValue(campaign, field)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Campaign Planning - Inline Editable Table
              </CardTitle>
              <CardDescription>
                Click any cell to edit directly. Changes are highlighted until saved.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {unsavedChanges.size > 0 && (
                <Badge variant="outline" className="text-yellow-600">
                  {unsavedChanges.size} unsaved changes
                </Badge>
              )}
              <Button onClick={saveAllChanges} disabled={unsavedChanges.size === 0}>
                <Save className="h-4 w-4 mr-2" />
                Save All
              </Button>
              <Button onClick={addNewRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Campaign Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
          <CardDescription>
            {campaigns.length} campaign(s) • Click any cell to edit inline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Program Type *</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Forecasted Leads</TableHead>
                  <TableHead>Owner *</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>MQL</TableHead>
                  <TableHead>SQL</TableHead>
                  <TableHead>Opps</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                      No campaigns found. Click "Add Row" to create your first campaign.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="min-w-[150px]">
                        {renderEditableCell(campaign, 'description')}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {renderEditableCell(campaign, 'region')}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        {renderEditableCell(campaign, 'campaignType')}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {renderEditableCell(campaign, 'quarterMonth')}
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        {renderEditableCell(campaign, 'expectedLeads')}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {renderEditableCell(campaign, 'owner')}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div
                          className="cursor-pointer hover:bg-muted/50 p-1 rounded text-xs min-h-[24px] flex items-center"
                          title="Notes/Description"
                        >
                          {campaign.description ? (
                            <span className="truncate">{campaign.description}</span>
                          ) : (
                            <span className="text-muted-foreground italic">Add notes...</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        {renderEditableCell(campaign, 'forecastedCost')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-blue-600">
                          {campaign.mql}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-green-600">
                          {campaign.sql}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-purple-600">
                          {campaign.opportunities}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-orange-600">
                          ${campaign.pipelineForecast.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCampaign(campaign.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {campaigns.length > 0 && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>How to use:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Click any cell to edit directly</li>
                  <li>Press Enter to save, Escape to cancel</li>
                  <li>Required fields: Program Type and Owner</li>
                  <li>Forecasted Leads automatically calculates MQL, SQL, Opportunities, and Pipeline</li>
                  <li>Changes are highlighted until saved</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
