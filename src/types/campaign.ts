export type CampaignStatus = "Planning" | "In Flight" | "Complete";

export interface SimpleCampaign {
  id: string;
  campaignName: string;
  campaignType: string;
  region: string;
  owner: string;
  forecastedCost: number;
  expectedLeads: number;
  quarterMonth: string;
}

export interface Campaign {
  id: string;
  campaignName: string;                // required
  description: string;
  campaignType: string;
  strategicPillar: string[];           // NOTE: singular 'Pillar' (match your code)
  revenuePlay: string;
  fy: string;
  quarterMonth: string;
  region: string;
  country: string;
  owner: string;
  forecastedCost?: number;
  expectedLeads?: number;
  pipelineForecast?: number;
  // ...add any other fields you actually use
  status: CampaignStatus;
  poRaised?: boolean;
  campaignCode?: string;
  issueLink?: string;
  actualCost?: number;
  actualLeads?: number;
  actualMQLs?: number;
  mql?: number;
  sql?: number;
  opportunities?: number;
}

export const makeEmptySimpleCampaign = (): SimpleCampaign => ({
  id: crypto?.randomUUID?.() ?? String(Date.now()),
  campaignName: "",
  campaignType: "",
  region: "",
  owner: "",
  forecastedCost: 0,
  expectedLeads: 0,
  quarterMonth: "",
});

export const makeEmptyCampaign = (): Campaign => ({
  id: crypto?.randomUUID?.() ?? String(Date.now()),
  campaignName: "",
  description: "",
  campaignType: "",
  strategicPillar: [],
  revenuePlay: "",
  fy: "",
  quarterMonth: "",
  region: "",
  country: "",
  owner: "",
  forecastedCost: 0,
  expectedLeads: 0,
  pipelineForecast: 0,
  status: "Planning",
});