export type StrategicPillar = "Account Growth and Product Adoption" | "Pipeline Acceleration & Executive Engagement" | "Brand Awareness & Top of Funnel Demand Generation" | "New Logo Acquisition";

export type CampaignStatus = "Planning" | "On Track" | "Shipped" | "Cancelled";

export interface Campaign {
  id: string;
  campaignName?: string;
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
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  status?: CampaignStatus;
  poRaised?: boolean;
  issueLink?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;
  impactedRegions?: string[];
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
  onChange?: (campaigns: Campaign[]) => void;
}

export interface ExecutionTrackingProps {
  campaigns: Campaign[];
  onUpdateCampaign: (campaign: Campaign) => void;
}

export interface CampaignDisplayProps {
  campaigns: Campaign[];
}