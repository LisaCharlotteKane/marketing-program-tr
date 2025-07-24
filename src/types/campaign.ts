/**
 * Shared Campaign interface for consistency across all components
 */
export interface Campaign {
  id: string;
  description: string;
  campaignType: string;
  strategicPillar: string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  // Optional execution tracking fields
  status?: string;
  poRaised?: boolean;
  salesforceCampaignCode?: string;
  issueLink?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMQLs?: number;
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