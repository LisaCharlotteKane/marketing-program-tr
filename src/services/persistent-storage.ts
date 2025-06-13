/**
 * Persistent Storage Service
 * 
 * Handles automatic saving of campaign data across multiple storage layers:
 * 1. localStorage (primary, quick access)
 * 2. IndexedDB (secondary, larger storage capacity)
 * 
 * This service provides redundancy and ensures data is never lost
 * even if localStorage fails or is cleared.
 */

import { Campaign } from "@/components/campaign-table";

// Default storage key
const DEFAULT_STORAGE_KEY = 'campaignData';

// IDB database name and store name
const DB_NAME = 'marketingCampaignDB';
const STORE_NAME = 'campaigns';
const DB_VERSION = 1;

// Initialize the IndexedDB database
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for campaigns if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Saves campaign data to IndexedDB
 * 
 * @param key The storage key
 * @param campaigns Campaign data to save
 * @returns Promise that resolves when data is saved
 */
async function saveToIndexedDB(key: string, campaigns: Campaign[]): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Delete existing record if it exists
    store.delete(key);
    
    // Add new record
    store.add({
      id: key,
      data: campaigns,
      timestamp: new Date().toISOString()
    });
    
    // Return a promise that resolves when transaction completes
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Failed to save to IndexedDB'));
    });
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    throw error;
  }
}

/**
 * Loads campaign data from IndexedDB
 * 
 * @param key The storage key
 * @returns Promise that resolves with campaign data or null if not found
 */
async function loadFromIndexedDB(key: string): Promise<Campaign[] | null> {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(new Error('Failed to load from IndexedDB'));
    });
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    return null;
  }
}

/**
 * Saves campaign data to localStorage
 * 
 * @param key The storage key
 * @param campaigns Campaign data to save
 */
function saveToLocalStorage(key: string, campaigns: Campaign[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(campaigns));
    
    // Also save timestamp for the auto-save indicator
    localStorage.setItem('autoSaveStatus', JSON.stringify({
      timestamp: new Date().toISOString(),
      key
    }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
}

/**
 * Loads campaign data from localStorage
 * 
 * @param key The storage key
 * @param defaultValue Default value if nothing is in localStorage
 * @returns Campaign data or default value
 */
function loadFromLocalStorage(key: string, defaultValue: Campaign[] = []): Campaign[] {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Saves campaign data to multiple storage layers
 * 
 * @param key The storage key
 * @param campaigns Campaign data to save
 * @returns Promise that resolves when all storage operations complete
 */
export async function saveAllStorageLayers(
  key: string = DEFAULT_STORAGE_KEY,
  campaigns: Campaign[]
): Promise<void> {
  // Save to localStorage (synchronous, immediate)
  saveToLocalStorage(key, campaigns);
  
  // Try to save to IndexedDB (asynchronous, background)
  try {
    await saveToIndexedDB(key, campaigns);
  } catch (error) {
    console.error('IndexedDB save failed (continuing with localStorage only):', error);
  }
  
  // Dispatch a custom event for the auto-save indicator
  window.dispatchEvent(new CustomEvent('campaignDataSaved', {
    detail: {
      timestamp: new Date().toISOString(),
      key
    }
  }));
  
  return Promise.resolve();
}

/**
 * Loads campaign data from the most reliable available source
 * 
 * @param key The storage key
 * @param defaultValue Default value if nothing is found in any storage
 * @returns Promise that resolves with campaign data
 */
export async function loadFromBestAvailableSource(
  key: string = DEFAULT_STORAGE_KEY,
  defaultValue: Campaign[] = []
): Promise<Campaign[]> {
  // Try IndexedDB first (more robust)
  const idbData = await loadFromIndexedDB(key);
  if (idbData) {
    // Also sync back to localStorage for faster future access
    saveToLocalStorage(key, idbData);
    return idbData;
  }
  
  // Fall back to localStorage
  return loadFromLocalStorage(key, defaultValue);
}

/**
 * Counts the total number of campaigns in all saved keys
 * Useful for status displays
 */
export async function countTotalSavedCampaigns(): Promise<number> {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          const total = request.result.reduce((sum, record) => {
            return sum + (record.data?.length || 0);
          }, 0);
          resolve(total);
        } else {
          resolve(0);
        }
      };
      request.onerror = () => reject(new Error('Failed to count campaigns'));
    });
  } catch (error) {
    console.error('Error counting campaigns:', error);
    return 0;
  }
}

/**
 * Gets all available storage keys
 * Useful for listing saved data sets
 */
export async function getAllStorageKeys(): Promise<string[]> {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(Array.from(request.result as IDBValidKey[]).map(k => k.toString()));
      };
      request.onerror = () => reject(new Error('Failed to get storage keys'));
    });
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
}