/**
 * Storage monitoring utility to prevent HTTP 431 errors
 * and provide better storage management
 */

export interface StorageInfo {
  key: string;
  size: number;
  type: 'localStorage' | 'sessionStorage';
}

export interface StorageStats {
  totalSize: number;
  itemCount: number;
  items: StorageInfo[];
  isNearLimit: boolean;
  isOverLimit: boolean;
}

// Conservative storage limits (varies by browser but these are safe)
export const STORAGE_LIMITS = {
  localStorage: 5 * 1024 * 1024, // 5MB
  sessionStorage: 5 * 1024 * 1024, // 5MB
  warning: 4 * 1024 * 1024, // 4MB warning threshold
  critical: 4.5 * 1024 * 1024, // 4.5MB critical threshold
};

/**
 * Get the size of a storage item in bytes
 */
export function getItemSize(value: string): number {
  return new Blob([value]).size;
}

/**
 * Get comprehensive storage statistics
 */
export function getStorageStats(): StorageStats {
  const items: StorageInfo[] = [];
  let totalSize = 0;

  // Check localStorage
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        const size = getItemSize(value);
        totalSize += size;
        items.push({ key, size, type: 'localStorage' });
      }
    }
  } catch (error) {
    console.warn('Could not read localStorage:', error);
  }

  // Check sessionStorage
  try {
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        const value = sessionStorage[key];
        const size = getItemSize(value);
        totalSize += size;
        items.push({ key, size, type: 'sessionStorage' });
      }
    }
  } catch (error) {
    console.warn('Could not read sessionStorage:', error);
  }

  // Sort by size (largest first)
  items.sort((a, b) => b.size - a.size);

  return {
    totalSize,
    itemCount: items.length,
    items,
    isNearLimit: totalSize > STORAGE_LIMITS.warning,
    isOverLimit: totalSize > STORAGE_LIMITS.critical,
  };
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if we can safely store data of a given size
 */
export function canStore(dataSize: number): boolean {
  const stats = getStorageStats();
  return stats.totalSize + dataSize <= STORAGE_LIMITS.critical;
}

/**
 * Clear all browser storage and cookies to resolve HTTP 431 errors
 */
export function clearAllStorage(): void {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('All browser storage and cookies cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

/**
 * Clear specific storage items by key pattern
 */
export function clearStorageByPattern(pattern: RegExp): number {
  let cleared = 0;
  
  try {
    // Clear from localStorage
    const localKeys = Object.keys(localStorage).filter(key => pattern.test(key));
    localKeys.forEach(key => {
      localStorage.removeItem(key);
      cleared++;
    });
    
    // Clear from sessionStorage
    const sessionKeys = Object.keys(sessionStorage).filter(key => pattern.test(key));
    sessionKeys.forEach(key => {
      sessionStorage.removeItem(key);
      cleared++;
    });
  } catch (error) {
    console.error('Error clearing storage by pattern:', error);
  }
  
  return cleared;
}

/**
 * Get storage health recommendations
 */
export function getStorageRecommendations(): string[] {
  const stats = getStorageStats();
  const recommendations: string[] = [];
  
  if (stats.isOverLimit) {
    recommendations.push('⚠️ Storage is critically full - clear immediately to prevent HTTP 431 errors');
    recommendations.push('🗑️ Use "Clear All Storage" in Settings to resolve deployment issues');
  } else if (stats.isNearLimit) {
    recommendations.push('⚡ Storage is getting full - consider exporting data to CSV');
    recommendations.push('🧹 Clear old or unused data to prevent issues');
  }
  
  if (stats.totalSize > 1024 * 1024) { // > 1MB
    recommendations.push('📊 Export campaign data regularly to keep storage lean');
  }
  
  if (stats.itemCount > 50) {
    recommendations.push('🧹 You have many storage items - consider cleanup');
  }
  
  return recommendations;
}