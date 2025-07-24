import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, TrashSimple } from "@phosphor-icons/react";

// Simple Campaign interface
export interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  region: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  pipelineForecast: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function CampaignTable({ campaigns, setCampaigns }: CampaignTableProps) {
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    campaignName: "",
    campaignType: "",
    region: "",
    owner: "",
    forecastedCost: 0,
    expectedLeads: 0,
  });

  const addCampaign = () => {
    if (!newCampaign.campaignName || !newCampaign.campaignType) {
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      campaignName: newCampaign.campaignName || "",
      campaignType: newCampaign.campaignType || "",
      region: newCampaign.region || "",
      owner: newCampaign.owner || "",
      forecastedCost: Number(newCampaign.forecastedCost) || 0,
      expectedLeads: Number(newCampaign.expectedLeads) || 0,
      pipelineForecast: (Number(newCampaign.expectedLeads) || 0) * 0.1 * 0.6 * 0.8 * 50000,
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      campaignName: "",
      campaignType: "",
      region: "",
      owner: "",
      forecastedCost: 0,
      expectedLeads: 0,
    });
  };

  const removeCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Campaign Name"
              value={newCampaign.campaignName || ""}
              onChange={(e) => setNewCampaign({ ...newCampaign, campaignName: e.target.value })}
            />
            <Input
              placeholder="Campaign Type"
              value={newCampaign.campaignType || ""}
              onChange={(e) => setNewCampaign({ ...newCampaign, campaignType: e.target.value })}
            />
            <Input
              placeholder="Region"
              value={newCampaign.region || ""}
              onChange={(e) => setNewCampaign({ ...newCampaign, region: e.target.value })}
            />
            <Input
              placeholder="Owner"
              value={newCampaign.owner || ""}
              onChange={(e) => setNewCampaign({ ...newCampaign, owner: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Forecasted Cost"
              value={newCampaign.forecastedCost || ""}
              onChange={(e) => setNewCampaign({ ...newCampaign, forecastedCost: Number(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Expected Leads"
              value={newCampaign.expectedLeads || ""}
              onChange={(e) => setNewCampaign({ ...newCampaign, expectedLeads: Number(e.target.value) })}
            />
          </div>
          <Button onClick={addCampaign} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No campaigns added yet
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                    <TableCell>{campaign.campaignType}</TableCell>
                    <TableCell>{campaign.region}</TableCell>
                    <TableCell>{campaign.owner}</TableCell>
                    <TableCell>${campaign.forecastedCost.toLocaleString()}</TableCell>
                    <TableCell>{campaign.expectedLeads.toLocaleString()}</TableCell>
                    <TableCell>${campaign.pipelineForecast.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCampaign(campaign.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashSimple className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}