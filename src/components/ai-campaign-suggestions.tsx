import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SparkleIcon, PlusCircle, ArrowClockwise, Brain } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Campaign } from "@/components/campaign-table";

interface AICampaignSuggestionsProps {
  campaigns: Campaign[];
  onAddCampaign: (campaign: Partial<Campaign>) => void;
}

export const AICampaignSuggestions = ({ campaigns, onAddCampaign }: AICampaignSuggestionsProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Partial<Campaign>[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate campaign suggestions based on existing campaigns and user prompt
  const generateSuggestions = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setLoading(true);
    
    try {
      // Get insights about current campaigns
      const campaignSummary = campaigns.length > 0 
        ? `Based on ${campaigns.length} existing campaigns: 
           - Top campaign types: ${getTopCampaignTypes(campaigns).join(', ')}
           - Most common pillars: ${getTopStrategicPillars(campaigns).join(', ')}
           - Most common regions: ${getTopRegions(campaigns).join(', ')}`
        : "No existing campaigns to analyze.";
      
      // Create the LLM prompt with campaign info and user guidance
      const llmPromptText = spark.llmPrompt`You are a marketing expert for a technology company. Generate 3 innovative campaign ideas based on this context:

${campaignSummary}

User request: ${prompt || "Generate 3 new marketing campaign ideas that would complement the existing portfolio."}

For each campaign, include:
- Campaign Type (select from: In-Account Events (1:1), Exec Engagement Programs, CxO Events (1:Few), Localized Events, Localized Programs, Lunch & Learns and Workshops (1:Few), Microsoft, Partners, Webinars, 3P Sponsored Events, Flagship Events, Targeted Paid Ads & Content Syndication, User Groups)
- Strategic Pillars (select from: Account Growth and Product Adoption, Pipeline Acceleration & Executive Engagement, Brand Awareness & Top of Funnel Demand Generation, New Logo Acquisition)
- Revenue Play (select from: Accelerate developer productivity with Copilot in VS Code and GitHub, Secure all developer workloads with the power of AI, All)
- Region (select from: North APAC, South APAC, SAARC, Digital)
- Country (appropriate for the region)
- Description (brief description of the campaign)
- Forecasted Cost (reasonable estimate in USD)
- Forecasted Leads (reasonable number of forecasted leads)

Return in JSON format ONLY (without explanation) as an array of 3 campaign objects with these exact properties:
[
  {
    "campaignType": "",
    "strategicPillars": [""],
    "revenuePlay": "",
    "region": "",
    "country": "",
    "description": "",
    "forecastedCost": number,
    "expectedLeads": number
  }
]`;

      // Call the LLM
      const response = await spark.llm(llmPromptText);
      
      // Parse the response
      try {
        const parsedSuggestions = JSON.parse(response) as Partial<Campaign>[];
        setSuggestions(parsedSuggestions);
        toast.success("Campaign suggestions generated successfully");
      } catch (error) {
        console.error("Failed to parse LLM response:", error);
        toast.error("Failed to generate properly formatted suggestions");
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error generating campaign suggestions:", error);
      toast.error("Failed to generate campaign suggestions");
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };
  
  // Helper functions to analyze existing campaigns
  const getTopCampaignTypes = (campaigns: Campaign[], limit = 3): string[] => {
    const typeCount = new Map<string, number>();
    
    campaigns.forEach(campaign => {
      if (!campaign.campaignType) return;
      
      const count = typeCount.get(campaign.campaignType) || 0;
      typeCount.set(campaign.campaignType, count + 1);
    });
    
    return [...typeCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  };
  
  const getTopStrategicPillars = (campaigns: Campaign[], limit = 3): string[] => {
    const pillarCount = new Map<string, number>();
    
    campaigns.forEach(campaign => {
      if (!campaign.strategicPillars?.length) return;
      
      campaign.strategicPillars.forEach(pillar => {
        const count = pillarCount.get(pillar) || 0;
        pillarCount.set(pillar, count + 1);
      });
    });
    
    return [...pillarCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  };
  
  const getTopRegions = (campaigns: Campaign[], limit = 3): string[] => {
    const regionCount = new Map<string, number>();
    
    campaigns.forEach(campaign => {
      if (!campaign.region) return;
      
      const count = regionCount.get(campaign.region) || 0;
      regionCount.set(campaign.region, count + 1);
    });
    
    return [...regionCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(entry => entry[0]);
  };
  
  // Handle adding a suggested campaign to the main table
  const handleAddSuggestion = (suggestion: Partial<Campaign>) => {
    onAddCampaign({
      ...suggestion,
      id: Math.random().toString(36).substring(2, 9),
      fiscalYear: "FY25", // Default values
      quarterMonth: "Q1 - July",
      status: "Planning",
      poRaised: false,
      actualCost: "",
      // Calculate derived metrics
      mql: typeof suggestion.expectedLeads === 'number' ? Math.round(suggestion.expectedLeads * 0.1) : 0,
      sql: typeof suggestion.expectedLeads === 'number' ? Math.round(suggestion.expectedLeads * 0.06) : 0,
      opportunities: typeof suggestion.expectedLeads === 'number' ? Math.round(Math.round(suggestion.expectedLeads * 0.06) * 0.8) : 0,
      pipelineForecast: typeof suggestion.expectedLeads === 'number' ? 
        Math.round(Math.round(suggestion.expectedLeads * 0.06) * 0.8) * 50000 : 0
    });
    
    toast.success("Campaign added to your planning table");
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" /> AI-Powered Campaign Suggestions
        </CardTitle>
        <CardDescription>Get intelligent campaign recommendations based on your marketing strategy</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="prompt">What kind of campaigns are you looking for?</Label>
          <div className="flex gap-2">
            <Input
              id="prompt"
              placeholder="E.g., 'Generate low-cost campaigns for the SAARC region' or 'Suggest ideas for developer events'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              onClick={generateSuggestions}
              disabled={loading}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <ArrowClockwise className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <SparkleIcon className="h-4 w-4" />
                  Generate Ideas
                </>
              )}
            </Button>
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <div className="space-y-4 mt-4">
            <h3 className="text-sm font-medium">Campaign Suggestions</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="border bg-card">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{suggestion.campaignType}</CardTitle>
                    <CardDescription className="line-clamp-2">{suggestion.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.strategicPillars?.map((pillar) => (
                        <Badge key={pillar} variant="outline" className="text-xs">
                          {pillar.substring(0, 15)}...
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue Play:</span>
                        <span className="font-medium">{suggestion.revenuePlay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Region:</span>
                        <span className="font-medium">{suggestion.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country:</span>
                        <span className="font-medium">{suggestion.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">
                          {typeof suggestion.forecastedCost === 'number' ? 
                            formatCurrency(suggestion.forecastedCost) : '$0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forecasted Leads:</span>
                        <span className="font-medium">{suggestion.expectedLeads || 0}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full mt-2 flex items-center justify-center gap-1"
                      onClick={() => handleAddSuggestion(suggestion)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add to Planning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};