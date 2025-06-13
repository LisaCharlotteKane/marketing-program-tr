import { useState, useEffect } from 'react';
import { Campaign } from '@/components/campaign-table';

/**
 * Hook to persist campaign data in localStorage
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
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error loading campaigns from localStorage', error);
      return initialValue;
    }
  });

  // Update localStorage when campaigns change
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(campaigns));
      
      // Optional: Show a toast notification
      if (campaigns.length > 0) {
        // Don't show on initial load
        if (JSON.stringify(campaigns) !== JSON.stringify(initialValue)) {
          // Use setTimeout to prevent too many toasts when rapidly changing data
          const timeoutId = setTimeout(() => {
            // Import dynamically to prevent circular dependencies
            import('sonner').then(({ toast }) => {
              toast.success('Campaign data saved locally');
            });
          }, 2000); // 2 second debounce
          
          return () => clearTimeout(timeoutId);
        }
      }
    } catch (error) {
      console.error('Error saving campaigns to localStorage', error);
      
      // Show error toast
      import('sonner').then(({ toast }) => {
        toast.error('Error saving campaign data locally');
      });
    }
  }, [campaigns, key, initialValue]);

  return [campaigns, setCampaigns];
}