import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle, Database, Users, Info } from "@phosphor-icons/react";
import { Campaign } from "@/types/campaign";

interface SharedStorageStatusProps {
  campaigns: Campaign[];
}

export function SharedStorageStatus({ campaigns }: SharedStorageStatusProps) {
  const campaignCount = campaigns.length;
  const recentCampaigns = campaigns
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, 5);

  const uniqueOwners = [...new Set(campaigns.map(c => c.owner).filter(Boolean))];
  const lastUpdateTime = campaignCount > 0 ? new Date().toLocaleString() : 'No data';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Shared Storage Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Global Access Enabled:</strong> All logged-in users can view and edit campaign data.
            Data is shared in real-time across all team members.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Campaign Data
            </Label>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{campaignCount}</div>
              <div className="text-xs text-muted-foreground">Total Campaigns</div>
              <div className="text-xs text-muted-foreground">Last Updated: {lastUpdateTime}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Contributors
            </Label>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{uniqueOwners.length}</div>
              <div className="text-xs text-muted-foreground">Unique Owners</div>
              <div className="flex flex-wrap gap-1">
                {uniqueOwners.slice(0, 3).map(owner => (
                  <Badge key={owner} variant="secondary" className="text-xs">
                    {owner.split(' ')[0]}
                  </Badge>
                ))}
                {uniqueOwners.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{uniqueOwners.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {recentCampaigns.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Recent Campaigns
            </Label>
            <div className="space-y-1">
              {recentCampaigns.map(campaign => (
                <div key={campaign.id} className="text-xs bg-muted p-2 rounded">
                  <div className="font-medium">{campaign.description || 'Untitled Campaign'}</div>
                  <div className="text-muted-foreground">
                    {campaign.owner} • {campaign.region} • {campaign.campaignType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How It Works:</strong> The app uses GitHub Spark's KV storage with global scope. 
            Any changes made by any user are immediately visible to all other logged-in users. 
            No permission checks - all authenticated users have full read/write access.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}