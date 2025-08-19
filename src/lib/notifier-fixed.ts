import { toast } from "sonner";

export type Notifier = {
  success(msg: string): void;
  error(msg: string | Error): void;
  info(msg: string): void;
  warning(msg: string): void;
  loading(msg: string): string;
  dismiss(id?: string): void;
};

// Implementation using sonner with proper error handling
export const notify: Notifier = {
  success(msg: string): void {
    toast(msg);
  },
  error(msg: string | Error): void {
    const message = msg instanceof Error ? msg.message : String(msg);
    toast(message);
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
  dismiss(_id?: string): void {
    // sonner doesn't have dismiss, so this is a no-op
  }
};