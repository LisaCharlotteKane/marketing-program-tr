/**
 * Auto GitHub Sync Service
 * 
 * Handles automatic synchronization of campaign data with GitHub
 * without requiring explicit user interaction with the GitHub Sync UI
 */

import { Campaign } from "@/components/campaign-table";
import { saveCampaignsToGitHub } from "./github-api";
import { toast } from "sonner";

// Default GitHub configuration
const DEFAULT_GITHUB_CONFIG = {
  token: "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", // Pre-configured token
  owner: "",
  repo: "",
  path: "campaign-data/campaigns.json"
};

// Flag to track initialization state
let isInitialized = false;

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize the auto-sync system
 * 
 * @returns Boolean indicating if initialization was successful
 */
export function initAutoGitHubSync(): boolean {
  try {
    // Load GitHub settings from localStorage
    const savedSettings = localStorage.getItem('githubSyncSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.owner && settings.repo) {
          DEFAULT_GITHUB_CONFIG.owner = settings.owner;
          DEFAULT_GITHUB_CONFIG.repo = settings.repo;
          
          if (settings.path) {
            DEFAULT_GITHUB_CONFIG.path = settings.path;
          }
          
          // Set initialized flag
          isInitialized = true;
          return true;
        }
      } catch (e) {
        console.error('Error loading GitHub settings from localStorage:', e);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Failed to initialize auto GitHub sync:", error);
    return false;
  }
}

/**
 * Check if auto GitHub sync is available (token + repo configured)
 */
export function isAutoGitHubSyncAvailable(): boolean {
  return isInitialized && 
    Boolean(DEFAULT_GITHUB_CONFIG.token && 
           DEFAULT_GITHUB_CONFIG.owner && 
           DEFAULT_GITHUB_CONFIG.repo);
}

/**
 * Sync campaigns to GitHub with debouncing
 * 
 * @param campaigns Campaign data to sync
 * @param silent Whether to show toast notifications
 * @returns Promise that resolves when sync is complete
 */
export async function syncCampaignsToGitHub(
  campaigns: Campaign[], 
  silent: boolean = true
): Promise<boolean> {
  // Don't proceed if not initialized or missing required config
  if (!isAutoGitHubSyncAvailable()) {
    return false;
  }
  
  // Clear any existing timeout
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  // Set a new timeout
  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      try {
        const result = await saveCampaignsToGitHub(campaigns, DEFAULT_GITHUB_CONFIG);
        
        if (result.success) {
          if (!silent) {
            toast.success(`Campaigns auto-synced to GitHub`);
          }
          resolve(true);
        } else {
          console.error("Auto GitHub sync failed:", result.message);
          if (!silent) {
            toast.error(`GitHub sync failed: ${result.message}`);
          }
          resolve(false);
        }
      } catch (error) {
        console.error("Error during auto GitHub sync:", error);
        if (!silent) {
          toast.error(`GitHub sync error: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        resolve(false);
      }
    }, 2000); // 2 second debounce
  });
}

/**
 * Update GitHub configuration settings
 * 
 * @param settings New settings to apply
 */
export function updateGitHubSyncConfig(settings: Partial<typeof DEFAULT_GITHUB_CONFIG>) {
  if (settings.token) {
    DEFAULT_GITHUB_CONFIG.token = settings.token;
  }
  
  if (settings.owner) {
    DEFAULT_GITHUB_CONFIG.owner = settings.owner;
  }
  
  if (settings.repo) {
    DEFAULT_GITHUB_CONFIG.repo = settings.repo;
  }
  
  if (settings.path) {
    DEFAULT_GITHUB_CONFIG.path = settings.path;
  }
  
  // Mark as initialized if we have the minimum required settings
  if (DEFAULT_GITHUB_CONFIG.token && DEFAULT_GITHUB_CONFIG.owner && DEFAULT_GITHUB_CONFIG.repo) {
    isInitialized = true;
  }
}