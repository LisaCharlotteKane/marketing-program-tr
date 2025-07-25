/**
 * Shared Campaign interface for consistency across all components
 */
export interface Campaign {
  id: string;
  campaignName?: string;
  description: string;
  campaignType: string;
  strategicPillar: string[];
  revenuePlay: string;
  fy: string;
  fiscalYear?: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  forecastedCost: number | string;
  expectedLeads: number | string;
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  // Optional execution tracking fields
  status?: string;
  poRaised?: boolean;
  campaignCode?: string;
  salesforceCampaignCode?: string;
  issueLink?: string;
  actualCost?: number | string;
  actualLeads?: number | string;
  actualMQLs?: number | string;
}

/**
 * Props for components that need to manage campaigns
 */
export interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
}

/**
 * Props for components that only need to display campaigns
 */
export interface CampaignDisplayProps {
  campaigns: Campaign[];
}