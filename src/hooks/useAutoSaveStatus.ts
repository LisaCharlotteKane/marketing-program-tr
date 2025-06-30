import { useState, useEffect, useRef } from 'react';

/**
 * Hook to track auto-save activity
 * 
 * @returns Object with save status information
 */
export function useAutoSaveStatus() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Handle storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'autoSaveStatus') {
        try {
          const status = JSON.parse(e.newValue || '{}');
          if (status.timestamp) {
            setLastSaved(new Date(status.timestamp));
            setIsSaving(false);
          }
        } catch (error) {
          console.error('Error parsing auto-save status', error);
        }
      } else if (e.key === 'campaignData') {
        // When campaign data changes, show saving state
        setIsSaving(true);
        
        // After a short delay, consider the save complete
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setIsSaving(false);
          
          // Read the latest timestamp
          try {
            const statusStr = localStorage.getItem('autoSaveStatus');
            if (statusStr) {
              const status = JSON.parse(statusStr);
              if (status.timestamp) {
                setLastSaved(new Date(status.timestamp));
              }
            }
          } catch (error) {
            console.error('Error reading auto-save status', error);
          }
        }, 800);
      }
    };
    
    // Handle custom force save events
    const handleForcedSave = (e: CustomEvent) => {
      setIsSaving(true);
      
      // After a short delay, consider the save complete
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsSaving(false);
        if (e.detail && e.detail.timestamp) {
          setLastSaved(new Date(e.detail.timestamp));
        } else {
          setLastSaved(new Date());
        }
      }, 800);
    };
    
    // Set up event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Set up event listener for custom forced save events
    window.addEventListener('forcedSave', handleForcedSave as EventListener);
    
    // Also check localStorage periodically to detect changes in the current tab
    // Using 5000ms (5 seconds) instead of 1000ms to reduce refresh frequency
    const interval = setInterval(() => {
      try {
        const statusStr = localStorage.getItem('autoSaveStatus');
        if (statusStr) {
          const status = JSON.parse(statusStr);
          if (status.timestamp && (!lastSaved || new Date(status.timestamp) > lastSaved)) {
            setLastSaved(new Date(status.timestamp));
            setIsSaving(false);
          }
        }
      } catch (error) {
        console.error('Error reading auto-save status', error);
      }
    }, 5000);
    
    // Load initial state
    try {
      const statusStr = localStorage.getItem('autoSaveStatus');
      if (statusStr) {
        const status = JSON.parse(statusStr);
        if (status.timestamp) {
          setLastSaved(new Date(status.timestamp));
        }
      }
    } catch (error) {
      console.error('Error reading initial auto-save status', error);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('forcedSave', handleForcedSave as EventListener);
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lastSaved]);
  
  /**
   * Format the "last saved" time in a human-readable format
   */
  const getFormattedLastSaved = () => {
    if (!lastSaved) return "";
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) {
      return `${diffSecs}s ago`;
    } else if (diffSecs < 3600) {
      return `${Math.floor(diffSecs / 60)}m ago`;
    } else {
      return lastSaved.toLocaleTimeString();
    }
  };
  
  return {
    isSaving,
    lastSaved,
    formattedLastSaved: getFormattedLastSaved()
  };
}