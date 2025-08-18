// HTTP 431 Prevention Utilities
export function initializeHTTP431Prevention(): () => void {
  console.log("Initializing HTTP 431 prevention...");
  
  // Clear potentially large cookies
  const clearLargeCookies = () => {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      if (name && name.trim().length > 0) {
        // Check if cookie is suspiciously large
        if (cookie.length > 1000) {
          console.log(`Clearing large cookie: ${name.trim()}`);
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }
    });
  };

  // Clear localStorage items that might be too large
  const clearLargeStorage = () => {
    try {
      const storage = window.localStorage;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          if (value && value.length > 50000) { // 50KB threshold
            console.log(`Clearing large localStorage item: ${key}`);
            storage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Error clearing large storage items:', error);
    }
  };

  // Monitor header size
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [input, init] = args;
    
    // Check if headers are getting too large
    if (init?.headers) {
      const headerString = JSON.stringify(init.headers);
      if (headerString.length > 8000) { // 8KB warning threshold
        console.warn('Large headers detected in fetch request:', headerString.length, 'bytes');
      }
    }
    
    return originalFetch.apply(this, args);
  };

  // Run cleanup
  clearLargeCookies();
  clearLargeStorage();

  // Return cleanup function
  return () => {
    window.fetch = originalFetch;
  };
}

export function emergencyCleanup(): void {
  console.log("Running emergency HTTP 431 cleanup...");
  
  // Clear all cookies
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
  
  // Clear all localStorage
  try {
    localStorage.clear();
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
  
  // Clear sessionStorage
  try {
    sessionStorage.clear();
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }
  
  console.log("Emergency cleanup completed");
}