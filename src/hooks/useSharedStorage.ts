import { useEffect, useState } from 'react';

/**
 * Custom hook for accessing shared storage with global scope
 * @param key The storage key
 * @param defaultValue Default value if nothing is stored
 * @returns [value, setValue, loading] - The value, setter function, and loading state
 */
export function useSharedStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Initialize storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Access the spark global object to get KV storage
        if (typeof window !== 'undefined' && window.spark) {
          const data = await window.spark.kv.get(key, { scope: 'global' });
          if (data !== undefined && data !== null) {
            setValue(data as T);
          }
        }
      } catch (error) {
        console.error(`Error loading data from shared storage (${key}):`, error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Function to update storage
  const updateValue = async (newValue: T) => {
    try {
      if (typeof window !== 'undefined' && window.spark) {
        await window.spark.kv.set(key, newValue, { scope: 'global' });
        setValue(newValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error saving data to shared storage (${key}):`, error);
      return false;
    }
  };

  return [value, updateValue, loading] as const;
}

// Declare window.spark for TypeScript
declare global {
  interface Window {
    spark: {
      kv: {
        get: (key: string, options?: { scope?: string }) => Promise<any>;
        set: (key: string, value: any, options?: { scope?: string }) => Promise<void>;
      };
    };
  }
}