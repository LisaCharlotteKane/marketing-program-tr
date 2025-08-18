import type { Campaign, CampaignStatus } from './campaign';

export function parseToNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Strip currency symbols, commas, and whitespace
  const cleaned = String(value).replace(/[\$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

export function parseStrategicPillars(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  
  // Handle semicolon-separated values from CSV
  return String(value).split(';').map(p => p.trim()).filter(p => p.length > 0);
}

export function parseCampaignStatus(value: string | undefined): CampaignStatus {
  const validStatuses: CampaignStatus[] = ['Planning', 'On Track', 'Shipped', 'Cancelled'];
  return validStatuses.includes(value as CampaignStatus) ? (value as CampaignStatus) : 'Planning';
}

export function calculateCampaignMetrics(
  expectedLeads: number,
  forecastedCost: number,
  campaignType: string
): {
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
} {
  if (campaignType.includes('In-Account Events (1:1)') && expectedLeads === 0) {
    // Special case: assume 20:1 ROI for in-account events
    return {
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: forecastedCost * 20
    };
  }

  const mql = Math.round(expectedLeads * 0.1); // 10% of leads
  const sql = Math.round(mql * 0.6); // 6% of leads (60% of MQLs)
  const opportunities = Math.round(sql * 0.8); // 80% of SQLs
  const pipelineForecast = opportunities * 50000; // $50K per opportunity

  return {
    mql,
    sql,
    opportunities,
    pipelineForecast
  };
}

export function createCampaignWithMetrics(
  baseData: Partial<Campaign>,
  expectedLeads: number,
  forecastedCost: number,
  campaignType: string
): Campaign {
  const metrics = calculateCampaignMetrics(expectedLeads, forecastedCost, campaignType);
  
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
  } as Campaign;
}