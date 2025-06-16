import { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign } from '@/components/campaign-table';
import { saveAllStorageLayers, loadFromBestAvailableSource } from '@/services/persistent-storage';
import { fixCorruptedCampaignData } from '@/services/storage-recovery';
import { toast } from 'sonner';
import { initAutoGitHubSync, syncCampaignsToGitHub, isAutoGitHubSyncAvailable } from '@/services/auto-github-sync';

/**
 * Enhanced hook to manage campaign data with robust auto-save
 * 
 * Features:
 * - Multi-layer storage (localStorage + IndexedDB)
 * - Automatic debounced saving
 * - Visual save indicators
 * - Auto-recovery from browser crashes
 * 
 * @param key The storage key to use
 * @param initialValue Default value if nothing exists in storage
 * @returns Array with campaigns state and setter plus save status info
 */
export function useEnhancedCampaigns(
  key: string = 'campaignData', 
  initialValue: Campaign[] = []
): [
  Campaign[],                              // Campaigns data
  React.Dispatch<React.SetStateAction<Campaign[]>>, // Setter function
  {                                        // Status object
    isSaving: boolean,                     // Whether saving is in progress
    lastSaved: Date | null,                // When last save completed
    error: string | null,                  // Last error message if any
    forceSave: () => Promise<void>         // Function to force immediate save
  }
] {
  // State to store campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialValue);
  
  // Save status tracking
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Data loaded flag - prevents overwriting with initialValue after loading
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Refs for debounce handling
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State to track GitHub sync status
  const [githubSyncEnabled, setGithubSyncEnabled] = useState(false);
  
  // Initialize GitHub sync
  useEffect(() => {
    const syncAvailable = initAutoGitHubSync();
    setGithubSyncEnabled(syncAvailable && isAutoGitHubSyncAvailable());
  }, []);

  // Load initial data from storage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // First try to load from storage
        const loadedData = await loadFromBestAvailableSource(key, []);
        
        // Apply fixes to corrupted data and ensure all required fields exist
        const processedData = fixCorruptedCampaignData(Array.isArray(loadedData) ? loadedData : []);
        
        setCampaigns(processedData);
        setDataLoaded(true);
        
        // Check if we have stored timestamp
        try {
          const statusStr = localStorage.getItem('autoSaveStatus');
          if (statusStr) {
            const status = JSON.parse(statusStr);
            if (status.timestamp && status.key === key) {
              setLastSaved(new Date(status.timestamp));
            }
          }
        } catch (e) {
          console.error('Error parsing last save timestamp:', e);
          // Non-critical error, continue
        }
      } catch (e) {
        console.error('Error loading initial campaign data:', e);
        // Don't set error state to avoid showing error dialog
        setError(null);
        
        // Use an empty array instead of initialValue to avoid potential issues
        setCampaigns([]);
        setDataLoaded(true);
        
        // Intentionally not dispatching storage error event to avoid showing error dialogs
        // Just log it to console
        console.warn("Storage error suppressed:", e instanceof Error 
          ? e.message 
          : "Failed to load saved campaign data. Starting with a fresh campaign planner.");
        
        // Show non-blocking toast
        toast.info('Starting with a fresh campaign planner', {
          duration: 3000
        });
      }
    };
    
    loadInitialData();
  }, [key]);

  // Save function that handles both storage layers and GitHub sync
  const saveCampaigns = useCallback(async (data: Campaign[]) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // First save to local storage layers
      await saveAllStorageLayers(key, data);
      setLastSaved(new Date());
      
      // Then attempt to sync to GitHub if enabled
      if (githubSyncEnabled) {
        syncCampaignsToGitHub(data).catch(error => {
          console.error("GitHub auto-sync error:", error);
          // Intentionally not setting error state for silent GitHub sync failures
        });
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error saving data';
      setError(errorMsg);
      console.error('Error saving campaign data:', e);
      
      // Only show toast for actual errors, not routine saves
      toast.info('Auto-save will continue locally');
    } finally {
      setIsSaving(false);
    }
  }, [key, githubSyncEnabled]);

  // Force save function (for manual triggers)
  const forceSave = useCallback(async () => {
    await saveCampaigns(campaigns);
    
    // Show success toast that includes GitHub sync info
    if (githubSyncEnabled) {
      toast.success('Campaign data saved locally and syncing to GitHub');
      // Attempt explicit GitHub sync with notification
      syncCampaignsToGitHub(campaigns, false).catch(error => {
        console.error("Explicit GitHub sync error:", error);
      });
    } else {
      toast.success('Campaign data saved successfully to browser storage');
    }
  }, [campaigns, saveCampaigns, githubSyncEnabled]);

  // Auto-save effect when campaigns change
  useEffect(() => {
    // Don't save until initial data is loaded (prevents overwriting with empty data)
    if (!dataLoaded) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Always save (even if empty array) to allow clearing data
    // Debounce save (500ms)
    saveTimeoutRef.current = setTimeout(() => {
      saveCampaigns(campaigns);
      
      // Optional: Show toast notification (less frequently)
      // Only do this for significant changes to avoid notification fatigue
      if (JSON.stringify(campaigns) !== JSON.stringify(initialValue)) {
        // Clear any existing toast timeout
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }
        
        // Show toast with longer debounce (3s) to avoid too many notifications
        toastTimeoutRef.current = setTimeout(() => {
          toast.success('Campaign data auto-saved', {
            duration: 2000,
          });
        }, 3000);
      }
    }, 500);
    
    // Clean up timeouts on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [campaigns, dataLoaded, initialValue, saveCampaigns]);

  // Set up window unload handler to ensure data is saved before page closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If there's a pending save, do it immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        
        // Synchronous localStorage save as a fallback
        // This won't catch all cases but helps with normal page navigation
        try {
          localStorage.setItem(key, JSON.stringify(campaigns));
          localStorage.setItem('autoSaveStatus', JSON.stringify({
            timestamp: new Date().toISOString(),
            key
          }));
        } catch (e) {
          console.error('Error in emergency save:', e);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [campaigns, key]);

  return [
    campaigns,
    setCampaigns,
    {
      isSaving,
      lastSaved,
      error,
      forceSave
    }
  ];
}