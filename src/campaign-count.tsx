import React, { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';

export function CampaignCount() {
  const [kvCampaigns] = useKV('campaignData', []);
  const [count, setCount] = useState(0);
  const [refreshTime, setRefreshTime] = useState(new Date());
  
  useEffect(() => {
    if (kvCampaigns && Array.isArray(kvCampaigns)) {
      setCount(kvCampaigns.length);
      console.log(`Found ${kvCampaigns.length} campaigns in shared storage`);
      
      // Log some sample data
      if (kvCampaigns.length > 0) {
        console.log('Sample campaign:', kvCampaigns[0]);
      }
    }
  }, [kvCampaigns]);

  const handleRefresh = () => {
    setRefreshTime(new Date());
    if (kvCampaigns && Array.isArray(kvCampaigns)) {
      setCount(kvCampaigns.length);
      console.log(`Refreshed: ${kvCampaigns.length} campaigns in shared storage`);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-md z-50 shadow-lg">
      <div className="text-center">
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-xs">campaigns in storage</div>
      </div>
      <div className="text-xs mt-2">
        <button 
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
        >
          Refresh
        </button>
        <div className="mt-1">Last check: {refreshTime.toLocaleTimeString()}</div>
      </div>
    </div>
  );
}

// Inject the component into the DOM
const injectCampaignCount = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  // Get React and ReactDOM
  import('react').then(React => {
    import('react-dom').then(ReactDOM => {
      ReactDOM.render(React.createElement(CampaignCount), container);
    });
  }).catch(error => {
    console.error('Failed to inject CampaignCount:', error);
  });
};

// Execute the injection when the script loads
injectCampaignCount();