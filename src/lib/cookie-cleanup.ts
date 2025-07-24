/**
 * Cookie and header cleanup utility to prevent HTTP 431 errors
 */

export function clearProblematicCookies() {
  try {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    let cleared = 0;
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      const cookieName = name.trim();
      
      // Check for potentially problematic cookies
      if (
        cookieName.includes('spark') ||
        cookieName.includes('kv-store') ||
        cookieName.includes('campaign') ||
        cookieName.includes('github-auth') ||
        cookieName.includes('session-data') ||
        cookieName.length > 50 // Very long cookie names
      ) {
        // Clear the cookie by setting it to expire in the past
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        cleared++;
      }
    });

    if (cleared > 0) {
      console.log(`Cleared ${cleared} potentially problematic cookies`);
    }

    return { cleared, total: cookies.length };
  } catch (error) {
    console.error('Error clearing cookies:', error);
    return { error: true, message: error.message };
  }
}

export function clearAllAppData() {
  try {
    console.log('Starting complete app data cleanup...');
    
    // Clear localStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (
        key.includes('campaign') ||
        key.includes('spark') ||
        key.includes('kv') ||
        key.includes('auth') ||
        key.includes('github')
      ) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach(key => {
      if (
        key.includes('campaign') ||
        key.includes('spark') ||
        key.includes('kv') ||
        key.includes('auth') ||
        key.includes('github')
      ) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear problematic cookies
    const cookieResult = clearProblematicCookies();

    console.log('App data cleanup completed');
    console.log(`- localStorage keys cleared: ${localStorageKeys.length}`);
    console.log(`- sessionStorage keys cleared: ${sessionStorageKeys.length}`);
    console.log(`- Cookies cleared: ${cookieResult.cleared || 0}`);

    return {
      success: true,
      localStorage: localStorageKeys.length,
      sessionStorage: sessionStorageKeys.length,
      cookies: cookieResult.cleared || 0
    };
  } catch (error) {
    console.error('Error clearing app data:', error);
    return { error: true, message: error.message };
  }
}

export function resetAppStorage() {
  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies for this domain
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });

    console.log('✅ Complete app storage reset completed');
    return { success: true, message: 'All storage cleared' };
  } catch (error) {
    console.error('Error resetting storage:', error);
    return { error: true, message: error.message };
  }
}

// Expose utilities to window for debugging
if (typeof window !== 'undefined') {
  (window as any).sparkCleanup = {
    clearCookies: clearProblematicCookies,
    clearAppData: clearAllAppData,
    resetStorage: resetAppStorage
  };
}