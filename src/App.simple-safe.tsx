import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import { SimpleCampaignTable } from '@/components/simple-campaign-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function App() {
  const [campaigns, setCampaigns] = useKV('campaignData', [], { scope: 'global' });
  const [activeTab, setActiveTab] = useState('planning');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />
      <header className="border-b shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Marketing Campaign Planner</h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Storage: {campaigns.length} campaigns
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="planning">Campaign Planning</TabsTrigger>
            <TabsTrigger value="execution">Execution Tracking</TabsTrigger>
            <TabsTrigger value="budget">Budget Management</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <SimpleCampaignTable campaigns={campaigns} setCampaigns={setCampaigns} />
          </TabsContent>

          <TabsContent value="execution">
            <Card>
              <CardHeader>
                <CardTitle>Execution Tracking</CardTitle>
                <CardDescription>
                  Track campaign execution status and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader>
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>
                  Monitor and manage regional marketing budgets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reporting">  
            <Card>
              <CardHeader>
                <CardTitle>Reporting Dashboard</CardTitle>
                <CardDescription>
                  View performance metrics and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  View campaigns in a calendar layout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature will be available soon. You can continue using the Planning tab to add campaigns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}