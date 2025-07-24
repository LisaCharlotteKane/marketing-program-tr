/**
 * Cookie cleanup utilities to prevent HTTP 431 errors
 */

export function clearProblematicCookies() {
  try {
    // Get all cookies
    const cookies = document.cookie.split(';');

    // Clear potentially problematic cookies
    const problematicPatterns = [
      'github-',
      'spark-',
      'auth-',
      'session-',
      'campaign-',
      'kv-store',
      'large-data'
    ];

    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      const cleanName = name.trim();

      const shouldDelete = problematicPatterns.some(pattern => 
        cleanName.toLowerCase().includes(pattern.toLowerCase())
      ) || cookie.length > 4096;

      if (shouldDelete) {
        document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        console.log(`Cleared problematic cookie: ${cleanName}`);
      }
    });

    // Also attempt domain-wide deletion for known patterns
    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`,
      'github.app',
      '.github.app'
    ];

    domains.forEach(domain => {
      problematicPatterns.forEach(pattern => {
        document.cookie = `${pattern}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      });
    });

  } catch (error) {
    console.warn('Cookie cleanup failed:', error);
  }
}

export function clearAllCookies() {
  try {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      const cleanName = name.trim();
      document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
    console.log('All cookies cleared');
  } catch (error) {
    console.warn('Failed to clear all cookies:', error);
  }
}
