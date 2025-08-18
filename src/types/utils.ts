import type { Campaign, CampaignStatus } from './campaign';

// Utility function to safely parse numbers from string inputs
export const parseToNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  
  // Clean the string: remove currency symbols, commas, and whitespace
  const cleaned = String(value).replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

// Utility function to parse strategic pillars from string input
export const parseStrategicPillars = (value: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (!value || value === '') return [];
  
  // Split by semicolon or comma
  return value.split(/[;,]/).map(item => item.trim()).filter(item => item !== '');
};

// Utility function to parse campaign status
export const parseCampaignStatus = (value: string): CampaignStatus => {
  const validStatuses: CampaignStatus[] = ['Planning', 'On Track', 'Shipped', 'Cancelled'];
  return validStatuses.includes(value as CampaignStatus) ? (value as CampaignStatus) : 'Planning';
};

// Calculate campaign metrics based on leads and cost
export const calculateCampaignMetrics = (
  expectedLeads: number, 
  forecastedCost: number, 
  campaignType: string
) => {
  const leads = parseToNumber(expectedLeads);
  const cost = parseToNumber(forecastedCost);
  
  // Special logic for In-Account Events (1:1) - assume 20:1 ROI if no leads
  if (campaignType === "In-Account Events (1:1)" && leads === 0) {
    return {
      mql: 0,
      sql: 0,
      opportunities: 0,
      pipelineForecast: cost * 20
    };
  }
  
  // Standard calculations
  const mql = Math.round(leads * 0.1); // 10% of expected leads
  const sql = Math.round(mql * 0.6);   // 6% of expected leads (60% of MQLs)
  const opportunities = Math.round(sql * 0.8); // 80% of SQLs
  const pipelineForecast = opportunities * 50000; // $50K per opportunity
  
  return {
    mql,
    sql,
    opportunities,
    pipelineForecast
  };
};

// Create a campaign with calculated metrics
export const createCampaignWithMetrics = (campaignData: Partial<Campaign>): Campaign => {
  const metrics = calculateCampaignMetrics(
    campaignData.expectedLeads || 0,
    campaignData.forecastedCost || 0,
    campaignData.campaignType || ''
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
    ...campaignData,
    ...metrics
  } as Campaign;
};