import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  Database, 
  CloudArrowUp, 
  ArrowsClockwise,
  Question
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function StorageInfo() {
  // Test shared storage with a simple key-value pair
  const [testValue, setTestValue] = useKV("storageTest", { 
    message: "Initial test value", 
    timestamp: Date.now(),
    updates: 0 
  });
  
  const [inputValue, setInputValue] = useState("");
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [userIdentifier, setUserIdentifier] = useState("");

  // Generate a simple user identifier on component mount
  useEffect(() => {
    // Create a random identifier for this session
    const randomId = Math.random().toString(36).substring(2, 8);
    setUserIdentifier(randomId);
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Update the shared value
  const updateTestValue = () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a test message");
      return;
    }

    // Get previous update count
    const previousUpdates = testValue?.updates || 0;

    setTestValue({
      message: inputValue.trim(),
      timestamp: Date.now(),
      updates: previousUpdates + 1,
      lastUpdatedBy: userIdentifier
    });

    toast.success("Test value updated in shared storage");
    setInputValue("");
  };

  // Force a refresh to see if we get the latest value
  const forceRefresh = () => {
    setLastRefresh(Date.now());
    toast.info("Forcing refresh of shared storage value");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Database className="h-8 w-8" /> Shared Storage Demo
          </h1>
          
          <p className="text-lg mb-8">
            This demo shows how data is saved in GitHub Spark's shared storage, making it accessible to all users.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Shared Storage Test
                </CardTitle>
                <CardDescription>
                  Test how data is shared between users via GitHub Spark's KV store
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Alert variant="info" className="bg-blue-50 border-blue-200">
                  <Question className="h-4 w-4" />
                  <AlertTitle>Your Session ID</AlertTitle>
                  <AlertDescription>
                    You are identified as user: <span className="font-mono text-primary">{userIdentifier}</span>
                  </AlertDescription>
                </Alert>
                
                <div className="rounded-md bg-muted p-4">
                  <h4 className="font-medium mb-2">Current Shared Value:</h4>
                  <div className="bg-card rounded-md p-3 font-mono text-sm">
                    <div>Message: <span className="text-primary">{testValue?.message || "No value found"}</span></div>
                    <div className="text-xs mt-1">
                      Updates: <span className="text-primary">{testValue?.updates || 0}</span>
                    </div>
                    {testValue?.lastUpdatedBy && (
                      <div className="text-xs mt-1">
                        Last updated by: <span className="text-primary">{testValue.lastUpdatedBy}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Last update time: {testValue?.timestamp ? formatTimestamp(testValue.timestamp) : "Never"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-message">Test Message</Label>
                    <div className="flex gap-2">
                      <Input
                        id="test-message"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter a test message to store"
                      />
                      <Button onClick={updateTestValue}>Update</Button>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={forceRefresh}
                    className="flex items-center gap-2 w-full justify-center"
                  >
                    <ArrowsClockwise className="h-4 w-4" /> Refresh from Shared Storage
                  </Button>
                </div>

                <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                  <p>
                    <strong>How this works:</strong> When you update the message above, it's saved to GitHub Spark's shared 
                    KV store using the <code className="bg-blue-100 px-1 rounded">useKV</code> hook. 
                    This makes the data available to all users of this Spark.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/50 px-6 py-3 text-xs text-muted-foreground">
                Last refreshed: {formatTimestamp(lastRefresh)}
              </CardFooter>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" /> How Shared Storage Works
                </CardTitle>
                <CardDescription>
                  Technical explanation of GitHub Spark's shared storage mechanism
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">1. The useKV Hook</h4>
                    <p className="text-sm mb-2">
                      GitHub Spark provides a <code className="bg-muted-foreground/20 px-1 rounded">useKV</code> React 
                      hook that creates a persistent key-value store that's shared across all users.
                    </p>
                    <div className="bg-card rounded-md p-2 text-xs font-mono overflow-auto">
                      // Basic usage of useKV hook<br/>
                      const [value, setValue] = useKV("myKey", initialValue);
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">2. Shared Data</h4>
                    <p className="text-sm mb-2">
                      When data is stored via useKV, it's available to all users who access this Spark.
                      This enables real-time collaboration without complex server setup.
                    </p>
                    <div className="bg-card rounded-md p-2 text-xs font-mono overflow-auto">
                      // Update shared data<br/>
                      setValue(newValue); // All users will see this update
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="font-medium mb-2">3. Local Backup</h4>
                    <p className="text-sm mb-2">
                      For reliability, the application also maintains a backup in the browser's localStorage.
                      This provides a fallback if there are issues with the KV store.
                    </p>
                    <div className="bg-card rounded-md p-2 text-xs font-mono overflow-auto">
                      // Backup to localStorage<br/>
                      localStorage.setItem("myKey", JSON.stringify(value));
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                  <p>
                    <strong>Try it yourself:</strong> Open this Spark in another browser tab or share it with a colleague.
                    Update the message in one tab and see it appear in the other after clicking "Refresh".
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CloudArrowUp className="h-5 w-5" /> Implementation Details
                </CardTitle>
                <CardDescription>
                  How the MarketPlanner app uses shared storage for campaign data
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Tabs defaultValue="campaigns" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="campaigns">Campaign Data</TabsTrigger>
                    <TabsTrigger value="budgets">Budget Data</TabsTrigger>
                    <TabsTrigger value="sync">Synchronization</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="campaigns" className="space-y-4 p-4">
                    <h3 className="font-medium text-lg">Campaign Storage</h3>
                    <p className="text-sm">
                      The MarketPlanner app stores all campaign data in the shared KV store using the key "campaignData".
                      This ensures all marketing team members see the same campaigns and can collaborate effectively.
                    </p>
                    <div className="bg-muted rounded-md p-3 text-sm font-mono">
                      // From useEnhancedCampaigns.ts<br/>
                      const [kvData, setKvData] = useKV&lt;T&gt;(key, initialValue);
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="budgets" className="space-y-4 p-4">
                    <h3 className="font-medium text-lg">Budget Storage</h3>
                    <p className="text-sm">
                      Regional budgets are also stored in the shared KV store using the key "regionalBudgets".
                      This ensures consistent budget allocation visibility across the team.
                    </p>
                    <div className="bg-muted rounded-md p-3 text-sm font-mono">
                      // From useRegionalBudgets.ts<br/>
                      const [budgets, setBudgets] = useKV("regionalBudgets", DEFAULT_BUDGETS);
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sync" className="space-y-4 p-4">
                    <h3 className="font-medium text-lg">Data Synchronization</h3>
                    <p className="text-sm">
                      The app implements automatic and manual synchronization mechanisms to ensure data consistency:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Automatic periodic checks for updates from other users</li>
                      <li>Manual refresh controls to force synchronization</li>
                      <li>Custom events to notify components of data changes</li>
                      <li>Conflict resolution strategies for simultaneous edits</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StorageInfo;