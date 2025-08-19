import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string): string {
  // Handle empty or non-numeric values
  if (amount === "" || amount === null || amount === undefined) {
    return "$0";
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Handle NaN
  if (isNaN(numAmount)) {
    return "$0";
  }

  // Format as currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
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

/**
 * Get a list of all known campaign types
 * This ensures we have a consistent list across the application
 */
export function getAllCampaignTypes(): string[] {
  return [
    "In-Account Events (1:1)",
    "Exec Engagement Programs",
    "CxO Events (1:Few)",
    "Localized Events",
    "Localized Programs",
    "Lunch & Learns and Workshops (1:Few)",
    "Microsoft",
    "Partners",
    "Webinars",
    "3P Sponsored Events",
    "Flagship Events (Galaxy, Universe Recaps) (1:Many)",
    "Targeted Paid Ads & Content Syndication",
    "User Groups",
    "Contractor/Infrastructure"
  ];
}

/**
 * Safely convert any value to a number with fallback
 * @param v The value to convert to number
 * @param d Default value if conversion fails (default: 0)
 * @returns Converted number or default value
 */
export const num = (v: unknown, d = 0): number => {
  const n = Number((v ?? "").toString().trim());
  return Number.isFinite(n) ? n : d;
};

/**
 * Safely convert any value to a string with fallback
 * @param v The value to convert to string
 * @param d Default value if conversion fails (default: "")
 * @returns Converted string or default value
 */
export const str = (v: unknown, d = ""): string => (v ?? d) as string;

/**
 * Convert a value or array to always be an array
 * @param x The value to convert to array
 * @returns Array containing the value(s)
 */
export const toArray = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x]);
