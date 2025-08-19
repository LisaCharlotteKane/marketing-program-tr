// TypeScript compilation test file
import type { Campaign } from '@/types/campaign';

// Test basic imports
import React from 'react';
import { toast } from 'sonner';
import { useKV } from '@/hooks/useKV';

// Test component types
const TestComponent: React.FC = () => {
  const [campaigns, setCampaigns] = useKV<Campaign[]>('test', []);
  
  React.useEffect(() => {
    toast('Test message');
  }, []);
  
  return <div>TypeScript Test Component</div>;
};

export default TestComponent;