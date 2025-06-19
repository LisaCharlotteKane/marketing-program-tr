import { toast } from "sonner";
import { saveCampaignsToGitHub } from "./github-api";

// Auto GitHub sync service
// This will set up event listeners to detect campaign changes and auto-sync with GitHub if configured

let syncTimer: NodeJS.Timeout | null = null;
const SYNC_DELAY = 60000; // 1 minute
let lastSyncTime = 0;

export function initAutoGitHubSync() {
  // Listen for campaign data changes
  window.addEventListener("campaign:updated", handleCampaignUpdate);
  
  // Listen for GitHub credential updates
  window.addEventListener("github:credentials_updated", initSync);
  
  // Initialize sync based on saved credentials
  initSync();
  
  return () => {
    // Clean up event listeners
    window.removeEventListener("campaign:updated", handleCampaignUpdate);
    window.removeEventListener("github:credentials_updated", initSync);
    
    // Clear any pending sync
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }
  };
}

function initSync() {
  // Check if we have GitHub credentials in localStorage
  const githubToken = localStorage.getItem("github_token");
  const githubRepo = localStorage.getItem("github_repo");
  const enableAutoSync = localStorage.getItem("github_auto_sync") === "true";
  
  if (!githubToken || !githubRepo || !enableAutoSync) {
    console.log("Auto GitHub sync not configured or disabled");
    return;
  }
  
  console.log("Auto GitHub sync initialized");
  
  // Trigger an initial sync
  syncCampaignsToGitHub();
}

function handleCampaignUpdate(event: Event) {
  const now = Date.now();
  
  // If we've synced recently, wait a bit before syncing again
  if (now - lastSyncTime < SYNC_DELAY) {
    // Clear any existing timer
    if (syncTimer) {
      clearTimeout(syncTimer);
    }
    
    // Set a new timer
    syncTimer = setTimeout(() => {
      syncCampaignsToGitHub();
    }, SYNC_DELAY);
    
    return;
  }
  
  // Otherwise sync immediately
  syncCampaignsToGitHub();
}

async function syncCampaignsToGitHub() {
  // Get GitHub credentials from localStorage
  const githubToken = localStorage.getItem("github_token");
  const githubRepo = localStorage.getItem("github_repo");
  const githubPath = localStorage.getItem("github_path") || "campaign-data/campaigns.json";
  const enableAutoSync = localStorage.getItem("github_auto_sync") === "true";
  
  if (!githubToken || !githubRepo || !enableAutoSync) {
    console.log("Cannot sync to GitHub - missing credentials or auto-sync disabled");
    return;
  }
  
  try {
    // Parse the repository owner and name
    const [owner, repo] = githubRepo.split('/');
    
    if (!owner || !repo) {
      console.log("Invalid repository format. Use owner/repo");
      return;
    }
    
    // Get campaigns from localStorage
    const campaignsJson = localStorage.getItem("campaignData");
    if (!campaignsJson) {
      console.log("No campaign data to sync");
      return;
    }
    
    const campaigns = JSON.parse(campaignsJson);
    
    // Sync to GitHub
    const result = await saveCampaignsToGitHub(campaigns, {
      token: githubToken,
      owner,
      repo,
      path: githubPath
    });
    
    if (result.success) {
      console.log("Campaigns auto-synced to GitHub");
      lastSyncTime = Date.now();
      
      // Update last sync timestamp
      localStorage.setItem("github_last_sync", new Date().toISOString());
    } else {
      console.error("Failed to auto-sync campaigns:", result.message);
    }
  } catch (error) {
    console.error("Error during GitHub auto-sync:", error);
  }
}