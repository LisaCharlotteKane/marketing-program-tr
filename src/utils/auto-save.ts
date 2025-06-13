import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Forces a save of the current data to localStorage
 * 
 * @param key The localStorage key to save
 * @param data The data to save
 * @returns Promise that resolves when the save is complete
 */
export function forceSave<T>(key: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Save the actual data
      localStorage.setItem(key, JSON.stringify(data));
      
      // Save the timestamp for tracking
      localStorage.setItem('autoSaveStatus', JSON.stringify({
        timestamp: new Date().toISOString(),
        key
      }));
      
      // Dispatch a custom event for AutoSaveIndicator to catch
      window.dispatchEvent(new CustomEvent('forcedSave', {
        detail: { key, timestamp: new Date().toISOString() }
      }));
      
      resolve();
    } catch (error) {
      console.error('Error force saving data', error);
      reject(error);
    }
  });
}