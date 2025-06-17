import { toast } from "sonner";

// Auto GitHub sync service
// This will set up event listeners to detect campaign changes and auto-sync with GitHub if configured

let syncTimer: NodeJS.Timeout | null = null;
const SYNC_DELAY = 60000; // 1 minute
let lastSyncTime = 0;

export function initAutoGitHubSync() {
  // Check if GitHub credentials are configured
  const token = localStorage.getItem("githubToken");
  const repo = localStorage.getItem("githubRepo");
  const path = localStorage.getItem("githubPath");
  
  if (!token || !repo || !path) {
    // Auto-sync not configured
    return;
  }
  
  // Listen for campaign data changes
  window.addEventListener("campaignDataChanged", () => {
    // Debounce sync operations
    if (syncTimer) {
      clearTimeout(syncTimer);
    }
    
    // Only sync if it's been more than SYNC_DELAY since last sync
    const now = Date.now();
    if (now - lastSyncTime < SYNC_DELAY) {
      syncTimer = setTimeout(syncToGitHub, SYNC_DELAY);
      return;
    }
    
    syncToGitHub();
  });
}

async function syncToGitHub() {
  try {
    const token = localStorage.getItem("githubToken");
    const repo = localStorage.getItem("githubRepo");
    const path = localStorage.getItem("githubPath");
    
    if (!token || !repo || !path) {
      return;
    }
    
    // Get campaigns data
    const campaigns = localStorage.getItem("campaignData");
    if (!campaigns) {
      return;
    }
    
    // Record sync time
    lastSyncTime = Date.now();
    
    // Sync logic would go here - similar to the GitHubSync component
    // This is a placeholder for the actual implementation
    console.log("Auto-syncing to GitHub...");
    
    // Would implement actual GitHub API calls here
    
  } catch (error) {
    console.error("Auto GitHub sync failed:", error);
    // Don't show toast for auto-sync failures to avoid annoying users
  }
}