import { useEffect, useState } from 'react';

/**
 * Custom hook for accessing localStorage as fallback storage
 * @param key The storage key
 * @param defaultValue Default value if nothing is stored
 * @returns [value, setValue, loading] - The value, setter function, and loading state
 */
export function useSharedStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Initialize storage from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(key);
          if (stored !== null) {
            setValue(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error(`Error loading data from localStorage (${key}):`, error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Function to update storage
  const updateValue = async (newValue: T) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(newValue));
        setValue(newValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
      return false;
    }
  };

  return [value, updateValue, loading] as const;
}

