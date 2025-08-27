import { useState, useEffect } from 'react';
import { cleanupStorage, getStorageSize } from '@/lib/storage-cleanup';

interface StorageInfo {
  localStorage: number;
  sessionStorage: number;
  total: number;
}

export function useStorageMonitor() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ localStorage: 0, sessionStorage: 0, total: 0 });
  const [isCleanupNeeded, setIsCleanupNeeded] = useState(false);

  const checkStorage = () => {
    const sizes = getStorageSize();
    const total = sizes.localStorage + sizes.sessionStorage;
    
    setStorageInfo({
      localStorage: sizes.localStorage,
      sessionStorage: sizes.sessionStorage,
      total
    });

    // Flag for cleanup if storage is over 2MB
    setIsCleanupNeeded(total > 2 * 1024 * 1024);
  };

  const performCleanup = () => {
    cleanupStorage();
    checkStorage();
  };

  useEffect(() => {
    checkStorage();
    
    // Check storage periodically
    const interval = setInterval(checkStorage, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);

  return {
    storageInfo,
    isCleanupNeeded,
    performCleanup,
    checkStorage
  };
}