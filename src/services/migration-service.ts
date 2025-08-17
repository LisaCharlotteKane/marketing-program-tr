import { toast } from "sonner";

export function runDataMigrations() {
  return new Promise<void>((resolve, reject) => {
    try {
      // Check for any legacy data formats and migrate them
      
      // Example migration: convert old campaign format to new format
      const oldCampaigns = localStorage.getItem("campaigns");
      if (oldCampaigns) {
        try {
          const parsed = JSON.parse(oldCampaigns);
          
          // Check if we need to migrate
          if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].id) {
            // Add IDs to campaigns
            const migratedCampaigns = parsed.map(campaign => ({
              ...campaign,
              id: Math.random().toString(36).substring(2, 9)
            }));
            
            // Save migrated data
            localStorage.setItem("campaignData", JSON.stringify(migratedCampaigns));
            
            // Remove old data
            localStorage.removeItem("campaigns");
            
            console.log("Migrated campaign data to new format");
          }
        } catch (e) {
          console.error("Error migrating campaign data:", e);
        }
      }
      
      resolve();
    } catch (error) {
      console.error("Error running data migrations:", error);
      reject(error);
    }
  });
}