import React from 'react';
import { useKV } from '@/hooks/useKVStorage';

/**
 * Simple test component to verify our storage hook works
 */
export function StorageTest() {
  const [testData, setTestData] = useKV('test', { count: 0 });

  const increment = () => {
    setTestData(prev => ({ count: prev.count + 1 }));
  };

  return (
    <div className="p-4 border rounded">
      <h3>Storage Test</h3>
      <p>Count: {testData.count}</p>
      <button onClick={increment} className="px-4 py-2 bg-blue-500 text-white rounded">
        Increment
      </button>
    </div>
  );
}