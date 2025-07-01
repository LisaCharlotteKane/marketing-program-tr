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
  Question,
  ClockCounterClockwise,
  CheckSquare,
  Warning
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useKV } from "@github/spark/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

function StorageInfo() {
  // Test shared storage with a simple key-value pair
  const [testValue, setTestValue] = useKV("storageTest", { 
    message: "Initial test value", 
    timestamp: Date.now(),
    updates: 0 
  });
  
  // Direct access to campaign data for diagnostics
  const [kvCampaigns] = useKV('campaignData', []);
  const [kvBudgets] = useKV('regionalBudgets', {});
  
  const [inputValue, setInputValue] = useState("");
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [userIdentifier, setUserIdentifier] = useState("");
  const [kvStatus, setKvStatus] = useState({ 
    campaigns: 'checking',
    budgets: 'checking',
    test: 'checking'
  });

  // Generate a simple user identifier on component mount
  useEffect(() => {
    // Create a random identifier for this session
    const randomId = Math.random().toString(36).substring(2, 8);
    setUserIdentifier(randomId);
    
    // Check KV status
    checkKvStatus();
  }, []);
  
  // Check status of KV store connections
  const checkKvStatus = () => {
    // Create a new object to avoid reference issues
    const newStatus = { ...kvStatus };
    
    // Check campaigns
    if (kvCampaigns && Array.isArray(kvCampaigns)) {
      newStatus.campaigns = 'working';
    } else {
      newStatus.campaigns = 'error';
    }
    
    // Check budgets
    if (kvBudgets && typeof kvBudgets === 'object') {
      newStatus.budgets = 'working';
    } else {
      newStatus.budgets = 'error';
    }
    
    // Check test value
    if (testValue && typeof testValue === 'object') {
      newStatus.test = 'working';
    } else {
      newStatus.test = 'error';
    }
    
    setKvStatus(newStatus);
  };

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
    
    // Check KV status after update
    setTimeout(checkKvStatus, 500);
  };

  // Force a refresh to see if we get the latest value
  const forceRefresh = () => {
    setLastRefresh(Date.now());
    toast.info("Forcing refresh of shared storage value");
    
    // Check KV status after refresh
    setTimeout(checkKvStatus, 500);
  };
  
  // Force a complete data sync
  const forceSyncAllData = () => {
    // Trigger global refresh events
    window.dispatchEvent(new CustomEvent("campaign:refresh"));
    
    toast.success("Forcing refresh of all shared data");
    setLastRefresh(Date.now());
    
    // Check KV status after sync
    setTimeout(checkKvStatus, 1000);
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Shared Storage Status
          </CardTitle>
          <CardDescription>
            Real-time diagnostics of the GitHub Spark shared KV storage
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Campaign Data
                {kvStatus.campaigns === 'working' ? (
                  <CheckSquare className="h-4 w-4 text-green-500" />
                ) : (
                  <Warning className="h-4 w-4 text-destructive" />
                )}
              </h4>
              <div className="text-sm space-y-2">
                <p>
                  Status: <Badge variant={kvStatus.campaigns === 'working' ? 'default' : 'destructive'}>
                    {kvStatus.campaigns === 'working' ? 'Connected' : 'Error'}
                  </Badge>
                </p>
                <p>
                  Campaigns: <span className="font-bold">{kvCampaigns && Array.isArray(kvCampaigns) ? kvCampaigns.length : 'Unknown'}</span>
                </p>
              </div>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Budget Data
                {kvStatus.budgets === 'working' ? (
                  <CheckSquare className="h-4 w-4 text-green-500" />
                ) : (
                  <Warning className="h-4 w-4 text-destructive" />
                )}
              </h4>
              <div className="text-sm space-y-2">
                <p>
                  Status: <Badge variant={kvStatus.budgets === 'working' ? 'default' : 'destructive'}>
                    {kvStatus.budgets === 'working' ? 'Connected' : 'Error'}
                  </Badge>
                </p>
                <p>
                  Regions: <span className="font-bold">
                    {kvBudgets && typeof kvBudgets === 'object' ? Object.keys(kvBudgets).length : 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Test Storage
                {kvStatus.test === 'working' ? (
                  <CheckSquare className="h-4 w-4 text-green-500" />
                ) : (
                  <Warning className="h-4 w-4 text-destructive" />
                )}
              </h4>
              <div className="text-sm space-y-2">
                <p>
                  Status: <Badge variant={kvStatus.test === 'working' ? 'default' : 'destructive'}>
                    {kvStatus.test === 'working' ? 'Connected' : 'Error'}
                  </Badge>
                </p>
                <p>
                  Last Update: <span className="font-bold">
                    {testValue?.timestamp ? new Date(testValue.timestamp).toLocaleTimeString() : 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={checkKvStatus}
              className="flex items-center gap-2"
              size="sm"
            >
              <ArrowsClockwise className="h-4 w-4" /> Check Status
            </Button>
            
            <Button 
              variant="outline" 
              onClick={forceSyncAllData}
              className="flex items-center gap-2"
              size="sm"
            >
              <CloudArrowUp className="h-4 w-4" /> Force Data Sync
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" /> Shared Storage Test
          </CardTitle>
          <CardDescription>
            Test that GitHub Spark's shared KV storage is working correctly
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
            <p className="flex items-center gap-2">
              <Question className="h-4 w-4 flex-shrink-0" />
              <span>
                To fully test shared storage, open this Spark in another browser window and update the message there.
                Then check if the value updates here after clicking refresh.
              </span>
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted/50 px-6 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ClockCounterClockwise className="h-3.5 w-3.5" />
            Last refreshed: {formatTimestamp(lastRefresh)}
          </div>
        </CardFooter>
      </Card>
      
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
              
              <div className="mt-4 text-sm">
                <strong>Current campaign count:</strong> {kvCampaigns && Array.isArray(kvCampaigns) ? kvCampaigns.length : 'Unknown'}
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
              
              <div className="mt-4 text-sm">
                <strong>Budget regions:</strong> {kvBudgets && typeof kvBudgets === 'object' ? Object.keys(kvBudgets).join(', ') : 'Unknown'}
              </div>
            </TabsContent>
            
            <TabsContent value="sync" className="space-y-4 p-4">
              <h3 className="font-medium text-lg">Data Synchronization</h3>
              <p className="text-sm">
                The app implements multiple synchronization mechanisms to ensure data consistency:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Automatic checks</strong> - Periodic polling of KV store (every 10 seconds)
                </li>
                <li>
                  <strong>Manual refresh</strong> - "Refresh Data" button to force immediate sync
                </li>
                <li>
                  <strong>Save & Share</strong> - Explicitly push all local data to shared storage
                </li>
                <li>
                  <strong>Visual indicators</strong> - Status badges show current sync state
                </li>
                <li>
                  <strong>Conflict resolution</strong> - Smart merging of data from different sources
                </li>
              </ul>
              
              <Alert variant="default" className="mt-4">
                <CheckSquare className="h-4 w-4" />
                <AlertTitle>How to troubleshoot sync issues</AlertTitle>
                <AlertDescription>
                  If you're not seeing data from other users, try:
                  <ol className="list-decimal pl-6 mt-2 space-y-1">
                    <li>Click "Refresh Data" in the app header</li>
                    <li>Click "Save & Share" to push your data</li>
                    <li>Check the Storage tab's connection status</li>
                    <li>Reload the page if issues persist</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default StorageInfo;