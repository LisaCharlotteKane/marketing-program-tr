export type CampaignStatus = "Planning" | "On Track" | "Shipped" | "Cancelled";

export interface Campaign {
  id: string;
  campaignName?: string;
  campaignType: string;
  strategicPillar: string[];           // array for multiple pillars
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;

  // Core metrics
  forecastedCost?: number;
  expectedLeads?: number;
  mql?: number;
  sql?: number;
  opportunities?: number;
  pipelineForecast?: number;

  // Execution tracking
  status?: CampaignStatus;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;
  poRaised?: boolean;
  issueLink?: string;

  // Optional fields
  impactedRegions?: string[];
  campaignCode?: string;

  // Allow indexing for CSV processing
  [key: string]: unknown;
}

export interface SimpleCampaign {
  id: string;
  campaignName?: string;
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
  onDeleteCampaign: (id: string) => void;
}

export interface ExecutionTrackingProps {
  campaigns: Campaign[];
  onUpdateCampaign: (campaign: Campaign) => void;
}