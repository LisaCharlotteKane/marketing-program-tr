import { toast } from "sonner";

export type Notifier = {
  success(msg: string): void;
  error(msg: string): void;
  info(msg: string): void;
  warning(msg: string): void;
  loading(msg: string): string;
  dismiss(id?: string): void;
};

export const notify: Notifier = {
  success: (msg: string) => toast(msg),
  error: (msg: string) => toast(msg),
  info: (msg: string) => toast(msg),
  warning: (msg: string) => toast(msg),
  loading: (msg: string) => {
    toast(msg);
    return "";
  },
  dismiss: () => {
    // No-op for now since sonner's toast doesn't expose dismiss
  },
};