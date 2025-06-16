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
    let request: IDBOpenDBRequest;
    
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      console.error('Error opening IndexedDB:', error);
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(new Error('Failed to open IndexedDB'));
    };
    
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
    
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      
      try {
        request = store.get(key);
      } catch (error) {
        console.error('Error accessing IndexedDB store:', error);
        reject(new Error('Failed to access IndexedDB store'));
        return;
      }
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB request error:', event);
        reject(new Error('Failed to load from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    throw error; // Re-throw to be handled by the caller
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
    if (!item) {
      return defaultValue;
    }
    
    try {
      const parsed = JSON.parse(item);
      // Validate the parsed data is an array
      if (!Array.isArray(parsed)) {
        console.warn('Invalid campaign data format in localStorage, using default');
        return defaultValue;
      }
      return parsed;
    } catch (parseError) {
      console.error('Error parsing JSON from localStorage:', parseError);
      // If JSON is invalid, remove it to prevent future errors
      localStorage.removeItem(key);
      return defaultValue;
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
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
  try {
    // Try IndexedDB first (more robust)
    try {
      const idbData = await loadFromIndexedDB(key);
      if (idbData) {
        // Validate and repair data if needed
        const validatedData = validateAndRepairCampaignData(idbData);
        
        // Also sync back to localStorage for faster future access
        saveToLocalStorage(key, validatedData);
        return validatedData;
      }
    } catch (error) {
      console.warn('IndexedDB load failed, falling back to localStorage:', error);
    }
    
    // Fall back to localStorage
    try {
      const localData = loadFromLocalStorage(key, defaultValue);
      // Validate and repair data if needed
      return validateAndRepairCampaignData(localData);
    } catch (localError) {
      console.error('LocalStorage load failed:', localError);
      return defaultValue;
    }
  } catch (error) {
    // Fallback to default in case of any unexpected errors
    console.error('Error loading campaign data:', error);
    // Return a fresh empty array rather than potentially problematic defaultValue
    return [];
  }
}

/**
 * Validates and repairs campaign data to ensure it's in the correct format
 * 
 * @param campaigns Campaign data to validate
 * @returns Validated and repaired campaign data
 */
function validateAndRepairCampaignData(campaigns: any[]): Campaign[] {
  if (!Array.isArray(campaigns)) {
    console.warn('Campaign data is not an array, using empty array instead');
    return [];
  }
  
  // Filter out non-object entries and ensure minimum valid properties
  return campaigns.filter(campaign => {
    // Must be an object
    if (typeof campaign !== 'object' || campaign === null) {
      console.warn('Filtered out non-object campaign entry:', campaign);
      return false;
    }
    
    // Must have at least id, campaignType, and country
    if (!campaign.id) {
      // Try to fix by adding an id
      campaign.id = Math.random().toString(36).substring(2, 9);
    }
    
    // Set defaults for missing required fields
    if (!campaign.campaignType) campaign.campaignType = "_none";
    if (!campaign.country) campaign.country = "_none";
    
    // Fix forecastedCost and expectedLeads to be numeric
    if (campaign.forecastedCost && isNaN(Number(campaign.forecastedCost))) {
      campaign.forecastedCost = 0;
    }
    
    if (campaign.expectedLeads && isNaN(Number(campaign.expectedLeads))) {
      campaign.expectedLeads = 0;
    }
    
    return true;
  });
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