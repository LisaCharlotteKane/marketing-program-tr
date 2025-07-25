import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Storage size limits (conservative estimates)
const STORAGE_LIMITS = {
  localStorage: 5 * 1024 * 1024, // 5MB
  sessionStorage: 5 * 1024 * 1024, // 5MB
  warning: 4 * 1024 * 1024, // 4MB warning threshold
};

/**
 * Custom hook for accessing localStorage with size monitoring and error handling
 * @param key The storage key
 * @param defaultValue Default value if nothing is stored
 * @returns [value, setValue, loading] - The value, setter function, and loading state
 */
export function useSharedStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Calculate storage size
  const getStorageSize = () => {
    let totalSize = 0;
    try {
      for (let k in localStorage) {
        if (localStorage.hasOwnProperty(k)) {
          totalSize += new Blob([localStorage[k]]).size;
        }
      }
    } catch (error) {
      console.warn('Could not calculate storage size:', error);
    }
    return totalSize;
  };

  // Initialize storage from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(key);
          if (stored !== null) {
            const parsed = JSON.parse(stored);
            setValue(parsed);
          }
        }
      } catch (error) {
        console.error(`Error loading data from localStorage (${key}):`, error);
        // If there's a parse error, try to clear the corrupted data
        try {
          localStorage.removeItem(key);
          console.warn(`Cleared corrupted data for key: ${key}`);
        } catch (clearError) {
          console.error(`Could not clear corrupted data for key: ${key}`, clearError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Function to update storage with size checks
  const updateValue = async (newValue: T) => {
    try {
      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(newValue);
        const newSize = new Blob([serialized]).size;
        const currentSize = getStorageSize();
        
        // Check if adding this data would exceed limits
        if (currentSize + newSize > STORAGE_LIMITS.localStorage) {
          toast.error('Storage limit exceeded. Please clear some data or export to CSV.');
          return false;
        }
        
        // Warn if approaching limit
        if (currentSize + newSize > STORAGE_LIMITS.warning) {
          toast.warning('Storage is getting full. Consider exporting data to prevent issues.');
        }
        
        localStorage.setItem(key, serialized);
        setValue(newValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error saving data to localStorage (${key}):`, error);
      
      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast.error('Browser storage is full. Please clear storage in Settings to continue.');
      } else {
        toast.error('Failed to save data. Storage may be corrupted.');
      }
      return false;
    }
  };

  return [value, updateValue, loading] as const;
}

