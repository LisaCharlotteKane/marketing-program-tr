/**
 * localStorage size management to prevent storage overflow and HTTP 431 errors
 */

export interface StorageSizeInfo {
  currentSize: number;
  maxSize: number;
  percentUsed: number;
  isNearLimit: boolean;
  largestItems: Array<{ key: string; size: number }>;
  recommendations: string[];
}

const STORAGE_WARNING_THRESHOLD = 0.8; // 80% full
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB typical limit

/**
 * Get comprehensive localStorage size information
 */
export function getStorageSizeInfo(): StorageSizeInfo {
  const items: Array<{ key: string; size: number }> = [];
  let currentSize = 0;

  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        const itemSize = new Blob([key + value]).size;
        items.push({ key, size: itemSize });
        currentSize += itemSize;
      }
    }
  } catch (error) {
    console.warn('Could not analyze localStorage:', error);
  }

  const percentUsed = currentSize / MAX_STORAGE_SIZE;
  const isNearLimit = percentUsed >= STORAGE_WARNING_THRESHOLD;
  
  // Sort by size descending
  const largestItems = items
    .sort((a, b) => b.size - a.size)
    .slice(0, 5); // Top 5 largest

  const recommendations: string[] = [];
  
  if (isNearLimit) {
    recommendations.push('Storage is near capacity - consider cleanup');
  }
  
  if (largestItems.some(item => item.size > 1024 * 1024)) {
    recommendations.push('Large data items found - consider compression or cleanup');
  }
  
  if (items.length > 50) {
    recommendations.push('Many storage items - consider removing unused data');
  }

  return {
    currentSize,
    maxSize: MAX_STORAGE_SIZE,
    percentUsed,
    isNearLimit,
    largestItems,
    recommendations
  };
}

/**
 * Clean up large localStorage items to prevent HTTP 431 errors
 */
export function cleanupLargeStorageItems(maxItemSize: number = 512 * 1024): number {
  let cleanedCount = 0;
  
  try {
    const itemsToCheck = Object.keys(localStorage);
    
    for (const key of itemsToCheck) {
      const value = localStorage.getItem(key);
      if (value) {
        const itemSize = new Blob([key + value]).size;
        
        // Remove items larger than maxItemSize
        if (itemSize > maxItemSize) {
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`Removed large localStorage item: ${key} (${itemSize} bytes)`);
        }
      }
    }
  } catch (error) {
    console.warn('Storage cleanup failed:', error);
  }
  
  return cleanedCount;
}

/**
 * Compress campaign data in localStorage to reduce size
 */
export function compressCampaignData(): boolean {
  try {
    const campaignKeys = Object.keys(localStorage).filter(key => 
      key.includes('campaign') || key.includes('marketing')
    );
    
    for (const key of campaignKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const data = JSON.parse(value);
          
          // Remove unnecessary fields from campaign data
          if (Array.isArray(data)) {
            const compressed = data.map(item => {
              // Remove empty or default values
              const cleaned: any = {};
              for (const [k, v] of Object.entries(item)) {
                if (v !== '' && v !== null && v !== undefined && v !== 0) {
                  cleaned[k] = v;
                }
              }
              return cleaned;
            });
            
            localStorage.setItem(key, JSON.stringify(compressed));
            console.log(`Compressed storage item: ${key}`);
          }
        } catch (parseError) {
          // Not JSON, skip compression
        }
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Campaign data compression failed:', error);
    return false;
  }
}

/**
 * Monitor storage size and auto-cleanup if needed
 */
export function startStorageMonitoring(): () => void {
  const checkStorage = () => {
    const info = getStorageSizeInfo();
    
    if (info.isNearLimit) {
      console.warn('localStorage near capacity:', info);
      
      // Auto-cleanup if over 90% full
      if (info.percentUsed > 0.9) {
        console.log('Auto-cleaning localStorage to prevent overflow...');
        cleanupLargeStorageItems();
        compressCampaignData();
      }
    }
  };
  
  // Check immediately
  checkStorage();
  
  // Then check every 60 seconds
  const interval = setInterval(checkStorage, 60000);
  
  return () => clearInterval(interval);
}

/**
 * Safe localStorage setter that prevents overflow
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    const itemSize = new Blob([key + value]).size;
    const info = getStorageSizeInfo();
    
    // Check if adding this item would exceed limits
    if (info.currentSize + itemSize > MAX_STORAGE_SIZE * 0.95) {
      console.warn(`Cannot store item ${key}: would exceed storage limit`);
      
      // Try cleanup and retry once
      cleanupLargeStorageItems();
      const newInfo = getStorageSizeInfo();
      
      if (newInfo.currentSize + itemSize > MAX_STORAGE_SIZE * 0.95) {
        return false;
      }
    }
    
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to store item ${key}:`, error);
    return false;
  }
}