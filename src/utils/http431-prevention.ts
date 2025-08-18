/**
 * HTTP 431 Prevention System
 * Initialize all monitoring and cleanup systems to prevent "Request Header Fields Too Large" errors
 */

import { clearProblematicCookies } from '@/lib/cookie-cleanup';
import { startHeaderSizeMonitoring, getHeaderSizeInfo } from '@/utils/header-guard';
import { startStorageMonitoring, getStorageSizeInfo, cleanupLargeStorageItems } from '@/utils/storage-size-guard';

/**
 * Initialize the HTTP 431 prevention system
 */
export function initializeHTTP431Prevention(): () => void {
  console.log('🛡️ Initializing HTTP 431 prevention system...');
  
  // 1. Immediate cleanup of problematic cookies
  clearProblematicCookies();
  
  // 2. Check current header size
  const headerInfo = getHeaderSizeInfo();
  if (headerInfo.warnings.length > 0) {
    console.warn('⚠️ Header size warnings:', headerInfo.warnings);
  }
  
  // 3. Check storage size
  const storageInfo = getStorageSizeInfo();
  if (storageInfo.isNearLimit) {
    console.warn('⚠️ localStorage near capacity, cleaning up...');
    cleanupLargeStorageItems();
  }
  
  // 4. Start monitoring systems
  const cleanupHeaderMonitoring = startHeaderSizeMonitoring();
  const cleanupStorageMonitoring = startStorageMonitoring();
  
  // 5. Set up periodic emergency cleanup
  const emergencyCleanupInterval = setInterval(() => {
    const currentHeaderInfo = getHeaderSizeInfo();
    const currentStorageInfo = getStorageSizeInfo();
    
    // Emergency cleanup if critically over limits
    if (currentHeaderInfo.isOverLimit) {
      console.warn('🚨 Emergency cookie cleanup - headers over limit');
      clearProblematicCookies();
    }
    
    if (currentStorageInfo.percentUsed > 0.95) {
      console.warn('🚨 Emergency storage cleanup - localStorage over 95% full');
      cleanupLargeStorageItems();
    }
  }, 120000); // Check every 2 minutes
  
  console.log('✅ HTTP 431 prevention system initialized');
  
  // Return cleanup function
  return () => {
    cleanupHeaderMonitoring();
    cleanupStorageMonitoring();
    clearInterval(emergencyCleanupInterval);
    console.log('🛡️ HTTP 431 prevention system shut down');
  };
}

/**
 * Emergency cleanup function for immediate use
 */
export function emergencyCleanup(): void {
  console.log('🚨 Running emergency cleanup...');
  
  // Clear all problematic cookies
  clearProblematicCookies();
  
  // Clean up large storage items
  const cleaned = cleanupLargeStorageItems(256 * 1024); // 256KB threshold
  
  console.log(`🚨 Emergency cleanup complete - removed ${cleaned} large items`);
}

/**
 * Get current system status for debugging
 */
export function getSystemStatus() {
  const headerInfo = getHeaderSizeInfo();
  const storageInfo = getStorageSizeInfo();
  
  return {
    headers: {
      cookieSize: headerInfo.cookieSize,
      estimatedSize: headerInfo.estimatedHeaderSize,
      isOverLimit: headerInfo.isOverLimit,
      warnings: headerInfo.warnings
    },
    storage: {
      currentSize: storageInfo.currentSize,
      percentUsed: storageInfo.percentUsed,
      isNearLimit: storageInfo.isNearLimit,
      recommendations: storageInfo.recommendations
    },
    recommendations: [
      ...headerInfo.warnings,
      ...storageInfo.recommendations
    ]
  };
}