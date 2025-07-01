import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignTable } from "@/components/campaign-table";
import { ReportingDashboard } from "@/components/reporting-dashboard";
import { ExecutionTracking } from "@/components/execution-tracking";
import { CampaignCalendarView } from "@/components/campaign-calendar-view";
import { Toaster } from "sonner";
import { Logo } from "@/components/logo";

export function CampaignCountChecker() {
  const [kvCampaigns] = useKV('campaignData', []);
  const [campaignCount, setCampaignCount] = useState(0);
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    if (Array.isArray(kvCampaigns)) {
      setCampaignCount(kvCampaigns.length);
    }
  }, [kvCampaigns]);

  return (
    <div className="text-xs text-muted-foreground">
      Storage: {campaignCount} campaigns
    </div>
  );
}

export default function App() {
  const [campaigns, setCampaigns] = useKV('campaignData', []);
  const [activeTab, setActiveTab] = useState('planning');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />
      <header className="border-b shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <CampaignCountChecker />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="planning">Campaign Planning</TabsTrigger>
            <TabsTrigger value="execution">Execution Tracking</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <CampaignTable 
              campaigns={campaigns} 
              setCampaigns={setCampaigns} 
            />
          </TabsContent>

          <TabsContent value="execution">
            <ExecutionTracking 
              campaigns={campaigns} 
              setCampaigns={setCampaigns}
            />
          </TabsContent>

          <TabsContent value="reporting">
            <ReportingDashboard campaigns={campaigns} />
          </TabsContent>

          <TabsContent value="calendar">
            <CampaignCalendarView campaigns={campaigns} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}