// Status type for campaigns
export type CampaignStatus = "Planning" | "On Track" | "Shipped" | "Cancelled";

// Strategic Pillar types
export type StrategicPillar = "Account Growth and Product Adoption" | "Pipeline Acceleration & Executive Engagement" | "Brand Awareness & Top of Funnel Demand Generation" | "New Logo Acquisition" | string;

// Main Campaign interface
export interface Campaign {
  id: string;
  campaignName?: string;
  campaignType: string;
  strategicPillar: string[]; // Keep as array to support multiple selections
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  // Fixed: Convert string costs/leads to numbers for calculations
  forecastedCost: number;
  expectedLeads: number;
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  status?: CampaignStatus;
  poRaised?: boolean;
  salesforceCampaignCode?: string;
  issueLink?: string;
  // Fixed: Convert string actuals to numbers  
  actualCost?: number;
  actualLeads?: number;
  actualMqls?: number;
  // Index signature to avoid strict indexing errors
  [key: string]: unknown;
}

// Form data interface for new campaigns
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

// Budget allocation interface
export interface BudgetAllocation {
  region: string;
  budget: number;
}

// Budget usage interface
export interface BudgetUsage {
  owner: string;
  region: string;
  budget: number;
  used: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// Simplified campaign interface
export interface SimpleCampaign {
  id: string;
  campaignName: string;
  campaignType?: string;
  region?: string;
  owner?: string;
}

// Component prop interfaces
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