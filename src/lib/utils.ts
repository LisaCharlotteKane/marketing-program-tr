import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize region names to handle legacy data
 * - Converts "North APAC" to "JP & Korea" for backward compatibility
 * - Ensures consistent region naming throughout the application
 * Use this function whenever displaying or filtering by region
 */
export function normalizeRegionName(region: string): string {
  if (!region) return "";
  
  // Handle legacy "North APAC" data
  return region === "North APAC" ? "JP & Korea" : region;
}

/**
 * Check if a campaign is a contractor/infrastructure type 
 * - Used to filter out contractor campaigns from budget impacts, ROI calculations, and calendar view
 * - Uses multiple detection methods for greater reliability
 */
export function isContractorCampaign(campaign: any): boolean {
  if (!campaign) return false;
  
  // Check for explicit campaign types
  if (campaign.campaignType === "Contractor" || 
      campaign.campaignType === "Contractor/Infrastructure") {
    return true;
  }
  
  // Check for substring matches in the campaign type
  if (typeof campaign.campaignType === 'string' && 
     (campaign.campaignType.toLowerCase().includes("contractor") || 
      campaign.campaignType.toLowerCase().includes("infrastructure"))) {
    return true;
  }
  
  // Not a contractor campaign
  return false;
}
