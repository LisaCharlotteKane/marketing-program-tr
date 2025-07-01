import { useKV } from "@github/spark/hooks";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

function CampaignCounter() {
  const [campaignData] = useKV("campaignData", []);
  const [count, setCount] = useState("Loading...");
  
  useEffect(() => {
    if (Array.isArray(campaignData)) {
      setCount(campaignData.length.toString());
      console.log(`Campaign count: ${campaignData.length}`);
      
      // Log detailed info
      if (campaignData.length > 0) {
        const firstCampaign = campaignData[0];
        const lastCampaign = campaignData[campaignData.length - 1];
        
        console.log("First campaign:", firstCampaign);
        console.log("Last campaign:", lastCampaign);
        
        // Calculate some stats
        const typeCounts = {};
        const regionCounts = {};
        const ownerCounts = {};
        
        campaignData.forEach(campaign => {
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
        
        console.log("Campaign types:", typeCounts);
        console.log("Campaign regions:", regionCounts);
        console.log("Campaign owners:", ownerCounts);
      }
    } else {
      setCount("Error: Not an array");
    }
  }, [campaignData]);
  
  return (
    <div 
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 9999,
        fontFamily: "sans-serif",
        fontSize: "14px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
      }}
    >
      <div style={{ marginBottom: "5px" }}>
        <span style={{ fontSize: "12px" }}>Campaigns in Storage:</span>
      </div>
      <div style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
        {count}
      </div>
      <div style={{ marginTop: "5px", fontSize: "10px", opacity: 0.7 }}>
        Last checked: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

// Wait for app to load, then inject our counter
setTimeout(() => {
  const counterDiv = document.createElement("div");
  document.body.appendChild(counterDiv);
  
  try {
    ReactDOM.render(<CampaignCounter />, counterDiv);
  } catch (error) {
    console.error("Failed to inject campaign counter:", error);
  }
}, 3000);