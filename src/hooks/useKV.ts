import { useState, useEffect } from 'react';

// Mock implementation of useKV for GitHub Pages deployment
// This replaces @github/spark/hooks when not running in Spark runtime
export function useKV<T>(key: string, initialValue: T, options?: { scope?: 'global' | 'user' }): [T, (value: T) => void, () => void] {
  const storageKey = options?.scope === 'global' ? `global-${key}` : `user-${key}`;
  
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newValue));
      setValue(newValue);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      setValue(newValue);
    }
  };

  const deleteValue = () => {
    try {
      localStorage.removeItem(storageKey);
      setValue(initialValue);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to persist to localStorage:', error);
    }
  }, [value, storageKey]);

  return [value, setStoredValue, deleteValue];
}