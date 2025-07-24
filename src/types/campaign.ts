// Shared Campaign interface for the marketing planning tool
export interface Campaign {
  id: string;
  campaignName: string;
  campaignType: string;
  strategicPillars: string[];
  revenuePlay: string;
  fiscalYear: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  description: string;
  forecastedCost: number | string;
  expectedLeads: number | string;
  
  // Calculated fields
  mql: number;
  sql: number;
  opportunities: number;
  pipelineForecast: number;
  
  // Execution tracking fields
  status: string;
  poRaised: boolean;
  campaignCode: string;
  issueLink: string;
  actualCost: number | string;
  actualLeads: number | string;
  actualMQLs: number | string;
}

// Budget allocation interface
export interface BudgetAllocation {
  owner: string;
  region: string;
  budget: number;
}

// Region color mapping for calendar and visualizations
export const REGION_COLORS = {
  "JP & Korea": "#3b82f6",     // blue
  "South APAC": "#10b981",      // green  
  "SAARC": "#f59e0b",          // orange
  "Digital": "#8b5cf6",        // purple
  "X APAC English": "#ef4444",  // red
  "X APAC Non English": "#6b7280" // gray
} as const;

// Budget allocations by owner
export const BUDGET_ALLOCATIONS: Record<string, BudgetAllocation> = {
  "Tomoko Tanaka": { owner: "Tomoko Tanaka", region: "JP & Korea", budget: 358000 },
  "Beverly Leung": { owner: "Beverly Leung", region: "South APAC", budget: 385500 },
  "Shruti Narang": { owner: "Shruti Narang", region: "SAARC", budget: 265000 },
  "Giorgia Parham": { owner: "Giorgia Parham", region: "Digital", budget: 68000 }
};