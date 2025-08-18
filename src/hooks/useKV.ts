import { useState, useEffect } from 'react';

// Simple KV hook implementation
export function useKV<T>(key: string, defaultValue: T): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValueAndStore = (newValue: T) => {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  const deleteValue = () => {
    setValue(defaultValue);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  };

  return [value, setValueAndStore, deleteValue];
}