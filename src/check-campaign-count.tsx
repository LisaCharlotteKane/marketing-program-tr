import React, { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';

// This component checks the number of campaigns in the shared KV store
export function CheckCampaignCount() {
  const [campaigns] = useKV('campaignData', []);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (Array.isArray(campaigns)) {
      setCount(campaigns.length);
      console.log(`Campaign count in KV store: ${campaigns.length}`);
      
      // If campaigns exist, log some details
      if (campaigns.length > 0) {
        console.log(`First campaign: ${JSON.stringify(campaigns[0])}`);
        console.log(`Last campaign: ${JSON.stringify(campaigns[campaigns.length - 1])}`);
      }
    } else {
      console.log('Campaigns in KV store is not an array');
    }
  }, [campaigns]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999
    }}>
      Campaigns in storage: <strong>{count}</strong>
    </div>
  );
}

// We'll instantiate this component directly
document.addEventListener('DOMContentLoaded', () => {
  const checkDiv = document.createElement('div');
  document.body.appendChild(checkDiv);
  
  // Use React DOM to render the component
  // This is a simplified approach for this specific task
  try {
    const React = require('react');
    const ReactDOM = require('react-dom');
    ReactDOM.render(<CheckCampaignCount />, checkDiv);
  } catch (error) {
    console.error('Failed to render campaign count checker:', error);
  }
});