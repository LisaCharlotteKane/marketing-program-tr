/**
 * Storage Recovery Service
 * 
 * Provides utility functions to recover from storage-related errors
 */

import { toast } from "sonner";

/**
 * Resets all storage for a fresh start
 * Use as a last resort when data is corrupted or can't be loaded
 * 
 * @returns Promise that resolves when all storage is reset
 */
export async function resetAllStorage(): Promise<void> {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear IndexedDB
    await clearIndexedDB();
    
    // Notify user
    toast.success("Storage reset successful. Reloading page...");
    
    // Reload the page after a brief delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error("Error resetting storage:", error);
    toast.error("Failed to reset storage. Try again or clear browser data manually.");
    throw error;
  }
}

/**
 * Clears all IndexedDB data
 * 
 * @returns Promise that resolves when IndexedDB is cleared
 */
async function clearIndexedDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.deleteDatabase('marketingCampaignDB');
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error("Error deleting IndexedDB:", event);
        reject(new Error("Failed to delete IndexedDB"));
      };
    } catch (error) {
      console.error("Error accessing IndexedDB:", error);
      // Resolve anyway since localStorage was cleared
      resolve();
    }
  });
}

/**
 * Exports all current data to a downloadable JSON file
 * Useful for backing up data before reset
 * 
 * @param campaigns Campaign data to export
 */
export function exportDataBackup(campaigns: any[]): void {
  try {
    // Create backup object with all relevant data
    const backup = {
      campaigns,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    // Convert to JSON string
    const dataStr = JSON.stringify(backup, null, 2);
    
    // Create download link
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `campaign-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Create and trigger download link
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Data backup exported successfully");
  } catch (error) {
    console.error("Error exporting data backup:", error);
    toast.error("Failed to export data backup");
  }
}