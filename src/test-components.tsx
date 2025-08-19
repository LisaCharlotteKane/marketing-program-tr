// Test file to check component imports and basic functionality
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Campaign } from "@/types/campaign";

// Test all phosphor icons used in the app
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
  BuildingOffice,
  Warning,
  ChartBarHorizontal,
  Gear,
  ClipboardText
} from "@phosphor-icons/react";

// Test if all imports work correctly
export function TestComponent() {
  const testCampaign: Campaign = {
    id: "test",
    campaignType: "Test",
    strategicPillar: ["Test"],
    revenuePlay: "Test",
    fy: "FY25",
    quarterMonth: "Q1 - July",
    region: "JP & Korea",
    country: "Japan",
    owner: "Test User",
    description: "Test campaign",
    forecastedCost: "1000",
    expectedLeads: "100",
    mql: 10,
    sql: 6,
    opportunities: 5,
    pipelineForecast: 250000
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Component Test
          </CardTitle>
          <CardDescription>Testing all components and icons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test Option</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Test input" />

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{testCampaign.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{testCampaign.region}</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex flex-wrap gap-2">
              <Calculator className="h-6 w-6" />
              <ChartBar className="h-6 w-6" />
              <CalendarIcon className="h-6 w-6" />
              <BuildingOffice className="h-6 w-6" />
              <Warning className="h-6 w-6" />
              <ChartBarHorizontal className="h-6 w-6" />
              <Gear className="h-6 w-6" />
              <ClipboardText className="h-6 w-6" />
              <Upload className="h-6 w-6" />
              <Download className="h-6 w-6" />
              <Funnel className="h-6 w-6" />
              <X className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}