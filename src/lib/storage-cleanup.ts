/**
 * Storage cleanup utilities to prevent HTTP 431 errors
 * Removes large or unnecessary data from localStorage and sessionStorage
 */

export function cleanupStorage(): void {
  try {
    // Get all localStorage keys
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      try {
        const value = localStorage.getItem(key);
        if (!value) continue;
        
        // Remove items larger than 50KB
        if (value.length > 50000) {
          keysToRemove.push(key);
          console.warn(`Removing large localStorage item: ${key} (${value.length} chars)`);
        }
        
        // Remove old or unnecessary keys
        if (key.startsWith('debug-') || 
            key.startsWith('temp-') || 
            key.includes('old') ||
            key.includes('backup')) {
          keysToRemove.push(key);
        }
      } catch (error) {
        console.warn(`Error checking localStorage key ${key}:`, error);
        keysToRemove.push(key);
      }
    }
    
    // Remove identified keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing localStorage key ${key}:`, error);
      }
    });
    
    console.log(`Cleaned up ${keysToRemove.length} localStorage items`);
    
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
}

export function getStorageSize(): { localStorage: number; sessionStorage: number } {
  let localSize = 0;
  let sessionSize = 0;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          localSize += key.length + value.length;
        }
      }
    }
  } catch (error) {
    console.warn('Error calculating localStorage size:', error);
  }
  
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value) {
          sessionSize += key.length + value.length;
        }
      }
    }
  } catch (error) {
    console.warn('Error calculating sessionStorage size:', error);
  }
  
  return { localStorage: localSize, sessionStorage: sessionSize };
}