import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, CloudCheck, FloppyDisk, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { type Campaign } from "@/components/campaign-table";

export function GitHubSync({ campaigns, setCampaigns }: { 
  campaigns: Campaign[], 
  setCampaigns: (campaigns: Campaign[]) => void 
}) {
  const [githubToken, setGithubToken] = useState("");
  const [repoPath, setRepoPath] = useState("username/repo");
  const [filePath, setFilePath] = useState("campaign-data/campaigns.json");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveToGitHub = async () => {
    if (!githubToken) {
      toast.error("Please enter a GitHub token");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Get repository owner and name
      const [owner, repo] = repoPath.split('/');
      
      // Content to save - stringify the campaigns array
      const content = JSON.stringify(campaigns, null, 2);
      
      // Encode content to base64
      const encodedContent = btoa(content);
      
      // First, check if the file exists to get its SHA (needed for update)
      let fileSha = '';
      try {
        const checkResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        
        if (checkResponse.ok) {
          const fileData = await checkResponse.json();
          fileSha = fileData.sha;
        }
      } catch (error) {
        // File probably doesn't exist yet, which is fine
        console.log("File doesn't exist yet or couldn't be accessed");
      }
      
      // Create or update the file
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'Update campaign planning data',
            content: encodedContent,
            sha: fileSha || undefined
          })
        }
      );
      
      if (response.ok) {
        toast.success("Campaign data saved to GitHub");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save to GitHub");
      }
    } catch (error) {
      console.error("GitHub API error:", error);
      toast.error(`GitHub API error: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLoadFromGitHub = async () => {
    if (!githubToken) {
      toast.error("Please enter a GitHub token");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get repository owner and name
      const [owner, repo] = repoPath.split('/');
      
      // Fetch the file content
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Decode content from base64
      const decodedContent = atob(data.content);
      
      // Parse the JSON content
      const loadedCampaigns = JSON.parse(decodedContent);
      
      // Update campaigns state
      setCampaigns(loadedCampaigns);
      
      toast.success("Campaign data loaded from GitHub");
    } catch (error) {
      console.error("GitHub API error:", error);
      toast.error(`GitHub API error: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" /> GitHub Integration
        </CardTitle>
        <CardDescription>Save and load campaign data to/from a GitHub repository</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="github-token">Personal Access Token</Label>
          <Input
            id="github-token"
            type="password"
            placeholder="ghp_..."
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            GitHub token with repo scope permissions
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="repo-path">Repository</Label>
            <Input
              id="repo-path"
              placeholder="username/repo"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-path">File Path</Label>
            <Input
              id="file-path"
              placeholder="path/to/file.json"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            variant="outline" 
            onClick={handleLoadFromGitHub}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <CloudCheck className="h-4 w-4 animate-spin" /> Loading...
              </>
            ) : (
              <>
                <CloudCheck className="h-4 w-4" /> Load from GitHub
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleSaveToGitHub}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <FloppyDisk className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FloppyDisk className="h-4 w-4" /> Save to GitHub
              </>
            )}
          </Button>
        </div>
        
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 mt-4">
          <div className="flex items-start">
            <WarningCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="ml-2">
              <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
              <p className="text-xs text-yellow-700 mt-1">
                Your GitHub token is stored only in this browser session and is not saved 
                between page reloads. For production use, consider implementing OAuth or
                a more secure token management system.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}