import { useState, useEffect } from 'react';

export function useKV<T>(key: string, initialValue: T): [T, (value: T) => void] {
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

  const updateValue = (newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [value, updateValue];
}