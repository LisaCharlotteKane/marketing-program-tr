import { toast as sonnerToast } from "sonner";

export type Notifier = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  loading: (message: string) => string | number;
  dismiss: (id?: string | number) => void;
};

export const notify: Notifier = {
  success: (message: string) => { sonnerToast.success(message); },
  error: (message: string) => { sonnerToast.error(message); },
  info: (message: string) => { sonnerToast.info(message); },
  warning: (message: string) => { sonnerToast.warning(message); },
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: (id?: string | number) => { sonnerToast.dismiss(id); },
};

// Legacy support for simple toast function
export const toast = (message: string) => sonnerToast(message);

export default notify;