// Function to check campaign count from the console
async function checkCampaignCount() {
  try {
    // Check if spark KV is available
    if (!window.spark || !window.spark.kv) {
      console.error('Spark KV API not available');
      return;
    }
    
    // Get campaigns from KV store
    console.log('Fetching campaign data from KV store...');
    const campaigns = await window.spark.kv.get('campaignData');
    
    // Validate the data
    if (!campaigns) {
      console.log('No campaign data found');
      return;
    }
    
    if (!Array.isArray(campaigns)) {
      console.error('Campaign data is not an array:', campaigns);
      return;
    }
    
    // Display the count
    console.log(`📊 Campaign count: ${campaigns.length}`);
    
    // Display some additional statistics
    if (campaigns.length > 0) {
      // Calculate statistics
      const typeCounts = {};
      const regionCounts = {};
      const ownerCounts = {};
      
      campaigns.forEach(campaign => {
        // Count by type
        const type = campaign.campaignType || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        
        // Count by region
        const region = campaign.region || "Unknown";
        regionCounts[region] = (regionCounts[region] || 0) + 1;
        
        // Count by owner
        const owner = campaign.owner || "Unknown";
        ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
      });
      
      console.log('Campaign Types:', typeCounts);
      console.log('Regions:', regionCounts);
      console.log('Owners:', ownerCounts);
      
      // Show first and last campaign
      console.log('First campaign:', campaigns[0]);
      console.log('Last campaign:', campaigns[campaigns.length - 1]);
    }
    
    return campaigns.length;
  } catch (error) {
    console.error('Error checking campaign count:', error);
  }
}

// Add the function to the window object so it can be called from the console
window.checkCampaignCount = checkCampaignCount;

// Let the user know the function is available
console.log('Campaign count checker available. Run window.checkCampaignCount() to check');

// Return the function for immediate use
checkCampaignCount;