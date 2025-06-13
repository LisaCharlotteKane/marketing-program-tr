/**
 * GitHub Repository API Service
 * 
 * Handles interactions with GitHub API for storing and retrieving campaign data
 */

// Campaign data type import
import { Campaign } from "@/components/campaign-table";

// Base configuration
interface GitHubConfig {
  token: string | null;
  owner: string;
  repo: string;
  path: string;
}

// Default configuration
const defaultConfig: GitHubConfig = {
  token: null,
  owner: '',
  repo: '',
  path: 'campaign-data/campaigns.json',
};

// Types for GitHub API responses
interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

/**
 * Encodes content to base64 (required for GitHub API)
 */
function encodeToBase64(content: string): string {
  // For browser environment
  return btoa(unescape(encodeURIComponent(content)));
}

/**
 * Decodes content from base64
 */
function decodeFromBase64(content: string): string {
  // For browser environment
  return decodeURIComponent(escape(atob(content)));
}

/**
 * Saves campaign data to GitHub repository
 * 
 * @param campaigns Array of campaign data to save
 * @param config GitHub repository configuration
 * @returns Promise that resolves with success message or rejects with error
 */
export async function saveCampaignsToGitHub(
  campaigns: Campaign[],
  config: Partial<GitHubConfig> = {}
): Promise<{ success: boolean; message: string }> {
  // Merge with default config
  const fullConfig: GitHubConfig = { ...defaultConfig, ...config };
  
  // Validate configuration
  if (!fullConfig.token) {
    throw new Error('GitHub token is required');
  }
  
  if (!fullConfig.owner || !fullConfig.repo) {
    throw new Error('GitHub owner and repo are required');
  }

  try {
    // Prepare the data for saving
    const content = JSON.stringify(campaigns, null, 2);
    const encodedContent = encodeToBase64(content);
    
    // Try to get existing file to obtain the SHA (needed for updates)
    let sha: string | undefined;
    try {
      const response = await fetch(
        `https://api.github.com/repos/${fullConfig.owner}/${fullConfig.repo}/contents/${fullConfig.path}`,
        {
          headers: {
            'Authorization': `token ${fullConfig.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json() as GitHubFileResponse;
        sha = data.sha;
      }
    } catch (error) {
      // File might not exist yet, which is fine
      console.log('File does not exist yet, will create it');
    }
    
    // Create or update the file
    const requestBody: any = {
      message: 'Update campaign planning data',
      content: encodedContent,
      committer: {
        name: 'Marketing Campaign Tool',
        email: 'campaign-tool@example.com',
      },
    };
    
    // Include SHA if we're updating an existing file
    if (sha) {
      requestBody.sha = sha;
    }
    
    // Make the API call to update or create the file
    const response = await fetch(
      `https://api.github.com/repos/${fullConfig.owner}/${fullConfig.repo}/contents/${fullConfig.path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${fullConfig.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${errorData.message}`);
    }
    
    return { 
      success: true, 
      message: `Campaign data successfully saved to ${fullConfig.path}` 
    };
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Loads campaign data from GitHub repository
 * 
 * @param config GitHub repository configuration
 * @returns Promise that resolves with campaign data or rejects with error
 */
export async function loadCampaignsFromGitHub(
  config: Partial<GitHubConfig> = {}
): Promise<{ success: boolean; campaigns?: Campaign[]; message: string }> {
  // Merge with default config
  const fullConfig: GitHubConfig = { ...defaultConfig, ...config };
  
  // Validate configuration
  if (!fullConfig.token) {
    throw new Error('GitHub token is required');
  }
  
  if (!fullConfig.owner || !fullConfig.repo) {
    throw new Error('GitHub owner and repo are required');
  }

  try {
    // Get file content from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${fullConfig.owner}/${fullConfig.repo}/contents/${fullConfig.path}`,
      {
        headers: {
          'Authorization': `token ${fullConfig.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return { 
          success: false, 
          message: `File not found at ${fullConfig.path}. Save campaigns first to create it.` 
        };
      }
      
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${errorData.message}`);
    }
    
    const data = await response.json() as GitHubFileResponse;
    
    // Decode the content
    const decodedContent = decodeFromBase64(data.content);
    const campaigns = JSON.parse(decodedContent) as Campaign[];
    
    return { 
      success: true, 
      campaigns, 
      message: `Successfully loaded ${campaigns.length} campaigns from GitHub` 
    };
  } catch (error) {
    console.error('Error loading from GitHub:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}