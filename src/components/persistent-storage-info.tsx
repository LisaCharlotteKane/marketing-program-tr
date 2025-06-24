import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, GitBranch, FileJson, Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PersistentStorageInfo() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> Storage Information
        </CardTitle>
        <CardDescription>How your campaign data is stored and persisted</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" /> Shared Storage
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Your campaign data is stored in GitHub Spark's shared KV store.
            All users of this Spark can see and collaborate on the same data.
          </p>
          <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
            const [campaigns, setCampaigns] = useKV("campaignData", [])
          </div>
        </div>
        
        <div className="rounded-md bg-muted p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> Local Storage (Backup)
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Campaign data is also backed up to browser local storage for offline use.
            This is primarily for compatibility with older versions of the app.
          </p>
          <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
            localStorage.setItem("campaignData", JSON.stringify(campaigns))
          </div>
        </div>
        
        <div className="rounded-md bg-muted p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <FileJson className="h-4 w-4" /> Regional Budgets
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Regional budget assignments are also stored in the shared KV store.
            All users see the same budget allocations and status.
          </p>
          <div className="bg-card rounded-md p-2 text-xs font-mono text-muted-foreground overflow-auto max-h-24">
            const [budgets, setBudgets] = useKV("regionalBudgets", DEFAULT_BUDGETS)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}