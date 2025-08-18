import { toast as sonnerToast } from "sonner";

// Simple toast wrapper that provides a unified interface
export const toast = (message: string): void => {
  sonnerToast(message);
};

// Export for backward compatibility
export default toast;