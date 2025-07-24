import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  description: string;
  campaignType: string;
  strategicPillar: string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

export function CampaignTable({ campaigns, setCampaigns }: CampaignTableProps) {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

  const clearFilters = () => {
    setRegionFilter('all');
    setQuarterFilter('all');
  };

  const deleteSelectedCampaigns = () => {
    setCampaigns(campaigns.filter(c => !selectedCampaigns.has(c.id)));
    toast.success(`Deleted ${selectedCampaigns.size} campaign(s)`);
    setSelectedCampaigns(new Set());
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (regionFilter !== 'all' && c.region !== regionFilter) return false;
      if (quarterFilter !== 'all' && c.quarterMonth !== quarterFilter) return false;
      return true;
    });
  }, [campaigns, regionFilter, quarterFilter]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="JP & Korea">JP & Korea</SelectItem>
                <SelectItem value="South APAC">South APAC</SelectItem>
                <SelectItem value="SAARC">SAARC</SelectItem>
                <SelectItem value="Digital">Digital</SelectItem>
              </SelectContent>
            </Select>

            <Select value={quarterFilter} onValueChange={setQuarterFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quarters</SelectItem>
                <SelectItem value="Q1 - July">Q1 - July</SelectItem>
                <SelectItem value="Q2 - October">Q2 - October</SelectItem>
                <SelectItem value="Q3 - January">Q3 - January</SelectItem>
                <SelectItem value="Q4 - April">Q4 - April</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedCampaigns.size > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedCampaigns.size} selected
          </div>
          <Button variant="destructive" onClick={deleteSelectedCampaigns} className="flex items-center gap-2">
            <Trash className="h-4 w-4" /> Delete Selected
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((c, index) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.has(c.id)}
                        onChange={() => {
                          const copy = new Set(selectedCampaigns);
                          copy.has(c.id) ? copy.delete(c.id) : copy.add(c.id);
                          setSelectedCampaigns(copy);
                        }}
                      />
                    </TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell>{c.campaignType}</TableCell>
                    <TableCell>{c.region}</TableCell>
                    <TableCell>{c.quarterMonth}</TableCell>
                    <TableCell>{c.owner}</TableCell>
                    <TableCell>${c.forecastedCost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
