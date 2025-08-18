// Campaign Type Definitions
export type CampaignStatus = 'Planning' | 'On Track' | 'Shipped' | 'Cancelled';
export type StrategicPillar = string[]; // Array of strategic pillars

// Core Campaign Interface
export interface Campaign {
  id: string;
  campaignName?: string;
  campaignType: string;
  strategicPillar: StrategicPillar;
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number;
  expectedLeads: number;
  
  // Auto-calculated metrics
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  
  // Execution tracking
  status?: CampaignStatus;
  poRaised?: boolean;
  issueLink?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;
}

// Form Data Interface
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

// Budget Interfaces
export interface BudgetAllocation {
  region: string;
  budget: number;
}

export interface BudgetUsage extends BudgetAllocation {
  owner: string;
  used: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// Component Props Interfaces
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

// Simplified Campaign Interface for basic display
export interface SimpleCampaign {
  id: string;
  campaignName?: string;
  campaignType?: string;
  region?: string;
  owner?: string;
}

export interface CampaignDisplayProps {
  campaigns: Campaign[];
}