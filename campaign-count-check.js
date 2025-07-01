// This script will be inserted into the HTML to check the campaign count
window.checkCampaignCount = async function() {
  try {
    if (!window.spark || !window.spark.kv) {
      console.error('Spark KV store not available');
      return 'Spark KV API not available';
    }
    
    // Get campaigns from KV store
    const campaigns = await window.spark.kv.get('campaignData');
    
    if (!campaigns) {
      console.error('No campaign data found');
      return 'No campaign data found';
    }
    
    if (!Array.isArray(campaigns)) {
      console.error('Campaign data is not an array');
      return 'Campaign data is not an array';
    }
    
    console.log(`Found ${campaigns.length} campaigns in the KV store`);
    
    // Log some sample data
    if (campaigns.length > 0) {
      console.log('First campaign:', campaigns[0]);
      console.log('Last campaign:', campaigns[campaigns.length - 1]);
    }
    
    return campaigns.length;
  } catch (error) {
    console.error('Error checking campaign count:', error);
    return `Error: ${error.message}`;
  }
};

// Run the check
setTimeout(async () => {
  const count = await window.checkCampaignCount();
  console.log(`Campaign count: ${count}`);
  
  // Create a UI element to display the count
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '10px';
  div.style.right = '10px';
  div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  div.style.color = 'white';
  div.style.padding = '10px';
  div.style.borderRadius = '5px';
  div.style.zIndex = '9999';
  div.innerHTML = `Campaigns: <strong>${count}</strong>`;
  
  document.body.appendChild(div);
}, 2000); // Wait for Spark to initialize