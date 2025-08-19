import type { CampaignStatus } from './campaign';

export function parseToNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,$]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function parseStrategicPillars(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(';').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export function parseCampaignStatus(value: string | undefined): CampaignStatus {
  const validStatuses: CampaignStatus[] = ['Planning', 'On Track', 'Shipped', 'Cancelled'];
  return validStatuses.includes(value as CampaignStatus) ? (value as CampaignStatus) : 'Planning';
}

export function calculateCampaignMetrics(expectedLeads: number, forecastedCost: number, campaignType: string) {
  // Special case for In-Account Events with no leads - assume 20:1 ROI
  if (campaignType === "In-Account Events (1:1)" && expectedLeads === 0) {
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