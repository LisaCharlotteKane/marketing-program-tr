import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "@phosphor-icons/react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  region: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  quarterMonth: string;
}

interface SimpleCampaignFormProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function SimpleCampaignForm({ campaigns, setCampaigns }: SimpleCampaignFormProps) {
  const [formData, setFormData] = useState({
    campaignName: "",
    campaignType: "",
    region: "",
    owner: "",
    forecastedCost: "",
    expectedLeads: "",
    quarterMonth: ""
  });

  const campaignTypes = [
    "In-Account Events (1:1)",
    "Exec Engagement Programs",
    "CxO Events (1:Few)",
    "Localized Events",
    "Webinars",
    "Microsoft",
    "Partners"
  ];

  const regions = ["JP & Korea", "South APAC", "SAARC", "Digital"];
  const owners = ["Giorgia Parham", "Tomoko Tanaka", "Beverly Leung", "Shruti Narang"];
  const quarters = [
    "Q1 - July", "Q1 - August", "Q1 - September",
    "Q2 - October", "Q2 - November", "Q2 - December", 
    "Q3 - January", "Q3 - February", "Q3 - March",
    "Q4 - April", "Q4 - May", "Q4 - June"
  ];

  const addCampaign = () => {
    if (!formData.campaignName || !formData.campaignType || !formData.region || !formData.owner) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      campaignName: formData.campaignName,
      campaignType: formData.campaignType,
      region: formData.region,
      owner: formData.owner,
      forecastedCost: parseFloat(formData.forecastedCost) || 0,
      expectedLeads: parseFloat(formData.expectedLeads) || 0,
      quarterMonth: formData.quarterMonth
    };

    setCampaigns([...campaigns, newCampaign]);
    
    // Reset form
    setFormData({
      campaignName: "",
      campaignType: "",
      region: "",
      owner: "",
      forecastedCost: "",
      expectedLeads: "",
      quarterMonth: ""
    });

    toast.success("Campaign added successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Campaign</CardTitle>
        <CardDescription>Create a new marketing campaign entry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name *</Label>
            <Input
              id="campaignName"
              value={formData.campaignName}
              onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaignType">Campaign Type *</Label>
            <Select value={formData.campaignType} onValueChange={(value) => setFormData({ ...formData, campaignType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent>
                {campaignTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Campaign Owner *</Label>
            <Select value={formData.owner} onValueChange={(value) => setFormData({ ...formData, owner: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quarterMonth">Quarter/Month</Label>
            <Select value={formData.quarterMonth} onValueChange={(value) => setFormData({ ...formData, quarterMonth: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select quarter/month" />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((quarter) => (
                  <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecastedCost">Forecasted Cost (USD)</Label>
            <Input
              id="forecastedCost"
              type="number"
              value={formData.forecastedCost}
              onChange={(e) => setFormData({ ...formData, forecastedCost: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedLeads">Expected Leads</Label>
            <Input
              id="expectedLeads"
              type="number"
              value={formData.expectedLeads}
              onChange={(e) => setFormData({ ...formData, expectedLeads: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={addCampaign} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}