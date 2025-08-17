/**
 * Storage cleanup utilities to prevent excessive data accumulation
 */

const MAX_STORAGE_SIZE = 50000; // 50KB limit
const MAX_CAMPAIGN_COUNT = 50; // Limit campaigns to prevent bloat

export function initStorageCleanup() {
  try {
    // Clean up localStorage
    cleanupLocalStorage();
    
    // Clean up sessionStorage
    cleanupSessionStorage();
    
    // Set up periodic cleanup
    setInterval(cleanupLocalStorage, 60000); // Every minute
    
    console.log('Storage cleanup initialized');
  } catch (error) {
    console.warn('Storage cleanup initialization failed:', error);
  }
}

function cleanupLocalStorage() {
  try {
    const problematicKeys = [
      'spark-kv-campaignData',
      'github-auth-token',
      'kvStore-cache',
      'campaign-sync-data',
      'persistentCampaigns',
      'github-session',
      'auth-state'
    ];
    
    // Remove problematic keys
    problematicKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Removed problematic localStorage key: ${key}`);
      }
    });
    
    // Check and limit campaign data
    const campaignData = localStorage.getItem('campaignData');
    if (campaignData) {
      if (campaignData.length > MAX_STORAGE_SIZE) {
        console.warn('Large campaign data detected, reducing size...');
        try {
          const parsed = JSON.parse(campaignData);
          if (Array.isArray(parsed) && parsed.length > MAX_CAMPAIGN_COUNT) {
            const reduced = parsed.slice(0, MAX_CAMPAIGN_COUNT);
            localStorage.setItem('campaignData', JSON.stringify(reduced));
            console.log(`Reduced campaigns from ${parsed.length} to ${reduced.length}`);
          }
        } catch (parseError) {
          console.warn('Failed to parse campaign data, removing:', parseError);
          localStorage.removeItem('campaignData');
        }
      }
    }
    
    // Check total localStorage usage
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    
    if (totalSize > 500000) { // 500KB
      console.warn('localStorage usage is high, performing aggressive cleanup');
      aggressiveCleanup();
    }
    
  } catch (error) {
    console.warn('localStorage cleanup failed:', error);
  }
}

function cleanupSessionStorage() {
  try {
    const problematicKeys = [
      'spark-temp-data',
      'github-temp-auth',
      'large-session-data'
    ];
    
    problematicKeys.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`Removed problematic sessionStorage key: ${key}`);
      }
    });
  } catch (error) {
    console.warn('sessionStorage cleanup failed:', error);
  }
}

function aggressiveCleanup() {
  try {
    // Keep only essential data
    const campaignData = localStorage.getItem('campaignData');
    
    // Clear everything
    localStorage.clear();
    
    // Restore only campaign data (limited)
    if (campaignData) {
      try {
        const parsed = JSON.parse(campaignData);
        if (Array.isArray(parsed)) {
          const limited = parsed.slice(0, 20); // Keep only 20 campaigns
          localStorage.setItem('campaignData', JSON.stringify(limited));
        }
      } catch {
        // If parsing fails, start fresh
        localStorage.setItem('campaignData', JSON.stringify([]));
      }
    }
    
    console.log('Aggressive cleanup completed');
  } catch (error) {
    console.warn('Aggressive cleanup failed:', error);
  }
}

export function getStorageUsage() {
  try {
    let totalLocalStorage = 0;
    let totalSessionStorage = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalLocalStorage += localStorage[key].length;
      }
    }
    
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        totalSessionStorage += sessionStorage[key].length;
      }
    }
    
    return {
      localStorage: totalLocalStorage,
      sessionStorage: totalSessionStorage,
      total: totalLocalStorage + totalSessionStorage
    };
  } catch (error) {
    console.warn('Failed to calculate storage usage:', error);
    return { localStorage: 0, sessionStorage: 0, total: 0 };
  }
}

export function emergencyCleanup() {
  try {
    // Emergency: clear everything except essential campaign data
    const campaigns = localStorage.getItem('campaignData');
    
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore minimal campaign data
    if (campaigns) {
      try {
        const parsed = JSON.parse(campaigns);
        if (Array.isArray(parsed)) {
          const minimal = parsed.slice(0, 10).map(campaign => ({
            id: campaign.id,
            description: campaign.description,
            region: campaign.region,
            owner: campaign.owner,
            forecastedCost: campaign.forecastedCost || 0,
            expectedLeads: campaign.expectedLeads || 0
          }));
          localStorage.setItem('campaignData', JSON.stringify(minimal));
        }
      } catch {
        localStorage.setItem('campaignData', JSON.stringify([]));
      }
    }
    
    console.log('Emergency cleanup completed');
    return true;
  } catch (error) {
    console.error('Emergency cleanup failed:', error);
    return false;
  }
}