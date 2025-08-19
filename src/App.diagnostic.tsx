import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Campaign } from "@/types/campaign";

function DiagnosticApp() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />
      
      <header className="border-b shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Marketing Campaign Planner - Diagnostic</h1>
          </div>
          <div className="text-xs text-muted-foreground">
            No auth required - localStorage only
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>App Status</CardTitle>
            <CardDescription>Testing if the app loads without authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">✅ App loaded successfully!</p>
            <p className="text-sm text-muted-foreground mt-2">
              This confirms the 404 error has been resolved by removing Spark authentication dependencies.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default DiagnosticApp;