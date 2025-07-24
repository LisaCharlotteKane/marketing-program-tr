/**
 * Storage cleanup utility to prevent HTTP 431 errors
 * This removes large or problematic data that could cause header size issues
 */

export function cleanupStorage() {
  try {
    // List of localStorage keys that might grow large
    const potentiallyLargeKeys = [
      'campaignData',
      'assignedBudgets', 
      'kvStore',
      'sharedCampaigns',
      'userData'
    ];

    let totalCleaned = 0;
    let issuesFound = [];

    potentiallyLargeKeys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const sizeKB = (item.length / 1024);
          
          if (sizeKB > 50) { // If larger than 50KB
            issuesFound.push(`${key}: ${sizeKB.toFixed(1)}KB`);
            
            // For campaignData, keep only essential recent data
            if (key === 'campaignData') {
              try {
                const parsed = JSON.parse(item);
                if (Array.isArray(parsed) && parsed.length > 50) {
                  // Keep only first 50 campaigns
                  const reduced = parsed.slice(0, 50).map(campaign => ({
                    id: campaign.id,
                    campaignName: campaign.campaignName || '',
                    campaignType: campaign.campaignType || '',
                    region: campaign.region || '',
                    owner: campaign.owner || '',
                    forecastedCost: campaign.forecastedCost || 0,
                    expectedLeads: campaign.expectedLeads || 0,
                    status: campaign.status || 'Planning'
                  }));
                  
                  localStorage.setItem(key, JSON.stringify(reduced));
                  totalCleaned += (item.length - JSON.stringify(reduced).length) / 1024;
                  console.log(`Reduced ${key} from ${parsed.length} to ${reduced.length} campaigns`);
                }
              } catch (parseError) {
                // If can't parse, remove entirely
                localStorage.removeItem(key);
                totalCleaned += sizeKB;
                console.log(`Removed unparseable ${key}`);
              }
            } else {
              // For other large items, remove entirely
              localStorage.removeItem(key);
              totalCleaned += sizeKB;
              console.log(`Removed large ${key} (${sizeKB.toFixed(1)}KB)`);
            }
          }
        }
      } catch (error) {
        console.warn(`Error cleaning ${key}:`, error);
      }
    });

    // Clean up any session storage that might be problematic
    try {
      if (sessionStorage.length > 0) {
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          const item = sessionStorage.getItem(key);
          if (item && item.length > 10000) { // 10KB limit for session
            sessionStorage.removeItem(key);
            console.log(`Removed large sessionStorage item: ${key}`);
          }
        });
      }
    } catch (error) {
      console.warn('Error cleaning sessionStorage:', error);
    }

    if (issuesFound.length > 0) {
      console.log('Storage cleanup completed:');
      console.log('Large items found:', issuesFound);
      console.log(`Total cleaned: ${totalCleaned.toFixed(1)}KB`);
      return { 
        cleaned: true, 
        totalCleaned: totalCleaned.toFixed(1), 
        issues: issuesFound 
      };
    }

    return { cleaned: false, message: 'No large storage items found' };
  } catch (error) {
    console.error('Storage cleanup failed:', error);
    return { error: true, message: error.message };
  }
}

export function getStorageInfo() {
  try {
    const info = {
      localStorage: {
        used: 0,
        items: []
      },
      sessionStorage: {
        used: 0,
        items: []
      }
    };

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        const size = item ? item.length : 0;
        info.localStorage.used += size;
        info.localStorage.items.push({
          key,
          sizeKB: (size / 1024).toFixed(1)
        });
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const item = sessionStorage.getItem(key);
        const size = item ? item.length : 0;
        info.sessionStorage.used += size;
        info.sessionStorage.items.push({
          key,
          sizeKB: (size / 1024).toFixed(1)
        });
      }
    }

    info.localStorage.usedKB = (info.localStorage.used / 1024).toFixed(1);
    info.sessionStorage.usedKB = (info.sessionStorage.used / 1024).toFixed(1);

    return info;
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}

// Run cleanup on module load
export function initStorageCleanup() {
  // Run cleanup immediately
  const result = cleanupStorage();
  
  if (result.cleaned) {
    console.log(`✅ Storage cleanup completed - freed ${result.totalCleaned}KB`);
  }

  // Set up periodic cleanup every 10 minutes
  setInterval(() => {
    const info = getStorageInfo();
    if (info && parseFloat(info.localStorage.usedKB) > 100) { // If >100KB
      console.log('Large localStorage detected, running cleanup...');
      cleanupStorage();
    }
  }, 600000); // 10 minutes
}