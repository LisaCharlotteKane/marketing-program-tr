import type { Campaign, CampaignStatus, StrategicPillar } from './campaign';

export function parseToNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function parseStrategicPillars(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    if (value.includes(';')) {
      return value.split(';').map(s => s.trim()).filter(Boolean);
    }
    return value ? [value] : [];
  }
  return [];
}

export function parseCampaignStatus(value: string | undefined): CampaignStatus {
  const validStatuses: CampaignStatus[] = ['Planning', 'On Track', 'Shipped', 'Cancelled'];
  return validStatuses.includes(value as CampaignStatus) ? (value as CampaignStatus) : 'Planning';
}

export function calculateCampaignMetrics(expectedLeads: number, forecastedCost: number, campaignType: string) {
  const leads = Number(expectedLeads) || 0;
  const cost = Number(forecastedCost) || 0;

  // Special case for In-Account Events (1:1) without leads
  if (campaignType === "In-Account Events (1:1)" && leads === 0) {
    return {
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: cost * 20 // 20:1 ROI
    };
  }

  const mql = Math.round(leads * 0.1);
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

export function createCampaignWithMetrics(formData: Partial<Campaign>): Campaign {
  const metrics = calculateCampaignMetrics(
    formData.expectedLeads || 0,
    formData.forecastedCost || 0,
    formData.campaignType || ''
  );

  return {
    id: Date.now().toString(),
    campaignName: formData.campaignName || '',
    campaignType: formData.campaignType || '',
    strategicPillar: formData.strategicPillar || [],
    revenuePlay: formData.revenuePlay || '',
    fy: formData.fy || '',
    quarterMonth: formData.quarterMonth || '',
    region: formData.region || '',
    country: formData.country || '',
    owner: formData.owner || '',
    description: formData.description || '',
    forecastedCost: Number(formData.forecastedCost) || 0,
    expectedLeads: Number(formData.expectedLeads) || 0,
    status: formData.status || 'Planning',
    ...metrics
  };
}