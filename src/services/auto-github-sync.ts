import { toast } from "sonner";

// Auto GitHub sync service
// This will set up event listeners to detect campaign changes and auto-sync with GitHub if configured

let syncTimer: NodeJS.Timeout | null = null;
const SYNC_DELAY = 60000; // 1 minute
let lastSyncTime = 0;

export function initAutoGitHubSync() {
  // Simplified to avoid GitHub errors
  console.log("Auto GitHub sync disabled to avoid errors");
  return;
  
  // Removed GitHub integration code to focus on local storage
}