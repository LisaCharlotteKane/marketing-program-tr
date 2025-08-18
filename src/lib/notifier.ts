// Simple toast wrapper - no methods, just a function
export function toast(message: string): void {
  // In a real app, this would use sonner or similar
  // For now, fallback to basic logging
  console.log(`Toast: ${message}`);
  
  // Try to use sonner if available globally
  if (typeof window !== 'undefined' && (window as any).toast) {
    (window as any).toast(message);
  }
}