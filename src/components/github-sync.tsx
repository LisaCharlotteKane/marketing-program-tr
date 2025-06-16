import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { saveCampaignsToGitHub, loadCampaignsFromGitHub, saveBudgetsToGitHub, loadBudgetsFromGitHub } from "@/services/github-api";
import { Campaign } from "@/components/campaign-table";
import { RegionalBudgets } from "@/hooks/useRegionalBudgets";
import { CloudArrowUp, CloudArrowDown, CheckCircle, WarningCircle, Key, ClockClockwise, ChartDonut } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAutoSave } from "@/hooks/useAutoSave";
import { updateGitHubSyncConfig } from "@/services/auto-github-sync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GitHubSyncProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export function GitHubSync({ campaigns, setCampaigns }: GitHubSyncProps) {
  // State for GitHub configuration
  const [token, setToken] = useState("");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [path, setPath] = useState("campaign-data/campaigns.json");
  const [budgetPath, setBudgetPath] = useState("campaign-data/budgets.json");
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({ 
    type: "idle", 
    message: "" 
  });
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("_default");
  const [isLoading, setIsLoading] = useState(false);
  
  // Budgets state for loading from GitHub
  const [budgets, setBudgets] = useState<RegionalBudgets | null>(null);
  
  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Active tab
  const [activeTab, setActiveTab] = useState("campaigns");
  
  // Set token to the hardcoded value
  useEffect(() => {
    const hardcodedToken = "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";
    setToken(hardcodedToken);
    
    // Update GitHub sync config with the token
    updateGitHubSyncConfig({
      token: hardcodedToken,
      owner,
      repo,
      path,
      budgetPath
    });
  }, []);
  // Load saved GitHub settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('githubSyncSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.owner) setOwner(settings.owner);
        if (settings.repo) setRepo(settings.repo);
        if (settings.path) setPath(settings.path);
        if (settings.budgetPath) setBudgetPath(settings.budgetPath);
        if (settings.selectedFiscalYear) setSelectedFiscalYear(settings.selectedFiscalYear);
        if (settings.autoSaveEnabled !== undefined) setAutoSaveEnabled(settings.autoSaveEnabled);
      } catch (e) {
        console.error('Error loading GitHub settings from localStorage:', e);
      }
    }
  }, []);
  
  // Save GitHub settings to localStorage when they change
  useEffect(() => {
    if (owner || repo || path || budgetPath || selectedFiscalYear !== "_default" || autoSaveEnabled) {
      const settings = {
        owner,
        repo,
        path,
        budgetPath,
        selectedFiscalYear,
        autoSaveEnabled
      };
      localStorage.setItem('githubSyncSettings', JSON.stringify(settings));
      
      // Update auto GitHub sync configuration
      updateGitHubSyncConfig({
        token,
        owner,
        repo,
        path: selectedFiscalYear !== "_default" 
          ? `campaign-data/${selectedFiscalYear.toLowerCase()}.json`
          : path,
        budgetPath
      });
    }
  }, [owner, repo, path, budgetPath, selectedFiscalYear, autoSaveEnabled, token]);
  
  // Use the auto-save hook
  const { lastSaved, isSaving, error: autoSaveError, canSave } = useAutoSave(campaigns, {
    token: token || null,
    owner,
    repo,
    path: selectedFiscalYear !== "_default" 
      ? `campaign-data/${selectedFiscalYear.toLowerCase()}.json`
      : path,
    enabled: autoSaveEnabled,
    delay: 2000 // 2 seconds delay
  });

  // Fiscal year options for file selection
  const fiscalYears = ["FY24", "FY25", "FY26"];

  // Handle saving campaigns to GitHub
  const handleSaveCampaigns = async () => {
    if (!token || !owner || !repo) {
      setStatus({
        type: "error",
        message: "GitHub token, owner, and repository name are required"
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      // Adjust path based on selected fiscal year
      const filePath = selectedFiscalYear !== "_default" 
        ? `campaign-data/${selectedFiscalYear.toLowerCase()}.json`
        : path;

      const result = await saveCampaignsToGitHub(campaigns, {
        token,
        owner,
        repo,
        path: filePath
      });

      if (result.success) {
        setStatus({
          type: "success",
          message: result.message
        });
        toast.success(`Successfully saved ${campaigns.length} campaigns to GitHub`);
      } else {
        setStatus({
          type: "error",
          message: result.message
        });
        toast.error(`Error saving to GitHub: ${result.message}`);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading campaigns from GitHub
  const handleLoadCampaigns = async () => {
    if (!token || !owner || !repo) {
      setStatus({
        type: "error",
        message: "GitHub token, owner, and repository name are required"
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      // Adjust path based on selected fiscal year
      const filePath = selectedFiscalYear !== "_default" 
        ? `campaign-data/${selectedFiscalYear.toLowerCase()}.json`
        : path;

      const result = await loadCampaignsFromGitHub({
        token,
        owner,
        repo,
        path: filePath
      });

      if (result.success && result.campaigns) {
        setCampaigns(result.campaigns);
        setStatus({
          type: "success",
          message: result.message
        });
        toast.success(`Successfully loaded ${result.campaigns.length} campaigns from GitHub`);
      } else {
        setStatus({
          type: "error",
          message: result.message
        });
        toast.error(`Error loading from GitHub: ${result.message}`);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving budgets to GitHub
  const handleSaveBudgets = async () => {
    if (!token || !owner || !repo) {
      setStatus({
        type: "error",
        message: "GitHub token, owner, and repository name are required"
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      // Get budgets from localStorage
      const budgetData = localStorage.getItem('regionalBudgets');
      if (!budgetData) {
        setStatus({
          type: "error",
          message: "No budget data available to save"
        });
        return;
      }

      const budgets = JSON.parse(budgetData) as RegionalBudgets;

      const result = await saveBudgetsToGitHub(budgets, {
        token,
        owner,
        repo,
        path: budgetPath
      });

      if (result.success) {
        setStatus({
          type: "success",
          message: result.message
        });
        toast.success(`Successfully saved regional budgets to GitHub`);
      } else {
        setStatus({
          type: "error",
          message: result.message
        });
        toast.error(`Error saving budgets to GitHub: ${result.message}`);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading budgets from GitHub
  const handleLoadBudgets = async () => {
    if (!token || !owner || !repo) {
      setStatus({
        type: "error",
        message: "GitHub token, owner, and repository name are required"
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const result = await loadBudgetsFromGitHub({
        token,
        owner,
        repo,
        path: budgetPath
      });

      if (result.success && result.budgets) {
        setBudgets(result.budgets);
        
        // Save to localStorage
        localStorage.setItem('regionalBudgets', JSON.stringify(result.budgets));
        
        // Update timestamp
        localStorage.setItem('budgetSaveStatus', JSON.stringify({
          timestamp: new Date().toISOString()
        }));
        
        setStatus({
          type: "success",
          message: result.message
        });
        toast.success(`Successfully loaded regional budgets from GitHub`);
        
        // Reload the page to apply the loaded budgets
        window.location.reload();
      } else {
        setStatus({
          type: "error",
          message: result.message
        });
        toast.error(`Error loading budgets from GitHub: ${result.message}`);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Key className="h-5 w-5" /> GitHub Repository Sync
        </CardTitle>
        <CardDescription>
          Enter your GitHub repository details and access token to sync data.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configuration Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="github-token">
              GitHub Personal Access Token
              <span className="text-destructive"> *</span>
            </Label>
            <div className="relative">
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_..."
                value="••••••••••••••••••••••••••••••••"
                className="font-mono bg-green-50 pr-28"
                disabled
                required
              />
              <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white">Pre-configured</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Token is pre-configured for this application.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github-owner">
              Repository Owner
              <span className="text-destructive"> *</span>
            </Label>
            <Input
              id="github-owner"
              placeholder="username or org name"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github-repo">
              Repository Name
              <span className="text-destructive"> *</span>
            </Label>
            <Input
              id="github-repo"
              placeholder="repo-name"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscal-year">Fiscal Year File</Label>
            <Select
              value={selectedFiscalYear}
              onValueChange={setSelectedFiscalYear}
            >
              <SelectTrigger id="fiscal-year">
                <SelectValue placeholder="Select fiscal year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_default">Default (all campaigns)</SelectItem>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedFiscalYear === "_default" 
                ? `Using default path: ${path}`
                : `Will use path: campaign-data/${selectedFiscalYear.toLowerCase()}.json`}
            </p>
          </div>
        </div>
        
        {/* Auto-save toggle */}
        <div className="flex items-center space-x-2 border p-3 rounded-md mt-4">
          <Switch
            id="auto-save"
            checked={autoSaveEnabled}
            onCheckedChange={setAutoSaveEnabled}
            disabled={!canSave}
          />
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="auto-save" className="text-sm font-medium">
              Enable Auto-Save to GitHub
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically save changes to GitHub when data is modified
            </p>
          </div>
          
          {autoSaveEnabled && (
            <div className="flex items-center gap-1.5">
              {isSaving && <Badge variant="secondary" className="text-xs py-0">Saving to GitHub...</Badge>}
              {lastSaved && !isSaving && (
                <Badge variant="outline" className="text-xs gap-1 py-0">
                  <ClockClockwise className="h-3 w-3" />
                  Last GitHub sync: {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {status.type === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        {status.type === "error" && (
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <WarningCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-red-700 space-y-2">
              <p>{status.message}</p>
              {status.message.includes("Not Found") && (
                <div className="text-sm mt-2 p-2 bg-red-100 rounded">
                  <p><strong>Common "Not Found" reasons:</strong></p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Repository doesn't exist - create it on GitHub first</li>
                    <li>Token doesn't have write access to the repository</li>
                    <li>Repository owner name is incorrect (check for typos)</li>
                    <li>You're using an organization repo without proper permissions</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Sync Options */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <CloudArrowUp className="h-4 w-4" /> Campaign Data
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <ChartDonut className="h-4 w-4" /> Budget Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaigns">
            <div className="p-4 border rounded-md bg-muted/30 mt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Campaign data includes all planned and executed marketing campaigns.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleLoadCampaigns}
                  disabled={isLoading || !token || !owner || !repo}
                  className="flex items-center gap-2"
                >
                  <CloudArrowDown className="h-4 w-4" />
                  Load Campaigns
                </Button>
                <Button
                  onClick={handleSaveCampaigns}
                  disabled={isLoading || !token || !owner || !repo || campaigns.length === 0}
                  className="flex items-center gap-2"
                >
                  <CloudArrowUp className="h-4 w-4" />
                  Save Campaigns
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="budgets">
            <div className="p-4 border rounded-md bg-muted/30 mt-2">
              <p className="text-sm text-muted-foreground mb-4">
                Budget data includes regional budget assignments and program allocations.
                <br />
                <span className="text-xs">Stored at: <code>{budgetPath}</code></span>
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleLoadBudgets}
                  disabled={isLoading || !token || !owner || !repo}
                  className="flex items-center gap-2"
                >
                  <CloudArrowDown className="h-4 w-4" />
                  Load Budgets
                </Button>
                <Button
                  onClick={handleSaveBudgets}
                  disabled={isLoading || !token || !owner || !repo}
                  className="flex items-center gap-2"
                >
                  <CloudArrowUp className="h-4 w-4" />
                  Save Budgets
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}