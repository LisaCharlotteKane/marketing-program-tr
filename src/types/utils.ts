import type { Campaign, CampaignStatus } from './campaign';

/**
 * Parse string to number safely
 */
export function parseToNumber(value: string | number | undefined | null): number {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  
  const cleaned = String(value).replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse strategic pillars from string or array
 */
export function parseStrategicPillars(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'string') return [];
  
  // Handle semicolon or comma separated values
  return value.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Parse campaign status with validation
 */
export function parseCampaignStatus(value: string | undefined): CampaignStatus {
  const validStatuses: CampaignStatus[] = ['Planning', 'On Track', 'Shipped', 'Cancelled'];
  
  if (!value) return 'Planning';
  
  const found = validStatuses.find(status => 
    status.toLowerCase() === value.toLowerCase()
  );
  
  return found || 'Planning';
}

/**
 * Calculate campaign metrics based on leads, cost, and type
 */
export function calculateCampaignMetrics(
  expectedLeads: number = 0, 
  forecastedCost: number = 0, 
  campaignType: string = ''
): {
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
} {
  // Special case for In-Account Events (1:1) - use 20:1 ROI if no leads
  if (campaignType.includes('In-Account Events (1:1)') && expectedLeads === 0) {
    return {
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: forecastedCost * 20
    };
  }

  // Standard calculations
  const mql = Math.round(expectedLeads * 0.1); // 10% of expected leads
  const sql = Math.round(mql * 0.6); // 6% of expected leads (60% of MQLs)
  const opportunities = Math.round(sql * 0.8); // 80% of SQLs
  const pipelineForecast = opportunities * 50000; // $50K per opportunity

  return {
    mql,
    sql,
    opportunities,
    pipelineForecast
  };
}

/**
 * Create a campaign with calculated metrics
 */
export function createCampaignWithMetrics(baseData: Partial<Campaign>): Campaign {
  const metrics = calculateCampaignMetrics(
    baseData.expectedLeads, 
    baseData.forecastedCost, 
    baseData.campaignType
  );

  return {
    id: Date.now().toString(),
    campaignName: '',
    campaignType: '',
    strategicPillar: [],
    revenuePlay: '',
    fy: '',
    quarterMonth: '',
    region: '',
    country: '',
    owner: '',
    description: '',
    forecastedCost: 0,
    expectedLeads: 0,
    status: 'Planning',
    ...baseData,
    ...metrics
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate campaign data
 */
export function validateCampaign(campaign: Partial<Campaign>): string[] {
  const errors: string[] = [];

  if (!campaign.campaignType) {
    errors.push('Campaign type is required');
  }

  if (!campaign.owner) {
    errors.push('Campaign owner is required');
  }

  if (!campaign.region) {
    errors.push('Region is required');
  }

  if (campaign.forecastedCost && campaign.forecastedCost < 0) {
    errors.push('Forecasted cost cannot be negative');
  }

  if (campaign.expectedLeads && campaign.expectedLeads < 0) {
    errors.push('Expected leads cannot be negative');
  }

  return errors;
}