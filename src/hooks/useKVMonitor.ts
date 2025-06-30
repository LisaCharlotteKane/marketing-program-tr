import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

interface KVMonitorProps<T> {
  /**
   * The key to monitor in the KV store
   */
  storageKey: string;
  
  /**
   * Default value if the key doesn't exist
   */
  defaultValue: T;
  
  /**
   * Callback fired when the value changes
   */
  onChange?: (newValue: T, oldValue: T) => void;
  
  /**
   * Interval in ms to check for changes (default: 2000ms)
   */
  interval?: number;
}

/**
 * A hook that monitors a KV store key for changes
 * This is useful for detecting when other users update shared data
 */
export function useKVMonitor<T>({
  storageKey,
  defaultValue,
  onChange,
  interval = 2000
}: KVMonitorProps<T>) {
  // Access the KV store
  const [kvValue, setKvValue] = useKV<T>(storageKey, defaultValue);
  
  // Keep track of the previous value for comparison
  const [previousValue, setPreviousValue] = useState<T>(kvValue);
  
  // Track changes and notify via the onChange callback
  useEffect(() => {
    // Simple equality check to detect changes
    const hasChanged = JSON.stringify(kvValue) !== JSON.stringify(previousValue);
    
    if (hasChanged) {
      console.log(`KV value changed for key "${storageKey}"`);
      
      // Call the onChange handler if provided
      if (onChange) {
        onChange(kvValue, previousValue);
      }
      
      // Update previous value
      setPreviousValue(kvValue);
    }
  }, [kvValue, previousValue, onChange, storageKey]);
  
  // Periodically refresh the KV value to check for external changes
  useEffect(() => {
    const checkForChanges = () => {
      // This forces a re-fetch from the KV store
      // The actual comparison happens in the effect above
      setKvValue(prev => {
        // Return same reference if it's an object to avoid unnecessary rerenders
        // when nothing has changed
        return prev;
      });
    };
    
    // Set up the interval
    const intervalId = setInterval(checkForChanges, interval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [interval, setKvValue]);
  
  // Return the current value from KV store and setter
  return [kvValue, setKvValue, previousValue];
}