import { toast } from "sonner";

export type Notifier = {
  success(msg: string): void;
  error(msg: string): void;
  info(msg: string): void;
  warning(msg: string): void;
  loading(msg: string): string;
  dismiss(id?: string): void;
};

// Implementation using sonner
export const notify: Notifier = {
  success(msg: string): void {
    toast(msg);
  },
  error(msg: string): void {
    toast(msg);
  },
  info(msg: string): void {
    toast(msg);
  },
  warning(msg: string): void {
    toast(msg);
  },
  loading(msg: string): string {
    toast(msg);
    return msg; // Return a mock ID for compatibility
  },
  dismiss(id?: string): void {
    // sonner doesn't have dismiss, so this is a no-op
  }
};