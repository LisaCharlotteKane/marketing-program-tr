/**
 * Emergency cleanup script for HTTP 431 "Request Header Fields Too Large" errors
 * 
 * This script can be run in the browser console to immediately clear problematic data
 * that might be causing large headers and the 431 error.
 */

(function() {
  console.log('🚨 Emergency Spark App Cleanup Started');
  
  let totalCleared = 0;
  let errors = [];
  
  try {
    // 1. Clear all localStorage
    console.log('Clearing localStorage...');
    const localStorageSize = JSON.stringify(localStorage).length;
    localStorage.clear();
    console.log(`✅ Cleared localStorage (${(localStorageSize/1024).toFixed(1)}KB)`);
    totalCleared += localStorageSize;
  } catch (error) {
    errors.push('localStorage: ' + error.message);
  }
  
  try {
    // 2. Clear all sessionStorage
    console.log('Clearing sessionStorage...');
    const sessionStorageSize = JSON.stringify(sessionStorage).length;
    sessionStorage.clear();
    console.log(`✅ Cleared sessionStorage (${(sessionStorageSize/1024).toFixed(1)}KB)`);
    totalCleared += sessionStorageSize;
  } catch (error) {
    errors.push('sessionStorage: ' + error.message);
  }
  
  try {
    // 3. Clear all cookies for this domain
    console.log('Clearing cookies...');
    const cookies = document.cookie.split(';');
    let cookiesCleared = 0;
    
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim()) {
        const cookieName = name.trim();
        // Clear cookie for multiple domain/path combinations
        const domains = [
          '',
          `domain=${window.location.hostname}`,
          `domain=.${window.location.hostname}`,
          `domain=.github.app`,
          `domain=.spark.github.com`
        ];
        const paths = ['', 'path=/', 'path=/app'];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${domain}; ${path}`;
          });
        });
        cookiesCleared++;
      }
    });
    console.log(`✅ Cleared ${cookiesCleared} cookies`);
  } catch (error) {
    errors.push('cookies: ' + error.message);
  }
  
  try {
    // 4. Clear any IndexedDB databases
    console.log('Clearing IndexedDB...');
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
            console.log(`Deleted IndexedDB: ${db.name}`);
          }
        });
      }).catch(err => errors.push('IndexedDB: ' + err.message));
    }
  } catch (error) {
    errors.push('IndexedDB: ' + error.message);
  }
  
  try {
    // 5. Clear Cache API if available
    console.log('Clearing Cache API...');
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
          console.log(`Deleted cache: ${cacheName}`);
        });
      }).catch(err => errors.push('Cache API: ' + err.message));
    }
  } catch (error) {
    errors.push('Cache API: ' + error.message);
  }
  
  // 6. Report results
  console.log('\n📊 Cleanup Summary:');
  console.log(`Total data cleared: ${(totalCleared/1024).toFixed(1)}KB`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Errors encountered:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n✅ Emergency cleanup completed!');
  console.log('💡 Tip: Reload the page to restart the app with clean storage');
  
  // Ask user if they want to reload
  if (confirm('Cleanup completed! Reload the page to restart the app?')) {
    window.location.reload();
  }
  
  return {
    totalCleared: (totalCleared/1024).toFixed(1) + 'KB',
    errors: errors,
    success: errors.length === 0
  };
})();