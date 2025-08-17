// Simple test to validate all types compile correctly
import React from 'react';
import type { Campaign, FormData } from '@/types/campaign';
import { calculateCampaignMetrics, parseToNumber } from '@/types/utils';

// Test component to verify types
export function TypeTest(): JSX.Element {
  // Test Campaign type
  const testCampaign: Campaign = {
    id: "test-1",
    campaignType: "Test",
    strategicPillar: ["Test Pillar"],
    revenuePlay: "Test Revenue",
    fy: "FY25",
    quarterMonth: "Q1 - July",
    region: "Test Region",
    country: "Test Country",
    owner: "Test Owner",
    description: "Test Description",
    forecastedCost: 1000,
    expectedLeads: 50,
    mql: 5,
    sql: 3,
    opportunities: 2,
    pipelineForecast: 100000
  };

  // Test FormData type
  const testFormData: FormData = {
    campaignType: "Test",
    strategicPillar: ["Test"],
    revenuePlay: "Test",
    fy: "FY25",
    quarterMonth: "Q1 - July",
    region: "Test",
    country: "Test",
    owner: "Test",
    description: "Test",
    forecastedCost: 1000,
    expectedLeads: 50,
    campaignName: "Test Campaign"
  };

  // Test utility functions
  const metrics = calculateCampaignMetrics(50, 1000, "Test");
  const numberValue = parseToNumber("$1,000");

  return (
    <div>
      <h3>Type Test Component</h3>
      <p>Campaign ID: {testCampaign.id}</p>
      <p>Form Campaign Type: {testFormData.campaignType}</p>
      <p>Calculated MQL: {metrics.mql}</p>
      <p>Parsed Number: {numberValue}</p>
    </div>
  );
}

export default TypeTest;