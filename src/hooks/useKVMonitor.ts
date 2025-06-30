import { useEffect, useState, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

/**
 * Custom hook to monitor KV store for external changes
 * This helps with multi-user scenarios where data is shared between users
 */
export function useKVMonitor<T>(key: string, onExternalUpdate?: (data: T) => void) {
  const [kvData, setKvData] = useKV<T>(key, null as T);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const dataRef = useRef<string | null>(null);
  
  // Start monitoring when the hook is first used
  useEffect(() => {
    setIsMonitoring(true);
    
    // Save initial data snapshot for comparison
    if (kvData) {
      try {
        dataRef.current = JSON.stringify(kvData);
      } catch (error) {
        console.error(`Error serializing ${key} initial data:`, error);
      }
    }
    
    // Setup interval for polling the KV store
    const intervalId = setInterval(() => {
      if (!kvData) return;
      
      try {
        // Get current data as a string for comparison
        const currentDataStr = JSON.stringify(kvData);
        
        // If we have previous data to compare with
        if (dataRef.current && dataRef.current !== currentDataStr) {
          console.log(`Detected external change to ${key} in KV store`);
          
          // Call the callback if provided
          if (onExternalUpdate) {
            onExternalUpdate(kvData);
          }
          
          // Update our reference
          dataRef.current = currentDataStr;
        } else if (!dataRef.current) {
          // First time seeing data
          dataRef.current = currentDataStr;
        }
      } catch (error) {
        console.error(`Error checking for ${key} KV updates:`, error);
      }
    }, 15000); // Check every 15 seconds
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      setIsMonitoring(false);
    };
  }, [key, kvData, onExternalUpdate]);
  
  // Function to force a refresh of the KV data
  const forceRefresh = async () => {
    try {
      // Get the latest data from KV store
      if (kvData) {
        // Notify callback with current KV data
        if (onExternalUpdate) {
          onExternalUpdate(kvData);
        }
        
        // Update our reference
        dataRef.current = JSON.stringify(kvData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error refreshing ${key} KV data:`, error);
      return false;
    }
  };
  
  return {
    isMonitoring,
    forceRefresh,
    kvData,
    setKvData
  };
}