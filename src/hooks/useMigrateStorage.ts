import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

/**
 * Helper hook to migrate data from user scope to global scope if needed
 * @param key Storage key to migrate
 */
export function useMigrateToGlobal(key: string) {
  const [userData] = useKV(key, null);
  const [globalData, setGlobalData] = useKV(key, null, { scope: 'global' });
  
  useEffect(() => {
    // Only run migration if we have user data but no global data
    if (userData && Array.isArray(userData) && userData.length > 0) {
      if (!globalData || (Array.isArray(globalData) && globalData.length === 0)) {
        console.log(`Migrating ${key} from user scope to global scope...`);
        setGlobalData(userData);
      }
    }
  }, [userData, globalData, setGlobalData, key]);
}