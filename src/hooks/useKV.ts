import { useState, useEffect } from 'react';

const MAX_STORAGE_SIZE = 1024 * 1024; // 1MB limit per item

export function useKV<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  // Simple localStorage implementation for now
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const updateValue = (newValue: T): void => {
    try {
      const serialized = JSON.stringify(newValue);
      
      // Check size before storing
      if (serialized.length > MAX_STORAGE_SIZE) {
        console.warn(`Data too large for localStorage (${serialized.length} chars), using in-memory storage only`);
        setValue(newValue);
        return;
      }
      
      setValue(newValue);
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');
        // Clear non-essential keys to make space
        const keysToCheck = ['debug-', 'temp-', 'old-', 'backup-'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const storageKey = localStorage.key(i);
          if (storageKey && keysToCheck.some(prefix => storageKey.startsWith(prefix))) {
            localStorage.removeItem(storageKey);
          }
        }
        // Try again
        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch (retryError) {
          console.error(`Error saving ${key} after cleanup:`, retryError);
        }
      } else {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }
  };

  const deleteValue = (): void => {
    try {
      setValue(initialValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error deleting ${key} from localStorage:`, error);
    }
  };

  return [value, updateValue, deleteValue];
}