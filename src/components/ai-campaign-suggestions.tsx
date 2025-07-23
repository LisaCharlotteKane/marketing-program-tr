import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "@phosphor-icons/react";
import { Campaign } from "@/components/campaign-table";

interface AICampaignSuggestionsProps {
  campaigns: Campaign[];
  onAddCampaign: (campaign: Partial<Campaign>) => void;
}

export const AICampaignSuggestions = ({ campaigns, onAddCampaign }: AICampaignSuggestionsProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Campaign Suggestions
        </CardTitle>
        <CardDescription>
          AI suggestions are temporarily disabled. You can manually create campaigns using the form below.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};