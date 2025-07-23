// Mock hook for GitHub Spark's useKV when running in standalone mode
import { useState, useEffect } from 'react';

// Simple localStorage-based implementation to replace Spark KV
export function useKV<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(`kv_${key}`);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.warn(`Error reading from localStorage for key ${key}:`, error);
      return initialValue;
    }
  });

  const setKvValue = (newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(`kv_${key}`, JSON.stringify(newValue));
      console.log(`KV Mock: Stored ${key} with ${Array.isArray(newValue) ? newValue.length : 'N/A'} items`);
    } catch (error) {
      console.error(`Error storing to localStorage for key ${key}:`, error);
    }
  };

  return [value, setKvValue];
}

// Mock Spark object for development
if (typeof window !== 'undefined' && !window.spark) {
  window.spark = {
    kv: {
      get: async (key: string) => {
        try {
          const value = localStorage.getItem(`kv_${key}`);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error(`Mock KV get error for ${key}:`, error);
          return null;
        }
      },
      set: async (key: string, value: any) => {
        try {
          localStorage.setItem(`kv_${key}`, JSON.stringify(value));
          console.log(`Mock KV: Set ${key}`);
          return true;
        } catch (error) {
          console.error(`Mock KV set error for ${key}:`, error);
          return false;
        }
      }
    },
    user: {
      login: 'dev-user',
      id: 1,
      name: 'Development User'
    }
  };
}