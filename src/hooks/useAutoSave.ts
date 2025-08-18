import { useEffect, useState, useRef } from 'react';
import { toast } from "@/lib/notifier";
import { saveCampaignsToGitHub } from '@/services/github-api';
import { Campaign } from '@/types/campaign';

interface AutoSaveConfig {
  token?: string;
  owner?: string;
  repo?: string;
  path?: string;
  enabled?: boolean;
  delay?: number;
}

/**
 * Hook to automatically save campaign data to GitHub
 * 
 * @param campaigns Array of campaign data to save
 * @param config GitHub repository configuration and auto-save options
 */
export function useAutoSave(campaigns: Campaign[], config: AutoSaveConfig = {}) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Default configuration
  const {
    token,
    owner, 
    repo,
    path = 'campaign-data/campaigns.json',
    enabled = true,
    delay = 5000, // 5 seconds delay
  } = config;

  // Check if we have the required configuration to save
  const canSave = Boolean(token && owner && repo && enabled);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-save whenever campaigns change
  useEffect(() => {
    // Don't proceed if we don't have required config or if we have no campaigns
    if (!canSave || campaigns.length === 0) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to save after delay
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setError(null);
        
        const result = await saveCampaignsToGitHub(campaigns, {
          token,
          owner,
          repo,
          path
        });

        if (result.success) {
          setLastSaved(new Date());
          // Optional: Show toast for success
          // toast.success("Campaigns saved to GitHub");
        } else {
          setError(result.message);
          toast(`Error auto-saving: ${result.message}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        toast(`Auto-save error: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
    }, delay);
  }, [campaigns, token, owner, repo, path, enabled, delay]);

  return {
    lastSaved,
    isSaving,
    error,
    canSave
  };
}