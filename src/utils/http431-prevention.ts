// HTTP 431 Prevention System
// Prevents "Request Header Fields Too Large" errors

let isInitialized = false;

export function emergencyCleanup(): void {
  console.log('Running emergency cleanup for HTTP 431 prevention...');
  
  try {
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });
    
    console.log('Emergency cleanup completed');
  } catch (error) {
    console.warn('Error during emergency cleanup:', error);
  }
}

export function initializeHTTP431Prevention(): () => void {
  if (isInitialized) {
    return () => {}; // Already initialized
  }

  console.log('Initializing HTTP 431 prevention...');
  
  // Clear large localStorage entries that might cause header issues
  try {
    const keysToCheck = ['marketing-campaigns', 'budget-allocations', 'user-preferences'];
    
    keysToCheck.forEach(key => {
      const value = localStorage.getItem(key);
      if (value && value.length > 100000) { // 100KB threshold
        console.warn(`Large localStorage entry detected for key "${key}": ${value.length} characters`);
        // Don't auto-clear, just warn
      }
    });

    // Clear any overly large cookies
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.split('=');
      if (value && value.length > 4000) { // 4KB threshold for cookies
        console.warn(`Large cookie detected: ${name?.trim()}`);
        // Clear the large cookie
        document.cookie = `${name?.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });

  } catch (error) {
    console.warn('Error during HTTP 431 prevention cleanup:', error);
  }

  isInitialized = true;
  
  return () => {
    isInitialized = false;
  };
}