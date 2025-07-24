import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Toaster } from "sonner";
import { Calculator, BarChart3, Target, Calendar, Building2 } from "@phosphor-icons/react";
import { SimpleCampaignForm } from "@/components/simple-campaign-form";
import { SimpleCampaignList } from "@/components/simple-campaign-list";

export default function App() {
  const [campaigns, setCampaigns] = useKV('campaignData', [], { scope: 'global' });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />
      
      <header className="border-b shadow-sm bg-card">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Marketing Campaign Planner</h1>
                <p className="text-sm text-muted-foreground">APAC Marketing Operations</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {Array.isArray(campaigns) ? campaigns.length : 0} campaigns
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Planning
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Execution
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reporting
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Budget
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Campaign Planning</h2>
                  <p className="text-muted-foreground">
                    Plan and forecast marketing campaign performance across APAC regions
                  </p>
                </div>
              </div>
              
              <SimpleCampaignForm campaigns={campaigns} setCampaigns={setCampaigns} />
              <SimpleCampaignList campaigns={campaigns} />
              
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Auto-Calculated Metrics</CardTitle>
                  <CardDescription>
                    Based on "Expected Leads," we automatically calculate performance forecasts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="font-medium">MQL Forecast</div>
                      <div className="text-muted-foreground">10% of Expected Leads</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">SQL Forecast</div>
                      <div className="text-muted-foreground">6% of Expected Leads</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium"># Opportunities</div>
                      <div className="text-muted-foreground">80% of SQL Forecast</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">Pipeline Forecast</div>
                      <div className="text-muted-foreground"># Opportunities × $50K</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="execution">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Execution Tracking</h2>
                <p className="text-muted-foreground">
                  Update campaign status and track actual performance metrics
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Execution Tracking</CardTitle>
                  <CardDescription>Loading execution tracking features...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading execution tracking...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reporting">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaign Performance</h2>
                <p className="text-muted-foreground">
                  Analyze forecasted vs actual performance across regions and campaigns
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Reporting Dashboard</CardTitle>
                  <CardDescription>Loading reporting features...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading reporting dashboard...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Campaign Calendar</h2>
                <p className="text-muted-foreground">
                  Visual timeline of all campaigns organized by fiscal year and quarter
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Calendar</CardTitle>
                  <CardDescription>Loading calendar view...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading calendar view...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
                <p className="text-muted-foreground">
                  Track budget allocation and spending across regions and campaign owners
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Budget Management</CardTitle>
                  <CardDescription>Loading budget management features...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading budget management...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}