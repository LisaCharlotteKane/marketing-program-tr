/**
 * GitHub Repository API Service
 * 
 * Handles interactions with GitHub API for storing and retrieving campaign data
 */

// Campaign data type import
import { Campaign } from "@/types/campaign";
import { RegionalBudgets } from "@/hooks/useRegionalBudgets";

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
 * Attempts to perform a fetch operation with retries
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @param retries Number of retries
 * @returns Promise with the fetch response
 */
async function retryableFetch(url: string, options: RequestInit, retries = 2): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    
    // For 429 Too Many Requests, retry with backoff
    if (response.status === 429 && retries > 0) {
      // Get retry-after header or use default backoff
      const retryAfter = response.headers.get('retry-after');
      const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryableFetch(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    // For network errors, retry if we have retries left
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryableFetch(url, options, retries - 1);
    }
    throw error;
  }
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
 * Generic function to save data to GitHub repository
 * 
 * @param data Data to save
 * @param config GitHub repository configuration
 * @param commitMessage Optional commit message
 * @returns Promise that resolves with success message or rejects with error
 */
export async function saveDataToGitHub<T>(
  data: T,
  config: Partial<GitHubConfig> = {},
  commitMessage: string = 'Update data'
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
    const content = JSON.stringify(data, null, 2);
    const encodedContent = encodeToBase64(content);
    
    // Try to get existing file to obtain the SHA (needed for updates)
    let sha: string | undefined;
    try {
      const response = await retryableFetch(
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
      message: commitMessage,
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
    const response = await retryableFetch(
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
      try {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
      } catch (jsonError) {
        // If we can't parse the error as JSON, use the status text
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }
    
    return { 
      success: true, 
      message: `Data successfully saved to ${fullConfig.path}` 
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
 * Generic function to load data from GitHub repository
 * 
 * @param config GitHub repository configuration
 * @returns Promise that resolves with loaded data or rejects with error
 */
export async function loadDataFromGitHub<T>(
  config: Partial<GitHubConfig> = {}
): Promise<{ success: boolean; data?: T; message: string }> {
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
    const response = await retryableFetch(
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
          message: `File not found at ${fullConfig.path}. Save data first to create it.` 
        };
      }
      
      try {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
      } catch (jsonError) {
        // If we can't parse the error as JSON, use the status text
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const fileData = await response.json() as GitHubFileResponse;
    
    // Decode the content
    const decodedContent = decodeFromBase64(fileData.content);
    const data = JSON.parse(decodedContent) as T;
    
    return { 
      success: true, 
      data, 
      message: `Successfully loaded data from GitHub` 
    };
  } catch (error) {
    console.error('Error loading from GitHub:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
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
  return saveDataToGitHub(campaigns, config, 'Update campaign planning data');
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
  const result = await loadDataFromGitHub<Campaign[]>(config);
  
  return {
    success: result.success,
    campaigns: result.data,
    message: result.message
  };
}

/**
 * Saves budget data to GitHub repository
 * 
 * @param budgets Regional budget data to save
 * @param config GitHub repository configuration
 * @returns Promise that resolves with success message or rejects with error
 */
export async function saveBudgetsToGitHub(
  budgets: RegionalBudgets,
  config: Partial<GitHubConfig> = {}
): Promise<{ success: boolean; message: string }> {
  return saveDataToGitHub(
    budgets, 
    {
      ...config,
      path: config.path || 'campaign-data/budgets.json'
    },
    'Update regional budget data'
  );
}

/**
 * Loads budget data from GitHub repository
 * 
 * @param config GitHub repository configuration
 * @returns Promise that resolves with budget data or rejects with error
 */
export async function loadBudgetsFromGitHub(
  config: Partial<GitHubConfig> = {}
): Promise<{ success: boolean; budgets?: RegionalBudgets; message: string }> {
  const result = await loadDataFromGitHub<RegionalBudgets>({
    ...config,
    path: config.path || 'campaign-data/budgets.json'
  });
  
  return {
    success: result.success,
    budgets: result.data,
    message: result.message
  };
}