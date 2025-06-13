/**
 * Data Migration Service
 * 
 * Handles one-time migration of data from old storage patterns to new ones
 * Ensures backward compatibility with previous app versions
 */

import { Campaign } from "@/components/campaign-table";
import { saveAllStorageLayers } from "./persistent-storage";

/**
 * Runs data migration tasks to ensure compatibility with older app versions
 * 
 * @returns Promise that resolves when migrations are complete
 */
export async function runDataMigrations(): Promise<void> {
  try {
    await migrateOldCampaignData();
    console.log("Data migration complete");
  } catch (error) {
    console.error("Error during data migration:", error);
  }
}

/**
 * Migrates campaign data from old localStorage-only format to new multi-layer storage
 */
async function migrateOldCampaignData(): Promise<void> {
  try {
    // Check if we've already run this migration
    const migrationCompleted = localStorage.getItem('dataMigration_v1_completed');
    if (migrationCompleted === 'true') {
      return;
    }
    
    // Look for campaign data in the old format
    const oldData = localStorage.getItem('campaignData');
    if (oldData) {
      try {
        const campaigns = JSON.parse(oldData) as Campaign[];
        
        // Only migrate if we have valid data
        if (Array.isArray(campaigns) && campaigns.length > 0) {
          console.log(`Migrating ${campaigns.length} campaigns to new storage format`);
          
          // Save to the new storage system
          await saveAllStorageLayers('campaignData', campaigns);
          
          // Mark migration as complete
          localStorage.setItem('dataMigration_v1_completed', 'true');
          
          console.log("Campaign data migration successful");
        }
      } catch (parseError) {
        console.error("Error parsing old campaign data:", parseError);
      }
    }
    
    // Mark migration as completed even if there was no data to migrate
    localStorage.setItem('dataMigration_v1_completed', 'true');
    
  } catch (error) {
    console.error("Error migrating campaign data:", error);
    throw error;
  }
}