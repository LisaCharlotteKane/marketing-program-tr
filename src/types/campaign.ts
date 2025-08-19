// Centralized campaign types
export type CampaignStatus = "Planning" | "On Track" | "Shipped" | "Cancelled";

export interface Campaign {
  id: string;
  campaignName: string;
  campaignType?: string;
  strategicPillar?: string[] | string;
  fy?: string;
  quarterMonth?: string;
  region?: string;
  country?: string;
  owner?: string;
  description?: string;
  revenuePlay?: string;

  // Numeric fields - storing as numbers
  forecastedCost?: number;
  expectedLeads?: number;
  mql?: number;
  sql?: number;
  opportunities?: number;
  pipelineForecast?: number;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;

  // Execution tracking
  status?: CampaignStatus;
  poRaised?: boolean;
  issueLink?: string;
  campaignCode?: string;
  impactedRegions?: string[];

  // Allow additional fields for CSV imports
  [key: string]: unknown;
}

export interface SimpleCampaign {
  id: string;
  campaignName: string;
  campaignType?: string;
  region?: string;
  owner?: string;
}

export interface FormData {
  campaignType: string;
  strategicPillar: string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number;
  expectedLeads: number;
  campaignName: string;
}

export interface BudgetAllocation {
  region: string;
  budget: number;
}

export interface BudgetUsage {
  owner: string;
  region: string;
  budget: number;
  used: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// Component prop types
export interface CampaignTableProps {
  campaigns: Campaign[];
  setCampaigns?: (campaigns: Campaign[]) => void;
  onDeleteCampaign?: (id: string) => void;
}

export interface CampaignDisplayProps {
  campaigns: Campaign[];
}

export interface ImportExportProps {
  onImportCampaigns: (campaigns: Campaign[]) => void;
  campaigns: Campaign[];
}

export interface CampaignFormProps {
  onAddCampaign: (campaign: Campaign) => void;
}

export interface ExecutionTrackingProps {
  campaigns: Campaign[];
  onUpdateCampaign: (campaign: Campaign) => void;
}