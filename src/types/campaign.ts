export type CampaignStatus = "Planning" | "On Track" | "Shipped" | "Cancelled";

export interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  strategicPillar: string | string[];
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;

  // Numeric fields
  forecastedCost?: number;
  expectedLeads?: number;
  mql?: number;
  sql?: number;
  opportunities?: number;
  pipelineForecast?: number;
  
  // Execution fields
  status?: CampaignStatus;
  poRaised?: boolean;
  issueLink?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;

  // Optional fields
  impactedRegions?: string[];
  campaignCode?: string;

  // Allow additional fields
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
  campaignName: string;
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

export interface ImportExportProps {
  onImportCampaigns: (campaigns: Campaign[]) => void;
  campaigns: Campaign[];
}

export interface CampaignFormProps {
  onAddCampaign: (campaign: Campaign) => void;
}

export interface CampaignTableProps {
  campaigns: Campaign[];
  onDeleteCampaign?: (id: string) => void;
}

export interface ExecutionTrackingProps {
  campaigns: Campaign[];
  onUpdateCampaign: (campaign: Campaign) => void;
}

export interface CampaignDisplayProps {
  campaigns: Campaign[];
}