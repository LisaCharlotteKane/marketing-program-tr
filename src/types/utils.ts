import type { Campaign, CampaignStatus } from './campaign';

export function parseToNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const str = String(value).replace(/[$,]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function parseStrategicPillars(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value.join(';');
  }
  return String(value || '');
}

export function parseCampaignStatus(value: string | undefined): CampaignStatus {
  const validStatuses: CampaignStatus[] = ['Planning', 'On Track', 'Shipped', 'Cancelled'];
  if (validStatuses.includes(value as CampaignStatus)) {
    return value as CampaignStatus;
  }
  return 'Planning';
}

export function calculateCampaignMetrics(
  expectedLeads: number, 
  forecastedCost: number, 
  campaignType: string
) {
  // Special case for In-Account Events with no leads
  if (campaignType.includes('In-Account') && expectedLeads === 0) {
    return {
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: forecastedCost * 20
    };
  }

  const mql = Math.round(expectedLeads * 0.1);
  const sql = Math.round(mql * 0.6);
  const opportunities = Math.round(sql * 0.8);
  const pipelineForecast = opportunities * 50000;

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
    campaignType: '',
    strategicPillar: '',
    revenuePlay: '',
    fy: '',
    quarterMonth: '',
    region: '',
    country: '',
    owner: '',
    description: '',
    ...baseData,
    expectedLeads,
    forecastedCost,
    ...metrics,
    status: 'Planning'
  } as Campaign;
}