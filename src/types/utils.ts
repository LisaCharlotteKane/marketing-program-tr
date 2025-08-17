// Utility functions for type safety and calculations

import type { Campaign } from './campaign';

/**
 * Calculate campaign metrics based on expected leads and cost
 */
export function calculateCampaignMetrics(
  expectedLeads: number, 
  forecastedCost: number, 
  campaignType: string
): { mql: number; sql: number; opportunities: number; pipelineForecast: number } {
  // Special case for In Account Events
  if (campaignType === "In-Account Events (1:1)" && expectedLeads === 0) {
    return {
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: forecastedCost * 20 // 20:1 ROI for in-account events
    };
  }

  const mql = Math.round(expectedLeads * 0.1); // 10% of expected leads
  const sql = Math.round(mql * 0.6); // 60% of MQLs
  const opportunities = Math.round(sql * 0.8); // 80% of SQLs
  const pipelineForecast = opportunities * 50000; // $50K per opportunity

  return { mql, sql, opportunities, pipelineForecast };
}

/**
 * Parse a string/number value to a safe number
 */
export function parseToNumber(value: string | number | undefined | null): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Safe string array parser for strategic pillars
 */
export function parseStrategicPillars(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(';').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Type guard to ensure campaign has required fields
 */
export function isValidCampaign(campaign: Partial<Campaign>): campaign is Campaign {
  return !!(
    campaign.id &&
    campaign.campaignType &&
    campaign.owner &&
    campaign.region &&
    typeof campaign.forecastedCost === 'number' &&
    typeof campaign.expectedLeads === 'number'
  );
}

/**
 * Create a new campaign with calculated metrics
 */
export function createCampaignWithMetrics(data: Omit<Campaign, 'id' | 'mql' | 'sql' | 'opportunities' | 'pipelineForecast'>): Campaign {
  const metrics = calculateCampaignMetrics(data.expectedLeads, data.forecastedCost, data.campaignType);
  
  return {
    id: Date.now().toString(),
    ...data,
    ...metrics
  };
}