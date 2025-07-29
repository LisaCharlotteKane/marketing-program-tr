export interface Campaign {
  id: string;
  campaignType: string;
  strategicPillar: string | string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  campaignName?: string;
  forecastedCost: string;
  expectedLeads: string;
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  status?: 'Planning' | 'On Track' | 'Shipped' | 'Cancelled';
  poRaised?: boolean;
  salesforceCampaignCode?: string;
  issueLink?: string;
  actualCost?: string;
  actualLeads?: string;
  actualMQLs?: string;
}