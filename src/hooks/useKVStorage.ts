import { useSharedStorage } from './useSharedStorage';
import { useCallback } from 'react';

/**
 * Hook that mimics the GitHub Spark useKV API using localStorage
 * This provides a simpler interface that matches the expected signature
 */
export function useKV<T>(key: string, defaultValue: T, options?: { scope?: string }) {
  const [value, updateValue, loading] = useSharedStorage<T>(key, defaultValue);
  
  // Create a setter that matches the expected signature and is stable
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    updateValue((currentValue) => {
      if (typeof newValue === 'function') {
        // Handle function updates
        const updater = newValue as (prev: T) => T;
        return updater(currentValue);
      } else {
        // Handle direct value updates
        return newValue;
      }
    });
  }, [updateValue]);

  // Return value and setter (loading state is handled internally)
  return [value, setValue] as const;
}