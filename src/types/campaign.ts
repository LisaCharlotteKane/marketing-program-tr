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


// Budget Interfaces
  region: string;
  budget: number;
  budget: number;

export interface BudgetUsage extends BudgetAllocation {
export interface BudgetUsage extends BudgetAllocation {
  used: number;
  used: number;
  remaining: number;
  percentage: number;
}

// Component Props Interfaces
// Component Props Interfaces
  onImportCampaigns: (campaigns: Campaign[]) => void;
  campaigns: Campaign[];
}
}
export interface CampaignFormProps {
  onAddCampaign: (campaign: Campaign) => void;
}

export interface CampaignTableProps {
  campaigns: Campaign[];
  onDeleteCampaign: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
export interface ExecutionTrackingProps {
  campaigns: Campaign[];
export interface ExecutionTrackingProps {
  campaigns: Campaign[];

// Simplified Campaign Interface for basic display
export interface SimpleCampaign {
// Simplified Campaign Interface for basic display
  region?: string;
  owner?: string;
}

export interface CampaignDisplayProps {
  campaigns: Campaign[];
}export interface CampaignDisplayProps {
  campaigns: Campaign[];
}