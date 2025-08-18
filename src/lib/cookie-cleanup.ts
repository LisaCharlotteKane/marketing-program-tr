/**
 * Cookie cleanup utilities to prevent HTTP 431 errors
 */

export function clearProblematicCookies() {
  try {
    console.log('Starting cookie cleanup to prevent HTTP 431 errors...');
    
    // Get all cookies
    const cookies = document.cookie.split(';');
    let clearedCount = 0;

    // Clear potentially problematic cookies (more comprehensive patterns)
    const problematicPatterns = [
      'github-',
      'spark-',
      'auth-',
      'session-',
      'campaign-',
      'kv-store',
      'large-data',
      '_gh_',
      'user-',
      'token-',
      'jwt-',
      'bearer-'
    ];

    cookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      const cleanName = name.trim();

      // Delete if matches patterns OR if cookie is too large
      const shouldDelete = problematicPatterns.some(pattern => 
        cleanName.toLowerCase().includes(pattern.toLowerCase())
      ) || cookie.length > 4096 || (value && value.length > 4096);

      if (shouldDelete) {
        // Clear with multiple deletion attempts to ensure removal
        const deleteOptions = [
          `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`,
          `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`,
          `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`,
          `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure`,
          `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None`
        ];

        deleteOptions.forEach(deleteString => {
          document.cookie = deleteString;
        });
        
        clearedCount++;
        console.log(`Cleared cookie: ${cleanName} (size: ${cookie.length} bytes)`);
      }
    });

    // Also attempt domain-wide deletion for known patterns
    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`,
      'github.app',
      '.github.app',
      'githubusercontent.com'
    ];

    domains.forEach(domain => {
      problematicPatterns.forEach(pattern => {
        document.cookie = `${pattern}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      });
    });

    console.log(`Cookie cleanup complete. Cleared ${clearedCount} problematic cookies.`);

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
