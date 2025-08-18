/**
 * Header size guard utilities to prevent HTTP 431 errors
 */

export interface HeaderSizeInfo {
  cookieSize: number;
  estimatedHeaderSize: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
  warnings: string[];
}

const MAX_SAFE_HEADER_SIZE = 8 * 1024; // 8KB safe limit
const WARNING_THRESHOLD = 6 * 1024; // 6KB warning threshold

/**
 * Estimate total HTTP header size including cookies
 */
export function getHeaderSizeInfo(): HeaderSizeInfo {
  const warnings: string[] = [];
  
  // Calculate cookie size
  const cookieSize = document.cookie.length;
  
  // Estimate other headers (User-Agent, Accept, etc.)
  // Common browser headers typically add 1-2KB
  const estimatedOtherHeaders = 2048;
  
  // Total estimated header size
  const estimatedHeaderSize = cookieSize + estimatedOtherHeaders;
  
  const isNearLimit = estimatedHeaderSize >= WARNING_THRESHOLD;
  const isOverLimit = estimatedHeaderSize >= MAX_SAFE_HEADER_SIZE;
  
  if (cookieSize > 4096) {
    warnings.push(`Cookie size (${cookieSize} bytes) is large`);
  }
  
  if (isNearLimit) {
    warnings.push(`Total header size (${estimatedHeaderSize} bytes) approaching limit`);
  }
  
  if (isOverLimit) {
    warnings.push(`Total header size (${estimatedHeaderSize} bytes) may cause HTTP 431 errors`);
  }
  
  return {
    cookieSize,
    estimatedHeaderSize,
    isNearLimit,
    isOverLimit,
    warnings
  };
}

/**
 * Get minimal headers for fetch requests
 */
export function getMinimalHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  // Only include essential headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
  };
  
  // Ensure no redundant headers
  return headers;
}

/**
 * Create a fetch wrapper that guards against large headers
 */
export function createHeaderGuardedFetch() {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headerInfo = getHeaderSizeInfo();
    
    if (headerInfo.isOverLimit) {
      console.warn('Header size too large, attempting cleanup...');
      // Trigger cookie cleanup
      const { clearProblematicCookies } = await import('@/lib/cookie-cleanup');
      clearProblematicCookies();
    }
    
    // Use minimal headers
    const headers = getMinimalHeaders(options.headers as Record<string, string> || {});
    
    return fetch(url, {
      ...options,
      headers
    });
  };
}

/**
 * Monitor and log header sizes
 */
export function startHeaderSizeMonitoring() {
  // Check header size every 30 seconds
  const interval = setInterval(() => {
    const info = getHeaderSizeInfo();
    
    if (info.warnings.length > 0) {
      console.warn('Header size warnings:', info.warnings);
      
      if (info.isOverLimit) {
        console.error('Header size over limit! This may cause HTTP 431 errors.');
        // Auto-cleanup if critically over limit
        import('@/lib/cookie-cleanup').then(({ clearProblematicCookies }) => {
          clearProblematicCookies();
        });
      }
    }
  }, 30000);
  
  // Return cleanup function
  return () => clearInterval(interval);
}