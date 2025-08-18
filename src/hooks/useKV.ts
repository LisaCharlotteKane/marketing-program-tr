import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;
type DeleteValue = () => void;

export function useKV<T>(key: string, initialValue: T): [T, SetValue<T>, DeleteValue] {
  const [value, setValue] = useState<T>(initialValue);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored));
      }
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
    }
  }, [key]);

  // Save to localStorage when value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key, value]);

  const deleteValue = () => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.warn(`Failed to delete ${key} from localStorage:`, error);
    }
  };

  return [value, setValue, deleteValue];
}