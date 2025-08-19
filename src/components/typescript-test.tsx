import React, { useState } from 'react';
import { notify } from '@/lib/notifier';
import { Campaign } from '@/types/campaign';
import { Button } from '@/components/ui/button';

// Test component to verify TypeScript fixes
export function TypeScriptTest() {
  // Test explicit generic typing for useState
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [count, setCount] = useState<number>(0);
  
  // Test the notifier
  const testNotifications = () => {
    notify.success('Success test');
    notify.error('Error test');
    notify.warning('Warning test');
    notify.info('Info test');
  };

  // Test Campaign creation with proper types
  const createTestCampaign = (): Campaign => {
    return {
      id: '1',
      campaignName: 'Test Campaign',
      campaignType: 'Test Type',
      strategicPillar: ['Test Pillar'],
      forecastedCost: 1000,
      expectedLeads: 100,
      mql: 10,
      sql: 6,
      opportunities: 5,
      pipelineForecast: 250000,
      status: 'Planning'
    };
  };

  // Test adding a campaign
  const addTestCampaign = () => {
    const newCampaign = createTestCampaign();
    setCampaigns(prev => [...prev, newCampaign]);
    setCount(prev => prev + 1);
    notify.success(`Added campaign ${count + 1}`);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">TypeScript Test Component</h2>
      
      <div className="space-x-2">
        <Button onClick={testNotifications}>
          Test Notifications
        </Button>
        <Button onClick={addTestCampaign}>
          Add Test Campaign ({campaigns.length})
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Campaigns: {campaigns.length}</p>
        <p>Count: {count}</p>
        {campaigns.length > 0 && (
          <p>Last campaign: {campaigns[campaigns.length - 1]?.campaignName}</p>
        )}
      </div>
    </div>
  );
}