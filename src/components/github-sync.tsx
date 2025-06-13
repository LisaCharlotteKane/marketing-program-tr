import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveCampaignsToGitHub, loadCampaignsFromGitHub } from "@/services/github-api";
import { Campaign } from "@/components/campaign-table";
import { CloudArrowUp, CloudArrowDown, CheckCircle, WarningCircle, Key } from "@phosphor-icons/react";
import { toast } from "sonner";

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
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({ 
    type: "idle", 
    message: "" 
  });
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("_default");
  const [isLoading, setIsLoading] = useState(false);

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
          Save and load campaign data to/from a GitHub repository
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
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              Token needs repo scope. <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" className="underline text-primary">Create a token</a>
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
            <AlertDescription className="text-red-700">
              {status.message}
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