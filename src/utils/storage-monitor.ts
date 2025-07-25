export interface StorageStats {
  localStorage: {
    size: number;
    itemCount: number;
    items: { key: string; size: number }[];
  };
  totalSize: number;
  isNearLimit: boolean;
  recommendations: string[];
}

export function getStorageStats(): StorageStats {
  const localStorageItems: { key: string; size: number }[] = [];
  let totalLocalSize = 0;

  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        const size = new Blob([value]).size;
        localStorageItems.push({ key, size });
        totalLocalSize += size;
      }
    }
  } catch (error) {
    console.warn('Could not analyze localStorage:', error);
  }

  return {
    localStorage: {
      size: totalLocalSize,
      itemCount: localStorageItems.length,
      items: localStorageItems.sort((a, b) => b.size - a.size)
    },
    totalSize: totalLocalSize,
    isNearLimit: totalLocalSize > 4 * 1024 * 1024, // 4MB threshold
    recommendations: getStorageRecommendations(totalLocalSize, localStorageItems)
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getStorageRecommendations(totalSize: number, items: { key: string; size: number }[]): string[] {
  const recommendations: string[] = [];

  if (totalSize > 4 * 1024 * 1024) {
    recommendations.push("Storage is over 4MB - consider clearing unused data");
  }

  if (items.length > 50) {
    recommendations.push("Large number of storage items - consider cleanup");
  }

  const largeItems = items.filter(item => item.size > 100 * 1024);
  if (largeItems.length > 0) {
    recommendations.push(`${largeItems.length} items over 100KB found`);
  }

  return recommendations;
}

export function clearAllStorage(): void {
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
}

export function clearStorageByPattern(pattern: string): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes(pattern)) {
      localStorage.removeItem(key);
    }
  });
}