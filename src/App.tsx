import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";

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
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-4">Campaign Planning</h2>
              <p className="text-muted-foreground">
                Campaign table component will be restored here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="execution">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-4">Execution Tracking</h2>
              <p className="text-muted-foreground">
                Execution tracking component will be restored here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-4">Budget Management</h2>
              <p className="text-muted-foreground">
                Budget management component will be restored here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reporting">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-4">Reporting</h2>
              <p className="text-muted-foreground">
                Reporting dashboard will be restored here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
              <p className="text-muted-foreground">
                Calendar view will be restored here.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="storage">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-4">Storage Management</h2>
              <p className="text-muted-foreground">
                Storage management will be restored here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}