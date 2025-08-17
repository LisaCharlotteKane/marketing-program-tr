import { useState, useEffect, useRef } from 'react';
import { Campaign } from '@/types/campaign';

/**
 * Hook to persist campaign data in localStorage with auto-save functionality
 * 
 * @param key The localStorage key to use
 * @param initialValue Initial value if nothing is in localStorage
 * @returns Array with campaigns and setter function
 */
export function useLocalCampaigns(
  key: string = 'campaignData', 
  initialValue: Campaign[] = []
): [Campaign[], React.Dispatch<React.SetStateAction<Campaign[]>>] {
  // State to store our campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      // Get from localStorage by key
      const item = localStorage.getItem(key);
      // Parse stored json or return initialValue
      if (item) {
        try {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) {
            return parsed;
          } else {
            console.warn('Invalid campaign data format in localStorage, using defaults');
            return initialValue;
          }
        } catch (parseError) {
          console.error('Error parsing campaigns from localStorage', parseError);
          return initialValue;
        }
      }
      return initialValue;
    } catch (error) {
      console.error('Error loading campaigns from localStorage', error);
      return initialValue;
    }
  });
  
  // Track last save status
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update localStorage when campaigns change (with debounce)
  useEffect(() => {
    // Clear any existing timeouts
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set saving state for immediate UI feedback
    setIsSaving(true);
    
    // Debounce the save operation (500ms)
    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Save to localStorage
        localStorage.setItem(key, JSON.stringify(campaigns));
        
        // Save timestamp for the auto-save indicator
        localStorage.setItem('autoSaveStatus', JSON.stringify({
          timestamp: new Date().toISOString(),
          key
        }));
        
        setLastSaved(new Date());
        setIsSaving(false);
        
        // Optional: Show a toast notification (less frequently)
        if (campaigns.length > 0) {
          // Don't show on initial load
          if (JSON.stringify(campaigns) !== JSON.stringify(initialValue)) {
            // Clear any existing toast timeout
            if (toastTimeoutRef.current) {
              clearTimeout(toastTimeoutRef.current);
            }
            
            // Show toast with longer debounce to avoid too many notifications
            toastTimeoutRef.current = setTimeout(() => {
              // Import dynamically to prevent circular dependencies
              import('sonner').then(({ toast }) => {
                toast.success('Campaign data auto-saved');
              });
            }, 3000); // 3 second debounce for toast
          }
        }
      } catch (error) {
        console.error('Error saving campaigns to localStorage', error);
        setIsSaving(false);
        
        // Show error toast
        import('sonner').then(({ toast }) => {
          toast.error('Error auto-saving campaign data');
        });
      }
    }, 500); // 500ms debounce for actual save
    
    // Clean up all timeouts on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [campaigns, key, initialValue]);

  return [campaigns, setCampaigns];
}