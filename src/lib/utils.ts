import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize region names to handle legacy data
 * Use this function whenever displaying or filtering by region
 */
export function normalizeRegionName(region: string): string {
  if (!region) return "";
  
  // Handle legacy "North APAC" data
  return region === "North APAC" ? "JP & Korea" : region;
}
