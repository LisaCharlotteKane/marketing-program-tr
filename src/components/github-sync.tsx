import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { saveCampaignsToGitHub, loadCampaignsFromGitHub } from "@/services/github-api";
import { Campaign } from "@/components/campaign-table";
import { CloudArrowUp, CloudArrowDown, CheckCircle, WarningCircle, Key, ClockClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAutoSave } from "@/hooks/useAutoSave";
import { updateGitHubSyncConfig } from "@/services/auto-github-sync";

interface GitHubSyncProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export function GitHubSync({ campaigns, setCampaigns }: GitHubSyncProps) {
  // State for GitHub configuration
  const [token, setToken] = useState("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");
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [path, setPath] = useState("campaign-data/campaigns.json");
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({ 
    type: "idle", 
    message: "" 
  });
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("_default");
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Load saved GitHub settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('githubSyncSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.owner) setOwner(settings.owner);
        if (settings.repo) setRepo(settings.repo);
        if (settings.path) setPath(settings.path);
        if (settings.selectedFiscalYear) setSelectedFiscalYear(settings.selectedFiscalYear);
        if (settings.autoSaveEnabled) setAutoSaveEnabled(settings.autoSaveEnabled);
      } catch (e) {
        console.error('Error loading GitHub settings from localStorage:', e);
      }
    }
  }, []);
  
  // Save GitHub settings to localStorage when they change
  useEffect(() => {
    if (owner || repo || path || selectedFiscalYear !== "_default" || autoSaveEnabled) {
      const settings = {
        owner,
        repo,
        path,
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
          : path
      });
    }
  }, [owner, repo, path, selectedFiscalYear, autoSaveEnabled, token]);
  
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
  const handleSave = async () => {
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
  const handleLoad = async () => {
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

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Key className="h-5 w-5" /> GitHub Repository Sync
        </CardTitle>
        <CardDescription>
          Your token is pre-configured. Just enter repository details below.
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
            <Input
              id="github-token"
              type="password"
              placeholder="ghp_..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono bg-green-50"
              required
            />
            <p className="text-xs text-muted-foreground">
              Token pre-configured. <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" className="underline text-primary">Create a new token</a> if needed.
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
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleLoad}
          disabled={isLoading || !token || !owner || !repo}
          className="flex items-center gap-2"
        >
          <CloudArrowDown className="h-4 w-4" />
          Load from GitHub
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading || !token || !owner || !repo || campaigns.length === 0}
          className="flex items-center gap-2"
        >
          <CloudArrowUp className="h-4 w-4" />
          Save to GitHub
        </Button>
      </CardFooter>
    </Card>
  );
}