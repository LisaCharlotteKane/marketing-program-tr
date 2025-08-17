import { toast } from "sonner";

/**
 * Notifier wrapper to handle different toast types
 * Sonner provides these methods, but we wrap them for type safety
 */
export const notifier = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  loading: (message: string) => toast.loading(message),
  dismiss: () => toast.dismiss(),
  message: (message: string) => toast(message)
};

export type { toast };