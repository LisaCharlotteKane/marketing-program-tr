import { toast } from "sonner";

/**
 * Notification wrapper that provides typed methods for the toast API
 * Since we're using sonner which already has success/error/etc methods,
 * we'll just re-export them with proper types
 */
export const notifier = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  loading: (message: string) => toast.loading(message),
  dismiss: () => toast.dismiss(),
};

// Also export a simple toast function for backwards compatibility
export { toast };